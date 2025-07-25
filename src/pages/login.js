import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NaverLogin from "./NaverLogin"
import KakaoLogin from "./KakaoLogin";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    user_id: "",
    password: "",
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { handleKakaoLogin: kakaoLoginFunction } = KakaoLogin();
  // Remember Me 기능: 컴포넌트 로드 시 저장된 아이디 불러오기
  useEffect(() => {
    const rememberedUserId = localStorage.getItem('rememberedUserId');
    if (rememberedUserId) {
      setForm(prev => ({
        ...prev,
        user_id: rememberedUserId,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //네이버 로그인 처리
  const handleNaverLogin = () => {
    const NAVER_CLIENT_ID = "W24SNU9H24_ktuo8Bmmn";
    const REDIRECT_URI = "http://localhost:3000/oauth";
    const STATE = Math.random().toString(36).substring(2, 15); // 랜덤 상태값
    const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;
    sessionStorage.setItem('naver_state', STATE);
    window.location.href = NAVER_AUTH_URL;
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('=== 로그인 시도 ===');
      console.log('아이디:', form.user_id);
      console.log('비밀번호:', form.password ? '***있음***' : '없음');
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: form.user_id,
          pw: form.password,
        })
      });

      const data = await response.json();
      console.log('서버 응답:', data);

      if (response.ok && data.success) {
        // 로그인 성공
        alert(`로그인 성공! 환영합니다, ${data.user.name}님!`);
        
        // AuthContext에 사용자 정보 저장
        login(data.user);
        
        // Remember Me 처리
        if (form.rememberMe) {
          localStorage.setItem('rememberedUserId', form.user_id);
        } else {
          localStorage.removeItem('rememberedUserId');
        }
        
        // 메인 페이지로 이동
        navigate('/');
      } else {
        // 로그인 실패
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('서버 연결에 실패했습니다. 네트워크를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 페이지로 이동
  const goToSignup = () => {
    navigate('/auth/join');
  };

  return (
    <div
      className="vh-100 vw-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #3870ed 0%, #3b68d1 100%)",
        minHeight: "100vh",
      }}
    >
      <div
        className="card shadow border-0"
        style={{
          width: "400px",
          padding: "42px 36px 32px 36px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(44,99,246,0.14)",
        }}
      >
        <form onSubmit={handleSubmit} autoComplete="off">
          <h2
            className="text-center mb-4"
            style={{
              color: "#5a5a5a",
              fontWeight: 400,
              letterSpacing: "-1px",
            }}
          >
            Welcome Back!
          </h2>
          
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="user_id"
              placeholder="아이디"
              value={form.user_id}
              onChange={handleChange}
              style={{
                borderRadius: "30px",
                padding: "15px 22px",
                fontSize: "15px",
                border: "1.5px solid #ececec",
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-2">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              style={{
                borderRadius: "30px",
                padding: "15px 22px",
                fontSize: "15px",
                border: "1.5px solid #ececec",
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-check mb-3 ps-1">
            <input
              className="form-check-input"
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              style={{ marginRight: "6px" }}
              disabled={isLoading}
            />
            <label 
              className="form-check-label" 
              htmlFor="rememberMe" 
              style={{ color: "#878787", fontSize: "14px" }}
            >
              Remember Me
            </label>
          </div>
          
          <button
            type="submit"
            className="btn w-100 mb-2"
            style={{
              background: isLoading ? "#ccc" : "#497afc",
              color: "#fff",
              borderRadius: "30px",
              fontWeight: 500,
              fontSize: "16px",
              padding: "12px 0",
              marginBottom: "14px",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "Login"}
          </button>
          
          {/* NAVER 로그인 */}
          <button
            type="button"
            className="btn w-100 mb-2"
            style={{
              background: "#13db3a",
              color: "#fff",
              borderRadius: "30px",
              fontWeight: 600,
              fontSize: "16px",
              padding: "12px 0",
              marginBottom: "10px",
            }}
            onClick= {handleNaverLogin}
            disabled={isLoading}
          >
            NAVER 로 로그인
          </button>
          
          {/* KAKAO 로그인 */}
          <button
            type="button"
            className="btn w-100 mb-3"
            style={{
              background: "#ffe043",
              color: "#222",
              borderRadius: "30px",
              fontWeight: 700,
              fontSize: "16px",
              padding: "12px 0",
              marginBottom: "15px",
            }}
            onClick={kakaoLoginFunction}
            disabled={isLoading}
          >
            <span style={{ color: "#111", fontWeight: 700 }}>kakao</span>{" "}
            <span style={{ color: "#222", fontWeight: 500 }}>로 로그인</span>
          </button>
          
          <hr style={{ borderTop: "1px solid #eee", margin: "22px 0 8px 0" }} />
          
          <div className="text-center" style={{ fontSize: "13.5px" }}>
            <a href="#" className="text-primary text-decoration-none me-2">
              Forgot Password?
            </a>
            <button
              type="button"
              className="btn btn-link text-primary text-decoration-none ms-2 p-0"
              style={{ fontSize: "13.5px" }}
              onClick={goToSignup}
              disabled={isLoading}
            >
              Create an Account!
            </button>
          </div>
          
          {/* 홈으로 돌아가기 */}
          <div className="text-center mt-2">
            <button
              type="button"
              className="btn btn-link text-muted p-0"
              style={{ textDecoration: "none", fontSize: "12px" }}
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              홈으로 돌아가기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}