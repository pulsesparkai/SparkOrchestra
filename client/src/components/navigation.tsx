import { Link, useLocation } from "wouter";
import { Music, ChartLine, Bot, Table, Eye, DollarSign, Bell, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenUsageIndicator } from "@/components/ui/token-usage-indicator";
import { useTour } from "@/components/onboarding/tour-context";
import orchestraLogo from '@assets/Lo_1754349496969.png';

export default function Navigation() {
  const [location] = useLocation();
  const { startTour } = useTour();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: ChartLine, tourId: "dashboard-tab" },
    { path: "/agents", label: "Agents", icon: Bot, tourId: "agents-tab" },
    { path: "/workflow", label: "Workflow", icon: Table, tourId: "workflows-tab" },
    { path: "/conductor", label: "Conductor", icon: Eye, tourId: "conductor-tab" },
    { path: "/pricing", label: "Pricing", icon: DollarSign, tourId: "pricing-tab" },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img 
                src={orchestraLogo}
                alt="Orchestra by PulseSpark.ai" 
                className="h-8 w-auto"
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
                          ? "bg-accent/20 text-accent" 
                          : "text-card-foreground hover:text-card-foreground/80"
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
              className="text-card-foreground hover:text-card-foreground/80"
              title="Start Tour"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-card-foreground hover:text-card-foreground/80">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <User className="text-accent-foreground w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}