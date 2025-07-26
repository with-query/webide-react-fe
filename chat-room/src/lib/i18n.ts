import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Translation {
  [key: string]: string | Translation;
}

interface LanguageStore {
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
  t: (key: string) => string;
}

const translations: Record<'ko' | 'en', Translation> = {
  ko: {
    // Brand
    brand: {
      name: '쿼리랑',
      tagline: '시각적 SQL 빌더 & 데이터 시각화'
    },
    
    // Landing Page
    landing: {
      hero: {
        title: '시각적 SQL 빌더 &',
        subtitle: '데이터 시각화',
        description: '코드 한 줄 작성하지 않고도 SQL 쿼리를 시각적으로 구축하고, 팀과 협업하며, 멋진 데이터 시각화를 만들어보세요.',
        getStarted: '무료로 시작하기',
        signIn: '로그인'
      },
      features: {
        visualBuilder: {
          title: '시각적 쿼리 빌더',
          description: 'SQL 지식 없이도 테이블을 드래그 앤 드롭으로 복잡한 쿼리를 구축하세요'
        },
        smartVisualizations: {
          title: '스마트 시각화',
          description: '쿼리 결과에서 자동으로 차트와 그래프를 생성합니다'
        },
        teamCollaboration: {
          title: '팀 협업',
          description: '프로젝트를 공유하고 팀과 실시간으로 협업하세요'
        },
        lightningFast: {
          title: '번개처럼 빠름',
          description: '쿼리를 즉시 실행하고 결과를 실시간으로 확인하세요'
        }
      },
      cta: {
        title: '데이터 워크플로우를 혁신할 준비가 되셨나요?',
        description: '쿼리랑을 사용하여 더 빠른 쿼리 구축, 더 나은 협업, 멋진 시각화를 만드는 수천 명의 데이터 전문가들과 함께하세요.',
        startBuilding: '지금 구축 시작하기'
      }
    },
    
    // Navigation
    navigation: {
      dashboard: '대시보드',
      ide: 'IDE',
      chat: '채팅',
      profile: '프로필',
      logout: '로그아웃',
      saveProject: '프로젝트 저장',
      saving: '저장 중...',
      share: '공유',
      project: '프로젝트',
      untitledProject: '제목 없는 프로젝트'
    },
    
    // Chat
    chat: {
      title: '팀 채팅',
      subtitle: '실시간으로 팀과 협업하세요.',
      generalChat: '일반 채팅',
      noMessages: '아직 메시지가 없습니다',
      startConversation: '첫 번째 메시지를 보내서 대화를 시작하세요',
      typeMessage: '메시지를 입력하세요...',
      you: '나',
      send: '보내기',
      connecting: '연결 중...',
      connected: '연결됨',
      disconnected: '연결 끊김',
      reconnecting: '재연결 중...',
    },
    
    // Dashboard
    dashboard: {
      title: '대시보드',
      welcome: '환영합니다! 프로젝트에서 일어나고 있는 일들을 확인하세요.',
      recentProjects: '최근 프로젝트',
      newProject: '새 프로젝트',
      noProjects: {
        title: '아직 프로젝트가 없습니다',
        description: 'SQL 쿼리 구축을 시작하려면 첫 번째 프로젝트를 만드세요',
        create: '프로젝트 만들기'
      },
      quickActions: '빠른 작업',
      newQueryProject: '새 쿼리 프로젝트',
      viewAnalytics: '분석 보기',
      teamChat: '팀 채팅',
      recentChat: '최근 채팅',
      noMessages: '아직 메시지가 없습니다',
      noDescription: '설명 없음'
    },
    
    // IDE
    ide: {
      databaseTables: '데이터베이스 테이블',
      searchTables: '테이블 검색...',
      categories: {
        all: '전체',
        users: '사용자',
        sales: '판매',
        products: '제품'
      },
      dragToCanvas: '테이블을 캔버스로 드래그하여 쿼리 구축',
      generateSample: '샘플 쿼리 생성',
      generatedSQL: '생성된 SQL',
      format: '포맷',
      copy: '복사',
      executeQuery: '쿼리 실행',
      executing: '실행 중...',
      noQuery: '쿼리 없음',
      syntaxValid: '구문 유효',
      onlySelect: 'SELECT 쿼리만 허용',
      placeholder: 'SQL 쿼리가 여기에 표시됩니다...',
      lines: '줄',
      startBuilding: {
        title: '쿼리 구축 시작',
        description: '왼쪽 패널에서 테이블을 이 캔버스로 드래그하여 시작하세요. 외래 키 관계를 기반으로 연결이 자동으로 감지됩니다.'
      },
      zoom: '확대',
      zoomOut: '축소',
      reset: '재설정',
      clear: '지우기',
      remove: '제거',
      rows: '행'
    },
    
    // Results Panel
    results: {
      title: '쿼리 결과',
      executed: '쿼리 실행됨',
      returned: '행 반환됨',
      table: '테이블',
      chart: '차트',
      noResults: {
        title: '결과 없음',
        description: '결과를 보려면 쿼리를 실행하세요'
      },
      noData: {
        title: '시각화할 데이터 없음',
        description: '차트를 보려면 숫자 데이터가 포함된 쿼리를 실행하세요'
      },
      noNumeric: {
        title: '숫자 데이터 없음',
        description: '시각화를 위해서는 쿼리 결과에 숫자 열이 필요합니다'
      },
      showing: '다음 중 처음 100개 표시',
      of: ' 중',
      export: '내보내기',
      share: '결과 공유'
    },
    
    // Chat
    chat: {
      title: '팀 채팅',
      description: '팀과 실시간으로 협업하세요.',
      general: '일반 채팅',
      noMessages: {
        title: '아직 메시지가 없습니다',
        description: '첫 번째 메시지를 보내 대화를 시작하세요'
      },
      placeholder: '메시지를 입력하세요...',
      you: '나'
    },
    
    // Profile
    profile: {
      title: '프로필',
      description: '계정 설정을 관리하고 활동을 확인하세요.',
      information: '프로필 정보',
      memberSince: '가입일',
      lastActive: '마지막 활동',
      statistics: '통계',
      totalProjects: '총 프로젝트',
      publicProjects: '공개 프로젝트',
      recentActivity: '최근 활동',
      noActivity: {
        title: '아직 활동이 없습니다',
        description: '활동을 여기서 보려면 첫 번째 프로젝트를 만드세요'
      },
      lastModified: '마지막 수정'
    },
    
    // Common
    common: {
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      close: '닫기',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      search: '검색',
      filter: '필터',
      sort: '정렬',
      refresh: '새로고침',
      today: '오늘',
      yesterday: '어제',
      thisWeek: '이번 주',
      thisMonth: '이번 달',
      user: '사용자'
    },
    
    // Messages
    messages: {
      unauthorized: '권한이 없습니다. 다시 로그인하는 중...',
      projectSaved: '프로젝트가 성공적으로 저장되었습니다',
      projectSaveFailed: '프로젝트 저장에 실패했습니다',
      queryExecuted: '쿼리가 성공적으로 실행되었습니다.',
      queryError: '쿼리 오류',
      enterQuery: 'SQL 쿼리를 입력하세요',
      copied: '클립보드에 복사됨',
      copyFailed: '클립보드 복사에 실패했습니다',
      formatted: 'SQL 쿼리가 포맷되었습니다',
      exported: '결과가 내보내기되었습니다',
      messageSendFailed: '메시지 전송에 실패했습니다',
      noDataExport: '내보낼 쿼리 결과가 없습니다'
    }
  },
  
  en: {
    // Brand
    brand: {
      name: 'QueryLang',
      tagline: 'Visual SQL Builder & Data Visualization'
    },
    
    // Landing Page
    landing: {
      hero: {
        title: 'Visual SQL Builder &',
        subtitle: 'Data Visualization',
        description: 'Build SQL queries visually, collaborate with your team, and create stunning data visualizations without writing a single line of code.',
        getStarted: 'Get Started Free',
        signIn: 'Sign In'
      },
      features: {
        visualBuilder: {
          title: 'Visual Query Builder',
          description: 'Drag and drop tables to build complex queries without SQL knowledge'
        },
        smartVisualizations: {
          title: 'Smart Visualizations',
          description: 'Automatically generate charts and graphs from your query results'
        },
        teamCollaboration: {
          title: 'Team Collaboration',
          description: 'Share projects and collaborate in real-time with your team'
        },
        lightningFast: {
          title: 'Lightning Fast',
          description: 'Execute queries instantly and see results in real-time'
        }
      },
      cta: {
        title: 'Ready to transform your data workflow?',
        description: 'Join thousands of data professionals who use QueryLang to build queries faster, collaborate better, and create stunning visualizations.',
        startBuilding: 'Start Building Now'
      }
    },
    
    // Navigation
    navigation: {
      dashboard: 'Dashboard',
      ide: 'IDE',
      chat: 'Chat',
      profile: 'Profile',
      logout: 'Logout',
      saveProject: 'Save Project',
      saving: 'Saving...',
      share: 'Share',
      project: 'Project',
      untitledProject: 'Untitled Project'
    },
    
    // Chat
    chat: {
      title: 'Team Chat',
      subtitle: 'Collaborate with your team in real-time.',
      generalChat: 'General Chat',
      noMessages: 'No messages yet',
      startConversation: 'Start the conversation by sending the first message',
      typeMessage: 'Type a message...',
      you: 'You',
      send: 'Send',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      reconnecting: 'Reconnecting...',
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back! Here\'s what\'s happening with your projects.',
      recentProjects: 'Recent Projects',
      newProject: 'New Project',
      noProjects: {
        title: 'No projects yet',
        description: 'Create your first project to start building SQL queries',
        create: 'Create Project'
      },
      quickActions: 'Quick Actions',
      newQueryProject: 'New Query Project',
      viewAnalytics: 'View Analytics',
      teamChat: 'Team Chat',
      recentChat: 'Recent Chat',
      noMessages: 'No messages yet',
      noDescription: 'No description'
    },
    
    // IDE
    ide: {
      databaseTables: 'Database Tables',
      searchTables: 'Search tables...',
      categories: {
        all: 'All',
        users: 'Users',
        sales: 'Sales',
        products: 'Products'
      },
      dragToCanvas: 'Drag tables to canvas to build query',
      generateSample: 'Generate Sample Query',
      generatedSQL: 'Generated SQL',
      format: 'Format',
      copy: 'Copy',
      executeQuery: 'Execute Query',
      executing: 'Executing...',
      noQuery: 'No query',
      syntaxValid: 'Syntax valid',
      onlySelect: 'Only SELECT queries allowed',
      placeholder: 'Your SQL query will appear here...',
      lines: 'lines',
      startBuilding: {
        title: 'Start Building Your Query',
        description: 'Drag tables from the left panel onto this canvas to begin. Connections will be automatically detected based on foreign key relationships.'
      },
      zoom: 'Zoom In',
      zoomOut: 'Zoom Out',
      reset: 'Reset',
      clear: 'Clear',
      remove: 'Remove',
      rows: 'rows'
    },
    
    // Results Panel
    results: {
      title: 'Query Results',
      executed: 'Query executed',
      returned: 'rows returned',
      table: 'Table',
      chart: 'Chart',
      noResults: {
        title: 'No results',
        description: 'Execute a query to see results here'
      },
      noData: {
        title: 'No data to visualize',
        description: 'Execute a query with numeric data to see charts'
      },
      noNumeric: {
        title: 'No numeric data',
        description: 'Query results need numeric columns for visualization'
      },
      showing: 'Showing first 100 of',
      of: '',
      export: 'Export',
      share: 'Share Results'
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      thisMonth: 'This month',
      user: 'User'
    },
    
    // Messages
    messages: {
      unauthorized: 'Unauthorized. Logging in again...',
      projectSaved: 'Project saved successfully',
      projectSaveFailed: 'Failed to save project',
      queryExecuted: 'Query executed successfully.',
      queryError: 'Query Error',
      enterQuery: 'Please enter a SQL query',
      copied: 'Copied to clipboard',
      copyFailed: 'Failed to copy to clipboard',
      formatted: 'SQL query has been formatted',
      exported: 'Results exported as',
      messageSendFailed: 'Failed to send message',
      noDataExport: 'No query results to export'
    }
  }
};

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'ko', // Default to Korean
      setLanguage: (lang: 'ko' | 'en') => set({ language: lang }),
      t: (key: string) => {
        const { language } = get();
        const keys = key.split('.');
        let current: any = translations[language];
        
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k];
          } else {
            // Fallback to English if key not found
            current = translations.en;
            for (const fallbackKey of keys) {
              if (current && typeof current === 'object' && fallbackKey in current) {
                current = current[fallbackKey];
              } else {
                return key; // Return key if not found in fallback
              }
            }
            break;
          }
        }
        
        return typeof current === 'string' ? current : key;
      }
    }),
    {
      name: 'querylang-language',
      storage: createJSONStorage(() => localStorage),
    }
  )
);