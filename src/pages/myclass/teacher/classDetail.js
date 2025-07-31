import React, { useState, useEffect } from 'react';

const TClassDetail = () => {
  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');

  // URL에서 classId 추출 (실제 구현시 useParams 사용)
  const getClassIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('class_id') || '1';
  };

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path;
  };

  useEffect(() => {
    fetchClassDetail();
    fetchMaterials();
    fetchReviews();
  }, []);

  // 백엔드 데이터 가져오기
  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data); 
      } else {
        console.error('강의 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('강의 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}/materials`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      } else {
        console.error('강의 자료 가져오기 실패');
       
      }
    } catch (error) {
      console.error('강의 자료 가져오기 오류:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}/reviews`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        console.error('리뷰 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('리뷰 정보 가져오기 오류:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'MET001': // 영상
        return { icon: 'fas fa-play-circle', color: 'text-primary', label: '영상' };
      case 'MET002': // 과제
        return { icon: 'fas fa-clipboard-list', color: 'text-warning', label: '과제' };
      case 'MET003': // 시험
        return { icon: 'fas fa-file-alt', color: 'text-danger', label: '시험' };
      default:
        return { icon: 'fas fa-file', color: 'text-secondary', label: '자료' };
    }
  };

  const handleMaterialClick = (material) => {
    // 학생들이 제출한 것들이 나오는 페이지로 이동
    navigate(`/myclass/teacher/material/${material.meter_id}/submissions`);
  };

  const handleStudentListClick = () => {
    // 수강생 리스트 페이지로 이동
    const classId = getClassIdFromUrl();
    navigate(`/myclass/teacher/class/${classId}/students`);
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">강의 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* 뒤로가기 버튼 */}
      <div className="mb-3">
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/myclass/teacher/classList')}
        >
          <i className="fas fa-arrow-left mr-1"></i> 강의 목록으로 돌아가기
        </button>
      </div>

      {/* 강의 정보 헤더 */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              {classData?.img ? (
                <img
                  src={classData?.img?.startsWith('/img/') ? classData.img : `/img/${classData?.img}`}
                  className="img-fluid rounded class-main-img"
                  alt={classData?.name}
                />
              ) : (
                <div className="default-image-placeholder">
                  <div className="icon-container">
                    <div className="java-icon">☕</div>
                    <h3 className="java-text">java</h3>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-9">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="badge badge-outline-primary mb-2">{classData?.subject}</span>
                  <h2 className="h3 mb-2 text-gray-800">{classData?.name}</h2>
                  <p className="text-muted mb-3">{classData?.intro}</p>
                </div>
                <div className="class-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`${i < Math.floor(calculateAverageRating()) ? 'text-warning' : 'text-secondary'}`}>
                      &#9733;
                    </span>
                  ))}
                  <span className="ml-1 font-weight-bold">{calculateAverageRating()}</span>
                  <small className="text-muted ml-1">({reviews.length}개 리뷰)</small>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-user-tie text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>강사:</strong> {classData?.teacher}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-won-sign text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>수강료:</strong> {formatPrice(classData?.price)}원
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-calendar text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>개설일:</strong> {formatDate(classData?.createdAt)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-users text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>수강생:</strong> {classData?.studentCount}명
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="row mb-4">
        <div className="col-md-2 mb-2">
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/video/${classId}`);
            }}
          >
            <i className="fas fa-video mr-2"></i>강의 업로드
          </button>
        </div>
        <div className="col-md-2 mb-2">
          <button
            className="btn btn-warning btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/assignment?class_id=${classId}`);
            }}
          >
            <i className="fas fa-clipboard-list mr-2"></i>과제 업로드
          </button>
        </div>
        <div className="col-md-2 mb-2">
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/test?class_id=${classId}`);
            }}
          >
            <i className="fas fa-file-alt mr-2"></i>테스트 업로드
          </button>
        </div>
        <div className="col-md-2 mb-2">
          <button 
            className="btn btn-success btn-block"
            onClick={handleStudentListClick}
          >
            <i className="fas fa-users mr-2"></i>수강생 목록
          </button>
        </div>
        <div className="col-md-2 mb-2">
          <button 
            className="btn btn-info btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/board/List?classId=${classId}&boardNum=BOD002`);
            }}
          >
            <i className="fas fa-bullhorn mr-2"></i>공지사항
          </button>
        </div>
        <div className="col-md-2 mb-2">
          <button 
            className="btn btn-secondary btn-block"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/qna/${classId}`);
            }}
          >
            <i className="fas fa-question-circle mr-2"></i>Q&A
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="card shadow mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
                onClick={() => setActiveTab('materials')}
              >
                <i className="fas fa-folder-open mr-2"></i>강의 자료 ({materials.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="fas fa-star mr-2"></i>강의 평가 ({reviews.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'detail' ? 'active' : ''}`}
                onClick={() => setActiveTab('detail')}
              >
                <i className="fas fa-info-circle mr-2"></i>강의 상세
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {/* 강의 자료 탭 */}
          {activeTab === 'materials' && (
            <div className="materials-tab">
              {materials.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-folder-open fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">등록된 강의 자료가 없습니다.</p>
                </div>
              ) : (
                <div className="materials-list">
                  {materials.map((material, index) => {
                    const iconInfo = getMaterialIcon(material.type);
                    return (
                      <div 
                        key={material.meter_id || index}
                        className="material-item d-flex align-items-center p-3 mb-2 border rounded"
                        onClick={() => handleMaterialClick(material)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="material-number mr-3">
                          <span className="badge badge-light">{material.seq || index + 1}</span>
                        </div>
                        <div className="material-icon mr-3">
                          <i className={`${iconInfo.icon} fa-lg ${iconInfo.color}`}></i>
                        </div>
                        <div className="material-info flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{material.title || `강의 자료 ${material.seq || index + 1}`}</h6>
                              <small className="text-muted">
                                <span className="badge badge-outline-secondary mr-2">
                                  {iconInfo.label}
                                </span>
                                {material.detail && (
                                  <span className="text-muted">{material.detail}</span>
                                )}
                              </small>
                            </div>
                            <div className="material-actions">
                              <span className="badge badge-info mr-2">제출현황 보기</span>
                              <i className="fas fa-chevron-right text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 강의 평가 탭 */}
          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              {reviews.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-star fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
                </div>
              ) : (
                <div className="reviews-list">
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5 className="mb-3">평가 요약</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <span className="text-warning">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < Math.floor(calculateAverageRating()) ? 'text-warning' : 'text-secondary'}>
                                &#9733;
                              </span>
                            ))}
                          </span>
                          <span className="ml-2 font-weight-bold">{calculateAverageRating()}</span>
                          <span className="text-muted ml-1">/ 5.0</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">총 {reviews.length}개의 리뷰</small>
                      </div>
                    </div>
                  </div>

                  {reviews.map((review, index) => (
                    <div key={review.id || index} className="review-item border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <span className="font-weight-bold mr-2">{review.studentName || '익명'}</span>
                            <div className="star-rating">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < (review.rating || 0) ? 'text-warning' : 'text-secondary'}>
                                  &#9733;
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{formatDate(review.createdAt)}</small>
                      </div>
                      <p className="mb-0 text-gray-700">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 강의 상세 탭 */}
          {activeTab === 'detail' && (
            <div className="detail-tab">
              {classData?.detail ? (
                <div>
                  <h5 className="mb-3">강의 상세 설명</h5>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {classData.detail}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-info-circle fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">등록된 상세 설명이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .class-main-img {
          max-height: 200px;
          width: 100%;
          object-fit: cover;
        }
        
        .default-image-placeholder {
          width: 100%;
          height: 200px;
          background-color: #fff5e6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        
        .icon-container {
          text-align: center;
        }
        
        .java-icon {
          width: 80px;
          height: 80px;
          background-color: #f39c12;
          border-radius: 10px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          font-weight: bold;
        }
        
        .java-text {
          color: #e67e22;
          font-weight: bold;
          font-size: 24px;
          margin: 0;
        }
        
        .class-rating {
          text-align: right;
        }
        
        .badge-outline-primary {
          background-color: transparent !important;
          border: 1px solid #007bff;
          color: #007bff;
        }
        
        .badge-outline-secondary {
          background-color: transparent !important;
          border: 1px solid #6c757d;
          color: #6c757d;
        }
        
        .material-item {
          transition: all 0.2s ease-in-out;
          background-color: #fff;
        }
        
        .material-item:hover {
          background-color: #f8f9fc !important;
          border-color: #007bff !important;
          transform: translateX(5px);
        }
        
        .material-number .badge {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .material-icon {
          width: 40px;
          text-align: center;
        }
        
        .text-sm {
          font-size: 0.875rem;
        }
        
        .btn-block {
          display: block;
          width: 100%;
        }
        
        .materials-list, .reviews-list {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          background: transparent;
        }
        
        .nav-tabs .nav-link.active {
          color: #007bff;
          background: #fff;
          border-bottom: 2px solid #007bff;
        }
        
        .nav-tabs .nav-link:hover {
          border: none;
          color: #007bff;
        }
        
        .review-item:last-child {
          border-bottom: none !important;
        }
        
        .text-gray-300 {
          color: #d1d5db !important;
        }
        
        .text-gray-400 {
          color: #9ca3af !important;
        }
        
        .text-gray-500 {
          color: #6b7280 !important;
        }
        
        .text-gray-700 {
          color: #374151 !important;
        }
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
      `}</style>
    </div>
  );
};

export default TClassDetail;