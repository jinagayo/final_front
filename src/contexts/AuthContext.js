import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인
  const login = (userData) => {
    console.log('AuthContext: 사용자 로그인', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 로그아웃
  const logout = async () => {
    console.log('AuthContext: 사용자 로그아웃');
    
    try {
      // 서버에 로그아웃 요청
      await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedUserId');
  };

  // 페이지 새로고침 시 로그인 상태 복원
  useEffect(() => {
    console.log('AuthContext: 로그인 상태 복원 시도');
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('저장된 사용자 정보 복원:', userData);
        setUser(userData);
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 인증 상태 확인
  const isAuthenticated = () => {
    return user !== null;
  };

  // 권한 확인 (숫자 기반)
  const hasPosition = (position) => {
    return user && user.position === position;
  };

  // 학생인지 확인 (position = "1")
  const isStudent = () => hasPosition("1");

  // 강사인지 확인 (position = "2")
  const isInstructor = () => hasPosition("2");

  // 관리자인지 확인 (position = "0")
  const isAdmin = () => hasPosition("0");

  // 현재 사용자 ID 가져오기
  const getCurrentUserId = () => user?.user_id;

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    hasPosition,
    isStudent,
    isInstructor,
    isAdmin,
    getCurrentUserId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};