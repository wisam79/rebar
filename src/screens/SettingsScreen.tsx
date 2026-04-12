import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { getRecordCount, deleteAllRecords } from '../services/db';
import { Colors } from '../constants/theme';

export default function SettingsScreen() {
  const [recordCount, setRecordCount] = useState(0);

  const fetchCount = useCallback(async () => {
    const c = await getRecordCount();
    setRecordCount(c);
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear All History',
      `This will permanently delete all ${recordCount} saved records. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllRecords();
              setRecordCount(0);
              Alert.alert('Done', 'All records have been deleted.');
            } catch (e) {
              Alert.alert('Error', 'Failed to delete records.');
            }
          },
        },
      ]
    );
  }, [recordCount]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* App Info Card */}
      <View style={styles.card}>
        <Text style={styles.appName}>Rebar Counter</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appDesc}>
          Offline-first construction rebar counter using on-device ML inference.
        </Text>
      </View>

      {/* Database Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Database</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Saved Records</Text>
          <Text style={styles.statValue}>{recordCount}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.statDesc}>
          All data is stored locally on device. No cloud sync.
        </Text>
      </View>

      {/* Actions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleClearHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.actionBtnText}>Clear All History</Text>
        </TouchableOpacity>
      </View>

      {/* ML Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ML Inference</Text>
        <Text style={styles.statDesc}>
          Detection runs entirely on-device using a YOLO-based TFLite model.
          No internet connection required. All frame processing happens locally
          via react-native-fast-tflite.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  appDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 8,
  },
  statDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  actionBtn: {
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
