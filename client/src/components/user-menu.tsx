import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApiKeyModal } from '@/components/ui/api-key-modal';
import { useAuth } from '@/components/auth/auth-provider';
import { useUserData } from '@/hooks/use-user-data';
import { 
  User, 
  Settings, 
  Key, 
  CreditCard, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { userData } = useUserData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  const handleApiKeyModal = () => {
    setApiKeyModalOpen(true);
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (userData?.username) {
      return userData.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 p-0 bg-orchestra-brown rounded-full hover:bg-orchestra-brown/90 transition-colors"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-orchestra-brown text-white text-xs font-semibold">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={`w-3 h-3 ml-1 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {userData?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs bg-orchestra-brown/10 text-orchestra-brown px-2 py-0.5 rounded-full">
                  {userData?.userPlan === 'free' ? 'Free Plan' : 'Early Adopter'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 mr-3 text-gray-500" />
              Profile
            </button>

            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              Settings
            </button>

            <button
              onClick={handleApiKeyModal}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Key className="w-4 h-4 mr-3 text-gray-500" />
              API Keys
            </button>

            <button
              onClick={() => handleNavigation('/billing')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-3 text-gray-500" />
              Billing
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
        hasExistingKey={userData?.hasApiKey || false}
      />
    </div>
  );
}