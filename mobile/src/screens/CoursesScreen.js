import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import api from '../api/axios';

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#009688" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004d40" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{courses.length}</Text>
        </View>
      </View>

      <FlatList
        data={courses}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCourses(); }} tintColor="#009688" />
        }
        contentContainerStyle={{ padding: 16, paddingTop: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptyText}>You are not enrolled in any courses yet. Contact your admin.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.courseName}>{item.name}</Text>
              <Text style={styles.courseCode}>{item.code}</Text>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.codePill}>
                <Text style={styles.codePillText}>{item.code}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#78909c', fontSize: 14 },
  header: {
    backgroundColor: '#004d40',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  countBadge: {
    backgroundColor: '#009688', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  countText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { marginRight: 14 },
  indexBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center', alignItems: 'center',
  },
  indexText: { color: '#009688', fontWeight: '800', fontSize: 14 },
  cardBody: { flex: 1 },
  courseName: { fontSize: 15, fontWeight: '700', color: '#263238', marginBottom: 3 },
  courseCode: { fontSize: 12, color: '#78909c' },
  cardRight: {},
  codePill: {
    backgroundColor: '#e0f2f1', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  codePillText: { color: '#00796b', fontWeight: '700', fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#37474f', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#90a4ae', textAlign: 'center', lineHeight: 20 },
});
