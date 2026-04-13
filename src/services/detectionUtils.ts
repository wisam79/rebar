export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  box: BoundingBox;
  confidence: number;
  classId: number;
}

export function computeIOU(a: BoundingBox, b: BoundingBox): number {
  const interX1 = Math.max(a.x1, b.x1);
  const interY1 = Math.max(a.y1, b.y1);
  const interX2 = Math.min(a.x2, b.x2);
  const interY2 = Math.min(a.y2, b.y2);

  const interW = Math.max(0, interX2 - interX1);
  const interH = Math.max(0, interY2 - interY1);
  const interArea = interW * interH;

  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);

  const unionArea = areaA + areaB - interArea;
  if (unionArea <= 0) return 0;

  return interArea / unionArea;
}

export function nonMaxSuppression(
  boxes: BoundingBox[],
  scores: number[],
  classIds: number[],
  iouThreshold: number
): Detection[] {
  const indices: number[] = [];
  for (let i = 0; i < scores.length; i++) {
    indices.push(i);
  }

  indices.sort((a, b) => scores[b] - scores[a]);

  const selected: Detection[] = [];
  const suppressed = new Array(scores.length).fill(false);

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    if (suppressed[idx]) continue;
    if (scores[idx] < 0.001) continue;

    selected.push({
      box: boxes[idx],
      confidence: scores[idx],
      classId: classIds[idx],
    });

    for (let j = i + 1; j < indices.length; j++) {
      const jdx = indices[j];
      if (suppressed[jdx]) continue;
      if (classIds[jdx] !== classIds[idx]) continue;

      const iou = computeIOU(boxes[idx], boxes[jdx]);
      if (iou > iouThreshold) {
        suppressed[jdx] = true;
      }
    }
  }

  return selected;
}

export function scaleBoxesToFrame(
  detections: Detection[],
  frameWidth: number,
  frameHeight: number,
  modelInputSize: number
): Detection[] {
  const scaleX = frameWidth / modelInputSize;
  const scaleY = frameHeight / modelInputSize;

  return detections.map((d) => ({
    box: {
      x1: d.box.x1 * scaleX,
      y1: d.box.y1 * scaleY,
      x2: d.box.x2 * scaleX,
      y2: d.box.y2 * scaleY,
    },
    confidence: d.confidence,
    classId: d.classId,
  }));
}

export function resizeFrameToModel(
  frameData: Uint8Array,
  frameWidth: number,
  frameHeight: number,
  modelSize: number
): Float32Array {
  const channels = 3;
  const output = new Float32Array(modelSize * modelSize * channels);
  const scaleX = frameWidth / modelSize;
  const scaleY = frameHeight / modelSize;

  for (let y = 0; y < modelSize; y++) {
    const srcY = Math.min(Math.floor(y * scaleY), frameHeight - 1);
    for (let x = 0; x < modelSize; x++) {
      const srcX = Math.min(Math.floor(x * scaleX), frameWidth - 1);
      const srcIdx = (srcY * frameWidth + srcX) * channels;
      const dstIdx = (y * modelSize + x) * channels;
      output[dstIdx] = frameData[srcIdx] / 255.0;
      output[dstIdx + 1] = frameData[srcIdx + 1] / 255.0;
      output[dstIdx + 2] = frameData[srcIdx + 2] / 255.0;
    }
  }

  return output;
}
