// ProfileScreen.js - Simplified version with mock data
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, Alert, ScrollView, Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';
import { useTheme } from './ThemeContext';

export default function ProfileScreen({ navigation, user }) {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(theme.isDark);

  useEffect(() => {
    loadUserData();
    
    // Add focus listener to refresh data when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const userData = await db.collection('users').doc(user.uid).get();
      if (userData) {
        console.log('Profile loaded user data:', userData);
        console.log('Friends array:', userData.friends);
        setCurrentUser(userData);
        setDisplayName(userData.displayName || userData.username || '');
      }
    } catch (err) {
      console.log('Error loading user data:', err);
    }
  };

  const updateDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // Simulate updating display name
      const updatedUser = { ...currentUser, displayName: displayName.trim() };
      await db.collection('users').doc(user.uid).set(updatedUser);
      
      setCurrentUser(updatedUser);
      Alert.alert('Success', 'Display name updated successfully');
    } catch (err) {
      console.log('Error updating display name:', err);
      Alert.alert('Error', 'Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Logged out', 'You have been logged out successfully');
    } catch (err) {
      console.log('Logout error:', err);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(currentUser?.displayName || currentUser?.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.username, { color: theme.colors.text }]}>@{currentUser?.username}</Text>
          <Text style={[styles.usercode, { color: theme.colors.textSecondary }]}>User Code: {currentUser?.usercode}</Text>
          
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadUserData}
          >
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile Information</Text>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter display name"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TouchableOpacity 
              style={[
                styles.updateBtn, 
                { backgroundColor: theme.colors.primary },
                loading && styles.updateBtnDisabled
              ]}
              onPress={updateDisplayName}
              disabled={loading}
            >
              <Text style={styles.updateBtnText}>
                {loading ? 'Updating...' : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Username</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
              {currentUser?.username}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>User Code</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
              {currentUser?.usercode}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Friends</Text>
            <Text style={[styles.fieldValue, { color: theme.colors.textSecondary }]}>
              {currentUser?.friends ? currentUser.friends.length : 0} friends
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>
          
          <View style={[styles.settingItem, { 
            backgroundColor: theme.colors.surface, 
            borderBottomColor: theme.colors.border 
          }]}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={20} 
                color={theme.colors.primary} 
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => {
                setIsDarkMode(value);
                theme.toggleTheme();
              }}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={handleLogout}>
            <Text style={styles.actionBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  usercode: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#666',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  updateBtn: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateBtnDisabled: {
    backgroundColor: '#ccc',
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});