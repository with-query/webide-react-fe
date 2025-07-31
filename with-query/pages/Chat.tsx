import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";

export default function Chat() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');

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

  // Fetch initial chat messages  
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/chat/messages"],
    enabled: isAuthenticated,
  });

  // WebSocket connection management
  useEffect(() => {
    if (!isAuthenticated) return;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            // Invalidate and refetch messages when new message arrives
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (isAuthenticated) {
            setConnectionStatus('reconnecting');
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    };

    connectWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [isAuthenticated, queryClient]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/chat/messages", { message });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage);
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="modern-nav">
        <Navigation />
      </div>
      
      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-dark-text mb-3">{t('chat.title')}</h1>
              <p className="text-lg text-muted-foreground">
                {t('chat.subtitle')}
              </p>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
              connectionStatus === 'connected' 
                ? 'bg-green-100/80 text-green-700 border border-green-200/50' 
                : 'bg-orange-100/80 text-orange-700 border border-orange-200/50'
            }`}>
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="font-medium">{t(`chat.${connectionStatus}`)}</span>
            </div>
          </div>
        </div>

        <div className="floating-element h-[calc(100vh-240px)] flex flex-col">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-orange-50/80 to-orange-100/80">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-dark-text">{t('chat.generalChat')}</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col p-6">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-24" />
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (messages as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-dark-text mb-2">{t('chat.noMessages')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('chat.startConversation')}
                  </p>
                </div>
              ) : (
                <>
                  {(messages as any[]).map((message: any) => {
                    const isOwnMessage = message.userId === (user as any)?.id;
                    return (
                      <div 
                        key={message.id} 
                        className={`flex items-end space-x-3 mb-6 ${
                          isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <Avatar className="w-10 h-10 shadow-lg border-2 border-white">
                          <AvatarImage 
                            src={message.user.profileImageUrl} 
                            alt={message.user.firstName || "User"} 
                          />
                          <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-semibold">
                            {message.user.firstName?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col max-w-md">
                          <div className={`flex items-center space-x-2 mb-2 ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}>
                            <span className="text-xs font-semibold text-dark-text">
                              {isOwnMessage ? t('chat.you') : (message.user.firstName || "User")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div 
                            className={`modern-chat-bubble ${isOwnMessage ? "own" : "other"}`}
                          >
                            {message.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('chat.typeMessage')}
                className="flex-1 modern-input"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="circular-icon bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:scale-110"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
