import React, { useState, useEffect } from 'react';

const List = () => {
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 실제 API에서 공지사항 데이터 가져오기
const fetchNotices = async () => {
    try {
        console.log('공지사항 조회 시작');
        
        // boardnum을 문자열로 전달 (기존 구조에 맞춤)
        const url = `http://localhost:8080/board/list?boardnum=BOD002&page=${currentPage}&size=10&search=${encodeURIComponent(searchTerm)}&sortBy=${sortBy}&filterBy=${filterBy}`;
        console.log('요청 URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('응답 상태:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('서버 응답 오류:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API 응답:', data);
        
        if (data.success) {
            // 백엔드에서 이미 변환된 형식으로 데이터가 옴
            setNotices(data.data || []);
            setTotalPages(data.totalPage || 1);
            setLoading(false);
        } else {
            console.error('API 오류:', data.message);
            setError(data.message);
            setLoading(false);
        }
    } catch (error) {
        console.error('공지사항 조회 오류:', error);
        setError(error.message);
        setLoading(false);
    }
};
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchNotices(currentPage, searchTerm, sortBy, filterBy);
  }, [currentPage, sortBy, filterBy]);

  // 검색어 변경 시 디바운싱 적용
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // 검색 시 첫 페이지로 이동
      fetchNotices(1, searchTerm, sortBy, filterBy);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 공지사항 상세보기
  // handleNoticeClick 함수도 수정:
const handleNoticeClick = async (noticeId) => {
    try {
        // 조회수 증가 API 호출 (boardId 사용)
        await fetch(`http://localhost:8080/board/api/notices/${noticeId}/view`, {
            method: 'POST',
            credentials: 'include'
        });
        
        // 상세 페이지로 이동
        window.location.href = `/notices/${noticeId}`;
    } catch (error) {
        console.error('조회수 증가 오류:', error);
        // 오류가 있어도 상세 페이지로 이동
        window.location.href = `/notices/${noticeId}`;
    }
};

  // 새 공지사항 작성
  const handleCreateNotice = () => {
    window.location.href = '/notices/create';
    // 또는 React Router 사용 시:
    // navigate('/notices/create');
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = date.getHours() >= 12 ? '오후' : '오전';
      const displayHours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
      
      return `${year}.${month}.${day} ${period} ${String(displayHours).padStart(2, '0')}:${minutes}`;
    } catch (error) {
      return dateString; // 파싱 실패 시 원본 반환
    }
  };

  const pinnedNotices = notices.filter(notice => notice.isPinned || notice.pinned);
  const regularNotices = notices.filter(notice => !notice.isPinned && !notice.pinned);

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3 text-muted">공지사항을 불러오는 중...</p>
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
                onClick={() => fetchNotices(currentPage, searchTerm, sortBy, filterBy)}
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
            <h2 className="h3 mb-0 text-gray-800 font-weight-bold">공지사항</h2>
            <button 
              className="btn btn-primary"
              onClick={handleCreateNotice}
              style={{
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                borderRadius: '0.35rem',
                padding: '0.5rem 1rem'
              }}
            >
              게시글 작성
            </button>
          </div>

          {/* 검색 및 필터 섹션 */}
          <div className="card shadow mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h6 className="font-weight-bold text-primary mb-2">등록된 공지사항</h6>
                </div>
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-4">
                      <select 
                        className="form-control form-control-sm"
                        value={sortBy}
                        onChange={handleSortChange}
                        style={{ fontSize: '14px' }}
                      >
                        <option value="latest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="views">조회수순</option>
                      </select>
                    </div>
                    <div className="col-md-5">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="공지사항 검색"
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                    <div className="col-md-3">
                      <select 
                        className="form-control form-control-sm"
                        value={filterBy}
                        onChange={handleFilterChange}
                        style={{ fontSize: '14px' }}
                      >
                        <option value="all">전체</option>
                        <option value="중요">중요</option>
                        <option value="공지">공지</option>
                        <option value="일반">일반</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 공지사항 목록 */}
          <div className="card shadow">
            <div className="card-body p-0">
              {/* 중요 공지사항 (상단 고정) */}
              {pinnedNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  className="notice-item border-bottom"
                  style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: '#fff8e1',
                    borderLeft: '4px solid #ff9800',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fff3c4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#fff8e1'}
                  onClick={() => handleNoticeClick(notice.id)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <span className="badge badge-warning mr-2" style={{ fontSize: '11px' }}>
                          📌 고정
                        </span>
                        <h6 className="mb-0 text-dark font-weight-bold" style={{ fontSize: '15px' }}>
                          {notice.title}
                        </h6>
                      </div>
                      <div className="d-flex align-items-center text-muted" style={{ fontSize: '13px' }}>
                        <span className="mr-3">
                          <i className="fas fa-user mr-1"></i>
                          {notice.author || notice.createdBy}
                        </span>
                        <span className="mr-3">
                          <i className="fas fa-clock mr-1"></i>
                          {formatDate(notice.createdAt || notice.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary font-weight-bold" style={{ fontSize: '16px' }}>
                        {(notice.views || notice.viewCount || 0).toLocaleString()}
                      </div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        조회수
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 일반 공지사항 */}
              {regularNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  className="notice-item border-bottom"
                  style={{
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  onClick={() => handleNoticeClick(notice.id)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <span 
                          className={`badge mr-2`}
                          style={{ 
                            fontSize: '11px',
                            backgroundColor: notice.category === '중요' ? '#dc3545' : 
                                           notice.category === '공지' ? '#007bff' : '#6c757d',
                            color: 'white'
                          }}
                        >
                          {notice.category || notice.type || '일반'}
                        </span>
                        <h6 className="mb-0 text-dark" style={{ fontSize: '15px' }}>
                          {notice.title}
                        </h6>
                      </div>
                      <div className="d-flex align-items-center text-muted" style={{ fontSize: '13px' }}>
                        <span className="mr-3">
                          <i className="fas fa-user mr-1"></i>
                          {notice.author || notice.createdBy}
                        </span>
                        <span className="mr-3">
                          <i className="fas fa-clock mr-1"></i>
                          {formatDate(notice.createdAt || notice.date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary font-weight-bold" style={{ fontSize: '16px' }}>
                        {(notice.views || notice.viewCount || 0).toLocaleString()}
                      </div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        조회수
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {notices.length === 0 && (
                <div className="text-center py-5">
                  <div className="text-muted">
                    <i className="fas fa-search fa-2x mb-3"></i>
                    <p>등록된 공지사항이 없습니다.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
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
                  
                  {/* 페이지 번호들 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
          )}
        </div>
      </div>
    </div>
  );
};

export default List;