// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 라우팅을 위해 useNavigate 필요

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userNickname, setUserNickname] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate(); // AuthProvider 내부에서 useNavigate 사용

  useEffect(() => {
    // 앱 로드 시 localStorage에서 토큰 및 닉네임 확인
    const storedToken = localStorage.getItem('token');
    const storedNickname = localStorage.getItem('nickname');

    if (storedToken && storedNickname) {
      setIsLoggedIn(true);
      setUserNickname(storedNickname);
      setToken(storedToken);
      // 토큰이 있다면 초기 로딩 후 특정 페이지로 이동시킬 수도 있습니다.
      // 예: navigate('/dashboard');
    } else {
      setIsLoggedIn(false);
      setUserNickname(null);
      setToken(null);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 로그인 처리 함수 (LoginModal에서 호출될 함수)
  const login = (token, nickname) => {
    localStorage.setItem('token', token);
    localStorage.setItem('nickname', nickname);
    setIsLoggedIn(true);
    setUserNickname(nickname);
    setToken(token);
    // 로그인 성공 후 Editor 페이지로 이동 (예시: 기본 프로젝트 ID "default")
    navigate('/editor/default'); 
  };

  // 로그아웃 처리 함수
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    setIsLoggedIn(false);
    setUserNickname(null);
    setToken(null);
    navigate('/'); // 로그아웃 후 홈으로 이동
  };

  const authContextValue = {
    isLoggedIn,
    userNickname,
    token,
    login, // 로그인 함수
    logout, // 로그아웃 함수
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅: 다른 컴포넌트에서 인증 상태와 함수를 쉽게 사용하도록
export const useAuth = () => {
  return useContext(AuthContext);
};