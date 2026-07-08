import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, StatusBar
} from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [report, setReport] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
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
      const me = res.data.report.find(r => r.student_id === user?.id);
      setMyRecord(me || res.data.report[0] || null);
    } catch { setReport([]); setMyRecord(null); }
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchReport(selectedCourse); }, [selectedCourse]);

  const getPctColor = (pct) => {
    if (pct >= 75) return '#009688';
    if (pct >= 50) return '#ffa726';
    return '#ef5350';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#009688" />
        <Text style={{ color: '#78909c', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004d40" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>Track your attendance per course</Text>
      </View>

      {/* Course Pills */}
      {courses.length > 0 && (
        <View style={styles.pillsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
            {courses.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.pill, selectedCourse?.id === c.id && styles.pillActive]}
                onPress={() => setSelectedCourse(c)}
              >
                <Text style={[styles.pillText, selectedCourse?.id === c.id && styles.pillTextActive]}>
                  {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* My Stats Card */}
      {myRecord && selectedCourse && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{selectedCourse.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{myRecord.total_sessions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{myRecord.attended_sessions}</Text>
              <Text style={styles.statLabel}>Attended</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: getPctColor(myRecord.attendance_percentage) }]}>
                {myRecord.attendance_percentage}%
              </Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${myRecord.attendance_percentage}%`,
              backgroundColor: getPctColor(myRecord.attendance_percentage)
            }]} />
          </View>

          {myRecord.attendance_percentage < 75 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠ Below 75% — You are a defaulter</Text>
            </View>
          )}
        </View>
      )}

      {/* All Students */}
      <Text style={styles.listTitle}>All Students</Text>
      <FlatList
        data={report}
        keyExtractor={item => item.student_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCourses(); }} tintColor="#009688" />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📊</Text>
            <Text style={styles.emptyText}>No attendance data yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <View style={styles.miniBar}>
                <View style={[styles.miniBarFill, {
                  width: `${item.attendance_percentage}%`,
                  backgroundColor: getPctColor(item.attendance_percentage)
                }]} />
              </View>
            </View>
            <View style={[styles.pctPill, { backgroundColor: getPctColor(item.attendance_percentage) + '20' }]}>
              <Text style={[styles.pctText, { color: getPctColor(item.attendance_percentage) }]}>
                {item.attendance_percentage}%
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#004d40',
    paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 3 },
  pillsWrapper: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eceff1' },
  pills: { paddingHorizontal: 16, gap: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f0f4f4',
    borderWidth: 1.5, borderColor: '#cfd8dc',
  },
  pillActive: { backgroundColor: '#009688', borderColor: '#009688' },
  pillText: { fontSize: 13, fontWeight: '700', color: '#546e7a' },
  pillTextActive: { color: '#fff' },
  statsCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  statsTitle: { fontSize: 15, fontWeight: '700', color: '#263238', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '900', color: '#009688' },
  statLabel: { fontSize: 11, color: '#90a4ae', marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: '#eceff1' },
  progressBg: { backgroundColor: '#eceff1', borderRadius: 6, height: 10, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: 6 },
  warningBox: {
    backgroundColor: '#fdecea', borderRadius: 8, padding: 10, marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: '#ef5350',
  },
  warningText: { color: '#c62828', fontSize: 12, fontWeight: '700' },
  listTitle: { fontSize: 12, fontWeight: '700', color: '#78909c', paddingHorizontal: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  studentCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  studentAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  studentAvatarText: { color: '#009688', fontWeight: '800', fontSize: 15 },
  studentInfo: { flex: 1, marginRight: 10 },
  studentName: { fontSize: 14, fontWeight: '700', color: '#263238', marginBottom: 6 },
  miniBar: { backgroundColor: '#eceff1', borderRadius: 4, height: 5, overflow: 'hidden' },
  miniBarFill: { height: 5, borderRadius: 4 },
  pctPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pctText: { fontSize: 13, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { color: '#90a4ae', fontSize: 14 },
});
