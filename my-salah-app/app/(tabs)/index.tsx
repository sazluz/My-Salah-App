import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Modal,
  StyleSheet, Dimensions, Image, TextInput
} from 'react-native';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PRAYER_ICONS = {
  Fajr: require('./assets/fajir.png'),
  Dhuhr: require('./assets/zuhur.png'),
  Asr: require('./assets/asr.png'),
  Maghrib: require('./assets/Magrib.png'),
  Isha: require('./assets/Isha.png'),
};

const COLORS = {
  onTime: '#4CAF50',
  late: '#FFC107',
  missed: '#F44336',
  default: '#1e1e1e'
};

const REASONS = [
  { icon: require('./assets/laziness.png'), label: 'Laziness' },
  { icon: require('./assets/work.png'), label: 'Work' },
  { icon: require('./assets/friends.png'), label: 'Friends' },
  { icon: require('./assets/family.png'), label: 'Family' },
  { icon: require('./assets/education.png'), label: 'Education' },
  { icon: require('./assets/sport.png'), label: 'Exercise' },
  { icon: require('./assets/sleep.png'), label: 'Sleep' },
  { icon: require('./assets/sick.png'), label: 'Sick' },
  { icon: require('./assets/other.png'), label: 'Other' },
];

const STATUS_OPTIONS = [
  {
    key: 'onTime',
    label: 'On Time',
    icon: require('./assets/salat.png'),
    color: COLORS.onTime
  },
  {
    key: 'late',
    label: 'Late',
    icon: require('./assets/pray.png'),
    color: COLORS.late
  },
  {
    key: 'missed',
    label: 'Not Prayed',
    icon: require('./assets/missed.png'),
    color: COLORS.missed
  }
];

