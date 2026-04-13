import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRebarDetector } from '../hooks/useRebarDetector';
import DetectionOverlay from '../components/DetectionOverlay';
import IconButton from '../components/IconButton';
import BottomSheet from '../components/BottomSheet';
import Badge from '../components/Badge';
import { saveRecord } from '../services/db';
import { useAppContext } from '../context/AppContext';
import {
  FlashIcon, FlashOffIcon, CaptureIcon, FolderIcon, RefreshIcon,
} from '../constants/icons';

export default function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  const { settings, activeProject, projects, updateSetting } = useAppContext();
  const { detections, count, fps, modelLoading, modelReady, loadModel, detect } = useRebarDetector();

  const countRef = useRef(count);
  countRef.current = count;
  const confRef = useRef(settings.confidenceThreshold);
  confRef.current = settings.confidenceThreshold;
  const iouRef = useRef(settings.nmsIouThreshold);
  iouRef.current = settings.nmsIouThreshold;

  useEffect(() => { loadModel(); }, [loadModel]);
  useEffect(() => { setFlash(settings.flashEnabled); }, [settings.flashEnabled]);

  useEffect(() => {
    let animFrameId: number;
    let lastDetectTime = 0;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setError('Camera access denied. Please allow camera permission and reload.');
      }
    };

    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !modelReady) {
        animFrameId = requestAnimationFrame(processFrame);
        return;
      }
      const now = Date.now();
      if (now - lastDetectTime < 1000) {
        animFrameId = requestAnimationFrame(processFrame);
        return;
      }
      lastDetectTime = now;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        await detect(imageData, confRef.current, iouRef.current);
      }
      animFrameId = requestAnimationFrame(processFrame);
    };

    startCamera();
    animFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [modelReady, detect]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleCaptureAndSave = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      await saveRecord(countRef.current, imageDataUrl, activeProject?.name ?? 'Unassigned', activeProject?.id ?? null, `Session capture at ${new Date().toLocaleTimeString()}`, settings.rebarDiameter, settings.rebarGrade);
      setSessionCount(prev => prev + 1);
    } catch (e) {
      console.error('Capture failed:', e);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, activeProject, settings]);

  const toggleFlash = useCallback(() => {
    const next = !flash;
    setFlash(next);
    updateSetting('flashEnabled', next);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try { track.applyConstraints({ advanced: [{ torch: next }] as any }); } catch {}
      }
    }
  }, [flash, updateSetting]);

  const resetSession = useCallback(() => { setSessionCount(0); }, []);

  if (error) {
    return (
      <div style={{ flex: 1, background: 'var(--bg)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <div style={{ fontSize: 15, color: 'var(--danger)', textAlign: 'center' }}>{error}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ flex: 1, background: '#000', position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%', minHeight: '100%',
          objectFit: 'cover',
          width: containerSize.width, height: containerSize.height,
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <DetectionOverlay detections={detections} containerWidth={containerSize.width} containerHeight={containerSize.height} />

      {!cameraReady || modelLoading ? (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 14,
        }}>
          <div className="spinner" />
          <span style={{ fontSize: 14, color: 'var(--text-2)' }}>
            {modelLoading ? 'Loading model...' : 'Starting camera...'}
          </span>
        </div>
      ) : null}

      {cameraReady && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
            paddingTop: 56, paddingLeft: 16, paddingRight: 16, paddingBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            {activeProject && (
              <button onClick={() => setShowProjectPicker(true)} className="chip" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'transparent', color: 'var(--accent)', maxWidth: '60%' }}>
                <FolderIcon size={14} color="var(--accent)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeProject.name}</span>
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-2)' }}>
                {fps} FPS
              </div>
              <IconButton onPress={toggleFlash} size={40} backgroundColor={flash ? 'var(--accent-light)' : 'rgba(0,0,0,0.5)'}>
                {flash ? <FlashIcon size={20} color="var(--accent)" /> : <FlashOffIcon size={18} color="var(--text-2)" />}
              </IconButton>
            </div>
          </div>

          <div style={{
            position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 20, padding: '20px 36px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              animation: count > 0 ? 'countPop 0.3s ease' : 'none',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)' }}>DETECTED</span>
              <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-2px', color: 'var(--accent)', lineHeight: 1, margin: '4px 0' }}>{count}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)' }}>REBARS</span>
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
            paddingBottom: 48, paddingTop: 24, paddingLeft: 20, paddingRight: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 320, margin: '0 auto' }}>
              <IconButton onPress={resetSession} size={48} backgroundColor="rgba(255,255,255,0.1)">
                <RefreshIcon size={20} color="var(--text-1)" />
              </IconButton>

              <button
                onClick={handleCaptureAndSave}
                disabled={isCapturing}
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  background: 'var(--accent)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                  border: '4px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 0 24px rgba(var(--accent-rgb), 0.4)',
                  cursor: isCapturing ? 'default' : 'pointer', opacity: isCapturing ? 0.5 : 1,
                  padding: 0, transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  transform: isCapturing ? 'scale(0.9)' : 'scale(1)',
                }}
              >
                {isCapturing ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : <CaptureIcon size={32} color="#fff" />}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-3)' }}>SESSION</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>{sessionCount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {settings.rebarDiameter > 0 && <Badge label={`Ø${settings.rebarDiameter}mm`} variant="accent" size="md" />}
              {settings.rebarGrade && <Badge label={settings.rebarGrade} variant="default" size="md" />}
            </div>
          </div>
        </>
      )}

      <BottomSheet visible={showProjectPicker} onClose={() => setShowProjectPicker(false)} title="Select Project">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => { updateSetting('selectedProjectId', p.id ?? null); setShowProjectPicker(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', width: '100%', textAlign: 'left',
              background: p.id === settings.selectedProjectId ? 'var(--accent-light)' : 'transparent',
              border: 'none', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', color: 'inherit', font: 'inherit',
              transition: 'background 0.15s ease',
            }}
          >
            <FolderIcon size={20} color={p.id === (settings.selectedProjectId ?? null) ? 'var(--accent)' : 'var(--text-2)'} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)' }}>{p.name}</div>
              {p.location && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{p.location}</div>}
            </div>
            {p.id === (settings.selectedProjectId ?? null) && <Badge label="Active" variant="accent" size="sm" />}
          </button>
        ))}
        <button
          onClick={() => { updateSetting('selectedProjectId', null); setShowProjectPicker(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 18px', width: '100%', textAlign: 'left',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'inherit', font: 'inherit',
          }}
        >
          <FolderIcon size={20} color="var(--text-3)" />
          <span style={{ fontSize: 15, color: 'var(--text-3)' }}>No Project</span>
        </button>
      </BottomSheet>
    </div>
  );
}
