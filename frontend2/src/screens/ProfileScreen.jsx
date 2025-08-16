import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { 
  Save,
  User,
  Moon,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: '28',
    weight: '75',
    height: '175',
    sleepGoal: '8',
    wakeTime: '07:00',
    bedTime: '23:00',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the data to your backend
    console.log('Profile data saved:', profileData);
  };

  const handleSignOut = () => {
    // Navigate back to landing page
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  const updateProfileData = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <User size={20} color="#8B5CF6" />
        <Text style={styles.sectionTitle}>Personal Information</Text>
      </View>
      
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.name}
              onChangeText={(text) => updateProfileData('name', text)}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.name}</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.email}
              onChangeText={(text) => updateProfileData('email', text)}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.email}</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Age</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.age}
              onChangeText={(text) => updateProfileData('age', text)}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.age} years</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Weight</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.weight}
              onChangeText={(text) => updateProfileData('weight', text)}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.weight} kg</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Height</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.height}
              onChangeText={(text) => updateProfileData('height', text)}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.height} cm</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Sleep Goal</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.sleepGoal}
              onChangeText={(text) => updateProfileData('sleepGoal', text)}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.sleepGoal} hours</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Wake Time</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.wakeTime}
              onChangeText={(text) => updateProfileData('wakeTime', text)}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.wakeTime}</Text>
          )}
        </View>
        
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Bed Time</Text>
          {isEditing ? (
            <TextInput
              style={styles.profileInput}
              value={profileData.bedTime}
              onChangeText={(text) => updateProfileData('bedTime', text)}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.profileValue}>{profileData.bedTime}</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => setIsEditing(!isEditing)}
      >
        <Text style={styles.editButtonText}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Moon size={20} color="#8B5CF6" />
        <Text style={styles.sectionTitle}>Preferences</Text>
      </View>
      
      <View style={styles.preferencesCard}>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceLeft}>
            <Bell size={20} color="#8B5CF6" />
            <Text style={styles.preferenceLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#374151', true: '#8B5CF6' }}
            thumbColor={notifications ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceLeft}>
            <Palette size={20} color="#8B5CF6" />
            <Text style={styles.preferenceLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#374151', true: '#8B5CF6' }}
            thumbColor={darkMode ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceLeft}>
            <Shield size={20} color="#8B5CF6" />
            <Text style={styles.preferenceLabel}>Data Sharing</Text>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: '#374151', true: '#8B5CF6' }}
            thumbColor={dataSharing ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Globe size={20} color="#8B5CF6" />
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>
      
      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionLeft}>
            <HelpCircle size={20} color="#8B5CF6" />
            <Text style={styles.actionLabel}>Help & Support</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionLeft}>
            <Shield size={20} color="#8B5CF6" />
            <Text style={styles.actionLabel}>Privacy Policy</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <View style={styles.actionLeft}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Sign Out</Text>
          </View>
          <Text style={[styles.actionArrow, { color: '#EF4444' }]}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSectionContainer}>
          {renderProfileSection()}
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.saveSection}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.saveButtonGradient}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Preferences Section */}
        {renderPreferencesSection()}

        {/* Settings Section */}
        {renderSettingsSection()}

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
    marginTop: 16,
  },
  profileSectionContainer: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  profileCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1D5DB',
    minWidth: 100,
    flexShrink: 0,
  },
  profileInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    textAlign: 'right',
    minWidth: 120,
  },
  profileValue: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    textAlign: 'right',
    minWidth: 120,
  },
  editButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  saveSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  preferencesCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  versionSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
});
