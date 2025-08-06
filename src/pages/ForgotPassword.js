import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_id: "",
    email: "",
  });

  const [step, setStep] = useState(1); // 1: 정보입력, 2: 이메일전송완료, 3: 새비밀번호설정
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState({
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewPasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 1단계: 아이디와 이메일로 사용자 확인
  const handleFindPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('=== 비밀번호 찾기 시도 ===');
      console.log('아이디:', form.user_id);
      console.log('이메일:', form.email);

      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: form.user_id,
          email: form.email,
        })
      });

      const data = await response.json();
      console.log('서버 응답:', data);

      if (response.ok && data.success) {
        alert('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
        setStep(2);
      } else {
        alert(data.message || '일치하는 사용자 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      alert('서버 연결에 실패했습니다. 네트워크를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 인증코드 확인 및 새 비밀번호 설정
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.password !== newPassword.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.password.length < 6) {
      alert('비밀번호는 6자 이상 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: form.user_id,
          email: form.email,
          verification_code: verificationCode,
          new_password: newPassword.password,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
        navigate('/auth/login');
      } else {
        alert(data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      alert('서버 연결에 실패했습니다. 네트워크를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/auth/login');
  };

  const resendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: form.user_id,
          email: form.email,
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('인증 이메일을 다시 발송했습니다.');
      } else {
        alert('이메일 재발송에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
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
        {/* 1단계: 사용자 정보 입력 */}
        {step === 1 && (
          <form onSubmit={handleFindPassword} autoComplete="off">
            <h2
              className="text-center mb-4"
              style={{
                color: "#5a5a5a",
                fontWeight: 400,
                letterSpacing: "-1px",
              }}
            >
              비밀번호 찾기
            </h2>
            
            <p 
              className="text-center mb-4" 
              style={{ 
                color: "#878787", 
                fontSize: "14px",
                lineHeight: "1.5"
              }}
            >
              가입할 때 사용한 아이디와 이메일을 입력해주세요.
            </p>
            
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
            
            <div className="mb-4">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="이메일"
                value={form.email}
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
            
            <button
              type="submit"
              className="btn w-100 mb-3"
              style={{
                background: isLoading ? "#ccc" : "#497afc",
                color: "#fff",
                borderRadius: "30px",
                fontWeight: 500,
                fontSize: "16px",
                padding: "12px 0",
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "비밀번호 찾기"}
            </button>
            
            <hr style={{ borderTop: "1px solid #eee", margin: "22px 0 8px 0" }} />
            
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link text-primary text-decoration-none p-0"
                style={{ fontSize: "13.5px" }}
                onClick={goToLogin}
                disabled={isLoading}
              >
                로그인으로 돌아가기
              </button>
            </div>
            
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
        )}

        {/* 2단계: 이메일 발송 완료 및 새 비밀번호 설정 */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} autoComplete="off">
            <h2
              className="text-center mb-4"
              style={{
                color: "#5a5a5a",
                fontWeight: 400,
                letterSpacing: "-1px",
              }}
            >
              새 비밀번호 설정
            </h2>
            
            <p 
              className="text-center mb-4" 
              style={{ 
                color: "#878787", 
                fontSize: "14px",
                lineHeight: "1.5"
              }}
            >
              이메일로 발송된 인증코드를 입력하고<br/>새 비밀번호를 설정해주세요.
            </p>
            
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="인증코드 (6자리)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={{
                  borderRadius: "30px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  border: "1.5px solid #ececec",
                  textAlign: "center",
                  letterSpacing: "2px"
                }}
                maxLength="6"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="새 비밀번호 (6자 이상)"
                value={newPassword.password}
                onChange={handleNewPasswordChange}
                style={{
                  borderRadius: "30px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  border: "1.5px solid #ececec",
                }}
                minLength="6"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                placeholder="새 비밀번호 확인"
                value={newPassword.confirmPassword}
                onChange={handleNewPasswordChange}
                style={{
                  borderRadius: "30px",
                  padding: "15px 22px",
                  fontSize: "15px",
                  border: "1.5px solid #ececec",
                }}
                minLength="6"
                required
                disabled={isLoading}
              />
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
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
              disabled={isLoading}
            >
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </button>
            
            <button
              type="button"
              className="btn w-100 mb-3"
              style={{
                background: "transparent",
                color: "#878787",
                border: "1.5px solid #ececec",
                borderRadius: "30px",
                fontWeight: 400,
                fontSize: "14px",
                padding: "10px 0",
              }}
              onClick={resendEmail}
              disabled={isLoading}
            >
              인증 이메일 다시 받기
            </button>
            
            <hr style={{ borderTop: "1px solid #eee", margin: "22px 0 8px 0" }} />
            
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link text-primary text-decoration-none p-0"
                style={{ fontSize: "13.5px" }}
                onClick={goToLogin}
                disabled={isLoading}
              >
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}