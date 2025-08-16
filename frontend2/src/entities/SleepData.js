export class SleepData {
  constructor(data = {}) {
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.sleep_score = data.sleep_score || 0;
    this.snoring_intensity = data.snoring_intensity || 0;
    this.snoring_severity = data.snoring_severity || 'low';
    this.apnea_risk = data.apnea_risk || 'low';
    this.fragmentation_events = data.fragmentation_events || 0;
    this.total_sleep_time = data.total_sleep_time || 0;
    this.deep_sleep_percentage = data.deep_sleep_percentage || 0;
    this.rem_sleep_percentage = data.rem_sleep_percentage || 0;
  }

  static async getToday() {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/sleep-data/${today}`);
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s sleep data');
      }
      const data = await response.json();
      return new SleepData(data);
    } catch (error) {
      console.warn('Failed to fetch sleep data, using mock data:', error);
      // Return mock data for development
      return new SleepData({
        date: new Date().toISOString().split('T')[0],
        sleep_score: 75,
        snoring_intensity: 45,
        snoring_severity: 'moderate',
        apnea_risk: 'low',
        fragmentation_events: 3,
        total_sleep_time: 480,
        deep_sleep_percentage: 18,
        rem_sleep_percentage: 22
      });
    }
  }

  static async getRecent(days = 7) {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/sleep-data/recent?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent sleep data');
      }
      const data = await response.json();
      return data.map(item => new SleepData(item));
    } catch (error) {
      console.warn('Failed to fetch recent sleep data, using mock data:', error);
      // Return mock data for development
      const mockData = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push(new SleepData({
          date: date.toISOString().split('T')[0],
          sleep_score: Math.floor(Math.random() * 40) + 60,
          snoring_intensity: Math.floor(Math.random() * 60) + 20,
          snoring_severity: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
          apnea_risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          fragmentation_events: Math.floor(Math.random() * 10),
          total_sleep_time: Math.floor(Math.random() * 120) + 360,
          deep_sleep_percentage: Math.floor(Math.random() * 25) + 10,
          rem_sleep_percentage: Math.floor(Math.random() * 25) + 15
        }));
      }
      return mockData;
    }
  }

  getSleepQuality() {
    if (this.sleep_score >= 80) return 'Excellent';
    if (this.sleep_score >= 70) return 'Good';
    if (this.sleep_score >= 60) return 'Fair';
    return 'Poor';
  }

  getFormattedSleepTime() {
    const hours = Math.floor(this.total_sleep_time / 60);
    const minutes = this.total_sleep_time % 60;
    return `${hours}h ${minutes}m`;
  }
}
