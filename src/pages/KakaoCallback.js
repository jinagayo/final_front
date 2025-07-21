import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const processingRef = useRef(false); // 처리 중 상태 관리

  useEffect(() => {
    // 이미 처리 중이면 무시
    if (processingRef.current) {
      console.log('이미 처리 중입니다. 무시...');
      return;
    }

    const handleKakaoCallback = async () => {
      // 처리 시작 플래그 설정
      processingRef.current = true;

      try {
        // URL에서 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        console.log('🟡 카카오 콜백 처리 시작 (한 번만)');
        console.log('Code:', code ? code.substring(0, 20) + '...' : 'null');
        console.log('Error:', error);

        // 에러 처리
        if (error) {
          console.error('카카오 로그인 에러:', error);
          alert('카카오 로그인이 취소되었거나 오류가 발생했습니다.');
          navigate('/auth/login');
          return;
        }

        if (code) {
          // URL에서 code 파라미터 제거 (재사용 방지)
          window.history.replaceState({}, document.title, '/kakao/callback');

          // 백엔드에 인증 코드 전송
          const response = await fetch('http://localhost:8080/auth/kakao/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              code: code,
              timestamp: Date.now() // 고유 요청 식별용
            })
          });

          console.log('서버 응답 상태:', response.status);

          if (!response.ok) {
            console.error('서버 오류:', response.status, response.statusText);
            alert(`서버 오류가 발생했습니다: ${response.status}`);
            navigate('/auth/login');
            return;
          }

          const responseText = await response.text();

          if (!responseText) {
            console.error('서버에서 빈 응답을 받았습니다.');
            alert('서버에서 응답을 받지 못했습니다.');
            navigate('/auth/login');
            return;
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            alert('서버 응답 형식이 올바르지 않습니다.');
            navigate('/auth/login');
            return;
          }

          console.log('파싱된 데이터:', data);

          if (data.success) {
            console.log('✅ 카카오 로그인 성공');
            
            const userInfo = data.user || data;
            login(userInfo);
            
            const userName = userInfo.name || userInfo.nickname || userInfo.user_id || '사용자';
            alert(`카카오 로그인 성공! 환영합니다, ${userName}님!`);
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

    handleKakaoCallback();
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: '#FEE500' }}>
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3" style={{ fontSize: '18px', color: '#666' }}>
          카카오 로그인 처리 중...
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
};

export default KakaoCallback;