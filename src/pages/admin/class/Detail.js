import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ClassDetail() {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { classId } = useParams();

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusBadge = (state) => {
    switch (state) {
      case 'STA002':
        return <span className="badge badge-warning badge-lg">검토중</span>;
      case 'STA001':
        return <span className="badge badge-success badge-lg">승인</span>;
      case 'STA003':
        return <span className="badge badge-danger badge-lg">반려</span>;
      default:
        return <span className="badge badge-secondary badge-lg">알 수 없음</span>;
    }
  };

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/class/Detail/${classId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("관리자 권한이 필요합니다. 로그인해주세요.");
            navigate('/auth/login');
            return;
          }
          if (response.status === 404) {
            setError("요청한 강의를 찾을 수 없습니다.");
            return;
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("강의 상세 데이터:", data);
        
        // 백엔드에서 배열로 전송되므로 첫 번째 요소를 가져옴
        if (data && data.length > 0) {
          setClassData(data[0]);
        } else {
          setError("강의 데이터가 없습니다.");
        }

      } catch (e) {
        setError("데이터를 불러오는 데 실패했습니다: " + e.message);
        console.error("강의 상세 데이터를 가져오지 못했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassDetail();
    }
  }, [classId, navigate]);

  const handleApproval = async (action) => {
    const actionText = action === 'STA001' ? '승인' : '반려';
    if (!window.confirm(`정말로 이 강의를 ${actionText}하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admin/class/Request/${classId}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert(`강의가 성공적으로 ${actionText}되었습니다.`);
        // 데이터 새로고침
        window.location.reload();
      } else {
        const errorData = await response.text();
        alert(`${actionText} 처리 중 오류가 발생했습니다: ${errorData}`);
      }
    } catch (error) {
      console.error(`${actionText} 처리 오류:`, error);
      alert(`${actionText} 처리 중 네트워크 오류가 발생했습니다.`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admin/class/Delete/${classId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('강의가 성공적으로 삭제되었습니다.');
        navigate('/admin/class/ClassList');
      } else {
        const errorData = await response.text();
        alert(`삭제 처리 중 오류가 발생했습니다: ${errorData}`);
      }
    } catch (error) {
      console.error('삭제 처리 오류:', error);
      alert('삭제 처리 중 네트워크 오류가 발생했습니다.');
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
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/admin/class/ClassList')}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
        <p className="text-gray-500">강의 정보를 찾을 수 없습니다.</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/admin/class/ClassList')}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">강의 상세 정보</h1>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/admin/class/ClassList')}
        >
          <i className="fas fa-arrow-left fa-sm mr-2"></i>
          목록으로 돌아가기
        </button>
      </div>

      {/* 강의 기본 정보 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">기본 정보</h6>
          {getStatusBadge(classData.state)}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h4 className="font-weight-bold text-gray-800 mb-3">{classData.name}</h4>
              <p className="text-gray-700 mb-4">{classData.intro}</p>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>강사:</strong>
                </div>
                <div className="col-sm-9">
                  <span className="badge badge-info">{classData.teacher}</span>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>과목:</strong>
                </div>
                <div className="col-sm-9">
                  <span className="badge badge-secondary">{classData.SUBJECT}</span>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>가격:</strong>
                </div>
                <div className="col-sm-9">
                  <span className="h5 text-success font-weight-bold">
                    {formatPrice(classData.price)}원
                  </span>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>평점:</strong>
                </div>
                <div className="col-sm-9">
                  <span className="badge badge-warning">
                    <i className="fas fa-star mr-1"></i>
                    {classData.mark || '-'}
                  </span>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>강사 경력:</strong>
                </div>
                <div className="col-sm-9">
                  <span className="text-gray-700">{classData.career || '-'}</span>
                </div>
              </div>
            </div>
            
            {/* 강의 이미지 영역 */}
            <div className="col-md-4">
              {classData.img ? (
                <img 
                  src={`/images/${classData.img}`} 
                  alt="강의 이미지" 
                  className="img-fluid rounded shadow"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="bg-light rounded shadow d-flex align-items-center justify-content-center" 
                style={{
                  height: '200px',
                  display: classData.img ? 'none' : 'flex'
                }}
              >
                <div className="text-center text-gray-500">
                  <i className="fas fa-image fa-3x mb-2"></i>
                  <p>이미지 없음</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 강사 소개 */}
      {classData.introduce && (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">강사 소개</h6>
          </div>
          <div className="card-body">
            <div className="text-gray-700" style={{whiteSpace: 'pre-wrap'}}>
              {classData.introduce}
            </div>
          </div>
        </div>
      )}

      {/* 강의 상세 설명 */}
      {classData.detail && (
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">강의 상세 설명</h6>
          </div>
          <div className="card-body">
            <div className="text-gray-700" style={{whiteSpace: 'pre-wrap'}}>
              {classData.detail}
            </div>
          </div>
        </div>
      )}

      {/* 반려 사유 (반려된 경우) */}
      {classData.state === 'STA003' && classData.rejectReason && (
        <div className="card shadow mb-4 border-left-danger">
          <div className="card-header py-3 bg-danger text-white">
            <h6 className="m-0 font-weight-bold">반려 사유</h6>
          </div>
          <div className="card-body">
            <p className="text-danger mb-0">{classData.rejectReason}</p>
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="card shadow mb-4">
        <div className="card-body text-center">
          {classData.state === 'STA002' ? (
            // 검토중인 강의 - 승인/반려 버튼
            <div className="btn-group" role="group">
              <button
                className="btn btn-success btn-lg px-4"
                onClick={() => handleApproval('STA001')}
              >
                <i className="fas fa-check mr-2"></i>
                승인하기
              </button>
              <button
                className="btn btn-danger btn-lg px-4"
                onClick={() => handleApproval('STA003')}
              >
                <i className="fas fa-times mr-2"></i>
                반려하기
              </button>
            </div>
          ) : (
            // 이미 승인/반려된 강의 - 삭제 버튼
            <button
              className="btn btn-outline-danger btn-lg px-4"
              onClick={handleDelete}
            >
              <i className="fas fa-trash mr-2"></i>
              강의 삭제하기
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .badge-lg {
          font-size: 0.9rem;
          padding: 0.5rem 0.75rem;
        }
        
        .list-group-item {
          border-bottom: 1px solid #e3e6f0 !important;
        }
        
        .list-group-item:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}