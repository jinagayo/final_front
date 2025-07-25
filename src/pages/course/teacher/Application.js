import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CourseCreationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    detail: '',
    price: '',
    intro: '',
    subId: '',
    img: null
  });

  const [imagePreview, setImagePreview] = useState(null);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
    axios.get('http://localhost:3000/course/teacher/Application') 
        .then(response => {
        setCategories(response.data);
        })
        .catch(error => {
        console.error('카테고리 로딩 실패:', error);
        alert('카테고리를 불러오는 데 실패했습니다.');
        });
    }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        img: file


      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

    const handleSubmit = () => {
    if (!formData.name || !formData.intro || !formData.subId || 
        !formData.price || !formData.detail) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }

    const sendData = new FormData();
    sendData.append('name', formData.name);
    sendData.append('intro', formData.intro);
    sendData.append('detail', formData.detail);
    sendData.append('price', formData.price);
    sendData.append('subId', formData.subId); // 여기도 수정됨

    //////////////////////////////////////////////////////이미지 보내는 거 : 서치용 키워드: 떡볶이//////////////////////////////////////
    // if (formData.img) {
    //     sendData.append('img', formData.img);
    // }

    axios.post('http://localhost:3000/course/teacher/formsubmit', sendData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    })
    .then(response => {
      // eslint-disable-next-line no-restricted-globals
        if (!confirm('개설 신청 완료시 수정할 수 없습니다. 계속 하시겠습니까?')) {
            return;
        }
        alert('강의 개설 신청이 완료되었습니다. 관리자 검토 후 승인됩니다.');
        navigate('/course/teacher/List')
        console.log(response.data);
    })
    .catch(error => {
        console.error('강의 개설 신청 실패:', error);
        alert('신청 중 오류가 발생했습니다.');
    });
    };
  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">강의 개설 신청</h1>
      </div>

      <div className="row">
        <div className="col-lg-12">
          {/* 기본 정보 카드 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">기본 정보</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">강의명 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="예: Python 기초부터 심화까지"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">과목구분 *</label>
                  <select
                    className="form-control"
                    name="subId"
                    value={formData.subId}
                    onChange={handleInputChange}
                  >
                    <option value="">과목을 선택해주세요</option>
                    {categories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">한줄소개 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="intro"
                    value={formData.intro}
                    onChange={handleInputChange}
                    placeholder="예: 프로그래밍 초보자도 쉽게 따라할 수 있는 Python 완전정복 강의"
                    maxLength="100"
                  />
                  <small className="form-text text-muted">{formData.intro.length}/100자</small>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">강의 가격 *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                  <small className="form-text text-muted">원 단위로 입력해주세요</small>
                </div>
              </div>
            </div>
          </div>

          {/* 강의 내용 카드 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">강의 내용</h6>
            </div>
            <div className="card-body">
              
              <div className="mb-3">
                <textarea
                  className="form-control"
                  name="detail"
                  value={formData.detail}
                  onChange={handleInputChange}
                  rows="8"
                  placeholder="강의 소개 및 커리큘럼을 작성해주세요. &#10;&#10;예시:&#10;1주차: Python 기초 문법&#10;- 변수와 데이터 타입&#10;- 조건문과 반복문&#10;&#10;2주차: 함수와 모듈&#10;- 함수 정의와 호출&#10;- 모듈 import와 활용"
                />
              </div>
            </div>
          </div>

          {/* 대표이미지 카드 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">대표이미지</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">강의 대표이미지 업로드</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleImageChange}
                  accept="image/png,image/jpeg,image/jpg"
                />
                <small className="form-text text-muted">PNG, JPG, JPEG 파일 (최대 5MB)</small>
              </div>
              
              {imagePreview && (
                <div className="mt-3">
                  <p className="font-weight-bold">미리보기:</p>
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    style={{ maxWidth: '300px', maxHeight: '200px' }}
                    className="img-thumbnail"
                  />
                  <br />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                  >
                    이미지 제거
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="card shadow mb-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                신청하기
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}