import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { WebSafeAreaView } from '../components/WebSafeAreaView';
import { WebCompatibleSwitch } from '../components/WebCompatibleSwitch';
import { useSleepStore } from '../store/sleepStore';
import { UserPreferences } from '../types';
import { colors } from '../constants/colors';

export const ProfileScreen: React.FC = () => {
  const { userPreferences, updateUserPreferences } = useSleepStore();
  const [isEditing, setIsEditing] = useState(false);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    updateUserPreferences({ [key]: value });
  };

  const handleSavePreferences = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Your preferences have been saved!');
  };

  const handleResetPreferences = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updateUserPreferences({
              unitSystem: 'metric',
              noisePreference: 'white',
              temperatureSensitivity: 'medium',
              lightSensitivity: 'medium',
              noiseTolerance: 'medium',
            });
            Alert.alert('Reset Complete', 'Preferences have been reset to defaults.');
          },
        },
      ]
    );
  };

  const getSensitivityLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return 'Medium';
    }
  };

  const getNoisePreferenceLabel = (pref: string) => {
    switch (pref) {
      case 'white': return 'White Noise';
      case 'pink': return 'Pink Noise';
      case 'nature': return 'Nature Sounds';
      default: return 'White Noise';
    }
  };

  return (
    <WebSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Profile & Settings</Text>
              <Text style={styles.headerSubtitle}>
                Customize your sleep experience
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfoSection}>
          <View style={styles.userInfoCard}>
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>👤</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>Sleep User</Text>
                <Text style={styles.userMemberSince}>Member since 2024</Text>
              </View>
            </View>
            
            <View style={styles.userStats}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Sleep Score</Text>
                <Text style={styles.statValue}>78</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Nights Tracked</Text>
                <Text style={styles.statValue}>15</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg. Duration</Text>
                <Text style={styles.statValue}>7.5h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {/* Unit System */}
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.preferenceTitle}>Unit System</Text>
                <Text style={styles.preferenceDescription}>Temperature and measurement units</Text>
              </View>
              {isEditing ? (
                <View style={styles.preferenceOptions}>
                  <TouchableOpacity
                    onPress={() => handlePreferenceChange('unitSystem', 'metric')}
                    style={[
                      styles.optionButton,
                      userPreferences.unitSystem === 'metric' && styles.optionButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      userPreferences.unitSystem === 'metric' && styles.optionButtonTextActive
                    ]}>
                      °C
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePreferenceChange('unitSystem', 'imperial')}
                    style={[
                      styles.optionButton,
                      userPreferences.unitSystem === 'imperial' && styles.optionButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      userPreferences.unitSystem === 'imperial' && styles.optionButtonTextActive
                    ]}>
                      °F
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.preferenceValue}>
                  {userPreferences.unitSystem === 'metric' ? '°C' : '°F'}
                </Text>
              )}
            </View>
          </View>

          {/* Noise Preference */}
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.preferenceTitle}>Noise Preference</Text>
                <Text style={styles.preferenceDescription}>Preferred background sound type</Text>
              </View>
              {isEditing ? (
                <View style={styles.preferenceOptions}>
                  {(['white', 'pink', 'nature'] as const).map((pref) => (
                    <TouchableOpacity
                      key={pref}
                      onPress={() => handlePreferenceChange('noisePreference', pref)}
                      style={[
                        styles.optionButton,
                        userPreferences.noisePreference === pref && styles.optionButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        userPreferences.noisePreference === pref && styles.optionButtonTextActive
                      ]}>
                        {getNoisePreferenceLabel(pref).split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.preferenceValue}>
                  {getNoisePreferenceLabel(userPreferences.noisePreference)}
                </Text>
              )}
            </View>
          </View>

          {/* Sensitivity Settings */}
          <View style={styles.preferenceCard}>
            <Text style={styles.preferenceTitle}>Sensitivity Settings</Text>
            
            {/* Temperature Sensitivity */}
            <View style={styles.sensitivityRow}>
              <Text style={styles.sensitivityLabel}>Temperature Sensitivity</Text>
              {isEditing ? (
                <View style={styles.sensitivityOptions}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => handlePreferenceChange('temperatureSensitivity', level)}
                      style={[
                        styles.sensitivityButton,
                        userPreferences.temperatureSensitivity === level && styles.sensitivityButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.sensitivityButtonText,
                        userPreferences.temperatureSensitivity === level && styles.sensitivityButtonTextActive
                      ]}>
                        {getSensitivityLabel(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.sensitivityValue}>
                  {getSensitivityLabel(userPreferences.temperatureSensitivity)}
                </Text>
              )}
            </View>

            {/* Light Sensitivity */}
            <View style={styles.sensitivityRow}>
              <Text style={styles.sensitivityLabel}>Light Sensitivity</Text>
              {isEditing ? (
                <View style={styles.sensitivityOptions}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => handlePreferenceChange('lightSensitivity', level)}
                      style={[
                        styles.sensitivityButton,
                        userPreferences.lightSensitivity === level && styles.sensitivityButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.sensitivityButtonText,
                        userPreferences.lightSensitivity === level && styles.sensitivityButtonTextActive
                      ]}>
                        {getSensitivityLabel(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.sensitivityValue}>
                  {getSensitivityLabel(userPreferences.lightSensitivity)}
                </Text>
              )}
            </View>

            {/* Noise Tolerance */}
            <View style={styles.sensitivityRow}>
              <Text style={styles.sensitivityLabel}>Noise Tolerance</Text>
              {isEditing ? (
                <View style={styles.sensitivityOptions}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => handlePreferenceChange('noiseTolerance', level)}
                      style={[
                        styles.sensitivityButton,
                        userPreferences.noiseTolerance === level && styles.sensitivityButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.sensitivityButtonText,
                        userPreferences.noiseTolerance === level && styles.sensitivityButtonTextActive
                      ]}>
                        {getSensitivityLabel(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.sensitivityValue}>
                  {getSensitivityLabel(userPreferences.noiseTolerance)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View>
                <Text style={styles.accountTitle}>Data Sync</Text>
                <Text style={styles.accountDescription}>Sync across devices</Text>
              </View>
              <WebCompatibleSwitch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#475569', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View>
                <Text style={styles.accountTitle}>Notifications</Text>
                <Text style={styles.accountDescription}>Sleep insights and reminders</Text>
              </View>
              <WebCompatibleSwitch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#475569', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View>
                <Text style={styles.accountTitle}>Privacy</Text>
                <Text style={styles.accountDescription}>Data sharing preferences</Text>
              </View>
              <Text style={styles.accountArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountCard}>
            <View style={styles.accountRow}>
              <View>
                <Text style={styles.accountTitle}>Help & Support</Text>
                <Text style={styles.accountDescription}>Get help and contact support</Text>
              </View>
              <Text style={styles.accountArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {isEditing && (
          <View style={styles.actionsSection}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleSavePreferences}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetPreferences}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Data Management */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dataCard}>
            <View style={styles.dataRow}>
              <View>
                <Text style={styles.dataTitle}>Export Data</Text>
                <Text style={styles.dataDescription}>Download your sleep data</Text>
              </View>
              <Text style={styles.dataArrow}>{'>'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataCard}>
            <View style={styles.dataRow}>
              <View>
                <Text style={styles.dataTitle}>Delete Account</Text>
                <Text style={styles.dataDescription}>Permanently remove your account</Text>
              </View>
              <Text style={styles.dataArrowDanger}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appInfoCard}>
            <Text style={styles.appInfoText}>
              Sleep Health App v1.0.0{'\n'}
              Built with React Native & Expo
            </Text>
          </View>
        </View>
      </ScrollView>
    </WebSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sleep.darker,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.gray[400],
    fontSize: 16,
  },
  editButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  userInfoSection: {
    marginBottom: 24,
  },
  userInfoCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 12,
    padding: 16,
  },
  userAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    backgroundColor: colors.blue,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  userMemberSince: {
    color: colors.gray[400],
    fontSize: 14,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
  },
  statLabel: {
    color: colors.gray[400],
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  preferencesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceTitle: {
    color: colors.white,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    color: colors.gray[400],
    fontSize: 14,
  },
  preferenceValue: {
    color: colors.blue,
    fontWeight: '500',
  },
  preferenceOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[700],
  },
  optionButtonActive: {
    backgroundColor: colors.blue,
  },
  optionButtonText: {
    color: colors.gray[400],
  },
  optionButtonTextActive: {
    color: colors.white,
  },
  sensitivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sensitivityLabel: {
    color: colors.gray[300],
    fontSize: 14,
  },
  sensitivityValue: {
    color: colors.blue,
    fontSize: 14,
  },
  sensitivityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sensitivityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.gray[700],
  },
  sensitivityButtonActive: {
    backgroundColor: colors.blue,
  },
  sensitivityButtonText: {
    color: colors.gray[400],
  },
  sensitivityButtonTextActive: {
    color: colors.white,
  },
  accountSection: {
    marginBottom: 24,
  },
  accountCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountTitle: {
    color: colors.white,
    fontWeight: '500',
  },
  accountDescription: {
    color: colors.gray[400],
    fontSize: 14,
  },
  accountArrow: {
    color: colors.gray[400],
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.green,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.red,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  dataSection: {
    marginBottom: 24,
  },
  dataCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataTitle: {
    color: colors.white,
    fontWeight: '500',
  },
  dataDescription: {
    color: colors.gray[400],
    fontSize: 14,
  },
  dataArrow: {
    color: colors.gray[400],
  },
  dataArrowDanger: {
    color: colors.red,
  },
  appInfoSection: {
    marginBottom: 24,
  },
  appInfoCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    padding: 16,
  },
  appInfoText: {
    color: colors.gray[400],
    textAlign: 'center',
    fontSize: 12,
  },
});
