import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';

// ✅ 1. 일관된 키 사용을 위해 상수로 정의
const TOKEN_KEY = "ACCESS_TOKEN_KEY";
const NICKNAME_KEY = "nickname";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userNickname, setUserNickname] = useState(null);
    const [token, setToken] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const { 
        isOpen: isLoginModalOpen, 
        onOpen: openLoginModal, 
        onClose: closeLoginModal 
    } = useDisclosure();

    // 앱 로드 시 localStorage에서 토큰 및 닉네임 확인
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedNickname = localStorage.getItem(NICKNAME_KEY);

        if (storedToken) {
            setIsLoggedIn(true);
            setUserNickname(storedNickname);
            setToken(storedToken);
        }
        setIsInitialized(true);
    }, []);

    // 로그인 처리 함수: 상태와 localStorage만 업데이트
      const login = (newToken, newNickname) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(NICKNAME_KEY, newNickname);
        setIsLoggedIn(true);
        setUserNickname(newNickname);
        setToken(newToken);
      };

    // 로그아웃 처리 함수: 상태와 localStorage만 업데이트
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(NICKNAME_KEY);
        setIsLoggedIn(false);
        setUserNickname(null);
        setToken(null);
    };

    const authContextValue = {
        isLoggedIn,
        userNickname,
        token,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isInitialized,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 다른 컴포넌트에서 쉽게 사용하기 위한 커스텀 훅
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};