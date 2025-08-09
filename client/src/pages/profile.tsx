import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { useUserData } from "@/hooks/use-user-data";
import { User, Mail, Calendar, Crown, Key, Zap, Edit } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { userData, isLoading } = useUserData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center justify-between">
                  <span>Account Information</span>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orchestra-brown rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userData?.username || 'User'}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{userData?.username || 'Not set'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Plan</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Crown className="w-4 h-4 text-gray-500" />
                      <Badge className={userData?.userPlan === 'free' ? 'bg-gray-100 text-gray-800' : 'bg-orchestra-brown/10 text-orchestra-brown'}>
                        {userData?.userPlan === 'free' ? 'Free Plan' : 'Early Adopter'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Key Status */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">API Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Anthropic API Key</div>
                      <div className="text-xs text-gray-600">
                        {userData?.hasApiKey ? 'Custom key configured' : 'Using platform credits'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={userData?.hasApiKey ? 'default' : 'secondary'}>
                    {userData?.hasApiKey ? 'Unlimited' : 'Limited'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Tokens Used</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.tokensUsed || 0} / {userData?.tokenLimit || 100}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orchestra-brown h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((userData?.tokensUsed || 0) / (userData?.tokenLimit || 100)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agents Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.agentCount || 0}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan Status</span>
                    <Badge className={userData?.userPlan === 'free' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                      {userData?.userPlan === 'free' ? 'Free' : 'Premium'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setLocation('/agents')}
                >
                  Manage Agents
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setLocation('/pricing')}
                >
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}