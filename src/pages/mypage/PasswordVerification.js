import React, { useState } from 'react';

export default function PasswordVerification({ onVerified, onCancel }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/Mypage/passwordCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', 
        },
        credentials: 'include',
        body: password 
      });

      if (response.ok) {
        onVerified();
      } else {
        setError(  '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 오류:', error);
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-xl-6 col-lg-8 col-md-10">
          <div className="card shadow-lg my-5">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="fas fa-lock fa-3x text-primary"></i>
                </div>
                <h2 className="h4 text-gray-900 mb-2">비밀번호 확인</h2>
                <p className="text-gray-600">프로필 수정을 위해 현재 비밀번호를 입력해주세요.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <label htmlFor="password" className="form-label font-weight-bold">
                    현재 비밀번호
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fas fa-key"></i>
                      </span>
                    </div>
                    <input
                      type="password"
                      id="password"
                      className={`form-control ${error ? 'is-invalid' : ''}`}
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="invalid-feedback d-block">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {error}
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={loading || !password.trim()}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          확인 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          확인
                        </>
                      )}
                    </button>
                  </div>
                  <div className="col-md-6 mb-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={onCancel}
                      disabled={loading}
                    >
                      <i className="fas fa-times mr-2"></i>
                      취소
                    </button>
                  </div>
                </div>
              </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="fas fa-info-circle mr-1"></i>
                  보안을 위해 비밀번호 확인이 필요합니다.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
        }
        
        .input-group-text {
          background-color: #f8f9fc;
          border: 1px solid #d1d3e2;
          color: #5a5c69;
        }
        
        .form-control:focus {
          border-color: #4e73df;
          box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
        }
        
        .btn-primary {
          background-color: #4e73df;
          border-color: #4e73df;
        }
        
        .btn-primary:hover {
          background-color: #2e59d9;
          border-color: #2653d4;
        }
        
        .btn-primary:disabled {
          background-color: #6c757d;
          border-color: #6c757d;
        }
        
        .invalid-feedback {
          color: #e74a3b !important;
        }
        
        .is-invalid {
          border-color: #e74a3b !important;
        }
      `}</style>
    </div>
  );
}