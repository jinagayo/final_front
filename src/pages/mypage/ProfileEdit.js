import React, { useState, useRef } from 'react';

export default function ProfileEdit({ userDetails, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || '',
    birthday: userDetails?.birthday ? userDetails.birthday.split('T')[0] : '',
    addressnum: userDetails?.addressnum || '',
    address1: userDetails?.address1 || '',
    address2: userDetails?.address2 || '',
    img: userDetails?.img || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(
    userDetails?.img ? `/images/${userDetails.img}` : "/img/undraw_profile.svg"
  );
  const fileInputRef = useRef(null);

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

  // 파일 선택 핸들러
  const handleImageChange = (e) => {
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

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        img: file
      }));
      
      // 에러 메시지 제거
      setErrors(prev => ({
        ...prev,
        img: ''
      }));
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

  // 주소 검색 (Daum 우편번호 API 사용 예시)
  const handleAddressSearch = () => {
    // 실제 구현에서는 Daum 우편번호 API를 사용하거나
    // 다른 주소 검색 서비스를 연동해야 합니다
    alert('주소 검색 기능은 별도의 API 연동이 필요합니다.');
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // 기본 정보 추가
      Object.keys(formData).forEach(key => {
        if (key === 'img' && formData[key] instanceof File) {
          submitData.append('profileImage', formData[key]);
        } else if (key !== 'img') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:8080/api/Mypage/ProfileUpdate', {
        method: 'POST',
        credentials: 'include',
        body: submitData
      });

      if (response.ok) {
        const updatedData = await response.json();
        alert('프로필이 성공적으로 수정되었습니다.');
        onComplete(updatedData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로필 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      alert(error.message || '프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">프로필 수정</h1>
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
                    src={preview}
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
                    onChange={(e) => handleInputChange('addressnum', e.target.value)}
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
                  onChange={(e) => handleInputChange('address1', e.target.value)}
                  placeholder="기본 주소"
                  disabled={loading}
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

        {/* 저장 버튼 */}
        <div className="row">
          <div className="col-12 text-center">
            <button
              type="submit"
              className="btn btn-primary btn-lg px-5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  저장 중...
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
      `}</style>
    </div>
  );
}