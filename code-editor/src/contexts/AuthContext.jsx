import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import axios from 'axios';

// ✅ 1. 앱 전체에서 사용할 토큰 키를 'token'으로 명확하게 정의합니다.
const ACCESS_TOKEN_KEY = "token";
const NICKNAME_KEY = "nickname";
const BASE_URL = "http://20.196.89.99:8080";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
        const checkAuthStatus = async () => {
            const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (storedToken) {
                try {
                    const res = await axios.get(`${BASE_URL}/api/users/me`, { 
                        headers: { Authorization: `Bearer ${storedToken}` } 
                    });
                    setUser(res.data);
                    setIsLoggedIn(true);
                } catch (error) {
                    // 토큰이 유효하지 않은 경우
                    localStorage.removeItem(ACCESS_TOKEN_KEY);
                    setUser(null);
                    setIsLoggedIn(false);
                }
            }
            setIsInitialized(true); // API 호출 여부와 관계없이 초기화는 완료됨
        };
        checkAuthStatus();
    }, []);

    // useEffect(() => {
    //     try {
    //         // ✅ 올바른 키로 토큰을 조회합니다.
    //         const storedToken = localStorage.getItem('token');
    //         const storedNickname = localStorage.getItem(NICKNAME_KEY);

    //         if (storedToken) {
    //             setIsLoggedIn(true);
    //             setUserNickname(storedNickname);
    //             setToken(storedToken);
    //         }
    //     } catch (error) {
    //         console.error("Error reading from localStorage", error);
    //     } finally {
    //         setIsInitialized(true);
    //     }
    // }, []);

    const login = (newToken, userData) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        // 2. 올바른 키로 토큰 삭제
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(NICKNAME_KEY); // 닉네임도 삭제
        setUser(null);
        setIsLoggedIn(false);
        window.location.href = '/'; 
    };

    const authContextValue = {
        user, // 3. user 객체를 value에 추가
        isLoggedIn,
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
