import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CourseApplicationList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [applications, setApplications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      // 날짜가 유효한지 확인
      if (isNaN(date.getTime())) return '-';
      
      // YYYY-MM-DD 형식으로 변환
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1); // 마지막 점 제거
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '-';
    }
  };

  // 검토일 표시 로직 함수
  const getReviewDate = (createdAt, updatedAt) => {
    if (!updatedAt) return '-';
    
    const createdDate = new Date(createdAt);
    const updatedDate = new Date(updatedAt);
    
    // 날짜가 유효하지 않으면 '-' 반환
    if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
      return '-';
    }
    
    // 생성일과 수정일을 날짜만 비교 (시간 제외)
    const createdDateOnly = createdDate.toDateString();
    const updatedDateOnly = updatedDate.toDateString();
    
    // 날짜가 다르면 검토일 표시, 같으면 '-' 표시
    if (createdDateOnly !== updatedDateOnly) {
      return formatDate(updatedAt);
    }
    
    return '-';
  };

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await fetch('http://localhost:8080/course/teacher/List', {
          // 중요: credentials 옵션을 'include'로 설정합니다.
          credentials: 'include' // 이 옵션이 세션 쿠키를 포함하도록 합니다.
        });
        
        if (!response.ok) {
          // 특정 HTTP 상태 코드에 따라 에러 처리 강화
          if (response.status === 401 || response.status === 403) {
            // 인증되지 않았거나 권한이 없는 경우
            // 로그인 페이지로 리다이렉션하거나 사용자에게 메시지를 보여줄 수 있습니다.
            setError("인증 정보가 없거나 권한이 없습니다. 로그인해주세요.");
            navigate('/login'); // 예시: 로그인 페이지로 이동
            return; // 이후 코드 실행 중지
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const data = await response.json();
        setApplications(data.applications);
        setCategories(['all', ...data.categories]);
      } catch (e) {
        setError("데이터를 불러오는 데 실패했습니다: " + e.message);
        console.error("강의 신청 데이터를 가져오지 못했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [navigate]); // navigate가 변경될 수 있으므로 의존성 배열에 추가 (리다이렉션 사용 시)

  // 나머지 코드는 동일합니다.
  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'STA002', label: '검토중' },
    { value: 'STA001', label: '승인' },
    { value: 'STA003', label: '반려' }
  ];

  const getStatusBadge = (state) => {
    switch (state) {
      case 'STA002':
        return <span className="badge badge-warning">검토중</span>;
      case 'STA001':
        return <span className="badge badge-success">승인</span>;
      case 'STA003':
        return <span className="badge badge-danger">반려</span>;
      default:
        return <span className="badge badge-secondary">알 수 없음</span>;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.state === statusFilter;
    const matchesCategory = categoryFilter === 'all' || app.subject === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusCount = (state) => {
    if (state === 'all') return applications.length;
    if (state === 'approved') return applications.filter(app => app.state === 'STA001').length;
    if (state === 'pending') return applications.filter(app => app.state === 'STA002').length;
    if (state === 'rejected') return applications.filter(app => app.state === 'STA003').length;
    return applications.filter(app => app.state === state).length;
  };

  const handleDelete = (classId) => {
    if (window.confirm('정말로 이 신청을 삭제하시겠습니까?')) {
      setApplications(prev => prev.filter(app => app.classId !== classId));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
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

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h2 className="h3 mb-0 text-gray-800 font-weight-bold">강의 개설 신청 내역</h2>
        <button className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm" onClick={() => navigate('/course/teacher/Application')}>
          <i className="fas fa-plus fa-sm text-white-50"></i> 새 강의 신청
        </button>
      </div>

      {/* Status Cards Row */}
      <div className="row">
        {/* 전체 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    전체</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('all')}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 검토중 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    검토 중</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('pending')}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 승인 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    승인</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('approved')}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 반려 Card */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    반려</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('rejected')}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-times-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">검색 및 필터</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">검색</label>
              <input
                type="text"
                className="form-control"
                placeholder="강의명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">상태</label>
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? '전체 과목' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 신청 내역 테이블 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            신청 내역 ({filteredApplications.length}건)
          </h6>
        </div>
        <div className="card-body">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-search fa-3x text-gray-300 mb-3"></i>
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>강의명</th>
                    <th>과목</th>
                    <th>가격</th>
                    <th>상태</th>
                    <th>신청일</th>
                    <th>검토일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.classId}>
                      <td>
                        <div className="font-weight-bold">{application.name}</div>
                        <small className="text-muted">{application.intro}</small>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{application.subject}</span>
                      </td>
                      <td>{formatPrice(application.price)}원</td>
                      <td>{getStatusBadge(application.state)}</td>
                      <td>{formatDate(application.createdAt)}</td>
                      <td>{getReviewDate(application.createdAt, application.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}