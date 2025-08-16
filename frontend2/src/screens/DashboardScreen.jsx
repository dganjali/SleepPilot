import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Upload, 
  Video, 
  Brain, 
  Zap,
  Play,
  Clock,
  Activity
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  const handleUploadVideo = () => {
    Alert.alert(
      'Upload Sleep Video',
      'This will upload your sleep video clip for AI analysis and RL processing.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upload',
          onPress: () => {
            // Simulate upload process
            setIsProcessing(true);
            setHasUploaded(true);
            
            // Simulate processing time
            setTimeout(() => {
              setIsProcessing(false);
            }, 3000);
          },
        },
      ]
    );
  };

  const renderUploadSection = () => (
    <View style={styles.uploadSection}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(167, 139, 250, 0.1)']}
        style={styles.uploadCard}
      >
        <View style={styles.uploadContent}>
          <View style={styles.uploadIcon}>
            <Video size={40} color="#8B5CF6" />
          </View>
          <Text style={styles.uploadTitle}>Upload Sleep Video</Text>
          <Text style={styles.uploadDescription}>
            Record a short clip of your sleep environment or upload an existing video for AI analysis
          </Text>
          
          {!hasUploaded ? (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleUploadVideo}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.uploadButtonGradient}
              >
                <Upload size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  {isProcessing ? 'Processing...' : 'Choose Video'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.processingStatus}>
              <View style={styles.statusRow}>
                <Activity size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>Video uploaded successfully</Text>
              </View>
              <View style={styles.statusRow}>
                <Brain size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>AI analysis in progress</Text>
              </View>
              <View style={styles.statusRow}>
                <Zap size={20} color="#8B5CF6" />
                <Text style={styles.statusText}>RL model processing</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderDemoInfo = () => (
    <View style={styles.demoSection}>
      <Text style={styles.sectionTitle}>How It Works</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Video size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>1. Upload Sleep Video</Text>
            <Text style={styles.infoDescription}>
              Record or upload a video clip of your sleep environment
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Brain size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>2. AI Analysis</Text>
            <Text style={styles.infoDescription}>
              Our AI analyzes sleep patterns, environment factors, and quality indicators
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Zap size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>3. RL Processing</Text>
            <Text style={styles.infoDescription}>
              Reinforcement learning models optimize your sleep environment in real-time
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Play size={24} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>4. Live Optimization</Text>
            <Text style={styles.infoDescription}>
              Get real-time recommendations and automated environment adjustments
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBackendInfo = () => (
    <View style={styles.backendSection}>
      <Text style={styles.sectionTitle}>Backend Processing</Text>
      
      <View style={styles.backendCard}>
        <View style={styles.backendHeader}>
          <Brain size={24} color="#8B5CF6" />
          <Text style={styles.backendTitle}>Layer3RL Engine</Text>
        </View>
        <Text style={styles.backendDescription}>
          Your sleep video is processed by our advanced reinforcement learning system located in the layer3rl backend. 
          This system continuously learns and optimizes your sleep environment based on real-time data.
        </Text>
        
        <View style={styles.backendFeatures}>
          <Text style={styles.featureText}>• Real-time video analysis</Text>
          <Text style={styles.featureText}>• Environment optimization</Text>
          <Text style={styles.featureText}>• Sleep quality prediction</Text>
          <Text style={styles.featureText}>• Adaptive learning algorithms</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Upload your sleep video for AI-powered analysis and optimization
          </Text>
        </View>

        {/* Upload Section */}
        {renderUploadSection()}

        {/* Demo Info */}
        {renderDemoInfo()}

        {/* Backend Info */}
        {renderBackendInfo()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#EBEBF599',
    lineHeight: 22,
  },
  uploadSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  uploadCard: {
    borderRadius: 20,
    padding: 24,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 16,
    color: '#EBEBF599',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  processingStatus: {
    marginTop: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#EBEBF599',
    marginLeft: 8,
  },
  demoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
  },
  backendSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  backendCard: {
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  backendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  backendDescription: {
    fontSize: 14,
    color: '#EBEBF599',
    lineHeight: 20,
    marginBottom: 16,
  },
  backendFeatures: {
    marginTop: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#EBEBF599',
    marginBottom: 8,
  },
});
