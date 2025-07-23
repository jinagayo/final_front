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
      console.log('세션 체크 시작...');
      
      const response = await fetch('http://localhost:8080/auth/check', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('세션 체크 응답:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('세션 데이터:', data);
        
        // 백엔드에서 isLoggedIn 필드를 확인
        if (data.isLoggedIn === true) {
          console.log('세션 유효, 사용자 설정:', data);
          setUser(data);
          return true;
        } else {
          console.log('세션 무효');
          setUser(null);
          return false;
        }
      } else {
        console.log('세션 확인 실패:', response.status);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('세션 확인 중 오류:', error);
      setUser(null);
      return false;
    }
  };

  // 로그인
  const login = (userData) => {
    console.log('로그인 데이터 설정:', userData);
    setUser(userData);
  };

  // 로그아웃
  const logout = async () => {
    try {
      console.log('로그아웃 요청 시작...');
      
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('로그아웃 성공:', data);
      }
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
    
    // 클라이언트 상태 정리
    setUser(null);
    console.log('사용자 상태 초기화 완료');
    
    return { success: true, message: '로그아웃되었습니다.' };
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    console.log('AuthProvider 초기화 시작...');
    
    const initializeAuth = async () => {
      await checkAuthStatus();
      setIsLoading(false);
      console.log('AuthProvider 초기화 완료');
    };
    
    initializeAuth();
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

  // 관리자인지 확인 (position = "3")
  const isAdmin = () => hasPosition("3");

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