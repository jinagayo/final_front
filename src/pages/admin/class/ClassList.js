import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClassList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('');

  const [applications, setApplications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const formattedDateString = dateString.replace(' ', 'T');
      const date = new Date(formattedDateString);

      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1);
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '-';
    }
  };

  const getReviewDate = (createdAt, updatedAt) => {
    if (!updatedAt) return '-';

    const createdDate = new Date(createdAt.replace(' ', 'T'));
    const updatedDate = new Date(updatedAt.replace(' ', 'T'));
    
    if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
      return '-';
    }
    
    if (createdDate.getFullYear() !== updatedDate.getFullYear() ||
        createdDate.getMonth() !== updatedDate.getMonth() ||
        createdDate.getDate() !== updatedDate.getDate()) {
      return formatDate(updatedAt);
    }
    
    return '-';
  };

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/class/ClassList', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("관리자 권한이 필요합니다. 로그인해주세요.");
            navigate('/login');
            return;
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API 응답 데이터:", data);

        if (Array.isArray(data)) {
          setApplications(data);
          const uniqueSubjects = ['all', ...new Set(data.map(app => app.subject))];
          setSubjects(uniqueSubjects);
        } else {
          if (data && Array.isArray(data.applications)) {
              setApplications(data.applications);
              const uniqueSubjects = ['all', ...new Set(data.applications.map(app => app.subject))];
              setSubjects(uniqueSubjects);
          } else {
              console.error("API 응답이 예상한 배열 또는 객체.applications 형태가 아닙니다:", data);
              setApplications([]);
              setSubjects(['all']);
          }
        }

      } catch (e) {
        setError("데이터를 불러오는 데 실패했습니다: " + e.message);
        console.error("강의 승인 데이터를 가져오지 못했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [navigate]);

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
    const appName = app.name || '';
    const appIntro = app.intro || '';
    const appState = app.state || '';
    const appSubject = app.subject || '';
    const appTeacherId = app.teacher || '';

    const matchesSearch = appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          appIntro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appState === statusFilter;
    const matchesSubject = subjectFilter === 'all' || appSubject === subjectFilter;
    const matchesTeacher = teacherFilter === '' || 
                          appTeacherId.toLowerCase().includes(teacherFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesSubject && matchesTeacher;
  });

  const getStatusCount = (state) => {
    if (state === 'all') return applications.length;
    return applications.filter(app => app.state === state).length;
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuickApproval = async (classId, action, event) => {
    // 이벤트 버블링 방지
    event.stopPropagation();
    
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



  const handleRowClick = (classId) => {
    navigate(`/admin/course/detail/${classId}`);
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
        <h1 className="h3 mb-0 text-gray-800">강의 승인 관리</h1>
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
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    전체 신청</div>
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
                    검토 대기</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('STA002')}
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
                    승인 완료</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {getStatusCount('STA001')}
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
                    {getStatusCount('STA003')}
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
            <div className="col-md-3 mb-3">
              <label className="form-label">강의명 검색</label>
              <input
                type="text"
                className="form-control"
                placeholder="강의명 또는 소개글로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">강사 검색</label>
              <input
                type="text"
                className="form-control"
                placeholder="강사 이름으로 검색..."
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">승인 상태</label>
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
            <div className="col-md-3 mb-3">
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

      {/* 강의 승인 테이블 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            강의 승인 대기 목록 ({filteredApplications.length}건)
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
                    <th>강사</th>
                    <th>과목</th>
                    <th>가격</th>
                    <th>상태</th>
                    <th>신청일</th>
                    <th>검토일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr 
                      key={application.classId}
                      onClick={() => handleRowClick(application.classId)}
                      style={{ cursor: 'pointer' }}
                      className="table-row-hover"
                    >
                      <td>
                        <div className="font-weight-bold">{application.name}</div>
                        <small className="text-muted">{application.intro}</small>
                      </td>
                      <td>
                        <span className="badge badge-info">{application.teacher}</span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{application.subject}</span>
                      </td>
                      <td>{formatPrice(application.price)}원</td>
                      <td>{getStatusBadge(application.state)}</td>
                      <td>{formatDate(application.createdAt)}</td>
                      <td>{getReviewDate(application.createdAt, application.updatedAt)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="btn-group" role="group" style={{width:"100%" , height:"30px"}}>
                          {application.state === 'STA002' ? (
                            // 검토중일 때 - 승인, 반려 버튼
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={(e) => handleQuickApproval(application.classId, 'STA001', e)}
                                title="승인"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={(e) => handleQuickApproval(application.classId, 'STA003', e)}
                                title="반려"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          ) : (
                            // 그 외 상태일 때 - 상세보기 버튼만
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/course/detail/${application.classId}`);
                              }}
                              title="상세보기"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f8f9fc !important;
        }
      `}</style>
    </div>
  );
}