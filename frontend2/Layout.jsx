import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./src/utils";
import { 
  Home, 
  TrendingUp, 
  Lightbulb, 
  AlertTriangle, 
  User,
  Moon
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home
  },
  {
    title: "Trends",
    url: createPageUrl("Trends"),
    icon: TrendingUp
  },
  {
    title: "Recommendations",
    url: createPageUrl("Recommendations"),
    icon: Lightbulb
  },
  {
    title: "Risks",
    url: createPageUrl("Risks"),
    icon: AlertTriangle
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <style>
        {`
          :root {
            --bg-primary: #000000;
            --bg-secondary: #1C1C1E;
            --bg-tertiary: #2C2C2E;
            --accent-primary: #A890FE;
            --accent-secondary: #C9B9FF;
            --primary-blue: #1A2A6C;
            --text-primary: #FFFFFF;
            --text-secondary: #EBEBF599;
            --text-muted: #EBEBF54D;
            --separator: #38383A;
            --success: #34C759;
            --warning: #FF9500;
            --danger: #FF3B30;
          }
          
          body {
            background-color: var(--bg-primary);
          }

          .ios-card {
            background-color: var(--bg-secondary);
            border-radius: 12px;
          }
          
          .ios-inset-card {
             background-color: var(--bg-tertiary);
             border-radius: 10px;
          }

          .ios-nav-bar {
            background-color: rgba(28, 28, 30, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--separator);
          }
        `}
      </style>
      
      {/* Main Content Area */}
      <div className="pb-24">
        {children}
      </div>

      {/* Mobile Bottom Navigation (iOS Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
        <nav className="relative ios-nav-bar h-20 border-t border-t-[var(--separator)] rounded-t-2xl">
          <div className="flex justify-around items-center pt-3">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className="flex flex-col items-center justify-center w-1/5 transition-transform duration-200 ease-in-out"
              >
                <item.icon 
                  className={`w-6 h-6 mb-1 transition-colors ${
                    location.pathname === item.url 
                      ? 'text-[var(--accent-primary)]' 
                      : 'text-[var(--text-secondary)]'
                  }`}
                  strokeWidth={location.pathname === item.url ? 2.5 : 2}
                />
                <span className={`text-xs font-medium transition-colors ${
                  location.pathname === item.url 
                    ? 'text-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)]'
                }`}>
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}