
import React, { useState, useEffect } from "react";
import { User } from "../src/entities/User";
import { Button } from "../src/components/ui/button";
import { Save } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    unit_system: 'metric',
    temperature_preference: 'celsius',
    noise_preference: 'white_noise',
    notification_enabled: true,
    bedtime_reminder: true,
    weekly_reports: true,
    temperature_sensitivity: 'medium',
    light_sensitivity: 'medium',
    noise_sensitivity: 'medium'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Load user preferences if they exist
      if (userData.preferences) {
        setPreferences({ ...preferences, ...userData.preferences });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({ preferences });
      // Show success message (could use a toast here)
      console.log("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-slate-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="px-2">
         <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            Profile
          </h1>
      </div>

      <div className="space-y-8">
          {/* User Information */}
          <div className="ios-card p-4 flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-blue)] to-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white">
                  {user?.full_name || 'User'}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
              </div>
          </div>
      
          {/* Settings Sections */}
          <div className="space-y-2">
            <h2 className="text-xs uppercase text-[var(--text-secondary)] px-4">Preferences</h2>
            <div className="ios-card divide-y divide-[var(--separator)]">
               <div className="p-4 flex items-center justify-between">
                <Label className="text-white">Unit System</Label>
                 <Select 
                    value={preferences.unit_system} 
                    onValueChange={(value) => setPreferences({...preferences, unit_system: value})}
                  >
                    <SelectTrigger className="w-auto bg-transparent border-none text-[var(--text-secondary)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (°C, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (°F, ft)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="p-4 flex items-center justify-between">
                <Label className="text-white">Noise Preference</Label>
                 <Select 
                    value={preferences.noise_preference} 
                    onValueChange={(value) => setPreferences({...preferences, noise_preference: value})}
                  >
                    <SelectTrigger className="w-auto bg-transparent border-none text-[var(--text-secondary)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white_noise">White Noise</SelectItem>
                      <SelectItem value="pink_noise">Pink Noise</SelectItem>
                      <SelectItem value="nature_sounds">Nature Sounds</SelectItem>
                      <SelectItem value="silence">Silence</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase text-[var(--text-secondary)] px-4">Notifications</h2>
            <div className="ios-card divide-y divide-[var(--separator)]">
              <div className="p-4 flex items-center justify-between">
                  <Label className="text-white">Enable Notifications</Label>
                  <Switch
                    checked={preferences.notification_enabled}
                    onCheckedChange={(checked) => setPreferences({...preferences, notification_enabled: checked})}
                  />
                </div>
              <div className="p-4 flex items-center justify-between">
                  <Label className="text-white">Bedtime Reminders</Label>
                  <Switch
                    checked={preferences.bedtime_reminder}
                    onCheckedChange={(checked) => setPreferences({...preferences, bedtime_reminder: checked})}
                  />
                </div>

                <div className="p-4 flex items-center justify-between">
                  <Label className="text-white">Weekly Reports</Label>
                  <Switch
                    checked={preferences.weekly_reports}
                    onCheckedChange={(checked) => setPreferences({...preferences, weekly_reports: checked})}
                  />
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase text-[var(--text-secondary)] px-4">Account</h2>
             <div className="ios-card">
                 <div className="p-2">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full text-center text-[var(--danger)] hover:bg-[var(--danger)]/10"
                    >
                      Sign Out
                    </Button>
                 </div>
             </div>
          </div>
          
          <div className="pt-4">
              <Button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full h-12 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-black font-semibold text-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
        </div>
    </div>
  );
}
