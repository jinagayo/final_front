import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // 페이징 관련 상태 (10개 고정)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 고정값
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 관리자 권한 확인
  const isAdmin = () => user?.position === '3' || user?.position === 'admin';

  // 강사 목록 가져오기 (서버 페이징)
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      // 페이징 파라미터를 URL에 추가
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: itemsPerPage.toString(),
        search: searchTerm || ''
      });
      
      console.log('강사 API 요청 URL:', `http://localhost:8080/api/admin/teachers?${params}`);
      
      const response = await fetch(`http://localhost:8080/api/admin/teachers?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('강사 API 응답 데이터:', data);
        
        setTeachers(data.data || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        console.error('강사 목록 가져오기 실패:', response.status);
        setTeachers([]);
      }
    } catch (error) {
      console.error('강사 목록 가져오기 오류:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // 강사 삭제
  const deleteTeacher = async (userId) => {
    if (!window.confirm('정말로 이 강사를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('강사가 삭제되었습니다.');
        fetchTeachers(); // 현재 페이지 다시 로드
      } else {
        alert('강사 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('강사 삭제 오류:', error);
      alert('강사 삭제 중 오류가 발생했습니다.');
    }
  };

  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 페이지 번호 배열 생성 (최대 5개 페이지 표시, 현재 페이지 중심)
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // 총 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 총 페이지가 5개 초과면 현재 페이지 기준으로 조정
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // 끝에서 조정이 필요한 경우
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // 컴포넌트 마운트 시 및 페이징 상태 변경 시 데이터 로드
  useEffect(() => {
    fetchTeachers();
  }, [currentPage, searchTerm]);

  // 관리자 권한 확인
  if (!isAdmin()) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          관리자 권한이 필요합니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-5">
      {/* 페이지 헤더 */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          <i className="fas fa-chalkboard-teacher mr-2"></i>
          강사 관리
        </h1>
      </div>

      {/* 강사 통계 카드 */}
      <div className="row mb-4">
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    전체 강사
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalElements}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    현재 페이지
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {teachers.length}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    승인 대기
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {teachers.filter(teacher => teacher.state === 'PENDING').length}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 강사 목록 테이블 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">강사 목록</h6>
        </div>

        <div className="card-body">
          {/* 검색 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">검색
                    <i className="fas fa-search"></i>
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="강사 ID, 이름, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-right">
              <button
                className="btn btn-primary"
                onClick={fetchTeachers}
                disabled={loading}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                새로고침
              </button>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">강사 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 결과 정보 */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <small className="text-muted">
                    총 {totalElements}명 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalElements)}명 표시 
                    (페이지 {currentPage}/{totalPages})
                  </small>
                </div>
              </div>

              {/* 테이블 */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th>강사 ID</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>전화번호</th>
                      <th>생년월일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length > 0 ? (
                      teachers.map((teacher, index) => (
                        <tr key={teacher.userId || index}>
                          <td className="font-weight-bold">{teacher.userId}</td>
                          <td>{teacher.name}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.phone || '-'}</td>
                          <td>{teacher.birthday ? new Date(teacher.birthday).toLocaleDateString() : '-'}</td>
                          {/*
                          <td>
                            <span className={`badge ${
                              teacher.state === 'ACTIVE' ? 'badge-success' : 
                              teacher.state === 'PENDING' ? 'badge-warning' : 
                              'badge-secondary'
                            }`}>
                              {teacher.state === 'ACTIVE' ? '승인완료' : 
                               teacher.state === 'PENDING' ? '승인대기' : 
                               '비활성'}
                            </span>
                          </td>*/}
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteTeacher(teacher.userId)}
                              title="삭제"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          {searchTerm ? '검색 결과가 없습니다.' : '등록된 강사가 없습니다.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이징 */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <nav aria-label="Page navigation">
                    <ul className="pagination mb-0">
                      {/* 이전 페이지 */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link border-0 bg-transparent"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{ 
                            color: currentPage === 1 ? '#6c757d' : '#007bff',
                            fontSize: '18px',
                            padding: '8px 12px'
                          }}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>

                      {/* 페이지 번호들 (최대 5개) */}
                      {getPageNumbers().map((pageNumber) => (
                        <li key={pageNumber} className="page-item mx-1">
                          <button
                            className={`page-link border-0 ${
                              pageNumber === currentPage 
                                ? 'bg-primary text-white' 
                                : 'bg-transparent text-primary'
                            }`}
                            onClick={() => handlePageChange(pageNumber)}
                            style={{
                              minWidth: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              fontWeight: pageNumber === currentPage ? 'bold' : 'normal',
                              boxShadow: pageNumber === currentPage ? '0 2px 4px rgba(0,123,255,0.3)' : 'none'
                            }}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      ))}

                      {/* 다음 페이지 */}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link border-0 bg-transparent"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{ 
                            color: currentPage === totalPages ? '#6c757d' : '#007bff',
                            fontSize: '18px',
                            padding: '8px 12px'
                          }}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;