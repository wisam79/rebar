import React, { useEffect, useRef } from 'react';
import type { Detection } from '../services/detectionUtils';

interface DetectionOverlayProps {
  detections: Detection[];
  containerWidth: number;
  containerHeight: number;
}

export default function DetectionOverlay({
  detections,
  containerWidth,
  containerHeight,
}: DetectionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || detections.length === 0 || containerWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0A84FF';

    for (const d of detections) {
      const x = d.box.x1;
      const y = d.box.y1;
      const w = d.box.x2 - d.box.x1;
      const h = d.box.y2 - d.box.y1;

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.9;

      const r = 6;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.stroke();

      const cornerLen = Math.min(w, h) * 0.2;
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerLen, y + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerLen);
      ctx.stroke();

      const labelY = Math.max(0, y - 22);
      const confText = `${Math.round(d.confidence * 100)}%`;
      ctx.font = 'bold 11px -apple-system, sans-serif';
      const textW = ctx.measureText(confText).width + 10;

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(x, labelY, textW, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 1;
      ctx.textBaseline = 'middle';
      ctx.fillText(confText, x + 5, labelY + 10);
    }

    ctx.globalAlpha = 1;
  }, [detections, containerWidth, containerHeight]);

  if (detections.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', left: 0, top: 0,
        width: containerWidth, height: containerHeight,
        pointerEvents: 'none',
      }}
    />
  );
}
