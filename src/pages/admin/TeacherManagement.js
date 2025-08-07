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
  const [pendingTotal, setPendingTotal] = useState(0);

  // 비밀번호 확인 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 관리자 권한 확인
  const isAdmin = () => user?.position === '3' || user?.position === 'admin';

  // 강사 목록 가져오기 (서버 페이징)
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: itemsPerPage.toString(),
        search: searchTerm || ''
      });
      
      const response = await fetch(`http://localhost:8080/api/admin/teachers?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('API 응답 데이터:', data); // 디버깅용 로그
        
        setTeachers(data.data || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setPendingTotal(data.pendingTotal || 0);
        
        // API 응답 구조 확인용 로그
        console.log('totalElements:', data.totalElements);
        console.log('pendingTotal:', data.pendingTotal);
      } else {
        console.error('강사 목록 가져오기 실패:', response.status);
        setTeachers([]);
        setTotalPages(0);
        setTotalElements(0);
        setPendingTotal(0);
      }
    } catch (error) {
      console.error('강사 목록 가져오기 오류:', error);
      setTeachers([]);
      setTotalPages(0);
      setTotalElements(0);
      setPendingTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 통계 데이터만 별도로 가져오는 함수 (검색과 무관하게)
  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/teachers/statistics', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('통계 데이터:', data); // 디버깅용 로그
        
        setTotalElements(data.totalElements || 0);
        setPendingTotal(data.pendingTotal || 0);
      } else {
        console.error('통계 데이터 가져오기 실패:', response.status);
      }
    } catch (error) {
      console.error('통계 데이터 가져오기 오류:', error);
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

  // 강사 삭제 (비밀번호 확인 후)
  const deleteTeacher = async () => {
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
        alert('강사가 삭제되었습니다.');
        closePasswordModal();
        
        // 삭제 후 통계 데이터와 목록 모두 새로고침
        await Promise.all([
          fetchTeachers(),
          fetchStatistics()
        ]);
      } else if (response.status === 401) {
        alert('비밀번호가 일치하지 않습니다.');
      } else if (response.status === 403) {
        alert('삭제 권한이 없습니다.');
      } else {
        alert('강사 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('강사 삭제 오류:', error);
      alert('강사 삭제 중 오류가 발생했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 엔터 키로 삭제 실행
  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter' && !passwordLoading) {
      deleteTeacher();
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

  // 새로고침 버튼 클릭 시
  const handleRefresh = async () => {
    await Promise.all([
      fetchTeachers(),
      fetchStatistics()
    ]);
  };

  // 페이지 번호 배열 생성 (최대 5개 페이지 표시, 현재 페이지 중심)
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isAdmin()) {
      // 초기 로드 시 통계 데이터 먼저 가져오기
      fetchStatistics();
    }
  }, []);

  // 페이징/검색 상태 변경 시 목록 데이터만 로드
  useEffect(() => {
    if (isAdmin()) {
      fetchTeachers();
    }
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
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          <i className="fas fa-chalkboard-teacher mr-2"></i>
          강사 관리
        </h1>
      </div>

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
                    {pendingTotal}명
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

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">강사 목록</h6>
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
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
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                새로고침
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">강사 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <small className="text-muted">
                    총 {searchTerm ? teachers.length : totalElements}명 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, searchTerm ? teachers.length : totalElements)}명 표시 
                    (페이지 {currentPage}/{totalPages})
                  </small>
                </div>
              </div>

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
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteClick(teacher.userId)}
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
                          {searchTerm ? '검색 결과가 없습니다.' : '등록된 강사가 없습니다.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <nav aria-label="Page navigation">
                    <ul className="pagination mb-0">
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
                  강사를 삭제하려면 관리자 비밀번호를 입력해주세요.
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
                    삭제할 강사 ID: <strong>{selectedUserId}</strong>
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
                  onClick={deleteTeacher}
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

export default TeacherManagement;