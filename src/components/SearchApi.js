export const searchApi = {
  // 통합 검색 API 호출
  search: async (query, category = 'all', page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        q: query,
        category: category,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`/api/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 인증이 필요한 경우
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('검색 API 오류:', error);
      throw error;
    }
  },

  // 인기 검색어 가져오기
  getPopularKeywords: async () => {
    try {
      const response = await fetch('/api/admin/search/popular', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('인기 검색어 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('인기 검색어 API 오류:', error);
      return { keywords: [] };
    }
  },

  // 검색어 자동완성
  getAutoComplete: async (query) => {
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('자동완성 조회 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('자동완성 API 오류:', error);
      return { suggestions: [] };
    }
  }
};

import { useState, useCallback, useRef } from 'react';
import { searchApi } from '../services/searchApi';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularKeywords, setPopularKeywords] = useState([]);
  
  // 디바운싱을 위한 타이머 ref
  const debounceTimer = useRef(null);

  // 검색 함수
  const search = useCallback(async (query, category = 'all', options = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchApi.search(query, category, options.page, options.limit);
      setResults(data.results || []);
      return data;
    } catch (err) {
      setError(err.message);
      setResults([]);
      console.error('검색 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 디바운싱된 검색 (실시간 검색용)
  const debouncedSearch = useCallback((query, category = 'all', delay = 300) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      search(query, category);
    }, delay);
  }, [search]);

  // 인기 검색어 가져오기
  const fetchPopularKeywords = useCallback(async () => {
    try {
      const data = await searchApi.getPopularKeywords();
      setPopularKeywords(data.keywords || []);
    } catch (err) {
      console.error('인기 검색어 조회 오류:', err);
    }
  }, []);

  // 검색 결과 초기화
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    popularKeywords,
    search,
    debouncedSearch,
    fetchPopularKeywords,
    clearResults
  };
};


// components/SearchComponent.js
import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';

const SearchComponent = ({ 
  onResultSelect, 
  placeholder = "강의, 강사, 게시글 검색...",
  className = "",
  maxResults = 8
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchRef = useRef(null);

  // 커스텀 훅 사용
  const { 
    results, 
    loading, 
    error, 
    popularKeywords, 
    debouncedSearch, 
    search,
    fetchPopularKeywords,
    clearResults 
  } = useSearch();

  // 컴포넌트 마운트 시 인기 검색어 가져오기
  useEffect(() => {
    fetchPopularKeywords();
  }, [fetchPopularKeywords]);

  // 검색 카테고리 옵션
  const searchCategories = [
    { value: 'all', label: '전체', icon: '🔍' },
    { value: 'course', label: '강의', icon: '📚' },
    { value: 'instructor', label: '강사', icon: '👨‍🏫' },
    { value: 'board', label: '게시글', icon: '📝' }
  ];

  // 입력 변화 처리 (실시간 검색)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      debouncedSearch(value, selectedCategory);
      setShowResults(true);
    } else {
      clearResults();
      setShowResults(false);
    }
  };

  // 카테고리 변경 처리
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (searchQuery.trim()) {
      search(searchQuery, category);
    }
  };

  // 검색 실행 (Enter 키 또는 검색 버튼)
  const executeSearch = async () => {
    if (searchQuery.trim()) {
      setShowResults(false);
      
      // 전체 검색 결과 페이지로 이동하거나 콜백 호출
      if (onResultSelect) {
        try {
          const fullResults = await search(searchQuery, selectedCategory, { limit: 100 });
          onResultSelect({
            type: 'fullSearch',
            query: searchQuery,
            category: selectedCategory,
            results: fullResults?.results || []
          });
        } catch (err) {
          console.error('전체 검색 실행 오류:', err);
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
    setSearchQuery('');
    setShowResults(false);
    clearResults();
    
    if (onResultSelect) {
      onResultSelect(item);
    }
  };

  // 인기 검색어 클릭 처리
  const handlePopularKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    search(keyword, selectedCategory);
    setShowResults(true);
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

  // 타입별 아이콘 반환
  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'instructor': return '👨‍🏫';
      case 'board': return '📝';
      default: return '🔍';
    }
  };

  // 타입별 배지 반환
  const getTypeBadge = (type) => {
    const badges = {
      course: { class: 'bg-primary', text: '강의' },
      instructor: { class: 'bg-success', text: '강사' },
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
                  item.title?.length > 40 ? `${item.title.substring(0, 40)}...` : item.title,
                  searchQuery
                )}
              </span>
              {getTypeBadge(item.type)}
            </div>
            
            {/* 타입별 상세 정보 */}
            {item.type === 'course' && (
              <div className="text-muted" style={{ fontSize: '12px' }}>
                <div>강사: {highlightSearchTerm(item.instructor, searchQuery)} • {item.category}</div>
                <div>⭐ {item.rating} • 수강생 {item.students?.toLocaleString()}명 • ₩{item.price?.toLocaleString()}</div>
              </div>
            )}
            
            {item.type === 'instructor' && (
              <div className="text-muted" style={{ fontSize: '12px' }}>
                <div>전문분야: {highlightSearchTerm(item.speciality, searchQuery)}</div>
                <div>⭐ {item.rating} • 강의 {item.courses}개 • 수강생 {item.students?.toLocaleString()}명</div>
              </div>
            )}
            
            {item.type === 'board' && (
              <div className="text-muted" style={{ fontSize: '12px' }}>
                <div>{item.boardType} • {highlightSearchTerm(item.author, searchQuery)} • {item.date}</div>
                {item.excerpt && (
                  <div className="mt-1" style={{ color: '#666' }}>
                    {highlightSearchTerm(
                      item.excerpt.length > 60 ? `${item.excerpt.substring(0, 60)}...` : item.excerpt,
                      searchQuery
                    )}
                  </div>
                )}
                <div>👁 {item.views} • 💬 {item.replies}</div>
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
            onFocus={() => {
              if (searchQuery) setShowResults(true);
              else if (popularKeywords.length > 0) setShowResults(true);
            }}
            style={{ minWidth: '300px', fontSize: '14px' }}
          />
          <div className="input-group-append">
            <button 
              className="btn btn-primary" 
              type="button"
              onClick={executeSearch}
              disabled={loading}
              style={{ border: 'none' }}
            >
              {loading ? (
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
          {/* 오류 표시 */}
          {error && (
            <div className="px-3 py-2 text-danger text-center">
              <small>검색 중 오류가 발생했습니다: {error}</small>
            </div>
          )}

          {/* 검색 결과 */}
          {results.length > 0 ? (
            <>
              <div className="px-3 py-2 border-bottom bg-light">
                <small className="text-muted font-weight-bold">
                  검색 결과 {results.length}개
                </small>
              </div>
              
              {results.slice(0, maxResults).map(renderResultItem)}
              
              {results.length > maxResults && (
                <div className="px-3 py-2 text-center border-top">
                  <button 
                    className="btn btn-link btn-sm text-primary p-0"
                    onClick={executeSearch}
                    style={{ textDecoration: 'none' }}
                  >
                    모든 검색 결과 보기 ({results.length}개) →
                  </button>
                </div>
              )}
            </>
          ) : searchQuery && !loading ? (
            <div className="px-3 py-4 text-center text-muted">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontSize: '14px' }}>'{searchQuery}'에 대한 검색 결과가 없습니다.</div>
              <small style={{ fontSize: '12px' }}>다른 키워드로 검색해보세요.</small>
            </div>
          ) : !searchQuery && popularKeywords.length > 0 ? (
            // 인기 검색어 표시
            <div>
              <div className="px-3 py-2 border-bottom bg-light">
                <small className="text-muted font-weight-bold">인기 검색어</small>
              </div>
              {popularKeywords.slice(0, 5).map((keyword, index) => (
                <div
                  key={index}
                  className="px-3 py-2 border-bottom search-result-item"
                  onClick={() => handlePopularKeywordClick(keyword)}
                  style={{ cursor: 'pointer', fontSize: '14px' }}
                >
                  <span className="text-primary mr-2">#{index + 1}</span>
                  {keyword}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

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

export default SearchComponent;