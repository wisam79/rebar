import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrameProcessor, Frame, runAtTargetFps } from 'react-native-vision-camera';
import { TensorflowPlugin } from 'react-native-fast-tflite';
import { useRunOnJS } from 'react-native-worklets-core';
import {
  Detection,
  nonMaxSuppression,
} from '../services/detectionUtils';
import { CONFIDENCE_THRESHOLD, NMS_IOU_THRESHOLD } from '../constants/theme';

/**
 * Custom hook that wraps the camera frame processor with TFLite inference.
 *
 * Pipeline:
 * 1. Camera captures frame (RGB pixel buffer)
 * 2. TFLite model runs inference via runSync (inside worklet)
 * 3. Output tensor is parsed (YOLO format: [1, 84, 8400])
 * 4. NMS filters overlapping detections
 * 5. Results are pushed to React state via useRunOnJS bridge
 */
export function useRebarDetector(plugin: TensorflowPlugin | null) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [count, setCount] = useState(0);
  const [fps, setFps] = useState(0);

  // Refs for tracking frame rate
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  // Bridge: worklet → JS thread
  const handleResults = useRunOnJS(
    (result: Detection[]) => {
      setDetections(result);
      setCount(result.length);
    },
    []
  );

  const updateFps = useRunOnJS(
    (currentFps: number) => {
      setFps(currentFps);
    },
    []
  );

  /**
   * Parse model output tensor into detections, then run NMS.
   *
   * Expected YOLO output formats:
   * - [1, 84, 8400]  → 84 = 4 bbox + 80 classes (standard, not transposed)
   * - [1, 8400, 84]  → transposed format
   *
   * Each detection slot: [cx, cy, w, h, class0_score, class1_score, ...]
   */
  const parseOutputAndNMS = useCallback(
    (outputTensor: Float32Array, totalElements: number): Detection[] => {
      let numBoxes: number;
      let numFeatures: number;
      let transposed = false;

      // Detect output format
      if (totalElements === 84 * 8400) {
        // [1, 84, 8400] standard YOLOv8
        numBoxes = 8400;
        numFeatures = 84;
      } else if (totalElements === 8400 * 84) {
        // [1, 8400, 84] transposed
        numBoxes = 8400;
        numFeatures = 84;
        transposed = true;
      } else {
        // Unknown format — try to infer
        numBoxes = 8400;
        numFeatures = Math.floor(totalElements / numBoxes);
        if (numBoxes * numFeatures !== totalElements) {
          return [];
        }
      }

      const numClasses = numFeatures - 4;
      const boxes: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const scores: number[] = [];
      const classIds: number[] = [];

      for (let i = 0; i < numBoxes; i++) {
        let cx: number, cy: number, w: number, h: number;

        if (transposed) {
          const baseIdx = i * numFeatures;
          cx = outputTensor[baseIdx];
          cy = outputTensor[baseIdx + 1];
          w = outputTensor[baseIdx + 2];
          h = outputTensor[baseIdx + 3];
        } else {
          // [1, num_features, num_boxes]
          cx = outputTensor[i];
          cy = outputTensor[i + numBoxes];
          w = outputTensor[i + 2 * numBoxes];
          h = outputTensor[i + 3 * numBoxes];
        }

        // Find max class confidence
        let maxScore = 0;
        let maxClassId = 0;

        for (let c = 0; c < numClasses; c++) {
          let score: number;
          if (transposed) {
            score = outputTensor[i * numFeatures + 4 + c];
          } else {
            score = outputTensor[i + (4 + c) * numBoxes];
          }

          if (score > maxScore) {
            maxScore = score;
            maxClassId = c;
          }
        }

        if (maxScore >= CONFIDENCE_THRESHOLD) {
          boxes.push({
            x1: cx - w / 2,
            y1: cy - h / 2,
            x2: cx + w / 2,
            y2: cy + h / 2,
          });
          scores.push(maxScore);
          classIds.push(maxClassId);
        }
      }

      return nonMaxSuppression(boxes, scores, classIds, NMS_IOU_THRESHOLD);
    },
    []
  );

  const frameProcessor = useFrameProcessor(
    (frame: Frame) => {
      'worklet';

      if (plugin == null || plugin.state !== 'loaded') return;

      const model = plugin.model;
      if (model == null) return;

      try {
        // FPS tracking via runAtTargetFps
        frameCountRef.current = frameCountRef.current + 1;

        runAtTargetFps(1, () => {
          'worklet';
          const now = Date.now();
          const elapsed = now - lastFpsTimeRef.current;
          if (elapsed > 0) {
            const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
            updateFps(currentFps);
          }
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        });

        // Get raw pixel data as ArrayBuffer, convert to Uint8Array
        const rawBuffer = frame.toArrayBuffer();
        const uint8Data = new Uint8Array(rawBuffer);

        // The model expects input shape [1, 640, 640, 3] or [1, 3, 640, 640]
        // Convert uint8 [0..255] to float32 [0..1]
        const inputFloat32 = new Float32Array(uint8Data.length);
        for (let i = 0; i < uint8Data.length; i++) {
          inputFloat32[i] = uint8Data[i] / 255.0;
        }

        // Run inference synchronously on the worklet thread
        const output = model.runSync([inputFloat32]);

        if (output == null || output.length === 0) return;

        const outputTensor = output[0] as Float32Array;
        const totalElements = outputTensor.length;

        // Parse + NMS
        const detections = parseOutputAndNMS(outputTensor, totalElements);

        // Send results to JS thread
        if (detections.length > 0) {
          handleResults(detections);
        }
      } catch (e) {
        // Silently ignore frame processing errors
      }
    },
    [plugin, handleResults, updateFps, parseOutputAndNMS]
  );

  return {
    frameProcessor,
    detections,
    count,
    fps,
  };
}
