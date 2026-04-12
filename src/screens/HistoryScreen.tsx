import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import type { Record } from '../services/db';
import { getAllRecords, deleteRecord } from '../services/db';
import { Colors } from '../constants/theme';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Single record card in the history list.
 */
const RecordCard = React.memo(function RecordCard({
  record,
  onDelete,
}: {
  record: Record;
  onDelete: (id: number) => void;
}) {
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete the count of ${record.count_result} rebars?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(record.id),
        },
      ]
    );
  }, [record, onDelete]);

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardCount}>{record.count_result}</Text>
        <Text style={styles.cardLabel}>REBARS</Text>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardRight}>
        <Text style={styles.cardProject}>{record.project_name || '—'}</Text>
        <Text style={styles.cardDate}>
          {formatDate(record.timestamp)} · {formatTime(record.timestamp)}
        </Text>
        {record.notes ? (
          <Text style={styles.cardNotes} numberOfLines={1}>
            {record.notes}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDelete}
        activeOpacity={0.6}
      >
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
});

export default function HistoryScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllRecords();
      setRecords(data);
    } catch (e) {
      console.error('Failed to fetch records:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Failed to delete record:', e);
      Alert.alert('Error', 'Could not delete record.');
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecords();
  }, [fetchRecords]);

  const renderItem = useCallback(
    ({ item }: { item: Record }) => (
      <RecordCard record={item} onDelete={handleDelete} />
    ),
    [handleDelete]
  );

  const keyExtractor = useCallback(
    (item: Record) => String(item.id),
    []
  );

  if (!loading && records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptySubtitle}>
          Captured rebar counts will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <Text style={styles.loadingText}>Loading records…</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cardLeft: {
    alignItems: 'center',
    minWidth: 60,
  },
  cardCount: {
    color: Colors.accent,
    fontSize: 36,
    fontWeight: 'bold',
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  cardDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },
  cardRight: {
    flex: 1,
  },
  cardProject: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  cardNotes: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
});
