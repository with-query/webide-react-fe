import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Chat() {
  const [message, setMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // 인증되지 않은 사용자 리디렉션
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

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', refreshTrigger],
    enabled: isAuthenticated,
    refetchInterval: 5000, // 5초마다 자동 새로고침
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return await apiRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ message: messageText }),
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: '메시지 전송됨',
        description: '메시지가 성공적으로 전송되었습니다.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '메시지 전송 실패',
        description: error.message || '메시지 전송 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    },
  });

  // 새 메시지가 추가되면 자동으로 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="modern-nav">
        <Navigation />
      </div>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* 채팅 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            💬 팀 채팅방
          </h1>
          <p className="text-lg text-muted-foreground">
            실시간으로 팀원들과 소통하세요
          </p>
        </div>

        {/* 채팅 컨테이너 */}
        <div className="floating-element max-w-3xl mx-auto">
          {/* 채팅 헤더 바 */}
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="circular-icon bg-white/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">팀 채팅</h2>
                  <p className="text-sm opacity-90">실시간 협업</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  온라인
                </span>
              </div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="h-96 overflow-y-auto p-6 bg-white/95 backdrop-blur-sm space-y-4">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="space-y-3 text-center">
                  <div className="circular-icon bg-gradient-to-r from-orange-400 to-pink-500 mx-auto">
                    <MessageCircle className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">메시지를 불러오는 중...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="space-y-4 text-center">
                  <div className="circular-icon bg-gradient-to-r from-orange-400 to-pink-500 mx-auto">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark-text mb-2">
                      💬 첫 번째 메시지를 보내보세요!
                    </h3>
                    <p className="text-muted-foreground">
                      팀원들과 프로젝트에 대해 이야기해보세요.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg: any) => {
                  const isOwnMessage = msg.userId === user?.id;
                  const userName = msg.user?.firstName || '익명';
                  const messageTime = new Date(msg.createdAt).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-start space-x-3`}
                    >
                      {!isOwnMessage && (
                        <div className="circular-icon bg-gradient-to-r from-purple-400 to-blue-500 text-white text-sm font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : ''}`}>
                        {!isOwnMessage && (
                          <p className="text-xs text-muted-foreground mb-1 ml-2">
                            {userName}
                          </p>
                        )}
                        
                        <div className={`rounded-container p-4 ${
                          isOwnMessage 
                            ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white' 
                            : 'bg-white border border-gray-200'
                        } ${isOwnMessage ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <p className={`text-xs mt-2 ${
                            isOwnMessage ? 'text-white/70 text-right' : 'text-muted-foreground'
                          }`}>
                            {messageTime}
                          </p>
                        </div>
                      </div>

                      {isOwnMessage && (
                        <div className="circular-icon bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 메시지 입력 */}
          <div className="p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-b-3xl">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 rounded-full border-2 border-gray-200 focus:border-orange-400 px-6 py-3"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                className="modern-button bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full px-8 hover:scale-105 transition-all duration-300"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}