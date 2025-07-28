import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const BoardDetail = () => {
  const { boardId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentBoardnum = new URLSearchParams(window.location.search).get('boardnum') || 'BOD002';
  useEffect(() => {
    fetchPostDetail();
  }, [boardId]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      
      // 여러 방법으로 토큰 확인
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      console.log('사용할 토큰:', token ? '토큰 존재' : '토큰 없음'); // 디버깅용
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('요청 헤더:', headers); // 디버깅용
      console.log('요청 URL:', `http://localhost:8080/detail/${boardId}`); // 디버깅용
      
      const response = await fetch(`http://localhost:8080/board/detail/${boardId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include' // 쿠키 기반 인증인 경우
      });
      
      console.log('응답 상태:', response.status); // 디버깅용
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('접근 권한이 없습니다. 로그인 상태를 확인해주세요.');
        } else if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        } else if (response.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.');
        } else {
          throw new Error(`서버 오류: ${response.status}`);
        }
      }
      
      const apiResponse = await response.json();
      console.log('API 응답:', apiResponse); // 디버깅용
      
      if (apiResponse.success) {
        setPost(apiResponse.data);
      } else {
        throw new Error(apiResponse.message || '데이터를 불러올 수 없습니다.');
      }
      
      setLoading(false);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('API 호출 오류:', err);
    }
  };

  const handleList = () => {
    window.location.href = `/board/list?boardnum=${currentBoardnum}`;
  };

  const handleEdit = () => {
    window.location.href = `/board/edit/${boardId}`;
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`http://localhost:8080/board/${boardId}`, { 
          method: 'DELETE',
          headers: headers,
          credentials: 'include'
        });
        
        if (response.ok) {
          alert('삭제되었습니다.');
          window.location.href = `/board/list?boardnum=${currentBoardnum}`;
        } else {
          throw new Error('삭제에 실패했습니다.');
        }
      } catch (err) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-4">
        <div className="alert alert-danger" role="alert">
          {error}
          <br />
          <button className="btn btn-secondary mt-2" onClick={handleList}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-fluid px-4">
        <div className="alert alert-warning" role="alert">
          게시물을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <h1 className="mt-4">게시물 상세</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/board/list">게시판</a>
        </li>
        <li className="breadcrumb-item active">상세보기</li>
      </ol>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <i className="fas fa-file-alt me-1"></i>
            게시물 정보
          </div>
          <div>
            <small className="text-muted">조회수: {post.views || 0}</small>
          </div>
        </div>
        <div className="card-body">
          {/* 게시물 제목 */}
          <div className="row mb-3">
            <div className="col-12">
              <h3 className="mb-0">{post.title || post.subject}</h3>
            </div>
          </div>

          {/* 게시물 메타 정보 */}
          <div className="row mb-4">
            <div className="col-md-6">
              <small className="text-muted">
                <i className="fas fa-user me-1"></i>
                작성자: {post.author || post.writer}
              </small>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                <i className="fas fa-calendar me-1"></i>
                작성일: {post.createdAt || post.regdate}
              </small>
            </div>
          </div>

          <hr />

          {/* 게시물 내용 */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="content-area" style={{ minHeight: '200px', lineHeight: '1.6' }}>
                {post.content ? post.content.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">
                    {line || '\u00A0'}
                  </p>
                )) : <p>내용이 없습니다.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-secondary"
              onClick={handleList}
            >
              <i className="fas fa-list me-1"></i>
              목록
            </button>
            
            <div>
              <button 
                className="btn btn-primary me-2"
                onClick={handleEdit}
              >
                <i className="fas fa-edit me-1"></i>
                수정
              </button>
              &nbsp;&nbsp;&nbsp;
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <i className="fas fa-trash me-1"></i>
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;