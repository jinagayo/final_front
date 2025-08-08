import React, { useState, useEffect } from 'react';
import { User, BookOpen } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';

export default function Join() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [openPostcode, setOpenPostcode] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  
  // 비밀번호 강도 체크 관련 상태 추가
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'danger',
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false
    }
  });
  
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    pw: '',
    confirmPassword: '',
    phone: '',
    birthday: '',
    address1: '',
    address2: '',
    addressnum: ''
  });

  // ⭐ 제출 중 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role === 'student' || role === 'teacher') {
      setSelectedRole(role === 'teacher' ? 'instructor' : 'student');
    } else {
      setSelectedRole('');
    }
  }, [role]);

  // 비밀번호 강도 체크 함수
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        feedback: '',
        color: 'danger',
        checks: {
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false
        }
      });
      return;
    }

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    let feedback = '';
    let color = 'danger';

    switch (score) {
      case 0:
      case 1:
        feedback = '매우 약함';
        color = 'danger';
        break;
      case 2:
        feedback = '약함';
        color = 'warning';
        break;
      case 3:
        feedback = '보통';
        color = 'info';
        break;
      case 4:
        feedback = '강함';
        color = 'success';
        break;
      case 5:
        feedback = '매우 강함';
        color = 'success';
        break;
      default:
        feedback = '';
    }

    setPasswordStrength({
      score,
      feedback,
      color,
      checks
    });
  };

  const handleRoleSelect = (selectedRole) => {
    const urlRole = selectedRole === 'instructor' ? 'teacher' : 'student';
    navigate(`/join/signup/${urlRole}`);
    setSelectedRole(selectedRole);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // 비밀번호 필드인 경우 강도 체크
    if (name === 'pw') {
      checkPasswordStrength(value);
    }
  };

  // ⭐ 버튼 활성화 조건 체크
  const isFormValid = () => {
    const requiredFields = ['user_id', 'name', 'email', 'phone', 'birthday', 'address1', 'addressnum', 'pw', 'confirmPassword'];
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim()
    );
    
    const passwordsMatch = formData.pw === formData.confirmPassword;
    const passwordStrong = passwordStrength.score >= 3;
    
    return allFieldsFilled && passwordsMatch && passwordStrong && !isSubmitting;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ⭐ 이미 제출 중이면 리턴
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // 비밀번호 강도 체크
      if (passwordStrength.score < 3) {
        alert('비밀번호 강도가 너무 약합니다. 더 안전한 비밀번호를 사용해주세요.');
        return;
      }

      // 비밀번호 일치 확인
      if (formData.pw !== formData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      if (formData.pw.length < 8) {
        alert('비밀번호는 8자리 이상이어야 합니다.');
        return;
      }

      const requiredFields = ['user_id', 'name', 'email', 'phone', 'birthday', 'address1', 'addressnum'];
      for (let field of requiredFields) {
        if (!formData[field] || !formData[field].toString().trim()) {
          alert(`${getFieldName(field)}은(는) 필수 입력 항목입니다.`);
          return;
        }
      }

      const endpoint = selectedRole === 'student' 
        ? 'http://localhost:8080/join/signup/student'
        : 'http://localhost:8080/join/signup/teacher';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.status === 403) {
        alert('접근 권한이 없습니다. 서버 설정을 확인해주세요.');
        return;
      }

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        alert('서버에서 예상하지 못한 응답을 받았습니다.');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        alert(`${selectedRole === 'student' ? '수강생' : '강사'}으로 회원가입이 완료되었습니다!`);
        navigate('/');
      } else {
        if (data.message) {
          alert(data.message);
        } else {
          alert('회원가입에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('상세 오류:', error);
      alert(`오류 발생: ${error.message}`);
    } finally {
      // ⭐ 제출 완료 후 상태 리셋
      setIsSubmitting(false);
    }
  };

  const getFieldName = (field) => {
    const fieldNames = {
      'user_id': '아이디',
      'name': '이름',
      'email': '이메일',
      'phone': '전화번호',
      'birthday': '생년월일',
      'addressnum': '우편번호',
      'address1': '기본주소',
      'address2': '상세주소'
    };
    return fieldNames[field] || field;
  };

  const handleAddressSearch = () => {
    setOpenPostcode(true);
  };

  const handleAddressComplete = (data) => {
    console.log('선택된 주소:', data);
    
    setFormData(prev => ({
      ...prev,
      addressnum: data.zonecode,
      address1: data.address
    }));
    
    setOpenPostcode(false);
  };

  return (
    <div className="vh-100 vw-100 position-fixed top-0 start-0 d-flex align-items-center justify-content-center" style={{ background: '#2D55C7', zIndex: 1000 }}>
      <div className="card shadow-lg border-0" style={{ width:"1000px", height:"800px", overflowY: "auto" }}>
        <div className="card-body p-4 d-flex flex-column justify-content-center">
          <div className="text-center mb-5">
            {!selectedRole && (
              <div className="text-center mb-4">
                <h2>회원가입</h2>
                <p>가입하실 유형을 선택해주세요</p>
              </div>
            )}
          </div>

          {!selectedRole ? (
            // 역할 선택 화면
            <div className="row g-4 justify-content-center">
              <div className="col-md-5">
                <div 
                  className="card h-100 border-0 shadow-sm role-card"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8f9fa',
                    minHeight: '350px'
                  }}
                  onClick={() => handleRoleSelect('student')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body text-center py-5 d-flex flex-column justify-content-center">
                    <div className="mb-5">
                      <div 
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: '150px',
                          height: '150px',
                          backgroundImage: 'url("/img/student.png")',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                      </div>
                    </div>
                    <h2 className="fw-bold mb-4" style={{ fontSize: '1.8rem' }}>수강생 회원가입</h2>
                    <p className="text-muted fs-6">강의를 수강하고 학습하세요</p>
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div 
                  className="card h-100 border-0 shadow-sm role-card"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8f9fa',
                    minHeight: '350px'
                  }}
                  onClick={() => handleRoleSelect('instructor')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body text-center py-5 d-flex flex-column justify-content-center">
                    <div className="mb-5">
                      <div 
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: '150px',
                          height: '150px',
                          backgroundImage: 'url("/img/teacher.png")',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                      </div>
                    </div>
                    <h2 className="fw-bold mb-4" style={{ fontSize: '1.8rem' }}>강사 회원가입</h2>
                    <p className="text-muted fs-6">강의를 제작하고 판매하세요</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 회원정보 입력 화면
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-3">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundImage: selectedRole === 'student' 
                      ? 'url("/img/student.png")' : 'url("/img/teacher.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                </div>
                <h4 className="fw-bold mb-1">
                  {selectedRole === 'student' ? '수강생' : '강사'} 회원가입
                </h4>
                <button 
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0"
                  onClick={() => {
                    setSelectedRole('');
                    navigate('/join');
                  }}
                >
                  다시 선택하기
                </button>
              </div>

              {/* 기본 정보 */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="user_id" className="form-label fw-semibold small">아이디</label>
                    <input
                      type="text"
                      className="form-control shadow-none"
                      id="user_id"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      required
                      placeholder="아이디를 입력하세요 (4-20자)"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="name" className="form-label fw-semibold small">이름</label>
                    <input
                      type="text"
                      className="form-control shadow-none"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="email" className="form-label fw-semibold small">이메일</label>
                    <input
                      type="email"
                      className="form-control shadow-none"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="phone" className="form-label fw-semibold small">전화번호</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="birthday" className="form-label fw-semibold small">생년월일</label>
                    <input
                      type="date"
                      className="form-control"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="addressnum" className="form-label fw-semibold small">우편번호</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="addressnum"
                        name="addressnum"
                        value={formData.addressnum}
                        readOnly
                        placeholder="우편번호"
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={handleAddressSearch}
                      >
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="mb-2">
                    <label htmlFor="address1" className="form-label fw-semibold small">기본주소</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address1"
                      name="address1"
                      value={formData.address1}
                      readOnly
                      placeholder="주소 검색 버튼을 클릭하세요"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="mb-2">
                    <label htmlFor="address2" className="form-label fw-semibold small">상세주소</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address2"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      placeholder="상세주소를 입력하세요 (예: 아파트동호수, 건물명 등)"
                    />
                  </div>
                </div>
              </div>

              {/* 비밀번호 섹션 - 강도 체크 추가 */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label htmlFor="pw" className="form-label fw-semibold small">비밀번호</label>
                    <input
                      type="password"
                      className="form-control"
                      id="pw"
                      name="pw"
                      value={formData.pw}
                      onChange={handleInputChange}
                      required
                      placeholder="8자리 이상 입력하세요"
                      minLength="8"
                    />
                    
                    {/* 비밀번호 강도 표시 */}
                    {formData.pw && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">비밀번호 강도:</small>
                          <small className={`text-${passwordStrength.color} fw-bold`}>
                            {passwordStrength.feedback}
                          </small>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar bg-${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold small">비밀번호 확인</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                    
                    {/* 비밀번호 일치 확인 */}
                    {formData.confirmPassword && (
                      <div className="mt-1">
                        {formData.pw === formData.confirmPassword ? (
                          <small className="text-success">
                            <i className="fas fa-check me-1"></i>
                            비밀번호가 일치합니다
                          </small>
                        ) : (
                          <small className="text-danger">
                            <i className="fas fa-times me-1"></i>
                            비밀번호가 일치하지 않습니다
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-md-8">
                  <button 
                    type="button"
                    className="btn btn-lg fw-semibold text-white w-100"
                    style={{
                      background: selectedRole === 'student' 
                        ? 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)'
                        : 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 1
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('버튼 클릭됨!'); // 디버깅용
                      handleSubmit(e);
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        처리 중...
                      </>
                    ) : (
                      '회원가입 완료'
                    )}
                  </button>
                </div>
                <div className="col-md-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSelectedRole('');
                      navigate('/join');
                    }}
                    disabled={isSubmitting}
                  >
                    이전으로
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 카카오 주소 API 모달 */}
          {openPostcode && (
            <div 
              className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                zIndex: 9999 
              }}
              onClick={() => setOpenPostcode(false)}
            >
              <div 
                className="bg-white rounded shadow-lg"
                style={{ width: '500px', height: '600px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h5 className="mb-0">주소 검색</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setOpenPostcode(false)}
                  ></button>
                </div>
                <div style={{ height: '550px' }}>
                  <DaumPostcode
                    onComplete={handleAddressComplete}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-muted fs-6 mb-0">
              이미 계정이 있으신가요? 
              <a href="/auth/login" className="text-primary text-decoration-none ms-1 fs-6">로그인</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}