import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleNaverCallback = async () => {
      try {
        // URL에서 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('Error:', error);

        // 에러 처리
        if (error) {
          console.error('네이버 로그인 에러:', error);
          alert('네이버 로그인이 취소되었거나 오류가 발생했습니다.');
          navigate('/auth/login');
          return;
        }

        // 상태값 검증 (CSRF 방지)
        const savedState = sessionStorage.getItem('naver_state');
        if (state !== savedState) {
          console.error('State 불일치:', { received: state, saved: savedState });
          alert('보안 오류가 발생했습니다. 다시 로그인해주세요.');
          navigate('/auth/login');
          return;
        }

        if (code) {
          // 백엔드에 인증 코드 전송
          const response = await fetch('http://localhost:8080/auth/naver/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              code: code,
              state: state
            })
          });

          const data = await response.json();

          if (data.success) {
            // 로그인 성공
            console.log('✅ 네이버 로그인 성공');
            
            const userInfo = data.user || data; //user객체가 없으면 data자체의 정보 사용


            // AuthContext에 사용자 정보 저장
            login(data.user);
            
            alert(`네이버 로그인 성공! 환영합니다, ${data.user.name}님!`);
            
            // 세션스토리지 정리
            sessionStorage.removeItem('naver_state');
            
            // 메인 페이지로 이동
            navigate('/');
          } else {
            console.error('백엔드 로그인 실패:', data.message);
            alert(data.message || '로그인 처리 중 오류가 발생했습니다.');
            navigate('/auth/login');
          }
        } else {
          console.error('인증 코드가 없습니다.');
          alert('로그인 정보를 받아올 수 없습니다.');
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        navigate('/auth/login');
      }
    };

    handleNaverCallback();
  }, [navigate, login]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3" style={{ fontSize: '18px', color: '#666' }}>
          네이버 로그인 처리 중...
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;