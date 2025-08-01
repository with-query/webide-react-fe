import { useQuery } from "@tanstack/react-query";

// User 객체의 타입을 정의합니다.
// user?.firstName, user?.profileImageUrl 접근을 위해 이 속성들을 포함합니다.
// 데이터가 없을 수도 있으므로 '?'를 붙여 선택적(optional) 속성으로 만듭니다.
interface User {
  id: string;
  firstName?: string;
  profileImageUrl?: string;
  // 필요하다면 여기에 다른 사용자 관련 속성들을 추가하세요 (예: email, role 등)
}

export function useAuth() {
  // useQuery의 제네릭 타입으로 User 또는 null을 명시하여,
  // useQuery가 반환하는 data(user)의 타입을 TypeScript에 알려줍니다.
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user, // user는 이제 User | null 타입입니다.
    isLoading,
    isAuthenticated: !!user, // user 객체가 있으면 true, 없으면 false
  };
}
