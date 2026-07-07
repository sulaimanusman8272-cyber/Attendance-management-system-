import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import api from '../api/axios';

export default function AttendanceScreen() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses);
      if (res.data.courses.length > 0 && !selectedCourse) {
        setSelectedCourse(res.data.courses[0]);
      }
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  const fetchReport = async (course) => {
    if (!course) return;
    try {
      const res = await api.get(`/reports/course/${course.id}/attendance`);
      setReport(res.data.report);
    } catch (_) {
      setReport([]);
    }
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchReport(selectedCourse); }, [selectedCourse]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Course Selector */}
      <View style={styles.courseSelector}>
        <FlatList
          data={courses}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.courseChip,
                selectedCourse?.id === item.id && styles.courseChipActive
              ]}
              onPress={() => setSelectedCourse(item)}
            >
              <Text style={[
                styles.courseChipText,
                selectedCourse?.id === item.id && styles.courseChipTextActive
              ]}>
                {item.code}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 12, gap: 8 }}
        />
      </View>

      {/* My Attendance Stats */}
      {report && report.length > 0 && selectedCourse && (() => {
        // Find current user's record (we'll show all since API returns all students)
        const myRecord = report[0]; // Simplified - shows first record
        return (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>{selectedCourse.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{myRecord?.total_sessions || 0}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{myRecord?.attended_sessions || 0}</Text>
                <Text style={styles.statLabel}>Attended</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={[styles.statItem]}>
                <Text style={[
                  styles.statNum,
                  { color: (myRecord?.attendance_percentage || 0) >= 75 ? '#2e7d32' : '#e53935' }
                ]}>
                  {myRecord?.attendance_percentage || 0}%
                </Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </View>
            </View>
            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View style={[
                styles.progressFill,
                {
                  width: `${myRecord?.attendance_percentage || 0}%`,
                  backgroundColor: (myRecord?.attendance_percentage || 0) >= 75 ? '#2e7d32' : '#e53935'
                }
              ]} />
            </View>
            {(myRecord?.attendance_percentage || 0) < 75 && (
              <Text style={styles.warningText}>
                Warning: Attendance below 75%. You are a defaulter.
              </Text>
            )}
          </View>
        );
      })()}

      {/* All Student Records */}
      <Text style={styles.sectionTitle}>All Students</Text>
      <FlatList
        data={report || []}
        keyExtractor={item => item.student_id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchCourses(); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No attendance data available.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.recordInfo}>
              <Text style={styles.recordName}>{item.name}</Text>
              <Text style={styles.recordEmail}>{item.email}</Text>
              <View style={styles.progressBg}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${item.attendance_percentage}%`,
                    backgroundColor: item.attendance_percentage >= 75 ? '#2e7d32' : '#e53935'
                  }
                ]} />
              </View>
            </View>
            <View style={[
              styles.pctBadge,
              { backgroundColor: item.attendance_percentage >= 75 ? '#e8f5e9' : '#fdecea' }
            ]}>
              <Text style={[
                styles.pctText,
                { color: item.attendance_percentage >= 75 ? '#2e7d32' : '#e53935' }
              ]}>
                {item.attendance_percentage}%
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  courseSelector: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  courseChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f0f2f5',
    borderWidth: 1, borderColor: '#ddd',
  },
  courseChipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  courseChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  courseChipTextActive: { color: '#fff' },
  statsCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 12,
    padding: 18, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2,
  },
  statsTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#1a73e8' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#eee' },
  progressBg: { backgroundColor: '#eee', borderRadius: 4, height: 8, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  warningText: { color: '#e53935', fontSize: 12, marginTop: 8, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', paddingHorizontal: 16, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  recordCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e8f0fe', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#1a73e8', fontWeight: '700', fontSize: 16 },
  recordInfo: { flex: 1, marginRight: 10 },
  recordName: { fontSize: 14, fontWeight: '700', color: '#333' },
  recordEmail: { fontSize: 11, color: '#888', marginBottom: 6 },
  pctBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pctText: { fontSize: 13, fontWeight: '800' },
  emptyText: { color: '#aaa', fontSize: 14 },
});
