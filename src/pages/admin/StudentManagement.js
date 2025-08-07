import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('userId');
  const [sortOrder, setSortOrder] = useState('asc');
  const { user } = useAuth();
  const [error, setError] = useState(null);
  // 페이징 관련 상태 (10개 고정)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 고정값
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 비밀번호 확인 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 관리자 권한 확인
  const isAdmin = () => user?.position === '3' || user?.position === 'admin';

  // 컴포넌트 마운트 시 및 페이징 상태 변경 시 데이터 로드
useEffect(() => {
  if (isAdmin()) {
    fetchStudents();
  }
}, [currentPage, searchTerm]);


  // 학생 목록 가져오기 (서버 페이징)
const fetchStudents = async () => {
  try {
    setLoading(true);
    setError(null); // ⭐ 에러 상태 초기화
    
    // 페이징 파라미터를 URL에 추가
    const params = new URLSearchParams({
      page: currentPage.toString(),
      size: itemsPerPage.toString(),
      search: searchTerm || ''
    });
    
    console.log('API 요청 URL:', `http://localhost:8080/api/admin/students?${params}`);
    
    const response = await fetch(`http://localhost:8080/api/admin/students?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      setStudents(data.data || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } else {
      // ⭐ 에러 상태별로 적절한 메시지 설정
      if (response.status === 403) {
        throw new Error('접근 권한이 없습니다. 관리자 권한이 필요합니다.');
      } else if (response.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else {
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('학생 목록 가져오기 오류:', error);
    setError(error.message); // ⭐ 에러 상태 설정
    setStudents([]);
  } finally {
    setLoading(false);
  }
};

  // 삭제 버튼 클릭 시 모달 열기
  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setShowPasswordModal(true);
    setPassword('');
  };

  // 모달 닫기
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setSelectedUserId(null);
    setPasswordLoading(false);
  };

  // 학생 삭제 (비밀번호 확인 후)
  const deleteStudent = async () => {
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setPasswordLoading(true);
      
      const response = await fetch(`http://localhost:8080/join/userDelete/${selectedUserId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password })
      });

      if (response.ok) {
        alert('학생이 삭제되었습니다.');
        closePasswordModal();
        fetchStudents(); // 현재 페이지 다시 로드
      } else if (response.status === 401) {
        alert('비밀번호가 일치하지 않습니다.');
      } else if (response.status === 403) {
        alert('삭제 권한이 없습니다.');
      } else {
        alert('학생 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      alert('학생 삭제 중 오류가 발생했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (error) {
    return (
      <div className="card-body">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">오류 발생</h4>
          <p>{error}</p>
          <hr />
          <div className="mb-0">
            <button 
              className="btn btn-outline-danger" 
              onClick={() => fetchStudents()}
            >
              다시 시도
            </button>
            {error.includes('권한') && (
              <div className="mt-2">
                <small className="text-muted">
                  관리자 권한이 필요합니다. 로그인 상태와 권한을 확인해주세요.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

// 관리자 권한 확인
if (!isAdmin()) {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">접근 권한 없음</h4>
        <p>
          <i className="fas fa-exclamation-triangle mr-2"></i>
          관리자 권한이 필요합니다.
        </p>
        <hr />
        <div className="mb-0">
          <small className="text-muted">
            현재 권한: {user?.position || '없음'} | 필요 권한: 관리자(3)
          </small>
        </div>
      </div>
    </div>
  );
}

  // 엔터 키로 삭제 실행
  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter' && !passwordLoading) {
      deleteStudent();
    }
  };

  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // 페이지 크기 변경 함수 제거 (10개 고정이므로 불필요)
  
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

  return (
    <div className="container-fluid px-4 py-5">
      {/* 페이지 헤더 */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          <i className="fas fa-user-graduate mr-2"></i>
          학생 관리
        </h1>
      </div>

      {/* 학생 통계 카드 */}
      <div className="row mb-4">
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    전체 학생
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalElements}명
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user-graduate fa-2x text-gray-300"></i>
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
                    {students.length}명
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
                    총 페이지
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalPages}페이지
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-file-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
            
      {/* 학생 목록 테이블 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">학생 목록</h6>
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
                  placeholder="학생 ID, 이름, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-right">
              <button
                className="btn btn-primary"
                onClick={fetchStudents}
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
              <p className="mt-2">학생 데이터를 불러오는 중...</p>
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
                      <th>학생 ID</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>전화번호</th>
                      <th>생년월일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student, index) => (
                        <tr key={student.userId || index}>
                          <td className="font-weight-bold">{student.userId}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.phone || '-'}</td>
                          <td>{student.birthday ? new Date(student.birthday).toLocaleDateString() : '-'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteClick(student.userId)}
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
                        <td colSpan="6" className="text-center py-4">
                          {searchTerm ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
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

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-lock mr-2 text-warning"></i>
                  비밀번호 확인
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  학생을 삭제하려면 관리자 비밀번호를 입력해주세요.
                  <br />
                  <strong>이 작업은 되돌릴 수 없습니다.</strong>
                </div>
                <div className="form-group">
                  <label htmlFor="deletePassword" className="form-label">
                    <i className="fas fa-key mr-1"></i>
                    관리자 비밀번호
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    className="form-control"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handlePasswordKeyPress}
                    disabled={passwordLoading}
                    autoFocus
                  />
                </div>
                <div className="form-group mb-0">
                  <small className="text-muted">
                    <i className="fas fa-info-circle mr-1"></i>
                    삭제할 학생 ID: <strong>{selectedUserId}</strong>
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                >
                  <i className="fas fa-times mr-1"></i>
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteStudent}
                  disabled={passwordLoading || !password.trim()}
                >
                  {passwordLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm mr-2" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash mr-1"></i>
                      삭제
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;