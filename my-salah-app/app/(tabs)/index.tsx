import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Modal,
  StyleSheet, Dimensions, Image
} from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const COLORS = {
  onTime: '#4CAF50',
  late: '#FFC107',
  missed: '#F44336',
  default: '#1e1e1e'
};

// ✅ Removed duplicate "Work"
const REASONS = [
  { icon: require('./assets/dawah.png'), label: 'Laziness' },
  { icon: require('./assets/work.png'), label: 'Work' },
  { icon: require('./assets/friends.png'), label: 'Friends' },
  { icon: require('./assets/family.png'), label: 'Family' },
  { icon: require('./assets/education.png'), label: 'Education' },
  { icon: require('./assets/exercise.png'), label: 'Exercise' },
  { icon: require('./assets/guests.png'), label: 'Guests' },
  { icon: require('./assets/quran.png'), label: 'Quran' },
  // { icon: require('./assets/other.png'), label: 'Other' }, // ✅ You can use a generic icon here
];

const SalahTracker = () => {
  const today = new Date();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [dateList] = useState(
    Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - 7 + i);
      return date;
    })
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState(7);

  const handlePrayerPress = (prayer: string) => {
    setSelectedPrayer(prayer);
    setModalVisible(true);
  };

  const handleStatus = (status: string) => {
    if (status === 'missed') {
      setModalVisible(false);
      setReasonModalVisible(true);
    } else {
      setStatuses(prev => ({
        ...prev,
        [`${selectedDateIndex}_${selectedPrayer}`]: status
      }));
      setModalVisible(false);
    }
  };

  const handleReason = (reason: string) => {
    setStatuses(prev => ({
      ...prev,
      [`${selectedDateIndex}_${selectedPrayer}`]: 'missed:' + reason
    }));
    setReasonModalVisible(false);
  };

  const renderPrayer = (prayer: string) => {
    const status = statuses[`${selectedDateIndex}_${prayer}`];
    let bgColor = COLORS.default;
    if (status === 'onTime') bgColor = COLORS.onTime;
    else if (status === 'late') bgColor = COLORS.late;
    else if (status?.startsWith('missed')) bgColor = COLORS.missed;

    return (
      <TouchableOpacity
        key={prayer}
        style={[styles.prayerCard, { backgroundColor: bgColor }]}
        onPress={() => handlePrayerPress(prayer)}
      >
        <View style={styles.iconBox}>
          <Icon name="sunrise" size={24} color="#00faff" />
        </View>
        <Text style={styles.prayerText}>{prayer}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>
        Today: {format(dateList[selectedDateIndex], 'EEE, d MMM')}
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
              index === selectedDateIndex && styles.selectedDateBox
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
            <TouchableOpacity style={[styles.optionBox, { backgroundColor: COLORS.onTime }]} onPress={() => handleStatus('onTime')}>
              <Text style={styles.optionText}>✅ On Time</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBox, { backgroundColor: COLORS.late }]} onPress={() => handleStatus('late')}>
              <Text style={styles.optionText}>⏰ Late</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBox, { backgroundColor: COLORS.missed }]} onPress={() => handleStatus('missed')}>
              <Text style={styles.optionText}>❌ Not Prayed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBox, { backgroundColor: '#555' }]} onPress={() => setModalVisible(false)}>
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
                  key={`${reason.label}_${idx}`} // ✅ Unique key
                  style={styles.reasonItem}
                  onPress={() => handleReason(reason.label)}
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
    marginBottom: 14
  },
  iconBox: {
    width: 30,
    alignItems: 'center',
    marginRight: 12
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
