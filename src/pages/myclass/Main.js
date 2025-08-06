import React, { useState, useEffect } from 'react';
import { useSearchParams,useParams } from 'react-router-dom';
export default function ClassMain() {
  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    content: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // URL에서 class_id 파라미터 추출 (실제 구현시 useParams 또는 URLSearchParams 사용)
  const getClassIdFromUrl = () => {
    // 실제 구현시: const { class_id } = useParams(); 또는 URLSearchParams 사용
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('class_id') || '1'; // 테스트용 기본값
  };

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path; 
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
      console.error('날짜 변환 오류:', error);
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

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || timeInSeconds <= 0) return '';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // 전체 진행률 계산
  const calculateProgress = () => {
    if (materials.length === 0) return 0;
    
    const completedCount = materials.filter(item => item.sub === true).length;
    return Math.round((completedCount / materials.length) * 100);
  };

  // 완료된 자료 수 계산
  const getCompletedCount = () => {
    return materials.filter(item => item.sub === true).length;
  };

  useEffect(() => {
    const fetchClassData = async () => {
      const classId = getClassIdFromUrl();
      
      try {
        const response = await fetch(`http://localhost:8080/api/myclass/Main?class_id=${classId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("로그인이 필요합니다.");
            navigate('/login');
            return;
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("강의 메인 데이터:", data);
        console.log("review 값:", data.review, "타입:", typeof data.review);
        
        if (data && data.class) {
          setClassData(data.class);
          // 백엔드에서 변경된 데이터 구조에 맞게 수정
          setMaterials(data.meterials || []);
          const reviewStatus = data.review === true;
          console.log("hasReviewed 설정값:", reviewStatus);
          setHasReviewed(reviewStatus);
        } else {
          setError("강의 정보를 찾을 수 없습니다.");
        }

      } catch (e) {
        setError("데이터를 불러오는 데 실패했습니다: " + e.message);
        console.error("강의 메인 데이터를 가져오지 못했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, []);

  const handleMaterialClick = (materialItem) => {
    const material = materialItem.meterial; // 백엔드 구조에 맞게 수정
    console.log('선택된 강의 자료:', material);
    
    switch (material.type) {
      case 'MET001': // 영상
        navigate(`/myclass/videoView/${material.meterId}`);
        break;
      case 'MET002': // 과제
        navigate(`/myclass/assignment?meterial_id=${material.meterId}`);
        break;
      case 'MET003': // 시험
        navigate(`/myclass/test?meterial_id=${material.meterId}`);
        break;
      default:
        console.log('알 수 없는 자료 타입:', material.type);
        alert('지원하지 않는 자료 타입입니다.');
    }
  };

  const handleReviewClick = () => {
    if (hasReviewed) {
      alert('이미 평가하셨습니다.');
      return;
    }
    
    setShowReviewForm(!showReviewForm);
  };

  const handleStarClick = (rating) => {
    setReviewData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleContentChange = (e) => {
    setReviewData(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  const handleReviewSubmit = async () => {
    if (reviewData.rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    
    if (!reviewData.content.trim()) {
      alert('리뷰 내용을 작성해주세요.');
      return;
    }

    const confirmed = window.confirm('제출시 수정/삭제 할 수 없습니다. 계속하시겠습니까?');
    if (!confirmed) return;

    setReviewSubmitting(true);
    
    try {
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          class_id: classId,
          rating: reviewData.rating,
          content: reviewData.content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP 에러! 상태: ${response.status}`);
      }

      alert('제출 되었습니다.');
      setShowReviewForm(false);
      setReviewData({ rating: 0, content: '' });
      
      // 페이지 새로고침하여 업데이트된 데이터 로드
      window.location.reload();

    } catch (error) {
      console.error('리뷰 제출 오류:', error);
      alert('리뷰 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">강의 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <p className="text-danger">{error}</p>
        <p className="text-gray-500">페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
        <p className="text-warning">강의 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const progressPercent = calculateProgress();
  const completedCount = getCompletedCount();

  return (
    <div className="container-fluid">
      {/* 뒤로가기 버튼 */}
      <div className="mb-3">
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/myclass/teacher/classList')}
        >
          <i className="fas fa-arrow-left mr-1"></i> 내 강의실로 돌아가기
        </button>
      </div>

      {/* 강의 정보 헤더 */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <img
                src={classData.img || '/default-class-image.jpg'}
                className="img-fluid rounded class-main-img"
                alt={classData.name}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMzAgMTAwTDE3MCA4MEwxNzAgMTIwTDEzMCAxMDBaIiBmaWxsPSIjREREREREIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LXNpemU9IjE0Ij7qsJXsnZgg7J2066+47KeAPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            </div>
            <div className="col-md-9">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="badge badge-outline-primary mb-2">{classData.subject}</span>
                  <h2 className="h3 mb-2 text-gray-800">{classData.name}</h2>
                  <p className="text-muted mb-3">{classData.intro}</p>
                </div>
                <div className="class-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`${i < Math.floor(classData.mark || 0) ? 'text-warning' : 'text-secondary'}`}>
                      &#9733;
                    </span>
                  ))}
                  <span className="ml-1 font-weight-bold">{classData.mark || 0}</span>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-user-tie text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>강사:</strong> {classData.teacher}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-won-sign text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>수강료:</strong> {formatPrice(classData.price)}원
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-calendar text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>개설일:</strong> {formatDate(classData.createdAt)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-list text-gray-400 mr-2"></i>
                    <span className="text-sm">
                      <strong>총 강의:</strong> {materials.length}개
                    </span>
                  </div>
                </div>
              </div>

              {/* 진행률 표시 */}
              <div className="progress-section mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-sm font-weight-bold">
                    <i className="fas fa-chart-pie text-success mr-2"></i>
                    학습 진행률
                  </span>
                  <span className="text-sm font-weight-bold text-success">
                    {completedCount}/{materials.length} ({progressPercent}%)
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${progressPercent}%` }}
                    aria-valuenow={progressPercent} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* 액션 버튼들 */}
        <div className="row mb-4">
          <div className="col-md-3 mb-2">
            <button 
              className="btn btn-primary btn-block"
              onClick={() => {
                console.log("버튼 클릭됨!");
                console.log("hasReviewed 현재값:", hasReviewed);
                if (hasReviewed) {
                  console.log("이미 평가함 - alert 표시");
                  alert('이미 평가하셨습니다.');
                  return;
                }
                console.log("평가 폼 토글");
                setShowReviewForm(!showReviewForm);
              }}
            >
              <i className="fas fa-star mr-2"></i>강의 평가하기
            </button>
          </div>
          
          <div className="col-md-3 mb-2">
            <button 
              className="btn btn-info btn-block"
              onClick={() => {
                console.log('classData:', classData);
                console.log('classId:', classData.classId);
                navigate(`/myclass/board/list/${classData.classId}?boardNum=BOD002`);
              }}
            >
              <i className="fas fa-bullhorn mr-2"></i>공지사항
            </button>
          </div>
          
          <div className="col-md-3 mb-2">
            <button 
              className="btn btn-info btn-block"
              onClick={() => {
                console.log('classData:', classData);
                console.log('classId:', classData.classId);
                navigate(`/myclass/board/list/${classData.classId}?boardNum=BOD001`);
              }}
            >
              <i className="fas fa-bullhorn mr-2"></i>QnA
            </button>
          </div>
          
          <div className="col-md-3 mb-2">
            <button 
              className="btn btn-outline-secondary btn-block"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt mr-2"></i>새로고침
            </button>
          </div>
        </div>

      {/* 강의 평가 폼 */}
      {showReviewForm && (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              <i className="fas fa-star mr-2"></i>강의 평가하기
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label className="form-label font-weight-bold mb-3">별점 (5점 만점)</label>
              <div className="star-rating mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`star-clickable ${i < reviewData.rating ? 'text-warning' : 'text-secondary'}`}
                    onClick={() => handleStarClick(i + 1)}
                    style={{ cursor: 'pointer', fontSize: '2rem', marginRight: '5px' }}
                  >
                    &#9733;
                  </span>
                ))}
                <span className="ml-3 text-muted">
                  {reviewData.rating > 0 ? `${reviewData.rating}점 선택됨` : '별점을 선택해주세요'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="reviewContent" className="form-label font-weight-bold">리뷰 작성</label>
              <textarea
                id="reviewContent"
                className="form-control"
                rows="5"
                placeholder="강의에 대한 솔직한 리뷰를 작성해주세요..."
                value={reviewData.content}
                onChange={handleContentChange}
                maxLength="500"
              ></textarea>
              <small className="form-text text-muted">
                {reviewData.content.length}/500자
              </small>
            </div>
            
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary mr-2"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewData({ rating: 0, content: '' });
                }}
                disabled={reviewSubmitting}
              >
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReviewSubmit}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>제출 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>제출하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 강의 상세 설명 */}
      {classData.detail && (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              <i className="fas fa-info-circle mr-2"></i>강의 상세 설명
            </h6>
          </div>
          <div className="card-body">
            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {classData.detail}
            </p>
          </div>
        </div>
      )}

      {/* 강의 자료 목록 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">
            <i className="fas fa-folder-open mr-2"></i>강의 자료 ({materials.length}개)
          </h6>
          <div className="progress-summary">
            <small className="text-muted">
              완료: <span className="font-weight-bold text-success">{completedCount}</span> / 
              전체: <span className="font-weight-bold">{materials.length}</span>
            </small>
          </div>
        </div>
        <div className="card-body">
          {materials.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-folder-open fa-3x text-gray-300 mb-3"></i>
              <p className="text-gray-500">등록된 강의 자료가 없습니다.</p>
            </div>
          ) : (
            <div className="materials-list">
              {materials.map((materialItem, index) => {
                const material = materialItem.meterial;
                const isCompleted = materialItem.sub === true;
                const iconInfo = getMaterialIcon(material.type);
                
                return (
                  <div 
                    key={material.meter_id || index}
                    className={`material-item d-flex align-items-center p-3 mb-2 border rounded ${isCompleted ? 'completed-material' : ''}`}
                    onClick={() => handleMaterialClick(materialItem)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="material-number mr-3">
                      <span className={`badge ${isCompleted ? 'badge-success' : 'badge-light'}`}>
                        {material.seq || index + 1}
                      </span>
                    </div>
                    <div className="material-icon mr-3">
                      <i className={`${iconInfo.icon} fa-lg ${iconInfo.color}`}></i>
                    </div>
                    <div className="material-info flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className={`mb-1 ${isCompleted ? 'text-success' : ''}`}>
                            {material.title || `강의 자료 ${material.seq || index + 1}`}
                            {isCompleted && <i className="fas fa-check-circle ml-2 text-success"></i>}
                          </h6>
                          <small className="text-muted">
                            <span className="badge badge-outline-secondary mr-2">
                              {iconInfo.label}
                            </span>
                            {material.type === 'MET001' && material.time && (
                              <span className="text-primary">
                                <i className="fas fa-clock mr-1"></i>
                                {formatTime(material.time)}
                              </span>
                            )}
                            {isCompleted && (
                              <span className="badge badge-success ml-2">
                                <i className="fas fa-check mr-1"></i>완료
                              </span>
                            )}
                          </small>
                        </div>
                        <div className="material-actions">
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
      </div>

      <style>{`
        .class-main-img {
          max-height: 200px;
          width: 100%;
          object-fit: cover;
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
        
        .completed-material {
          background-color: #f8fff9 !important;
          border-color: #28a745 !important;
        }
        
        .completed-material:hover {
          background-color: #e8f5e8 !important;
          border-color: #1e7e34 !important;
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
        
        .materials-list {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .star-clickable {
          transition: all 0.2s ease-in-out;
        }
        
        .star-clickable:hover {
          transform: scale(1.1);
        }
        
        .progress-section {
          border-top: 1px solid #e3e6f0;
          padding-top: 15px;
        }
        
        .progress-summary small {
          font-size: 0.8rem;
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
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
      `}</style>
    </div>
  );
}