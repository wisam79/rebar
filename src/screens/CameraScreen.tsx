import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  CameraCaptureError,
} from 'react-native-vision-camera';
import type { Camera as CameraType } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useRebarDetector } from '../hooks/useRebarDetector';
import DetectionOverlay from '../components/DetectionOverlay';
import { saveRecord } from '../services/db';
import { Colors } from '../constants/theme';

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<CameraType>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [projectName, setProjectName] = useState('');

  // Load the TFLite model
  const plugin = useTensorflowModel(require('../../assets/model.tflite'));

  // Detector hook — provides frameProcessor, count, fps, detections
  const { frameProcessor, detections, count, fps } =
    useRebarDetector(plugin);

  useEffect(() => {
    if (hasPermission) {
      setPermissionGranted(true);
    } else {
      requestPermission().then((granted) => {
        setPermissionGranted(granted);
        if (!granted) {
          Alert.alert(
            'Camera Permission Required',
            'This app needs camera access to detect and count rebar.',
            [{ text: 'OK', onPress: () => requestPermission() }]
          );
        }
      });
    }
  }, [hasPermission, requestPermission]);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  /**
   * Capture the current frame, then save the detection result to SQLite.
   * Uses takeSnapshot for a quick capture without needing photo mode enabled.
   */
  const handleCaptureAndSave = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      // Capture snapshot
      const snapshot = await cameraRef.current.takeSnapshot({
        quality: 80,
      });

      // Save to database
      await saveRecord(
        count,
        snapshot.path,
        projectName || 'Default',
        `Auto-captured at ${new Date().toLocaleTimeString()}`
      );

      Alert.alert(
        'Saved',
        `Count: ${count} rebars\nProject: ${projectName || 'Default'}\nSaved to history.`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      const err = e as Error;
      // Ignore "recording in progress" type errors gracefully
      if (
        err.message?.includes('recording') ||
        err.message?.includes('preview')
      ) {
        console.warn('Snapshot skipped:', err.message);
      } else {
        Alert.alert('Error', `Failed to save: ${err.message}`);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [cameraRef, isCapturing, count, projectName]);

  // --- Permission Denied State ---
  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.status}>Requesting camera permission…</Text>
      </View>
    );
  }

  // --- No Camera Device ---
  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No back camera device found.</Text>
      </View>
    );
  }

  // --- Model Loading State ---
  if (plugin.state !== 'loaded') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.status}>Loading model… ({plugin.state})</Text>
      </View>
    );
  }

  // --- Camera Active ---
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        onStarted={handleCameraReady}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
      />

      {/* Bounding Box Overlay */}
      <DetectionOverlay detections={detections} />

      {/* HUD: Live Count */}
      <View style={styles.hudContainer}>
        <View style={styles.hudCard}>
          <Text style={styles.hudLabel}>DETECTED</Text>
          <Text style={styles.hudCount}>{count}</Text>
          <Text style={styles.hudLabel}>REBARS</Text>
        </View>
        {cameraReady && (
          <View style={styles.hudSecondary}>
            <Text style={styles.hudFpsText}>{fps} FPS</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]}
          onPress={handleCaptureAndSave}
          disabled={isCapturing}
          activeOpacity={0.7}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color={Colors.background} />
          ) : (
            <>
              <Text style={styles.captureIcon}>📸</Text>
              <Text style={styles.captureLabel}>Capture & Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  status: {
    color: Colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  hudContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hudLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  hudCount: {
    color: Colors.accent,
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  hudSecondary: {
    marginTop: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hudFpsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 180,
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  captureLabel: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
