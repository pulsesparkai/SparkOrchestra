import { Link, useLocation } from "wouter";
import { Music, ChartLine, Bot, Table, Eye, DollarSign, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <nav className="bg-black border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Music className="text-white w-4 h-4" />
              </div>
              <span className="text-white font-semibold text-lg">Orchestra</span>
              <span className="text-gray-400 text-sm">by PulseSpark.ai</span>
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
                          ? "bg-purple-600/20 text-purple-400" 
                          : "text-gray-400 hover:text-white"
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
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="text-white w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}