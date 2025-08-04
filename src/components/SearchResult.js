// components/search/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}&limit=50`);
        
        if (!response.ok) {
          throw new Error('검색 실패');
        }
        
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('검색 실패:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleResultClick = (item) => {
    switch (item.type) {
      case 'course':
        window.location.href = `/course/detail/${item.id}`;
        break;
      case 'instructor':
        window.location.href = `/course/List?instructor=${encodeURIComponent(item.title)}`;
        break;
      case 'board':
        window.location.href = `/board/detail/${item.id}?boardnum=${item.boardType}`;
        break;
      default:
        console.log('알 수 없는 결과:', item);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'instructor': return '👨‍🏫';
      case 'board': return '📝';
      default: return '🔍';
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      course: { class: 'bg-primary', text: '강의' },
      instructor: { class: 'bg-success', text: '강사' },
      board: { class: 'bg-info', text: '게시글' }
    };
    
    const badge = badges[type] || { class: 'bg-secondary', text: '기타' };
    return (
      <span className={`badge ${badge.class} text-white`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">검색 중...</span>
          </div>
          <p className="mt-3">검색 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>검색 오류</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">검색 결과: "{query}"</h2>
          <p className="text-muted mb-4">{results.length}개의 검색 결과</p>
          
          {results.length > 0 ? (
            <div className="row">
              {results.map((item) => (
                <div key={`${item.type}-${item.id}`} className="col-md-6 col-lg-4 mb-4">
                  <div 
                    className="card h-100 shadow-sm"
                    onClick={() => handleResultClick(item)}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <span className="mr-2" style={{ fontSize: '20px' }}>
                          {getTypeIcon(item.type)}
                        </span>
                        {getTypeBadge(item.type)}
                      </div>
                      
                      <h5 className="card-title">
                        {item.title?.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
                      </h5>
                      
                      {/* 타입별 상세 정보 */}
                      {item.type === 'course' && (
                        <div className="text-muted">
                          <p>강사: {item.instructor}</p>
                          <p>⭐ {item.rating} • 수강생 {item.students?.toLocaleString()}명</p>
                          <p className="text-primary font-weight-bold">₩{item.price?.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {item.type === 'instructor' && (
                        <div className="text-muted">
                          <p>전문분야: {item.speciality}</p>
                          <p>⭐ {item.rating} • 강의 {item.courses}개</p>
                        </div>
                      )}
                      
                      {item.type === 'board' && (
                        <div className="text-muted">
                          <p>{item.boardType} • {item.author}</p>
                          <p>{item.date}</p>
                          {item.excerpt && (
                            <p className="text-secondary">
                              {item.excerpt.length > 80 ? `${item.excerpt.substring(0, 80)}...` : item.excerpt}
                            </p>
                          )}
                          <small>👁 {item.views} • 💬 {item.replies}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-5">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h4>검색 결과가 없습니다</h4>
              <p className="text-muted">다른 키워드로 검색해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;