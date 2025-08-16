import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, Card, Button, Switch, List, Divider, TextInput, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useSleepStore } from '../store/sleepStore';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { userProfile, settings, updateUserProfile, updateSettings, clearAllData, exportData, importData } = useSleepStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleSaveProfile = () => {
    if (tempProfile) {
      updateUserProfile(tempProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      Alert.alert('Export Successful', 'Your data has been exported successfully.');
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your sleep data, recommendations, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Data Cleared', 'All data has been cleared successfully.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Profile & Settings
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Manage your preferences and account settings
          </Text>
        </View>

        {/* User Profile */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                Personal Information
              </Text>
              <Button
                mode="text"
                onPress={() => setIsEditing(!isEditing)}
                icon={isEditing ? 'close' : 'pencil'}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  label="Name"
                  value={tempProfile?.name || ''}
                  onChangeText={(text) => setTempProfile(prev => prev ? { ...prev, name: text } : null)}
                  style={styles.input}
                />
                <TextInput
                  label="Age"
                  value={tempProfile?.age?.toString() || ''}
                  onChangeText={(text) => setTempProfile(prev => prev ? { ...prev, age: parseInt(text) || 0 } : null)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Weight (kg)"
                  value={tempProfile?.weight?.toString() || ''}
                  onChangeText={(text) => setTempProfile(prev => prev ? { ...prev, weight: parseFloat(text) || 0 } : null)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Height (cm)"
                  value={tempProfile?.height?.toString() || ''}
                  onChangeText={(text) => setTempProfile(prev => prev ? { ...prev, height: parseFloat(text) || 0 } : null)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  style={styles.saveButton}
                >
                  Save Changes
                </Button>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <List.Item
                  title="Name"
                  description={userProfile?.name || 'Not set'}
                  left={(props) => <List.Icon {...props} icon="account" />}
                />
                <List.Item
                  title="Age"
                  description={userProfile?.age ? `${userProfile.age} years` : 'Not set'}
                  left={(props) => <List.Icon {...props} icon="calendar" />}
                />
                <List.Item
                  title="Weight"
                  description={userProfile?.weight ? `${userProfile.weight} kg` : 'Not set'}
                  left={(props) => <List.Icon {...props} icon="scale" />}
                />
                <List.Item
                  title="Height"
                  description={userProfile?.height ? `${userProfile.height} cm` : 'Not set'}
                  left={(props) => <List.Icon {...props} icon="ruler" />}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Sleep Preferences */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Sleep Preferences
            </Text>
            
            <View style={styles.preferenceSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                Temperature Unit
              </Text>
              <SegmentedButtons
                value={userProfile?.temperaturePreference || 'celsius'}
                onValueChange={(value) => updateUserProfile({ temperaturePreference: value as 'celsius' | 'fahrenheit' })}
                buttons={[
                  { value: 'celsius', label: '°C' },
                  { value: 'fahrenheit', label: '°F' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.preferenceSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                Noise Preference
              </Text>
              <SegmentedButtons
                value={userProfile?.noisePreference || 'white'}
                onValueChange={(value) => updateUserProfile({ noisePreference: value as 'white' | 'pink' | 'nature' | 'none' })}
                buttons={[
                  { value: 'white', label: 'White' },
                  { value: 'pink', label: 'Pink' },
                  { value: 'nature', label: 'Nature' },
                  { value: 'none', label: 'None' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.preferenceSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                Sensitivity Levels
              </Text>
              <List.Item
                title="Light Sensitivity"
                description={userProfile?.lightSensitivity || 'Medium'}
                left={(props) => <List.Icon {...props} icon="lightbulb" />}
                right={() => (
                  <SegmentedButtons
                    value={userProfile?.lightSensitivity || 'medium'}
                    onValueChange={(value) => updateUserProfile({ lightSensitivity: value as 'low' | 'medium' | 'high' })}
                    buttons={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Med' },
                      { value: 'high', label: 'High' },
                    ]}
                    style={styles.smallSegmentedButtons}
                  />
                )}
              />
              <List.Item
                title="Temperature Sensitivity"
                description={userProfile?.temperatureSensitivity || 'Medium'}
                left={(props) => <List.Icon {...props} icon="thermometer" />}
                right={() => (
                  <SegmentedButtons
                    value={userProfile?.temperatureSensitivity || 'medium'}
                    onValueChange={(value) => updateUserProfile({ temperatureSensitivity: value as 'low' | 'medium' | 'high' })}
                    buttons={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Med' },
                      { value: 'high', label: 'High' },
                    ]}
                    style={styles.smallSegmentedButtons}
                  />
                )}
              />
              <List.Item
                title="Noise Sensitivity"
                description={userProfile?.noiseSensitivity || 'Medium'}
                left={(props) => <List.Icon {...props} icon="volume-high" />}
                right={() => (
                  <SegmentedButtons
                    value={userProfile?.noiseSensitivity || 'medium'}
                    onValueChange={(value) => updateUserProfile({ noiseSensitivity: value as 'low' | 'medium' | 'high' })}
                    buttons={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Med' },
                      { value: 'high', label: 'High' },
                    ]}
                    style={styles.smallSegmentedButtons}
                  />
                )}
              />
            </View>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              App Settings
            </Text>
            
            <List.Item
              title="Notifications"
              description="Receive sleep alerts and reminders"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => updateSettings({ notifications: value })}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Sound Alerts"
              description="Play sounds for important alerts"
              left={(props) => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.soundAlerts}
                  onValueChange={(value) => updateSettings({ soundAlerts: value })}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Dark Mode"
              description="Use dark theme for better sleep"
              left={(props) => <List.Icon {...props} icon="moon" />}
              right={() => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => updateSettings({ darkMode: value })}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Auto Sync"
              description="Automatically sync data with cloud"
              left={(props) => <List.Icon {...props} icon="cloud-sync" />}
              right={() => (
                <Switch
                  value={settings.autoSync}
                  onValueChange={(value) => updateSettings({ autoSync: value })}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Data Management
            </Text>
            
            <Button
              mode="outlined"
              icon="download"
              onPress={handleExportData}
              style={styles.dataButton}
            >
              Export Data
            </Button>
            <Button
              mode="outlined"
              icon="upload"
              onPress={() => {
                // Handle import data
              }}
              style={styles.dataButton}
            >
              Import Data
            </Button>
            <Button
              mode="outlined"
              icon="delete"
              onPress={handleClearData}
              style={[styles.dataButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
            >
              Clear All Data
            </Button>
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              About
            </Text>
            
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield" />}
              onPress={() => {
                // Navigate to privacy policy
              }}
            />
            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              onPress={() => {
                // Navigate to terms of service
              }}
            />
            <List.Item
              title="Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              onPress={() => {
                // Navigate to support
              }}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editForm: {
    gap: 12,
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 8,
  },
  profileInfo: {
    marginTop: 8,
  },
  preferenceSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  smallSegmentedButtons: {
    marginTop: 8,
  },
  dataButton: {
    marginBottom: 8,
  },
});

export default ProfileScreen;
