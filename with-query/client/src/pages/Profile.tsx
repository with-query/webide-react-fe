import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Database, BarChart3, Clock } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const totalProjects = projects.length;
  const publicProjects = projects.filter((p: any) => p.isPublic).length;
  const recentActivity = projects.slice(0, 5);

  return (
    <div className="min-h-screen bg-warm-beige">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-text mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your activity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 text-soft-orange mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage 
                      src={user?.profileImageUrl} 
                      alt={user?.firstName || "User"} 
                    />
                    <AvatarFallback className="bg-soft-orange text-white">
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-dark-text">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || "User"
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member since</span>
                    <span className="text-sm font-medium">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last active</span>
                    <span className="text-sm font-medium">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-white border-border mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-soft-orange mr-2" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Total Projects</span>
                  </div>
                  <Badge variant="secondary">{totalProjects}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Public Projects</span>
                  </div>
                  <Badge variant="secondary">{publicProjects}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 text-soft-orange mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-dark-text mb-2">No activity yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first project to see activity here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((project: any) => (
                      <div 
                        key={project.id} 
                        className="flex items-center justify-between p-4 bg-light-beige rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-soft-orange/10 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-soft-orange" />
                          </div>
                          <div>
                            <h4 className="font-medium text-dark-text">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-dark-text">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last modified
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
