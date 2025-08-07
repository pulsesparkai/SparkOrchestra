import { Link, useLocation } from "wouter";
import { Music, ChartLine, Bot, Table, Eye, DollarSign, Bell, User, HelpCircle, LogOut, Settings, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TokenUsageIndicator } from "@/components/ui/token-usage-indicator";
import { useTour } from "@/components/onboarding/tour-context";
import { useAuth } from "@/components/auth/auth-provider";
import orchestraLogo from '@assets/Lo_1754349496969.png';

export default function Navigation() {
  const [location] = useLocation();
  const { startTour } = useTour();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: ChartLine, tourId: "dashboard-tab" },
    { path: "/agents", label: "Agents", icon: Bot, tourId: "agents-tab" },
    { path: "/workflow", label: "Workflow", icon: Table, tourId: "workflows-tab" },
    { path: "/conductor", label: "Conductor", icon: Eye, tourId: "conductor-tab" },
    { path: "/pricing", label: "Pricing", icon: DollarSign, tourId: "pricing-tab" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img 
                src={orchestraLogo}
                alt="Orchestra by PulseSpark.ai" 
                className="h-10 w-auto"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-tour={item.tourId}
                      className={`
                        px-3 py-2 text-sm transition-colors
                        ${isActive 
                          ? "bg-orchestra-brown text-white" 
                          : "text-gray-700 hover:text-orchestra-brown"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <TokenUsageIndicator />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={startTour}
              className="text-gray-700 hover:text-orchestra-brown"
              title="Start Tour"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orchestra-brown">
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0 bg-orchestra-brown rounded-full hover:bg-orchestra-brown/90"
                >
                  <User className="text-white w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'info@pulsespark.ai'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <ChartLine className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Plan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}