import { Link, useLocation } from "wouter";
import { Music, ChartLine, Bot, Table, Eye, DollarSign, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenUsageIndicator } from "@/components/ui/token-usage-indicator";
import orchestraLogo from '@assets/Lo_1754349496969.png';

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: ChartLine },
    { path: "/agents", label: "Agents", icon: Bot },
    { path: "/workflow", label: "Workflow", icon: Table },
    { path: "/conductor", label: "Conductor", icon: Eye },
    { path: "/pricing", label: "Pricing", icon: DollarSign },
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
                      className={`
                        px-3 py-2 text-sm transition-colors
                        ${isActive 
                          ? "bg-primary/20 text-primary" 
                          : "text-muted-foreground hover:text-foreground"
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
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-primary-foreground w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}