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

  // 서버에서 세션 상태 확인
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/check', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 백엔드에서 isLoggedIn 필드를 확인
        if (data.isLoggedIn === true && data.user_id) {
          // 서버에 세션이 있으면 해당 정보로 업데이트
          const sessionUser = { user_id: data.user_id };
          setUser(sessionUser);
          localStorage.setItem('user', JSON.stringify(sessionUser));
          return true;
        } else {

          setUser(null);
          localStorage.removeItem('user');
          return false;
        }
      } else {
        console.log('세션 확인 실패:', response.status);
        // 403이나 다른 에러의 경우 세션이 없다고 판단
        setUser(null);
        localStorage.removeItem('user');
        return false;
      }
    } catch (error) {
      console.error('세션 확인 중 오류:', error);
      // 네트워크 에러 등의 경우 로컬 스토리지 데이터 유지하지 않음
      setUser(null);
      localStorage.removeItem('user');
      return false;
    }
  };

  // 로그인
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 로그아웃
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
    
    // 클라이언트 상태 정리
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedUserId');
    
    return { success: true, message: '로그아웃되었습니다.' };
  };

  // 페이지 새로고침 시 로그인 상태 복원
  useEffect(() => {

    const initializeAuth = async () => {
      // 1. 먼저 서버 세션 확인
      const hasServerSession = await checkAuthStatus();
      
      if (!hasServerSession) {
        // 2. 서버 세션이 없으면 로컬 스토리지 확인
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            localStorage.removeItem('user');
            setUser(null);
          } catch (error) {
            console.error('사용자 정보 파싱 오류:', error);
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  // 인증 상태 확인
  const isAuthenticated = () => {
    const result = user !== null;
    return result;
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
    getCurrentUserId,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};