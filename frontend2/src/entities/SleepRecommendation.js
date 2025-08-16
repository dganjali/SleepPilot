export class SleepRecommendation {
  constructor(data = {}) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.category = data.category || 'routine';
    this.title = data.title || '';
    this.description = data.description || '';
    this.target_value = data.target_value || '';
    this.priority = data.priority || 'medium';
    this.is_completed = data.is_completed || false;
  }

  static async getRecommendations() {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      return data.map(item => new SleepRecommendation(item));
    } catch (error) {
      console.warn('Failed to fetch recommendations, using mock data:', error);
      // Return mock data for development
      return [
        new SleepRecommendation({
          category: 'temperature',
          title: 'Optimize Room Temperature',
          description: 'Keep your bedroom between 65-68°F for optimal sleep quality',
          target_value: '66°F',
          priority: 'high'
        }),
        new SleepRecommendation({
          category: 'lighting',
          title: 'Reduce Blue Light Exposure',
          description: 'Avoid screens 2 hours before bedtime to improve melatonin production',
          target_value: '2 hours before bed',
          priority: 'medium'
        }),
        new SleepRecommendation({
          category: 'routine',
          title: 'Establish Consistent Sleep Schedule',
          description: 'Go to bed and wake up at the same time every day',
          target_value: '10:30 PM - 6:30 AM',
          priority: 'high'
        }),
        new SleepRecommendation({
          category: 'sound',
          title: 'Use White Noise',
          description: 'Consider using a white noise machine to mask disruptive sounds',
          target_value: '40-50 dB',
          priority: 'low'
        })
      ];
    }
  }

  async markCompleted() {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/recommendations/${this.id}/complete`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        throw new Error('Failed to mark recommendation as completed');
      }
      this.is_completed = true;
      return true;
    } catch (error) {
      console.warn('Failed to mark recommendation as completed:', error);
      // Mock completion for development
      this.is_completed = true;
      return true;
    }
  }

  getPriorityColor() {
    switch (this.priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }

  getCategoryIcon() {
    switch (this.category) {
      case 'temperature': return '🌡️';
      case 'lighting': return '💡';
      case 'sound': return '🔊';
      case 'humidity': return '💧';
      case 'routine': return '⏰';
      default: return '💤';
    }
  }
}
