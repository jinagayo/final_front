import React, { useState, useEffect } from 'react';
import { User, BookOpen } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Join() {
  const { role } = useParams();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('');
  
  // ✅ DTO 필드명과 정확히 일치하도록 수정
  const [formData, setFormData] = useState({
    user_id: '',        // DTO: getUser_id()
    name: '',           // DTO: getName()
    email: '',          // DTO: getEmail()
    pw: '',            // DTO: getPw()
    confirmPassword: '', // DTO: getConfirmPassword()
    phone: '',          // DTO: getPhone()
    birthday: '',       // DTO: getBirthday()
    address1: '',       // DTO: getAddress1()
    address2: '',       // DTO: getAddress2()
    addressnum: ''       // DTO: getAdressnum() (DB 컬럼명과 일치)
  });

  useEffect(() => {
    if (role === 'student' || role === 'teacher') {
      setSelectedRole(role === 'teacher' ? 'instructor' : 'student');
    } else {
      setSelectedRole('');
    }
  }, [role]);

  const handleRoleSelect = (selectedRole) => {
    const urlRole = selectedRole === 'instructor' ? 'teacher' : 'student';
    navigate(`/join/signup/${urlRole}`);
    setSelectedRole(selectedRole);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ 올바른 필드명으로 검증
    if (formData.pw !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.pw.length < 8) {
      alert('비밀번호는 8자리 이상이어야 합니다.');
      return;
    }

    // ✅ 올바른 필드명으로 필수 검사
    const requiredFields = ['user_id', 'name', 'email', 'phone', 'birthday', 'addressnum', 'address1'];
    for (let field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        alert(`${getFieldName(field)}은(는) 필수 입력 항목입니다.`);
        return;
      }
    }

    try {
      const endpoint = selectedRole === 'student' 
        ? 'http://localhost:8080/join/signup/student'
        : 'http://localhost:8080/join/signup/teacher';

      console.log('=== 전송할 데이터 확인 ===');
      console.log('user_id:', formData.user_id);
      console.log('pw:', formData.pw ? '***있음***' : 'NULL');
      console.log('전체 데이터:', formData);
      console.log('전송 URL:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      console.log('응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        alert(`${selectedRole === 'student' ? '수강생' : '강사'}으로 회원가입이 완료되었습니다!`);
        console.log('회원가입 성공:', data);
        navigate('/');
      } else {
        const errorData = await response.json();
        console.error('회원가입 실패:', errorData);
        
        if (errorData.message) {
          alert(errorData.message);
        } else {
          alert('회원가입에 실패했습니다.');
        }
        
        if (errorData.errors) {
          console.log('유효성 검사 에러:', errorData.errors);
        }
      }
    } catch (error) {
      console.error('네트워크 에러:', error);
      alert('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
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
      'address1': '기본주소'
    };
    return fieldNames[field] || field;
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
            <div>
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
                  className="btn btn-link btn-sm text-decoration-none p-0"
                  onClick={() => {
                    setSelectedRole('');
                    navigate('/join');
                  }}
                >
                  다시 선택하기
                </button>
              </div>

              {/* ✅ 기본 정보 - 필드명 수정 */}
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
                        onChange={handleInputChange}
                        required
                        placeholder="우편번호"
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => alert('우편번호 검색 기능')}
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
                      onChange={handleInputChange}
                      required
                      placeholder="기본주소를 입력하세요"
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
                      placeholder="상세주소를 입력하세요"
                    />
                  </div>
                </div>
              </div>

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
                      border: 'none'
                    }}
                    onClick={handleSubmit}
                  >
                    회원가입 완료
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
                  >
                    이전으로
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-muted fs-6 mb-0">
              이미 계정이 있으신가요? 
              <a href="/login" className="text-primary text-decoration-none ms-1 fs-6">로그인</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}