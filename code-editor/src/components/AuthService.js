import { useState, useEffect, useCallback } from 'react';

const token = "token";
const ACCESS_TOKEN_EXPIRY_KEY = "tokenExpiry"; // 액세스 토큰 만료 시간을 저장할 키
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30분 (밀리초)

let inactivityTimer = null; // 유휴 시간 타이머

// 사용자의 활동을 감지하고 타이머를 재설정하는 함수
const resetInactivityTimer = (logoutCallback) => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    console.log("30분 동안 활동이 없어 자동 로그아웃됩니다.");
    logoutCallback(); // 자동 로그아웃 함수 호출
  }, INACTIVITY_TIMEOUT);
};

// 모든 이벤트 리스너를 제거하는 함수
const removeActivityListeners = () => {
  document.removeEventListener("mousemove", handleActivity);
  document.removeEventListener("keydown", handleActivity);
  document.removeEventListener("click", handleActivity);
  clearTimeout(inactivityTimer);
};

// 활동 감지 핸들러 (내부에서 타이머 재설정)
let logoutHandlerRef = null; // 로그아웃 핸들러를 참조하기 위한 변수

const handleActivity = () => {
  if (logoutHandlerRef) {
    resetInactivityTimer(logoutHandlerRef);
  }
};

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // 로그아웃 처리 함수
  const logout = useCallback(() => {
    localStorage.removeItem(token);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
    localStorage.removeItem("nickname"); // 저장된 닉네임도 삭제
    localStorage.removeItem("savedEmail"); // 저장된 이메일도 삭제 (선택 사항)
    setIsLoggedIn(false);
    removeActivityListeners(); // 로그아웃 시 활동 리스너 제거
    window.location.href = "/"; // 로그인 페이지 또는 메인 페이지로 리디렉션
  }, []);

  // 로그인 성공 시 호출될 함수 (액세스 토큰 및 만료 시간 저장)
  const login = useCallback((token, nickname, expiresInSeconds) => {
    const now = Date.now();
    const expiryTime = now + (expiresInSeconds * 1000); // 밀리초 단위로 변환
    localStorage.setItem(token, token);
    localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, expiryTime.toString());
    localStorage.setItem("nickname", nickname);
    setIsLoggedIn(true);
    logoutHandlerRef = logout; // 로그아웃 핸들러 참조 저장
    resetInactivityTimer(logout); // 로그인 성공 시 타이머 시작
    // 여기에 활동 감지 리스너를 추가합니다.
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("click", handleActivity);
  }, [logout]);

  // 컴포넌트 마운트 시 또는 로그인 상태 변경 시 실행되는 useEffect
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);

    if (token && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      const now = Date.now();

      if (now < expiryTime) { // 토큰이 유효하면 타이머 재설정
        setIsLoggedIn(true);
        logoutHandlerRef = logout; // 로그아웃 핸들러 참조 저장
        resetInactivityTimer(logout);
        // 활동 감지 리스너 추가
        document.addEventListener("mousemove", handleActivity);
        document.addEventListener("keydown", handleActivity);
        document.addEventListener("click", handleActivity);

        // 액세스 토큰 만료 시간 임박 시 처리 (선택 사항: 리프레시 토큰 사용)
        // 예를 들어, 만료 5분 전에 토큰 갱신 시도
        const fiveMinutesBeforeExpiry = expiryTime - (5 * 60 * 1000);
        if (now < fiveMinutesBeforeExpiry) {
          // 토큰 갱신 로직 (서버에 리프레시 토큰 전송)
          // setTimeout(() => {
          //   // 토큰 갱신 API 호출
          //   // 성공 시 새 토큰과 만료 시간으로 localStorage 업데이트
          //   // 실패 시 강제 로그아웃
          // }, fiveMinutesBeforeExpiry - now);
        }
      } else { // 토큰 만료 시 로그아웃
        console.log("액세스 토큰이 만료되어 자동 로그아웃됩니다.");
        logout();
      }
    } else {
      setIsLoggedIn(false);
    }

    // 컴포넌트 언마운트 시 클린업
    return () => {
      removeActivityListeners();
    };
  }, [logout]);

  return { isLoggedIn, login, logout };
};

export default useAuth;