import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';

// ✅ 1. 앱 전체에서 사용할 토큰 키를 'token'으로 명확하게 정의합니다.
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

    useEffect(() => {
        try {
            // ✅ 올바른 키로 토큰을 조회합니다.
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedNickname = localStorage.getItem(NICKNAME_KEY);

            if (storedToken) {
                setIsLoggedIn(true);
                setUserNickname(storedNickname);
                setToken(storedToken);
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    const login = (newToken, newNickname) => {
        // ✅ 올바른 키로 토큰을 저장합니다.
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(NICKNAME_KEY, newNickname);
        setIsLoggedIn(true);
        setUserNickname(newNickname);
        setToken(newToken);
    };

    const logout = () => {
        // ✅ 2. 여기가 핵심입니다! 오타를 수정하여 올바른 키로 토큰을 삭제합니다.
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(NICKNAME_KEY);
        setIsLoggedIn(false);
        setUserNickname(null);
        setToken(null);
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
