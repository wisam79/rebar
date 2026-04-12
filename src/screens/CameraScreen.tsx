import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useRebarDetector } from '../hooks/useRebarDetector';
import { Colors } from '../constants/theme';

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [cameraReady, setCameraReady] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Load the TFLite model — returns a TensorflowPlugin
  const plugin = useTensorflowModel(require('../../assets/model.tflite'));

  // Initialize the detector hook with the plugin
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
            'This app needs camera access to detect and count rebar. Please grant permission in settings.',
            [{ text: 'OK', onPress: () => requestPermission() }]
          );
        }
      });
    }
  }, [hasPermission, requestPermission]);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

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
  const modelState = plugin.state;
  if (modelState !== 'loaded') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.status}>Loading model… ({modelState})</Text>
      </View>
    );
  }

  // --- Camera Active ---
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        onStarted={handleCameraReady}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
      />

      {/* Live HUD Overlay */}
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
        {!cameraReady && (
          <ActivityIndicator
            size="small"
            color={Colors.accent}
            style={styles.loader}
          />
        )}
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
  loader: {
    position: 'absolute',
    bottom: 120,
  },
});
