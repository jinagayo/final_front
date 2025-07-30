import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function MyClassList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  
  const [myClasses, setMyClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const navigate = useNavigate();

  const formatDate = (dateString) => {
  // null, undefined 등 falsy한 값은 바로 처리
  if (!dateString) return '-';

  // 문자열 타입인지 체크
  if (typeof dateString !== 'string') {
    console.warn('formatDate: 문자열이 아닌 값이 전달됨', dateString);
    return '-';
  }

  try {
    // '2025-07-30 10:00:00' → '2025-07-30T10:00:00' 변환
    const formattedDateString = dateString.replace(' ', 'T');
    const date = new Date(formattedDateString);

    if (isNaN(date.getTime())) {
      console.warn('formatDate: 유효하지 않은 날짜 형식', formattedDateString);
      return '-';
    }

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1); // '2025-07-30'
    
  } catch (error) {
    console.error('formatDate: 날짜 변환 중 오류 발생', error);
    return '-';
  }
};

  // 강의 클릭 시 상세 페이지로 이동
  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/myclass/List', {
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
        console.log("내 강의실 데이터:", data);
        console.log("데이터 타입:", typeof data);
        console.log("데이터가 배열인가?", Array.isArray(data));

        if (Array.isArray(data)) {
          console.log("데이터 첫 번째 요소:", data[0]);
          setMyClasses(data);
          const uniqueSubjects = ['all', ...new Set(data.map(cls => cls.subject).filter(subject => subject))];
          setSubjects(uniqueSubjects);
        } else {
          console.error("API 응답이 예상한 List<Map<String, Object>> 형태가 아닙니다:", data);
          console.error("실제 데이터 구조:", JSON.stringify(data, null, 2));
          setMyClasses([]);
          setSubjects(['all']);
        }

      } catch (e) {
        setError("데이터를 불러오는 데 실패했습니다: " + e.message);
        console.error("내 강의실 데이터를 가져오지 못했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMyClasses();
  }, []);

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: '수강중', label: '수강 중' },
    { value: '수강완료', label: '수강 완료' },
    { value: '수강취소', label: '수강취소' }
  ];

  const getStatusBadge = (state) => {
    switch (state) {
      case '수강중':
        return <span className="badge badge-success">수강 중</span>;
      case '수강완료':
        return <span className="badge badge-primary">수강 완료</span>;
      case '수강취소':
        return <span className="badge badge-warning">일시정지</span>;
      default:
        return <span className="badge badge-secondary">{state}</span>;
    }
  };

  const filteredClasses = myClasses.filter(cls => {
    // null/undefined 체크 강화
    if (!cls) return false;
    
    const className = cls.name || '';
    const classIntro = cls.intro || '';
    const classState = cls.state || '';
    const classSubject = cls.subject || '';

    const matchesSearch = className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          classIntro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || classState === statusFilter;
    const matchesSubject = subjectFilter === 'all' || classSubject === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const getStatusCount = (state) => {
    if (state === 'all') return myClasses.filter(cls => cls).length;
    return myClasses.filter(cls => cls && cls.state === state).length;
  };

  const handleClassClick = (classId) => {
    console.log('Course clicked:', classId);
    if (classId) {
      navigate(`/myclass/Main?class_id=${classId}`);
    } else {
      console.error('Course ID is missing');
      alert('강의 정보가 올바르지 않습니다.');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">강의실 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="containe
      
      t-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <p className="text-danger">{error}</p>
        <p className="text-gray-500">페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          <i className="fas fa-book-open mr-2"></i>내 강의실
        </h1>
        <div className="d-flex">
          <button
            className="btn btn-sm btn-outline-primary mr-2"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt fa-sm"></i> 새로고침
          </button>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="row">
        {/* 전체 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    전체 강의</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('all')}개
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-book fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 수강 중 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    수강 중</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('수강중')}개
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-play-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 수강 완료 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    수강 완료</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('수강완료')}개
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 일시정지 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    수강취소</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('수강취소')}개
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-pause-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            <i className="fas fa-filter mr-2"></i>검색 및 필터
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">강의명 검색</label>
              <input
                type="text"
                className="form-control"
                placeholder="강의명 또는 소개글로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">수강 상태</label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">과목</label>
              <select
                className="form-control"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? '전체 과목' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            <i className="fas fa-list mr-2"></i>내 강의 목록 ({filteredClasses.length}개)
          </h6>
        </div>
        <div className="card-body">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-book-open fa-4x text-gray-300 mb-4"></i>
              <h5 className="text-gray-500 mb-2">수강 중인 강의가 없습니다</h5>
              <p className="text-gray-400">새로운 강의를 찾아보세요!</p>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => navigate('/student/class/search')}
              >
                <i className="fas fa-search mr-2"></i>강의 찾아보기
              </button>
            </div>
          ) : (
            <div className="row">
              {filteredClasses.map((classItem, index) => (
                <div key={classItem.classId || index} className="col-lg-4 col-md-6 mb-4">
                  <div 
                    className="card class-card shadow h-100"
                    onClick={() => handleClassClick(classItem.classId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-img-container">
                      <img
                        src={classItem.img || '/default-class-image.jpg'}
                        className="card-img-top"
                        alt={classItem.name || '강의'}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMzAgMTAwTDE3MCA4MEwxNzAgMTIwTDEzMCAxMDBaIiBmaWxsPSIjREREREREIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LXNpemU9IjE0Ij7qsJXsnZgg7J2066+47KeAPC90ZXh0Pgo8L3N2Zz4=';
                        }}
                      />
                      <div className="card-status-overlay">
                        {getStatusBadge(classItem.state)}
                      </div>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="mb-2">
                        <span className="badge badge-outline-secondary mr-2">{classItem.subject || '과목'}</span>
                        <small className="text-muted">수강일: {formatDate(classItem.createdAt)}</small>
                      </div>
                      <h6 className="card-title font-weight-bold mb-2">{classItem.name || '강의명'}</h6>
                      <p className="card-text text-muted small mb-3 flex-grow-1">
                        {classItem.intro || '강의 소개'}
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="instructor-info d-flex align-items-center">
                            <i className="fas fa-user-tie text-gray-400 mr-1"></i>
                            <span className="text-sm text-gray-600">{classItem.teacher || '강사'}</span>
                          </div>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleClassClick(classItem.classId)}>
                            <i className="fas fa-play mr-1"></i>학습하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .class-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          border: none;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .class-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .card-img-container {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        
        .card-img-top {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .class-card:hover .card-img-top {
          transform: scale(1.05);
        }
        
        .card-status-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
        }
        
        .badge-outline-secondary {
          background-color: transparent !important;
          border: 1px solid #6c757d;
          color: #6c757d;
        }
        
        .instructor-info {
          font-size: 0.875rem;
        }
        
        .text-sm {
          font-size: 0.875rem;
        }
        
        .card-title {
          font-size: 1.1rem;
          line-height: 1.3;
          height: 2.6rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .card-text {
          height: 3rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .badge {
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
        }
        
        .btn-outline-primary:hover {
          transform: none;
        }
      `}</style>
    </div>
  );
}