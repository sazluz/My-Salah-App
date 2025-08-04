import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking, Share, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yourapp';
const WEBSITE_URL = 'https://codeforummah.vercel.app';
const PRIVACY_POLICY_URL = 'https://codeforummah.vercel.app/Mysalah-app/privacy';
const ABOUT_US_URL = 'https://codeforummah.vercel.app/about-us'; 
const TELEGRAM_URL = 'https://t.me/sazluz'; 

export default function SettingsScreen() {
  const [userName, setUserName] = useState<string>('');
  const [tempName, setTempName] = useState<string>('');
  const [editingName, setEditingName] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
        setTempName(storedName);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (tempName.trim().length === 0) {
      Alert.alert('Please enter a valid name.');
      return;
    }
    await AsyncStorage.setItem('userName', tempName.trim());
    setUserName(tempName.trim());
    setEditingName(false);
    Alert.alert('Name updated!', 'Your name has been changed.');
  };

  const handleReview = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {
      Alert.alert('Error', 'Unable to open Play Store.');
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out My Salah App: ${PLAY_STORE_URL}`,
        url: PLAY_STORE_URL,
        title: 'My Salah App'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share the app.');
    }
  };

  const handleRequestFeature = () => {
    Linking.openURL(TELEGRAM_URL).catch(() => {
      Alert.alert('Error', 'Unable to open email client.');
    });
  };

  const handleVisitWebsite = () => {
    Linking.openURL(WEBSITE_URL).catch(() => {
      Alert.alert('Error', 'Unable to open website.');
    });
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      Alert.alert('Error', 'Unable to open privacy policy.');
    });
  };

  const handleAboutUs = () => {
    Linking.openURL(ABOUT_US_URL).catch(() => {
      Alert.alert('Error', 'Unable to open about us page.');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Change Name */}
      <TouchableOpacity style={styles.section} onPress={() => setEditingName(true)}>
        <Text style={styles.sectionLabel}>Change your name</Text>
        <Text style={styles.sectionInfo}>
          {userName ? `Current name: ${userName}` : 'Set your name for a personalized experience.'}
        </Text>
        {editingName && (
          <View style={{ marginTop: 12 }}>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              autoFocus
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#555', marginTop: 0 }]} onPress={() => { setEditingName(false); setTempName(userName); }}>
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Review on Play Store */}
      {/* <TouchableOpacity style={styles.section} onPress={handleReview}>
        <Text style={styles.sectionLabel}>Review on Play Store</Text>
        <Text style={styles.sectionInfo}>
          Love the app? Leave us a review on the Play Store!
        </Text>
      </TouchableOpacity> */}

      {/* Share Application */}
      <TouchableOpacity style={styles.section} onPress={handleShare}>
        <Text style={styles.sectionLabel}>Share Application</Text>
        <Text style={styles.sectionInfo}>
          Share My Salah App with your friends and family.
        </Text>
      </TouchableOpacity>

      {/* Request Features */}
      <TouchableOpacity style={styles.section} onPress={handleRequestFeature}>
        <Text style={styles.sectionLabel}>Request Features</Text>
        <Text style={styles.sectionInfo}>
          Have an idea? Request a feature by sending us a message on Telegram.
        </Text>
      </TouchableOpacity>

      {/* Visit Website */}
      <TouchableOpacity style={styles.section} onPress={handleVisitWebsite}>
        <Text style={styles.sectionLabel}>Visit Our Website</Text>
        <Text style={styles.sectionInfo}>
          Learn more about My Salah App and our mission.
        </Text>
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity style={styles.section} onPress={handlePrivacyPolicy}>
        <Text style={styles.sectionLabel}>Privacy Policy</Text>
        <Text style={styles.sectionInfo}>
          Read our privacy policy to understand how we handle your data.
        </Text>
      </TouchableOpacity>

       {/* About Us */}
      <TouchableOpacity style={[styles.section, { marginBottom: 85 }]} onPress={handleAboutUs}>
        <Text style={styles.sectionLabel}>About Us</Text>
        <Text style={styles.sectionInfo}>
          Meet the team and learn more about My Salah App.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    paddingTop: 48,
  },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 16
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  currentName: {
    color: '#ccc',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24
  },
  section: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4
  },
  sectionInfo: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  rowLabel: {
    color: '#fff',
    fontSize: 15
  }
});