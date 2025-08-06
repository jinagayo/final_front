import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const CodingProblems = () => {

  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [level, setDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState(null);
  const [canSubmitProblem, setCanSubmitProblem] = useState(false);
  const [canCreateProblem, setCanCreateProblem] = useState(false);
  
const checkUserPermissions = async () => {
  try {
    const response = await fetch('http://localhost:8080/auth/check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('사용자 데이터:', userData); // 디버깅용
      setUserInfo(userData);
      
      const position = userData.position;
      console.log('position 값:', position, '타입:', typeof position); // 디버깅용
      
      // 문제 풀이는 모든 권한 가능
      setCanSubmitProblem(true);
      
      // 문제 출제는 권한 3(관리자)만 가능 - 숫자와 문자열 둘 다 체크
      const canCreate = position === 3 || position === "3";
      console.log('문제 출제 권한:', canCreate); // 디버깅용
      setCanCreateProblem(canCreate);
      
    } else {
      console.log('사용자 정보 조회 실패');
      setCanSubmitProblem(false);
      setCanCreateProblem(false);
    }
  } catch (error) {
    console.error('권한 확인 오류:', error);
    setCanSubmitProblem(false);
    setCanCreateProblem(false);
  }
};

  const fetchProblems = async () => {
    try {
      setLoading(true);
      
      // 올바른 API URL - Spring Boot Controller와 일치
      const url = `http://localhost:8080/api/admin/list?page=${currentPage}&size=10&search=${encodeURIComponent(searchTerm)}&sortBy=${sortBy}&level=${level}`;
      
      console.log('API 호출 URL:', url); // 디버깅용
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('응답 상태:', response.status); // 디버깅용

      if (response.ok) {
        const data = await response.json();
        console.log('받은 데이터:', data); // 디버깅용
        
        // Spring Boot에서 보내는 응답 구조에 맞게 처리
        if (data.success !== false) {
          setProblems(data.content || []);
          setTotalPages(data.totalPages || 1);
        } else {
          setError(data.message || '데이터를 불러올 수 없습니다.');
        }
      } else {
        // HTTP 에러 상태 처리
        const errorText = await response.text();
        console.error('HTTP 에러:', response.status, errorText);
        setError(`서버 오류: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setError(`네트워크 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserPermissions();
    fetchProblems();
  }, [currentPage, sortBy, level]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchProblems();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProblemClick = (problemId) => {
    console.log(`문제 ${problemId} 클릭됨`);
    window.location.href = `/admin/coding/detail/${problemId}`;
  };

  const getDifficultyStars = (difficulty) => {
    return '★'.repeat(difficulty);
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 1: return '#28a745'; // 초록
      case 2: return '#ffc107'; // 노랑
      case 3: return '#fd7e14'; // 주황
      case 4: return '#dc3545'; // 빨강
      case 5: return '#6f42c1'; // 보라
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3 text-muted">문제를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger text-center">
              <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
              <h5>오류가 발생했습니다</h5>
              <p>{error}</p>
              <button 
                className="btn btn-outline-danger"
                onClick={() => fetchProblems()}
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* 헤더 섹션 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 mb-0 text-gray-800 font-weight-bold">코딩 문제</h2>
              {userInfo && (
                <small className="text-muted">
                  사용자: {userInfo.name || userInfo.data?.name} | 
                  권한: {userInfo.position === 1 ? '학생' : userInfo.position === 2 ? '강사' : userInfo.position === 3 ? '관리자' : '알 수 없음'}
                </small>
              )}
            </div>
            
            {canCreateProblem && (
              <button 
                className="btn"
                onClick={() => alert('문제 출제 기능은 준비 중입니다.')}
                style={{
                  backgroundColor: '#4e73df',
                  borderColor: '#4e73df',
                  borderRadius: '0.35rem',
                  marginTop: '1.5rem',
                  padding: '0.5rem 1.5rem',
                  color: 'white',
                }}
              >
                문제 출제
              </button>
            )}
          </div>

          {/* 검색 및 필터 섹션 */}
          <div className="card shadow mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <h6 className="font-weight-bold text-primary mb-2">등록된 문제</h6>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-3">
                      <select 
                        className="form-control form-control-sm"
                        value={sortBy}
                        onChange={handleSortChange}
                        style={{ fontSize: '14px' }}
                      >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="level">난이도순</option>
                        <option value="correctRate">정답률순</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select 
                        className="form-control form-control-sm"
                        value={level}
                        onChange={handleDifficultyChange}
                        style={{ fontSize: '14px' }}
                      >
                        <option value="all">모든 난이도</option>
                        <option value="1">★ (쉬움)</option>
                        <option value="2">★★ (보통)</option>
                        <option value="3">★★★ (어려움)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="문제 제목 검색"
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 문제 목록 */}
          <div className="card shadow">
            <div className="card-body p-0">
              {/* 테이블 헤더 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 2fr 1fr 1fr 1fr',
                padding: '1rem 1.5rem',
                backgroundColor: '#f8f9fc',
                borderBottom: '1px solid #e3e6f0',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#5a5c69'
              }}>
                <div>상태</div>
                <div>제목</div>
                <div style={{ textAlign: 'center' }}>정답률</div>
                <div style={{ textAlign: 'center' }}>제출</div>
                <div style={{ textAlign: 'center' }}>난이도</div>
              </div>

              {/* 문제 목록 */}
              {problems.map((problem) => (
                <div 
                  key={problem.code_id || problem.id} 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 2fr 1fr 1fr 1fr',
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  onClick={() => handleProblemClick(problem.code_id || problem.id)}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {problem.isSolved ? (
                      <span style={{ color: '#28a745' }}>✓</span>
                    ) : (
                      <span style={{ color: '#dc3545' }}>○</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div>
                      <h6 className="mb-1" style={{ fontSize: '15px', fontWeight: '500' }}>
                        {problem.title}
                      </h6>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        <span className="mr-3">
                          <i className="fas fa-user mr-1"></i>
                          관리자
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: problem.correctRate >= 70 ? '#28a745' : 
                           problem.correctRate >= 50 ? '#ffc107' : '#dc3545'
                  }}>
                    {problem.correctRate}%
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {problem.submissions}명
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: getDifficultyColor(problem.level)
                  }}>
                    {getDifficultyStars(problem.level)}
                  </div>
                </div>
              ))}

              {problems.length === 0 && (
                <div className="text-center py-5">
                  <div className="text-muted">
                    <i className="fas fa-search fa-2x mb-3"></i>
                    <p>등록된 문제가 없습니다.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ color: '#4e73df' }}
                  >
                    이전
                  </button>
                </li>
                
                {Array.from({ length: Math.max(1, Math.min(5, totalPages)) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pageNum)}
                        style={{ 
                          backgroundColor: currentPage === pageNum ? '#4e73df' : 'transparent',
                          borderColor: '#4e73df',
                          color: currentPage === pageNum ? 'white' : '#4e73df'
                        }}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ color: '#4e73df' }}
                  >
                    다음
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProblems;