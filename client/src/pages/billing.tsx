import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { useUserData } from "@/hooks/use-user-data";
import { CreditCard, Calendar, DollarSign, Crown, Zap, ExternalLink, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Billing() {
  const { user } = useAuth();
  const { userData, isLoading } = useUserData();
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Coming Soon",
      description: "Stripe integration will be available shortly. Thanks for your interest!",
    });
  };

  const handleManageSubscription = () => {
    toast({
      title: "Subscription Management",
      description: "Stripe customer portal will be available soon.",
    });
  };

  const handleDownloadInvoice = () => {
    toast({
      title: "Download Invoice",
      description: "Invoice download will be available with Stripe integration.",
    });
  };

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

  const getCurrentPeriodEnd = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return formatDate(nextMonth);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your Orchestra subscription and billing information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5" />
                    <span>Current Plan</span>
                  </div>
                  {userData?.userPlan !== 'free' && (
                    <Badge className="bg-orchestra-brown/10 text-orchestra-brown">
                      Active
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {userData?.userPlan === 'free' ? 'Free Plan' : 'Early Adopter'}
                    </h3>
                    <p className="text-gray-600">
                      {userData?.userPlan === 'free' 
                        ? 'Basic features to get started' 
                        : '$15/month • Billed monthly'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {userData?.userPlan === 'free' ? '$0' : '$15'}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tokens per month</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.tokenLimit || 100}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agents</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.userPlan === 'free' ? '2 max' : 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conductor monitoring</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.userPlan === 'free' ? 'Basic' : 'Full'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API access</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.userPlan === 'free' ? 'Limited' : 'Full'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {userData?.userPlan === 'free' ? (
                    <Button 
                      onClick={handleUpgrade}
                      className="flex-1 bg-orchestra-brown hover:bg-orchestra-brown-hover text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade to Early Adopter
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleManageSubscription}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage This Month */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{userData?.agentCount || 0}</div>
                      <div className="text-sm text-gray-600">Agents Created</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-600">Workflows Run</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.userPlan === 'free' ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No billing history</p>
                    <p className="text-sm text-gray-500">Upgrade to Early Adopter to see billing information</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Early Adopter Plan</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(new Date())} - {getCurrentPeriodEnd()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">$15.00</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDownloadInvoice}
                          className="text-xs text-gray-600 hover:text-gray-900 p-0 h-auto"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing Summary Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Next Billing</CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.userPlan === 'free' ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">$0</div>
                    <p className="text-sm text-gray-600 mb-4">You're on the free plan</p>
                    <Button 
                      onClick={handleUpgrade}
                      size="sm"
                      className="w-full bg-orchestra-brown hover:bg-orchestra-brown-hover text-white"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">$15.00</div>
                      <p className="text-sm text-gray-600">Due {getCurrentPeriodEnd()}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Early Adopter</span>
                        <span className="text-gray-900">$15.00</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">$15.00</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.userPlan === 'free' ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No payment method required</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</div>
                        <div className="text-xs text-gray-600">Expires 12/25</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={handleManageSubscription}
                    >
                      Update Payment Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}