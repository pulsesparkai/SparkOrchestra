import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { useUserData } from "@/hooks/use-user-data";
import { Settings as SettingsIcon, Bell, Moon, Globe, Shield, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    workflowNotifications: true,
    errorNotifications: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    conductorAlerts: true
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement settings save API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your Orchestra preferences and notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-gray-900">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive updates about your workflows via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="workflow-notifications" className="text-gray-900">Workflow Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when workflows complete or fail</p>
                  </div>
                  <Switch
                    id="workflow-notifications"
                    checked={settings.workflowNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, workflowNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="error-notifications" className="text-gray-900">Error Notifications</Label>
                    <p className="text-sm text-gray-600">Immediate alerts for agent errors</p>
                  </div>
                  <Switch
                    id="error-notifications"
                    checked={settings.errorNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, errorNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="conductor-alerts" className="text-gray-900">Conductor Alerts</Label>
                    <p className="text-sm text-gray-600">Notifications from AI conductor interventions</p>
                  </div>
                  <Switch
                    id="conductor-alerts"
                    checked={settings.conductorAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, conductorAlerts: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language" className="text-gray-900">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone" className="text-gray-900">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save" className="text-gray-900">Auto-save Workflows</Label>
                    <p className="text-sm text-gray-600">Automatically save workflow changes</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-gray-900">Dark Mode</Label>
                    <p className="text-sm text-gray-600">Use dark theme (coming soon)</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-900">API Key Status</Label>
                    <p className="text-sm text-gray-600">
                      {userData?.hasApiKey ? 'Custom API key configured' : 'Using platform credits'}
                    </p>
                  </div>
                  <Badge variant={userData?.hasApiKey ? 'default' : 'secondary'}>
                    {userData?.hasApiKey ? 'Configured' : 'Platform'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-900">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orchestra-brown rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{userData?.username}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.userPlan === 'free' ? 'Free' : 'Early Adopter'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Agents</span>
                    <span className="text-sm font-medium text-gray-900">{userData?.agentCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tokens</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.tokensUsed || 0} / {userData?.tokenLimit || 100}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full bg-orchestra-brown hover:bg-orchestra-brown-hover text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}