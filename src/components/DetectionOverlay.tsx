import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import type { Detection } from '../services/detectionUtils';
import { Colors } from '../constants/theme';

interface DetectionOverlayProps {
  detections: Detection[];
  frameWidth?: number;
  frameHeight?: number;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * SVG overlay that draws bounding boxes around detected rebars.
 * Scales detection coordinates (in camera frame pixel space) to screen space.
 */
export default function DetectionOverlay({
  detections,
  frameWidth = SCREEN_W,
  frameHeight = SCREEN_H,
}: DetectionOverlayProps) {
  if (detections.length === 0) return null;

  // Calculate scale-to-fit from camera frame to screen
  const frameAspect = frameWidth / frameHeight;
  const screenAspect = SCREEN_W / SCREEN_H;

  let scaleX: number;
  let scaleY: number;
  let offsetX = 0;
  let offsetY = 0;

  if (frameAspect > screenAspect) {
    // Frame is wider — fit to screen width
    scaleX = SCREEN_W / frameWidth;
    scaleY = scaleX;
    offsetY = (SCREEN_H - frameHeight * scaleY) / 2;
  } else {
    // Frame is taller — fit to screen height
    scaleY = SCREEN_H / frameHeight;
    scaleX = scaleY;
    offsetX = (SCREEN_W - frameWidth * scaleX) / 2;
  }

  return (
    <Svg
      style={{ position: 'absolute', left: 0, top: 0 }}
      width={SCREEN_W}
      height={SCREEN_H}
    >
      {detections.map((d, i) => {
        const x = d.box.x1 * scaleX + offsetX;
        const y = d.box.y1 * scaleY + offsetY;
        const w = (d.box.x2 - d.box.x1) * scaleX;
        const h = (d.box.y2 - d.box.y1) * scaleY;

        return (
          <G key={`det-${i}`}>
            {/* Bounding box */}
            <Rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill="none"
              stroke={Colors.accent}
              strokeWidth={2}
              rx={4}
              opacity={0.9}
            />
            {/* Confidence label */}
            <SvgText
              x={x + 4}
              y={y - 6}
              fill={Colors.accent}
              fontSize={11}
              fontWeight="bold"
            >
              {`${Math.round(d.confidence * 100)}%`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