const SalahTracker = () => {
  const [installDate, setInstallDate] = useState<Date | null>(null);
  const [dateList, setDateList] = useState<Date[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const [userName, setUserName] = useState<string | null>(null);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');

  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  // Always fetch latest userName when focused (for settings changes)
  useFocusEffect(
    React.useCallback(() => {
      const fetchName = async () => {
        const storedName = await AsyncStorage.getItem('userName');
        setUserName(storedName);
      };
      fetchName();
    }, [])
  );

  useEffect(() => {
    const init = async () => {
      let stored = await AsyncStorage.getItem('installDate');
      if (!stored) {
        stored = new Date().toISOString();
        await AsyncStorage.setItem('installDate', stored);
      }
      setInstallDate(new Date(stored));

      let storedName = await AsyncStorage.getItem('userName');
      if (!storedName) {
        setNameModalVisible(true);
      } else {
        setUserName(storedName);
      }
    };
    init();
  }, []);

  const handleSaveName = async () => {
    if (tempName.trim().length > 0) {
      await AsyncStorage.setItem('userName', tempName.trim());
      setUserName(tempName.trim());
      setNameModalVisible(false);
    }
  };

  // Dynamic calendar: always show 7 days, starting from install date,
  // and always ending 6 days after today (today + 6)
  useEffect(() => {
    if (installDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Always show 7 days: from installDate up to max(today + 6, installDate + 6)
      const start = new Date(installDate);
      start.setHours(0, 0, 0, 0);

      // End date is max(today + 6, installDate + 6)
      const end = new Date(today);
      end.setDate(today.getDate() + 6);
      const installEnd = new Date(installDate);
      installEnd.setDate(installDate.getDate() + 6);

      if (installEnd > end) {
        end.setTime(installEnd.getTime());
      }

      const days = [];
      let d = new Date(start);
      while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      setDateList(days);

      // Select today if in range, else last day
      const todayIndex = days.findIndex(
        d => d.toDateString() === today.toDateString()
      );
      setSelectedDateIndex(todayIndex !== -1 ? todayIndex : days.length - 1);
    }
  }, [installDate]);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const data = await AsyncStorage.getItem('prayerStatuses');
        if (data) setStatuses(JSON.parse(data));
      } catch (e) {}
      setLoading(false);
    };
    loadStatuses();
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('prayerStatuses', JSON.stringify(statuses));
    }
  }, [statuses, loading]);

  const isToday = selectedDateIndex === dateList.findIndex(
    d => d.toDateString() === new Date().toDateString()
  );

  const getStatusForPrayer = (prayer: string) => {
    const dateKey = dateList[selectedDateIndex]?.toDateString();
    return statuses[dateKey]?.[prayer];
  };

  const handlePrayerPress = (prayer: string) => {
    if (!isToday) return;
    setSelectedPrayer(prayer);
    setModalVisible(true);
  };

  const handleStatus = (status: string) => {
    const dateKey = dateList[selectedDateIndex].toDateString();
    if (status === 'missed') {
      setModalVisible(false);
      setReasonModalVisible(true);
    } else {
      setStatuses(prev => ({
        ...prev,
        [dateKey]: {
          ...(prev[dateKey] || {}),
          [selectedPrayer]: status
        }
      }));
      setModalVisible(false);
    }
  };

  const handleReason = (reason: string) => {
    const dateKey = dateList[selectedDateIndex].toDateString();
    setStatuses(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [selectedPrayer]: 'missed:' + reason
      }
    }));
    setReasonModalVisible(false);
  };

  const renderPrayer = (prayer: string) => {
    const status = getStatusForPrayer(prayer);
    let bgColor = COLORS.default;
    if (status === 'onTime') bgColor = COLORS.onTime;
    else if (status === 'late') bgColor = COLORS.late;
    else if (status?.startsWith('missed')) bgColor = COLORS.missed;

    return (
      <TouchableOpacity
        key={prayer}
        style={[
          styles.prayerCard,
          { backgroundColor: bgColor },
          !isToday && { opacity: 0.5 }
        ]}
        onPress={() => handlePrayerPress(prayer)}
        disabled={!isToday}
      >
        <View style={styles.iconBox}>
          <Image source={PRAYER_ICONS[prayer]} style={{ width: 32, height: 32, resizeMode: 'contain' }} />
        </View>
        <Text style={styles.prayerText}>{prayer}</Text>
      </TouchableOpacity>
    );
  };

  if (!dateList.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Name Modal */}
      <Modal transparent visible={nameModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>What's your name?</Text>
            <TextInput
              style={{
                backgroundColor: '#222',
                color: '#fff',
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#555'
              }}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={tempName}
              onChangeText={setTempName}
              onSubmitEditing={handleSaveName}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.optionBox, { backgroundColor: '#007bff' }]}
              onPress={handleSaveName}
            >
              <Text style={styles.optionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Greeting */}
      {userName && (
        <Text style={[styles.titleText, { marginBottom: 8 }]}>
          Welcome, {userName}
        </Text>
      )}

      <Text style={styles.titleText}>
        Today: {format(new Date(), 'EEE, d MMM')}
      </Text>

      <FlatList
        data={dateList}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateListContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.dateBox,
              index === selectedDateIndex && styles.selectedDateBox,
            ]}
            onPress={() => setSelectedDateIndex(index)}
          >
            <Text style={styles.dateText}>{format(item, 'dd')}</Text>
            <Text style={styles.dayText}>{format(item, 'EEE')}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.prayerList}>{PRAYERS.map(renderPrayer)}</View>

      {/* Status Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>How did you pray {selectedPrayer}?</Text>
            <View style={styles.statusOptionsRow}>
              {STATUS_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.statusOptionBox, { backgroundColor: option.color }]}
                  onPress={() => handleStatus(option.key)}
                  disabled={!isToday}
                >
                  <Image source={option.icon} style={styles.statusOptionIcon} />
                  <Text style={styles.statusOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.optionBox, { backgroundColor: '#555', marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reason Modal */}
      <Modal transparent visible={reasonModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedPrayer
                ? `Why did you miss ${selectedPrayer}?`
                : 'Why did you miss this prayer?'}
            </Text>
            <View style={styles.reasonGrid}>
              {REASONS.map((reason, idx) => (
                <TouchableOpacity
                  key={`${reason.label}_${idx}`}
                  style={styles.reasonItem}
                  onPress={() => handleReason(reason.label)}
                  disabled={!isToday}
                >
                  <Image source={reason.icon} style={styles.reasonIcon} />
                  <Text style={styles.reasonText}>{reason.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.optionBox, { backgroundColor: '#555' }]} onPress={() => setReasonModalVisible(false)}>
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  titleText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  dateListContainer: {
    minHeight: 60,
    marginTop: 16,
    marginBottom: 2
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    height: 60,
    width: 60
  },
  selectedDateBox: {
    backgroundColor: '#007bff'
  },
  dateText: {
    color: '#fff',
    fontSize: 16
  },
  dayText: {
    color: '#ccc',
    fontSize: 12
  },
  prayerList: {
    marginTop: 0
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 5
  },
  iconBox: {
    width: 35,
    height: 33,
    alignItems: 'center',
    marginRight: 25
  },
  prayerText: {
    fontSize: 20,
    color: '#fff'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  modalBox: {
    margin: 24,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center'
  },
  optionBox: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 6
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff'
  },
  statusOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  statusOptionBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  statusOptionIcon: {
    width: 48,
    height: 48,
    marginBottom: 6,
    resizeMode: 'contain'
  },
  statusOptionText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center'
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  reasonItem: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 10
  },
  reasonIcon: {
    width: 50,
    height: 50,
    marginBottom: 6,
    resizeMode: 'contain'
  },
  reasonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center'
  }
});

export default SalahTracker;