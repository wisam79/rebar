import { useState, useRef, useCallback } from 'react';
import type { Detection } from '../services/detectionUtils';
import { nonMaxSuppression, resizeFrameToModel, scaleBoxesToFrame } from '../services/detectionUtils';
import { MODEL_INPUT_SIZE } from '../constants/theme';

interface TFLiteRunner {
  run(input: Float32Array): Promise<Float32Array[] | null>;
}

declare global {
  interface Window {
    tflite?: {
      createTFLiteModel(url: string): Promise<{
        run(input: Float32Array): Promise<{ data: ArrayBuffer }>;
      }>;
    };
  }
}

export function useRebarDetector() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [count, setCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const modelRef = useRef<TFLiteRunner | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());
  const runningRef = useRef(false);

  const loadModel = useCallback(async () => {
    setModelLoading(true);
    try {
      if (!window.tflite) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@aspect-build/tflite@0.0.3/dist/tflite.min.js';
        document.head.appendChild(script);
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load TFLite runtime'));
        });
      }

      const modelUrl = new URL('/model.tflite', window.location.origin).href;
      const model = await window.tflite!.createTFLiteModel(modelUrl);

      modelRef.current = {
        run: async (input: Float32Array) => {
          try {
            const output = await model.run(input);
            return [new Float32Array(output.data as ArrayBuffer)];
          } catch {
            return null;
          }
        },
      };

      setModelReady(true);
    } catch (e) {
      console.warn('TFLite model not available:', e);
      modelRef.current = null;
      setModelReady(true);
    } finally {
      setModelLoading(false);
    }
  }, []);

  const detect = useCallback(
    async (
      imageData: ImageData,
      confidenceThreshold: number,
      nmsIouThreshold: number
    ) => {
      if (!modelRef.current) return;

      if (runningRef.current) return;
      runningRef.current = true;

      try {
        frameCountRef.current++;
        const now = Date.now();
        const elapsed = now - lastFpsTimeRef.current;
        if (elapsed >= 1000) {
          const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
          setFps(currentFps);
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }

        const uint8Data = new Uint8Array(imageData.data.buffer);
        const inputFloat32 = resizeFrameToModel(
          uint8Data,
          imageData.width,
          imageData.height,
          MODEL_INPUT_SIZE
        );

        const output = await modelRef.current.run(inputFloat32);
        if (!output || output.length === 0) return;

        const outputTensor = output[0];
        const totalElements = outputTensor.length;
        const numBoxes = 8400;
        const numFeatures = Math.floor(totalElements / numBoxes);

        if (numBoxes * numFeatures !== totalElements) return;

        const numClasses = numFeatures - 4;
        const boxes: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
        const scores: number[] = [];
        const classIds: number[] = [];

        for (let i = 0; i < numBoxes; i++) {
          const baseIdx = i * numFeatures;
          const cx = outputTensor[baseIdx];
          const cy = outputTensor[baseIdx + 1];
          const w = outputTensor[baseIdx + 2];
          const h = outputTensor[baseIdx + 3];

          let maxScore = 0;
          let maxClassId = 0;

          for (let c = 0; c < numClasses; c++) {
            const score = outputTensor[baseIdx + 4 + c];
            if (score > maxScore) {
              maxScore = score;
              maxClassId = c;
            }
          }

          if (maxScore >= confidenceThreshold) {
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

        const dets = nonMaxSuppression(boxes, scores, classIds, nmsIouThreshold);
        const scaledDets = scaleBoxesToFrame(dets, imageData.width, imageData.height, MODEL_INPUT_SIZE);

        setDetections(scaledDets);
        setCount(scaledDets.length);
      } catch {
        // ignore frame errors
      } finally {
        runningRef.current = false;
      }
    },
    []
  );

  return {
    detections,
    count,
    fps,
    modelLoading,
    modelReady,
    loadModel,
    detect,
  };
}
