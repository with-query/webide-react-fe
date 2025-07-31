import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Plus, Clock, BarChart3, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: chatMessages = [], isLoading: chatLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="modern-nav">
        <Navigation />
      </div>
      
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            🚀 Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="floating-element p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="circular-icon bg-gradient-to-r from-purple-400 to-blue-500 mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-dark-text">📚 Recent Projects</h2>
                </div>
                <Link href="/ide">
                  <Button className="modern-button bg-gradient-to-r from-orange-400 to-pink-500 text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    ✨ New Project
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted/30 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="circular-icon bg-gradient-to-r from-gray-300 to-gray-400 mx-auto mb-6">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-text mb-3">No projects yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first project to start building SQL queries
                    </p>
                    <Link href="/ide">
                      <Button className="modern-button bg-gradient-to-r from-orange-400 to-pink-500 text-white">
                        🎯 Create Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.slice(0, 5).map((project: any) => (
                      <Link key={project.id} href={`/ide/${project.id}`}>
                        <div className="rounded-container hover:scale-105 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-dark-text">{project.name}</h4>
                              <p className="text-muted-foreground">
                                {project.description || "No description"}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Chat */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="floating-element p-6">
              <div className="flex items-center mb-6">
                <div className="circular-icon bg-gradient-to-r from-green-400 to-teal-500 mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark-text">⚡ Quick Actions</h2>
              </div>
              <div className="space-y-4">
                <Link href="/ide">
                  <Button variant="outline" className="w-full justify-start rounded-full py-4 hover:scale-105 transition-all duration-300">
                    <div className="circular-icon w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 mr-3">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    New Query Project
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start rounded-full py-4 hover:scale-105 transition-all duration-300">
                    <div className="circular-icon w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 mr-3">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    View Analytics
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="w-full justify-start rounded-full py-4 hover:scale-105 transition-all duration-300">
                    <div className="circular-icon w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 mr-3">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    Team Chat
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="floating-element p-6">
              <div className="flex items-center mb-6">
                <div className="circular-icon bg-gradient-to-r from-pink-400 to-purple-500 mr-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-dark-text">💬 Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {chatLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted/30 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No recent activity</p>
                    <Link href="/chat">
                      <Button className="modern-button bg-gradient-to-r from-green-400 to-teal-500 text-white">
                        💬 Start Chatting
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.slice(-3).map((message: any) => (
                      <div key={message.id} className="rounded-container">
                        <div className="flex items-start space-x-3">
                          <div className="circular-icon w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500">
                            <span className="text-xs text-white font-semibold">
                              {message.user?.firstName?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-dark-text">
                                {message.user?.firstName || "User"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}