export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.name = data.name || '';
    this.profile = data.profile || {};
  }

  static async me() {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/user/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.warn('Failed to fetch user data, using mock data:', error);
      // Return mock data for development
      return new User({
        id: 'demo-user-001',
        email: 'demo@example.com',
        name: 'Demo User',
        profile: {
          age: 30,
          weight: 70,
          height: 175,
          sleepGoal: 8
        }
      });
    }
  }

  static async signIn() {
    try {
      // Simulate authentication - replace with actual auth logic
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign in');
      }
      
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.warn('Failed to sign in, using mock data:', error);
      // Return mock data for development
      return new User({
        id: 'demo-user-001',
        email: 'demo@example.com',
        name: 'Demo User',
        profile: {
          age: 30,
          weight: 70,
          height: 175,
          sleepGoal: 8
        }
      });
    }
  }
}
