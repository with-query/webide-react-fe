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
    <nav className="bg-white border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-soft-orange rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-xl text-dark-text">{t('brand.name')}</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                size="sm"
                className={location === "/" ? "bg-soft-orange text-white" : ""}
              >
                <Home className="w-4 h-4 mr-2" />
{t('navigation.dashboard')}
              </Button>
            </Link>
            <Link href="/ide">
              <Button 
                variant={location.startsWith("/ide") ? "default" : "ghost"} 
                size="sm"
                className={location.startsWith("/ide") ? "bg-soft-orange text-white" : ""}
              >
                <Code className="w-4 h-4 mr-2" />
{t('navigation.ide')}
              </Button>
            </Link>
            <Link href="/chat">
              <Button 
                variant={location === "/chat" ? "default" : "ghost"} 
                size="sm"
                className={location === "/chat" ? "bg-soft-orange text-white" : ""}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
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
