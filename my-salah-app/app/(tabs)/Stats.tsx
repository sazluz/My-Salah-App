import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const COLORS = {
  onTime: '#4CAF50',
  late: '#FFC107',
  missed: '#F44336',
  default: '#1e1e1e'
};

const Stats = () => {
  const [stats, setStats] = useState({});
  const [dates, setDates] = useState<string[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchStats = async () => {
    const data = await AsyncStorage.getItem('prayerStatuses');
    if (data) {
      const parsed = JSON.parse(data);
      setStats(parsed);
      const filteredDates = Object.keys(parsed)
        .filter(dateKey =>
          PRAYERS.some(prayer => parsed[dateKey][prayer])
        )
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      setDates(filteredDates);
    }
    // Fetch user name
    const storedName = await AsyncStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  // Calculate totals
  const totals = PRAYERS.reduce(
    (acc, prayer) => {
      Object.values(stats).forEach((day: any) => {
        const status = day[prayer];
        if (status === 'onTime') acc.onTime++;
        else if (status === 'late') acc.late++;
        else if (status?.startsWith('missed')) acc.missed++;
      });
      return acc;
    },
    { onTime: 0, late: 0, missed: 0 }
  );

  return (
    <View style={styles.container}>
      {/* Greeting */}
      {userName && (
        <Text style={[styles.header, { marginBottom: 8 }]}>
          Welcome, {userName}
        </Text>
      )}
      <Text style={styles.header}>Your Salah Stats</Text>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, { backgroundColor: COLORS.onTime }]}>
          <Text style={styles.summaryLabel}>On Time</Text>
          <Text style={styles.summaryValue}>{totals.onTime}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: COLORS.late }]}>
          <Text style={styles.summaryLabel}>Late</Text>
          <Text style={styles.summaryValue}>{totals.late}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: COLORS.missed }]}>
          <Text style={styles.summaryLabel}>Missed</Text>
          <Text style={styles.summaryValue}>{totals.missed}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Daily Details</Text>
      {dates.length === 0 && (
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
          No stats yet. Mark your prayers to see stats here.
        </Text>
      )}
      <View style={styles.allDaysBox}>
        {dates.map(dateStr => (
          <View style={styles.dayRow} key={dateStr}>
            <Text style={styles.dayDate}>{dateStr}</Text>
            <View style={styles.dayPrayers}>
              {PRAYERS.map(prayer => {
                const status = stats[dateStr]?.[prayer];
                let color = COLORS.default;
                if (status === 'onTime') color = COLORS.onTime;
                else if (status === 'late') color = COLORS.late;
                else if (status?.startsWith('missed')) color = COLORS.missed;
                return (
                  <View key={prayer} style={[styles.prayerStatus, { backgroundColor: color }]}>
                    <Text style={styles.prayerText}>{prayer}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    paddingTop: 48
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center'
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4
  },
  summaryValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12
  },
  allDaysBox: {
    marginBottom: 18
  },
  dayRow: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8
  },
  dayDate: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6
  },
  dayPrayers: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  prayerStatus: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center'
  },
  prayerText: {
    color: '#fff',
    fontSize: 10,
    marginBottom: 2
  },
  statusText: {
    color: '#fff',
    fontSize: 10
  }
});

export default Stats;