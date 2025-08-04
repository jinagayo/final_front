// components/search/SimpleSearchComponent.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const SimpleSearchComponent = ({ 
  onResultSelect, 
  placeholder = "강의, 강사, 게시글 검색...",
  className = "",
  maxResults = 8
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  // 백엔드 API 호출 함수
  const searchAPI = async (query) => {
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}&limit=${maxResults}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.results || [];
      } else {
        throw new Error(data.message || '검색 실패');
      }
    } catch (error) {
      console.error('검색 API 오류:', error);
      throw error;
    }
  };

  // 통합 검색 함수
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      // 백엔드 API 호출
      const results = await searchAPI(query.trim());
      
      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // 디바운싱을 위한 타이머
  const [debounceTimer, setDebounceTimer] = useState(null);

  // 입력 변화 처리 (디바운싱 적용)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // 이전 타이머 취소
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // 새 타이머 설정 (300ms 지연)
    const newTimer = setTimeout(() => {
      if (value.trim()) {
        handleSearch(value);
      } else {
        setSearchResults([]);
        setShowResults(false);
        setError(null);
      }
    }, 300);
    
    setDebounceTimer(newTimer);
  };

  // 검색 실행 (Enter 키 또는 검색 버튼)
const executeSearch = () => {
  if (searchQuery.trim()) {
    setShowResults(false);
    
    // 🔥 첫 번째 검색 결과가 있으면 그것으로 이동
    if (searchResults.length > 0) {
      if (onResultSelect) {
        onResultSelect(searchResults[0]); // 첫 번째 결과로 이동
      }
    } else {
      // 검색 결과가 없으면 전체 검색 페이지로 이동
      if (onResultSelect) {
        onResultSelect({
          type: 'fullSearch',
          query: searchQuery.trim()
        });
      }
    }
  }
};

  // 키보드 이벤트 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // 결과 항목 클릭 처리
  const handleResultClick = (item) => {
    console.log('검색 결과 선택:', item);
    setSearchQuery('');
    setShowResults(false);
    
    if(item.type === 'class'){
      navigate(`/admin/class/Detail/${item.id}`)
    }else if(item.type === 'board'){
      navigate(`/board/detail/${item.id}`)
    }else if(item.type === 'coding'){
      navigate(`/admin/coding/detail/${item.id}`)
    }
    if (onResultSelect) {
      onResultSelect(item);
    }
  };

  // 외부 클릭 시 결과 숨김
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // 타입별 아이콘 반환
  const getTypeIcon = (type) => {
    switch (type) {
      case 'class': return '📚';
      case 'coding': return '👨‍🏫';
      case 'board': return '📝';
      default: return '🔍';
    }
  };

  // 타입별 배지 반환
  const getTypeBadge = (type) => {
    const badges = {
      class: { class: 'bg-primary', text: '강의' },
      coding: { class: 'bg-success', text: '코딩문제' },
      board: { class: 'bg-info', text: '게시글' }
    };
    
    const badge = badges[type] || { class: 'bg-secondary', text: '기타' };
    return (
      <span className={`badge ${badge.class} text-white`} style={{ fontSize: '10px' }}>
        {badge.text}
      </span>
    );
  };

  // 검색어 하이라이트
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} style={{ backgroundColor: '#fff3cd', fontWeight: 'bold' }}>{part}</span> : 
        part
    );
  };

  // 결과 항목 렌더링
  const renderResultItem = (item) => {
    return (
      <div
        key={`${item.type}-${item.id}`}
        className="px-3 py-2 border-bottom search-result-item"
        onClick={() => handleResultClick(item)}
        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
      >
        <div className="d-flex align-items-start">
          <span className="mr-2 mt-1" style={{ fontSize: '18px' }}>
            {getTypeIcon(item.type)}
          </span>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="font-weight-bold text-dark mr-2" style={{ fontSize: '14px' }}>
                {highlightSearchTerm(
                  item.title && item.title.length > 40 ? `${item.title.substring(0, 40)}...` : item.title || '제목 없음',
                  searchQuery
                )}
              </span>
              {getTypeBadge(item.type)}
            </div>
            
            {/* 타입별 상세 정보 */}
            {item.type === 'class' && (
              <div className="text-muted" style={{ fontSize: '12px' }}>
                <div>
                  강사: {item.teacher_name ? highlightSearchTerm(item.teacher_name, searchQuery) : '정보 없음'}
                  {item.category && ` • ${item.category}`}
                </div>
                <div>
                  {item.rating && `⭐ ${item.rating}`}
                  {item.price && ` • ₩${item.price.toLocaleString()}`}
                </div>
              </div>
            )}
            
            {item.type === 'coding' && (
              <div className="text-muted" style={{ fontSize: '12px' }}>
                <div>
                  {item.language && `언어: ${item.language}`}
                  {item.level && ` • 난이도: ${item.level}`}
                  {item.field && ` • 분야: ${item.field}`} {/* filed → field */}
                </div>
                {item.question && (
                  <div className="mt-1" style={{ color: '#666' }}>
                    {highlightSearchTerm(
                      item.question.length > 60 ? `${item.question.substring(0, 60)}...` : item.question,
                      searchQuery
                    )}
                  </div>
                )}
              </div>
            )}
            
            {item.type === 'board' && (
              <div className="text-muted" style={{ fontSize: '12px' }}>
                <div>
                  {item.boardType || '게시글'}
                  {item.author && ` • ${highlightSearchTerm(item.author, searchQuery)}`}
                  {item.date && ` • ${item.date}`}
                </div>
                {item.excerpt && (
                  <div className="mt-1" style={{ color: '#666' }}>
                    {highlightSearchTerm(
                      item.excerpt.length > 60 ? `${item.excerpt.substring(0, 60)}...` : item.excerpt,
                      searchQuery
                    )}
                  </div>
                )}
                <div>
                  {item.views && `👁 ${item.views}`}
                  {item.replies && ` • 💬 ${item.replies}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`position-relative ${className}`} ref={searchRef}>
      {/* 검색 입력 영역 */}
      <div className="d-none d-sm-flex navbar-search mr-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control bg-light border-0 small"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => searchQuery && setShowResults(true)}
            style={{ minWidth: '300px', fontSize: '14px' }}
          />
          <div className="input-group-append">
            <button 
              className="btn btn-primary" 
              type="button"
              onClick={executeSearch}
              disabled={isSearching}
              style={{ border: 'none' }}
            >
              {isSearching ? (
                <div className="spinner-border spinner-border-sm text-white" role="status">
                  <span className="sr-only">검색 중...</span>
                </div>
              ) : (
                <i className="fas fa-search fa-sm" style={{ color: 'white' }}></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 검색 결과 드롭다운 */}
      {showResults && (
        <div 
          className="position-absolute bg-white border rounded shadow-lg search-results"
          style={{ 
            top: '100%', 
            left: '0',
            right: '0', 
            zIndex: 1000,
            maxHeight: '500px',
            overflowY: 'auto',
            minWidth: '400px',
            marginTop: '5px'
          }}
        >
          {/* 에러 표시 */}
          {error && (
            <div className="px-3 py-3 text-center">
              <div className="text-danger" style={{ fontSize: '14px' }}>
                ⚠️ 검색 중 오류가 발생했습니다
              </div>
              <small className="text-muted">{error}</small>
            </div>
          )}

          {/* 검색 결과 표시 */}
          {!error && searchResults.length > 0 && (
            <>
              <div className="px-3 py-2 border-bottom bg-light">
                <small className="text-muted font-weight-bold">
                  검색 결과 {searchResults.length}개
                </small>
              </div>
              
              {searchResults.slice(0, maxResults).map(renderResultItem)}
              
              {searchResults.length > maxResults && (
                <div className="px-3 py-2 text-center border-top">
                  <button 
                    className="btn btn-link btn-sm text-primary p-0"
                    onClick={executeSearch}
                    style={{ textDecoration: 'none' }}
                  >
                    모든 검색 결과 보기 ({searchResults.length}개) →
                  </button>
                </div>
              )}
            </>
          )}

          {/* 검색 결과 없음 */}
          {!error && searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="px-3 py-4 text-center text-muted">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px' }}>'{searchQuery}'에 대한 검색 결과가 없습니다.</div>
              <small style={{ fontSize: '12px' }}>다른 키워드로 검색해보세요.</small>
            </div>
          )}

          {/* 로딩 상태 */}
          {isSearching && (
            <div className="px-3 py-4 text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="sr-only">검색 중...</span>
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: '14px' }}>
                검색 중...
              </div>
            </div>
          )}
        </div>
      )}

      {/* 모바일용 검색 버튼 */}
      <button 
        className="btn btn-primary d-sm-none"
        type="button"
        onClick={() => {
          const query = prompt('검색어를 입력하세요:');
          if (query) {
            setSearchQuery(query);
            handleSearch(query);
          }
        }}
      >
        <i className="fas fa-search"></i>
      </button>

      {/* CSS 스타일 */}
      <style jsx>{`
        .search-result-item:hover {
          background-color: #f8f9fa !important;
        }
        .search-results {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .search-results::-webkit-scrollbar {
          width: 6px;
        }
        .search-results::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .search-results::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .search-results::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default SimpleSearchComponent;