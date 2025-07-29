import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const List = () => {
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  const [userInfo, setUserInfo] = useState(null);
  const [canCreatePost, setCanCreatePost] = useState(false);
  
  const boardnum = searchParams.get('boardnum') || 'BOD002';
  const currentBoardnum = new URLSearchParams(window.location.search).get('boardnum') || 'BOD002';

  const checkUserPermissions = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/api/user/info', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        setUserInfo(userData);
        
        // 권한에 따른 게시글 작성 가능 여부 결정
        const position = userData.position || userData.data?.position;
        
        // 권한별 작성 가능 여부 설정
        switch(position) {
          case 1: // 학생
            setCanCreatePost(boardnum === 'BOD003' || boardnum === 'BOD001');
            break;
          case 2: // 강사
            setCanCreatePost(boardnum === 'BOD003' || boardnum === 'BOD001');
            break;
          case 3: // 관리자
            setCanCreatePost(true); // 관리자는 모든 게시판 작성 가능
            break;
          default:
            setCanCreatePost(false);
        }
      } else {
        console.log('사용자 정보 조회 실패');
        setCanCreatePost(false);
      }
    } catch (error) {
      console.error('권한 확인 오류:', error);
      setCanCreatePost(false);
    }
  };

  const fetchNotices = async () => {
    try {
      const url = `http://localhost:8080/board/list?boardnum=${boardnum}&page=${currentPage}&size=10&search=${encodeURIComponent(searchTerm)}&sortBy=${sortBy}&filterBy=${filterBy}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setNotices(data.data || []);
        setTotalPages(data.totalPage || 1);
        setLoading(false);
      } else {
        setError(data.message);
        setLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    checkUserPermissions(); // 🔥 권한 확인
    fetchNotices(currentPage, searchTerm, sortBy, filterBy);
  }, [currentPage, sortBy, filterBy]);

  // 검색어 변경 시 디바운싱 적용
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
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

  const handleNoticeClick = async (noticeId) => {
    try {
      await fetch(`http://localhost:8080/board/notices/${noticeId}/view`, {
        method: 'POST',
        credentials: 'include'
      });
      
      window.location.href = `/board/detail/${noticeId}?boardnum=${currentBoardnum}`;
    } catch (error) {
      window.location.href = `/board/detail/${noticeId}?boardnum=${currentBoardnum}`;
    }
  };

  // 🔥 게시글 작성 버튼 클릭 처리
  const handleCreateNotice = () => {
    if (!canCreatePost) {
      alert('게시글 작성 권한이 없습니다.');
      return;
    }
    window.location.href = `/board/write?boardnum=${currentBoardnum}`;
  };

  // 🔥 권한별 버튼 텍스트 및 스타일 결정
  const getButtonConfig = () => {
    if (!userInfo) {
      return {
        text: '로그인 필요',
        disabled: true,
        style: {
          backgroundColor: '#6c757d',
          borderColor: '#6c757d',
          cursor: 'not-allowed'
        }
      };
    }

    if (!canCreatePost) {
      const position = userInfo.position || userInfo.data?.position;
      let reasonText = '';
      
      switch(position) {
        case 1:
          reasonText = '학생은 게시글 작성 불가';
          break;
        case 2:
          reasonText = '해당 게시판 작성 권한 없음';
          break;
        default:
          reasonText = '작성 권한 없음';
      }

      return {
        text: reasonText,
        disabled: true,
        style: {
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          cursor: 'not-allowed'
        }
      };
    }

    return {
      text: '게시글 작성',
      disabled: false,
      style: {
        backgroundColor: '#4e73df',
        borderColor: '#4e73df',
        cursor: 'pointer'
      }
    };
  };

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
      return dateString;
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

  const buttonConfig = getButtonConfig();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* 헤더 섹션 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 mb-0 text-gray-800 font-weight-bold">공지사항</h2>
              {/* 🔥 사용자 정보 표시 (디버깅용) */}
              {userInfo && (
                <small className="text-muted">
                  사용자: {userInfo.name || userInfo.data?.name} | 
                  권한: {userInfo.position === 1 ? '학생' : userInfo.position === 2 ? '강사' : userInfo.position === 3 ? '관리자' : '알 수 없음'}
                </small>
              )}
            </div>
            
            {/* 🔥 권한별 게시글 작성 버튼 */}
            <button 
              className="btn"
              onClick={handleCreateNotice}
              disabled={buttonConfig.disabled}
              style={{
                ...buttonConfig.style,
                borderRadius: '0.35rem',
                marginTop: '1.5rem',
                padding: '0.5rem 1.5rem',
                color : 'white',
              }}
              title={buttonConfig.disabled ? buttonConfig.text : '게시글을 작성합니다'}
            >
              {buttonConfig.text}
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
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="공지사항 검색"
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

export default List;