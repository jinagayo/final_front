import React, { useState, useRef, useEffect } from 'react';

// 비밀번호 확인 컴포넌트
function PasswordVerification({ onVerified, onCancel, title, description, verifyType = 'edit' }) {
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
        onVerified(password); // 비밀번호를 전달
      } else {
        const errorData = await response.json();
        setError(errorData.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('비밀번호 확인 오류:', error);
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (verifyType === 'delete') {
      return 'fas fa-exclamation-triangle fa-3x text-danger';
    }
    if (verifyType === 'password') {
      return 'fas fa-key fa-3x text-warning';
    }
    return 'fas fa-lock fa-3x text-primary';
  };

  const getButtonColor = () => {
    if (verifyType === 'delete') {
      return 'btn-danger';
    }
    if (verifyType === 'password') {
      return 'btn-warning';
    }
    return 'btn-primary';
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-xl-6 col-lg-8 col-md-10">
          <div className="card shadow-lg my-5">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className={getIcon()}></i>
                </div>
                <h2 className="h4 text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600">{description}</p>
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
                      className={`btn ${getButtonColor()} btn-block`}
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

        .btn-danger {
          background-color: #e74a3b;
          border-color: #e74a3b;
        }
        
        .btn-danger:hover {
          background-color: #c9302c;
          border-color: #ac2925;
        }

        .btn-warning {
          background-color: #f6c23e;
          border-color: #f6c23e;
          color: #fff;
        }
        
        .btn-warning:hover {
          background-color: #dda20a;
          border-color: #d39e00;
          color: #fff;
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

// 비밀번호 변경 컴포넌트 
function PasswordChange({ onComplete, onCancel, currentPassword }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: 'text-muted' });

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = 'text-muted';

    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: 'text-muted' });
      return;
    }

    // 길이 체크
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // 복잡성 체크
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // 점수에 따른 메시지
    if (score < 3) {
      message = '약함';
      color = 'text-danger';
    } else if (score < 5) {
      message = '보통';
      color = 'text-warning';
    } else {
      message = '강함';
      color = 'text-success';
    }

    setPasswordStrength({ score, message, color });
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 비밀번호 강도 체크 (새 비밀번호인 경우)
    if (field === 'newPassword') {
      checkPasswordStrength(value);
    }

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 새 비밀번호 검사
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = '비밀번호는 영문자와 숫자를 포함해야 합니다.';
    }

    // 현재 비밀번호와 동일한지 체크
    if (formData.newPassword === currentPassword) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 다르게 설정해주세요.';
    }

    // 비밀번호 확인 검사
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 비밀번호 변경 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/Mypage/passwordChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: formData.newPassword
      });

      if (response.ok) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        onComplete();
      } else if (response.status === 401) {
        const errorData = await response.json();
        alert(errorData.message || '현재 비밀번호가 일치하지 않습니다.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      alert(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
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
                  <i className="fas fa-key fa-3x text-warning"></i>
                </div>
                <h2 className="h4 text-gray-900 mb-2">비밀번호 변경</h2>
                <p className="text-gray-600">새로운 비밀번호를 설정해주세요.</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* 새 비밀번호 */}
                <div className="form-group mb-4">
                  <label htmlFor="newPassword" className="form-label font-weight-bold">
                    새 비밀번호 <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* 비밀번호 강도 표시 */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">비밀번호 강도:</small>
                        <small className={passwordStrength.color}>
                          <strong>{passwordStrength.message}</strong>
                        </small>
                      </div>
                      <div className="progress" style={{ height: '4px' }}>
                        <div
                          className={`progress-bar ${
                            passwordStrength.score < 3 
                              ? 'bg-danger' 
                              : passwordStrength.score < 5 
                                ? 'bg-warning' 
                                : 'bg-success'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {errors.newPassword && (
                    <div className="invalid-feedback d-block">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.newPassword}
                    </div>
                  )}

                  {/* 비밀번호 요구사항 */}
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-info-circle mr-1"></i>
                      비밀번호는 8자 이상, 영문자와 숫자를 포함해야 합니다.
                    </small>
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="form-group mb-4">
                  <label htmlFor="confirmPassword" className="form-label font-weight-bold">
                    비밀번호 확인 <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      disabled={loading}
                    />
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* 비밀번호 일치 표시 */}
                  {formData.confirmPassword && (
                    <div className="mt-1">
                      {formData.newPassword === formData.confirmPassword ? (
                        <small className="text-success">
                          <i className="fas fa-check mr-1"></i>
                          비밀번호가 일치합니다.
                        </small>
                      ) : (
                        <small className="text-danger">
                          <i className="fas fa-times mr-1"></i>
                          비밀번호가 일치하지 않습니다.
                        </small>
                      )}
                    </div>
                  )}
                  
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* 보안 알림 */}
                <div className="alert alert-warning mb-4">
                  <i className="fas fa-shield-alt mr-2"></i>
                  <strong>보안 안내:</strong>
                  <ul className="mb-0 mt-2 pl-3">
                    <li>다른 사이트에서 사용하는 비밀번호와 다르게 설정하세요.</li>
                    <li>개인정보(이름, 생년월일 등)를 포함하지 마세요.</li>
                    <li>특수문자를 포함하면 더욱 안전합니다.</li>
                  </ul>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-2">
                    <button
                      type="submit"
                      className="btn btn-warning btn-block"
                      disabled={loading || !formData.newPassword || !formData.confirmPassword}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          변경 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key mr-2"></i>
                          비밀번호 변경
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
        
        .btn-warning {
          background-color: #f6c23e;
          border-color: #f6c23e;
          color: #fff;
        }
        
        .btn-warning:hover {
          background-color: #dda20a;
          border-color: #d39e00;
          color: #fff;
        }
        
        .btn-warning:disabled {
          background-color: #6c757d;
          border-color: #6c757d;
        }

        .btn-outline-secondary {
          border-color: #d1d3e2;
          color: #858796;
        }

        .btn-outline-secondary:hover {
          background-color: #858796;
          border-color: #858796;
          color: white;
        }
        
        .invalid-feedback {
          color: #e74a3b !important;
        }
        
        .is-invalid {
          border-color: #e74a3b !important;
        }

        .text-danger {
          color: #e74a3b !important;
        }

        .text-success {
          color: #28a745 !important;
        }

        .text-warning {
          color: #ffc107 !important;
        }

        .alert-warning {
          color: #856404;
          background-color: #fff3cd;
          border-color: #ffeaa7;
          border: 1px solid #ffeaa7;
          border-radius: 0.35rem;
          padding: 0.75rem 1.25rem;
        }

        .progress {
          background-color: #e9ecef;
          border-radius: 0.25rem;
        }

        .progress-bar {
          transition: width 0.3s ease;
        }

        .bg-danger {
          background-color: #e74a3b !important;
        }

        .bg-warning {
          background-color: #f6c23e !important;
        }

        .bg-success {
          background-color: #28a745 !important;
        }

        .input-group-append .btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        ul {
          list-style-type: disc;
          padding-left: 1rem;
        }

        li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}

// 메인 프로필 수정 컴포넌트
export default function ProfileEdit({ userDetails, onComplete, onCancel, onAccountDeleted }) {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'passwordVerify', 'deleteVerify', 'passwordChangeVerify', 'passwordChange'
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(''); // 'edit', 'delete', 'passwordChange'
  const [formData, setFormData] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || '',
    birthday:
    (() => {
      const b = userDetails?.birthday;
      if (!b) return '';
      if (typeof b === 'string') {
        if (b.includes('T')) return b.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(b)) return b;
        return b;
      }
      if (typeof b === 'number') {
        return new Date(b).toISOString().split('T')[0];
      }
      if (b instanceof Date) {
        return b.toISOString().split('T')[0];
      }
      return '';
    })(),
    addressnum: userDetails?.addressnum || '',
    address1: userDetails?.address1 || '',
    address2: userDetails?.address2 || '',
    img: userDetails?.img || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(userDetails?.img );
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // 카카오 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 입력값 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 파일을 Base64로 변환하는 함수
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // 파일 선택 핸들러
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          img: '파일 크기는 5MB 이하여야 합니다.'
        }));
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          img: '이미지 파일만 업로드 가능합니다.'
        }));
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        setPreview(base64);
        setImageFile(file);
        
        // 에러 메시지 제거
        setErrors(prev => ({
          ...prev,
          img: ''
        }));
      } catch (error) {
        console.error('파일 변환 오류:', error);
        setErrors(prev => ({
          ...prev,
          img: '파일 처리 중 오류가 발생했습니다.'
        }));
      }
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }

    if (formData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      newErrors.birthday = '올바른 날짜 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 카카오 주소 검색
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        
        let addr = ''; 
        let extraAddr = ''; 

        if (data.userSelectedType === 'R') { 
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        if (data.userSelectedType === 'R') {
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          if (extraAddr !== '') {
            extraAddr = ' (' + extraAddr + ')';
          }
        }
        setFormData(prev => ({
          ...prev,
          addressnum: data.zonecode,
          address1: addr + extraAddr
        }));

        setTimeout(() => {
          const detailAddressInput = document.querySelector('input[placeholder="상세 주소를 입력하세요"]');
          if (detailAddressInput) {
            detailAddressInput.focus();
          }
        }, 100);
      },
      width: '100%',
      height: '100%'
    }).open();
  };

  const uploadImageToServer = async(file, folderName='user/profile') => {
    const formData = new FormData();
    formData.append('file',file);
    formData.append('folderName',folderName);

    const response = await fetch('http://localhost:8080/api/Mypage/ProfileImageUpload',{
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if(response.ok){
      const {key} = await response.json();  //백엔드에서 return key;
      return key;
    }else{
      throw new Error('이미지 업로드 실패');
    }
  }

  // 비밀번호 확인 후 액션 처리
  const handlePasswordVerified = (password) => {
    setVerifiedPassword(password);
    
    if (pendingAction === 'edit') {
      // 프로필 수정
      handleProfileUpdate(password);
    } else if (pendingAction === 'delete') {
      // 회원 탈퇴
      handleAccountDelete(password);
    } else if (pendingAction === 'passwordChange') {
      // 비밀번호 변경 페이지로 이동
      setCurrentView('passwordChange');
    }
  };

  // 프로필 수정 처리
  const handleProfileUpdate = async (password) => {
    if (!validateForm()) {
      setCurrentView('main');
      return;
    }

    setLoading(true);

    try {
      let imgValue = formData.img;

      // 새 파일을 올린 경우에만 업로드
      if(imageFile && imageFile instanceof File){
        imgValue = await uploadImageToServer(imageFile, 'user/profile');
      }

      // JSON 데이터 생성 (비밀번호 포함)
      const submitData = {
        ...formData,
        img: imgValue,
        password: password // 확인된 비밀번호 포함
      };

      const response = await fetch('http://localhost:8080/api/Mypage/ProfileUpdate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        alert('프로필이 성공적으로 수정되었습니다.');
        onComplete(updatedData);
      } else if (response.status === 401) {
        const errorData = await response.json();
        alert(errorData.message || '비밀번호가 일치하지 않습니다.');
        setCurrentView('passwordVerify');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로필 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      alert(error.message || '프로필 수정 중 오류가 발생했습니다.');
      setCurrentView('main');
    } finally {
      setLoading(false);
    }
  };

  // 회원 탈퇴 처리
  const handleAccountDelete = async (password) => {
    const confirmDelete = window.confirm(
      '정말로 회원 탈퇴를 하시겠습니까?\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.'
    );

    if (!confirmDelete) {
      setCurrentView('main');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/join/userDelete/${userDetails?.id || 'current'}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        alert('회원 탈퇴가 완료되었습니다.');
        if (onAccountDeleted) {
          onAccountDeleted();
        }
      } else if (response.status === 401) {
        const errorData = await response.json();
        alert(errorData.message || '비밀번호가 일치하지 않습니다.');
        setCurrentView('deleteVerify');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert(error.message || '회원 탈퇴 중 오류가 발생했습니다.');
      setCurrentView('main');
    } finally {
      setLoading(false);
    }
  };

  // 폼 제출 (프로필 수정 - 비밀번호 확인으로 이동)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPendingAction('edit');
    setCurrentView('passwordVerify');
  };

  // 회원 탈퇴 버튼 클릭
  const handleDeleteAccount = () => {
    setPendingAction('delete');
    setCurrentView('deleteVerify');
  };

  // 비밀번호 변경 버튼 클릭
  const handleChangePassword = () => {
    setPendingAction('passwordChange');
    setCurrentView('passwordChangeVerify');
  };

  const S3_BASE_URL = "https://my-lecture-video.s3.ap-northeast-2.amazonaws.com/";

  const getImageUrl = (img) => {
    if (!img) return "/img/undraw_profile.svg";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return S3_BASE_URL + img;
  };

  // 프로필 수정을 위한 비밀번호 확인 화면
  if (currentView === 'passwordVerify') {
    return (
      <PasswordVerification
        title="비밀번호 확인"
        description="프로필 수정을 위해 현재 비밀번호를 입력해주세요."
        verifyType="edit"
        onVerified={handlePasswordVerified}
        onCancel={() => setCurrentView('main')}
      />
    );
  }

  // 회원 탈퇴를 위한 비밀번호 확인 화면
  if (currentView === 'deleteVerify') {
    return (
      <PasswordVerification
        title="회원 탈퇴 확인"
        description="회원 탈퇴를 위해 현재 비밀번호를 입력해주세요."
        verifyType="delete"
        onVerified={handlePasswordVerified}
        onCancel={() => setCurrentView('main')}
      />
    );
  }

  // 비밀번호 변경을 위한 비밀번호 확인 화면
  if (currentView === 'passwordChangeVerify') {
    return (
      <PasswordVerification
        title="비밀번호 변경 확인"
        description="비밀번호 변경을 위해 현재 비밀번호를 입력해주세요."
        verifyType="password"
        onVerified={handlePasswordVerified}
        onCancel={() => setCurrentView('main')}
      />
    );
  }

  // 비밀번호 변경 화면
  if (currentView === 'passwordChange') {
    return (
      <PasswordChange
        currentPassword={verifiedPassword}
        onComplete={() => setCurrentView('main')}
        onCancel={() => setCurrentView('main')}
      />
    );
  }

  // 메인 프로필 수정 화면
  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h2 className="h3 mb-0 text-gray-800 font-weight-bold">프로필 수정</h2>
        <div>
          <button
            className="btn btn-secondary mr-2"
            onClick={onCancel}
            disabled={loading}
          >
            <i className="fas fa-times fa-sm mr-2"></i>
            취소
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* 프로필 이미지 */}
          <div className="col-xl-4 col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">프로필 이미지</h6>
              </div>
              <div className="card-body text-center">
                <div className="profile-image-container mb-3">
                  <img 
                    src={getImageUrl(preview)}
                    alt="Profile Preview" 
                    className="rounded-circle shadow"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      border: '4px solid #f8f9fc'
                    }}
                  />
                  <div className="image-overlay">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary rounded-circle"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        width: '35px',
                        height: '35px',
                        padding: '0'
                      }}
                    >
                      <i className="fas fa-camera"></i>
                    </button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <p className="text-gray-600 small mb-0">
                  클릭하여 이미지 변경
                </p>
                {errors.img && (
                  <div className="text-danger small mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.img}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="col-xl-8 col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">기본 정보</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label font-weight-bold">
                      이름 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">
                        {errors.name}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label font-weight-bold">
                      이메일 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일을 입력하세요"
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label font-weight-bold">
                      전화번호 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="전화번호를 입력하세요"
                      disabled={loading}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">
                        {errors.phone}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label font-weight-bold">생년월일</label>
                    <input
                      type="date"
                      className={`form-control ${errors.birthday ? 'is-invalid' : ''}`}
                      value={formData.birthday}
                      onChange={(e) => handleInputChange('birthday', e.target.value)}
                      disabled={loading}
                    />
                    {errors.birthday && (
                      <div className="invalid-feedback">
                        {errors.birthday}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주소 정보 */}
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">주소 정보</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label font-weight-bold">우편번호</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.addressnum}
                    placeholder="우편번호"
                    disabled={loading}
                    readOnly
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleAddressSearch}
                      disabled={loading}
                      title="주소 검색"
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-8 mb-3">
                <label className="form-label font-weight-bold">기본 주소</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address1}
                  placeholder="우편번호 검색 후 자동 입력됩니다"
                  disabled={loading}
                  readOnly
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label font-weight-bold">상세 주소</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                  placeholder="상세 주소를 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              {/* 좌측 버튼들 */}
              <div>
                <button
                  type="button"
                  className="btn btn-outline-danger mr-2"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  <i className="fas fa-user-times mr-2"></i>
                  회원 탈퇴
                </button>
                <button
                  type="button"
                  className="btn btn-outline-warning"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  <i className="fas fa-key mr-2"></i>
                  비밀번호 변경
                </button>
              </div>
              
              {/* 우측 저장 버튼 */}
              <div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      프로필 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .profile-image-container {
          position: relative;
          display: inline-block;
        }
        
        .image-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
        }
        
        .card {
          border: none;
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
        }
        
        .card-header {
          background-color: #f8f9fc;
          border-bottom: 1px solid #e3e6f0;
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

        .btn-danger {
          background-color: #e74a3b;
          border-color: #e74a3b;
        }
        
        .btn-danger:hover {
          background-color: #c9302c;
          border-color: #ac2925;
        }

        .btn-outline-danger {
          color: #e74a3b;
          border-color: #e74a3b;
        }

        .btn-outline-danger:hover {
          background-color: #e74a3b;
          border-color: #e74a3b;
          color: white;
        }

        .btn-outline-warning {
          color: #f6c23e;
          border-color: #f6c23e;
        }

        .btn-outline-warning:hover {
          background-color: #f6c23e;
          border-color: #f6c23e;
          color: white;
        }
        
        .is-invalid {
          border-color: #e74a3b !important;
        }
        
        .invalid-feedback {
          color: #e74a3b !important;
          display: block;
        }
        
        .text-danger {
          color: #e74a3b !important;
        }

        .btn-outline-secondary {
          border-color: #d1d3e2;
          color: #858796;
        }

        .btn-outline-secondary:hover {
          background-color: #858796;
          border-color: #858796;
          color: white;
        }

        .input-group-append .btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        .alert {
          border: 1px solid transparent;
          border-radius: 0.35rem;
          padding: 0.75rem 1.25rem;
          margin-bottom: 1rem;
        }

        .alert-info {
          color: #0c5460;
          background-color: #d1ecf1;
          border-color: #bee5eb;
        }
      `}</style>
    </div>
  );
}