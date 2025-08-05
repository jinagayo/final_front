import React, { useState, useRef, useEffect } from 'react';

export default function ProfileEdit({ userDetails, onComplete, onCancel }) {
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
  console.log("imageFile:", imageFile);

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let imgValue = formData.img;

      // 새 파일을 올린 경우에만 업로드
      if(imageFile && imageFile instanceof File){
        imgValue = await uploadImageToServer(imageFile, 'user/profile');
      }

      // JSON 데이터 생성
      const submitData = {
        ...formData,
         img: imgValue  // 이미지 파일 정보 (Base64 포함)
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

  const S3_BASE_URL = "https://my-lecture-video.s3.ap-northeast-2.amazonaws.com/";

const getImageUrl = (img) => {
  if (!img) return "/img/undraw_profile.svg";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return S3_BASE_URL + img;
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
                      <img
                          src="/img/camera.png"
                          alt="Image"
                          style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)',margin:"5px"}}
                        />
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
                      
                    ><img
                          src="/img/searchIcon.png"
                          alt="Search"
                          style={{ width: '20px', height: '20px'}}
                        />
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
      `}</style>
    </div>
  );
}