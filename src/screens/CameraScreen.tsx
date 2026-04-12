import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { Colors } from '../constants/theme';

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [cameraReady, setCameraReady] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Load the TFLite model
  // The model is bundled via metro.config.js from assets/model.tflite
  const model = useTensorflowModel(require('../../assets/model.tflite'));

  useEffect(() => {
    if (hasPermission) {
      setPermissionGranted(true);
    } else {
      // Request permission on mount
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
  const modelState = model.state;
  if (modelState !== 'loaded') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.status}>
          Loading model… ({modelState})
        </Text>
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
      />
      {cameraReady ? (
        <View style={styles.readyOverlay}>
          <Text style={styles.readyText}>Camera Ready</Text>
          <Text style={styles.readyText}>Model Loaded ✓</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  loader: {
    position: 'absolute',
  },
  readyOverlay: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: Colors.overlay,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  readyText: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginVertical: 2,
  },
});
