import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';

// ✅ 1. 일관된 키 사용을 위해 상수로 정의

export const ACCESS_TOKEN_KEY = "token";
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
        try {
            const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
            const storedNickname = localStorage.getItem(NICKNAME_KEY);

            if (storedToken) {
                setIsLoggedIn(true);
                setUserNickname(storedNickname);
                setToken(storedToken);
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
        } finally {
            // ✅ 2. localStorage 확인 작업이 끝나면 초기화 완료로 설정
            setIsInitialized(true);
        }
    }, []);

    const login = (newToken, newNickname) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        localStorage.setItem(NICKNAME_KEY, newNickname);
        setIsLoggedIn(true);
        setUserNickname(newNickname);
        setToken(newToken);
    };

    // 로그아웃 처리 함수: 상태와 localStorage만 업데이트
    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(NICKNAME_KEY);
        setIsLoggedIn(false);
        setUserNickname(null);
        setToken(null);
        // ✅ 3. 로그아웃 시 페이지를 새로고침하여 모든 컴포넌트의 상태를 초기화합니다.
        window.location.href = '/'; 
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