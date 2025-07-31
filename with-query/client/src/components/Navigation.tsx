import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Database, Save, Share, Home, Code, User, MessageCircle } from "lucide-react";

interface NavigationProps {
  currentProject?: any;
  onSaveProject?: () => void;
  isSaving?: boolean;
}

export default function Navigation({ currentProject, onSaveProject, isSaving }: NavigationProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();

  return (
    <nav className="modern-nav px-8 py-4 mx-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                    <circle cx="12" cy="8" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-bounce"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {t('brand.name')}
                </span>
                <span className="text-xs text-muted-foreground font-medium -mt-1 opacity-70">
                  ✨ Visual SQL Magic
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant="ghost"
                size="sm"
                className={`rounded-full px-6 py-3 transition-all duration-300 ${
                  location === "/" 
                    ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg" 
                    : "hover:bg-white/50"
                }`}
              >
                <div className="circular-icon w-6 h-6 mr-2 bg-gradient-to-r from-orange-400 to-pink-500">
                  <Home className="w-4 h-4 text-white" />
                </div>
                {t('navigation.dashboard')}
              </Button>
            </Link>
            <Link href="/ide">
              <Button 
                variant="ghost"
                size="sm"
                className={`rounded-full px-6 py-3 transition-all duration-300 ${
                  location.startsWith("/ide") 
                    ? "bg-gradient-to-r from-purple-400 to-blue-500 text-white shadow-lg" 
                    : "hover:bg-white/50"
                }`}
              >
                <div className="circular-icon w-6 h-6 mr-2 bg-gradient-to-r from-purple-400 to-blue-500">
                  <Code className="w-4 h-4 text-white" />
                </div>
                {t('navigation.ide')}
              </Button>
            </Link>
            <Link href="/chat">
              <Button 
                variant="ghost"
                size="sm"
                className={`rounded-full px-6 py-3 transition-all duration-300 ${
                  location === "/chat" 
                    ? "bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg" 
                    : "hover:bg-white/50"
                }`}
              >
                <div className="circular-icon w-6 h-6 mr-2 bg-gradient-to-r from-green-400 to-teal-500">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                {t('navigation.chat')}
              </Button>
            </Link>
          </div>

          {/* Project Selector (only in IDE) */}
          {location.startsWith("/ide") && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{t('navigation.project')}:</span>
              <span className="text-sm font-medium">
                {currentProject?.name || t('navigation.untitledProject')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* IDE Actions */}
          {location.startsWith("/ide") && onSaveProject && (
            <>
              <Button
                onClick={onSaveProject}
                disabled={isSaving}
                className="bg-soft-orange hover:bg-soft-orange/90 text-white"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? t('navigation.saving') : t('navigation.saveProject')}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
{t('navigation.share')}
              </Button>
            </>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={user?.profileImageUrl} 
                    alt={user?.firstName || "User"} 
                  />
                  <AvatarFallback className="bg-soft-orange text-white">
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user?.firstName || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
{t('navigation.profile')}
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => window.location.href = "/api/logout"}
              >
{t('navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
