import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const BoardDetail = () => {
  const { boardId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const currentBoardnum = new URLSearchParams(window.location.search).get('boardnum') || 'BOD002';

  useEffect(() => {
    fetchPostDetail();
    fetchComments();
  }, [boardId]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      console.log('사용할 토큰:', token ? '토큰 존재' : '토큰 없음');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('요청 헤더:', headers);
      console.log('요청 URL:', `http://localhost:8080/detail/${boardId}`);
      
      const response = await fetch(`http://localhost:8080/board/detail/${boardId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      console.log('응답 상태:', response.status);
      
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
      console.log('API 응답:', apiResponse);
      
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

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8080/board/${boardId}/comments`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success) {
          setComments(apiResponse.data || []);
        }
      }
    } catch (err) {
      console.error('댓글 조회 오류:', err);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    
    setCommentLoading(true);
    
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8080/board/${boardId}/comments`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          content: newComment
        })
      });
      
      if (response.ok) {
        setNewComment('');
        await fetchComments(); // 댓글 목록 새로고침
        alert('댓글이 등록되었습니다.');
      } else {
        throw new Error('댓글 등록에 실패했습니다.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  // 댓글 수정 시작
  const handleEditComment = (comment) => {
    setEditingComment(comment.comment_id || comment.id);
    setEditContent(comment.content);
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // 대댓글 작성 시작
  const handleReplyComment = (comment) => {
    setReplyingToComment(comment.comment_id);
    setReplyContent('');
  };

  // 대댓글 작성 취소
  const handleCancelReply = () => {
    setReplyingToComment(null);
    setReplyContent('');
  };

  // 대댓글 작성 제출
  const handleReplySubmit = async (parentCommentId) => {
    if (!replyContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8080/board/${boardId}/comments`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent,
          parentCommentId: parentCommentId
        })
      });
      
      if (response.ok) {
        setReplyingToComment(null);
        setReplyContent('');
        await fetchComments();
        alert('답글이 등록되었습니다.');
      } else {
        throw new Error('답글 등록에 실패했습니다.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 댓글 수정 저장
  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8080/board/comments/${commentId}`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          content: editContent
        })
      });
      
      if (response.ok) {
        setEditingComment(null);
        setEditContent('');
        await fetchComments();
        alert('댓글이 수정되었습니다.');
      } else {
        throw new Error('댓글 수정에 실패했습니다.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:8080/board/comments/${commentId}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        await fetchComments();
        alert('댓글이 삭제되었습니다.');
      } else {
        throw new Error('댓글 삭제에 실패했습니다.');
      }
    } catch (err) {
      alert(err.message);
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

      {/* 게시물 상세 */}
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

      {/* 댓글 섹션 */}
      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-comments me-1"></i>
          댓글 ({comments.length})
        </div>
        <div className="card-body">
          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="mb-3">
              <label htmlFor="newComment" className="form-label">댓글 작성</label>
              <textarea
                id="newComment"
                className="form-control"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력해주세요..."
                disabled={commentLoading}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={commentLoading}
              >
                {commentLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    등록 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-1"></i>
                    댓글 등록
                  </>
                )}
              </button>
            </div>
          </form>

          <hr />

          {/* 댓글 목록 */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-comment-slash fa-2x mb-2"></i>
                <p>등록된 댓글이 없습니다.</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment_id || comment.id} className="comment-item mb-4">
                  {/* 부모 댓글 전체를 감싸는 박스 */}
                  <div className="border rounded p-3 bg-white shadow-sm">
                    {/* 최상위 댓글 */}
                    <div className="main-comment mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="comment-meta">
                          <strong className="me-2">{comment.created_by || comment.author || '익명'}</strong>
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {comment.formattedCreatedAt || 
                             (comment.created_at ? new Date(comment.created_at).toLocaleString() : '')}
                          </small>
                          {comment.updated_at && comment.updated_at !== comment.created_at && (
                            <small className="text-muted ms-2">
                              <i className="fas fa-edit me-1"></i>
                              수정됨
                            </small>
                          )}
                        </div>
                        <div className="comment-actions">
                          {editingComment === (comment.comment_id || comment.id) ? (
                            <div>
                              <button
                                className="btn btn-sm btn-success me-1"
                                onClick={() => handleUpdateComment(comment.comment_id || comment.id)}
                              >
                                <i className="fas fa-check"></i>
                                수정
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={handleCancelEdit}
                              >
                                <i className="fas fa-times"></i>
                                취소
                              </button>
                            </div>
                          ) : (
                            <div>
                              <button
                                className="btn btn-sm btn-outline-secondary me-1"
                                onClick={() => handleReplyComment(comment)}
                              >
                                <i className="fas fa-reply me-1"></i>
                                답글
                              </button>
                              &nbsp;&nbsp;
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleEditComment(comment)}
                              >
                                <i className="fas fa-edit me-1"></i>
                                수정
                              </button>
                              &nbsp;&nbsp;
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteComment(comment.comment_id || comment.id)}
                              >
                                <i className="fas fa-trash me-1"></i>
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="comment-content">
                        {editingComment === (comment.comment_id || comment.id) ? (
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {comment.content}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 대댓글 작성 폼 */}
                    {replyingToComment === (comment.comment_id || comment.id) && (
                      <div className="reply-form mb-3 ps-3 border-start border-3 border-primary">
                        <div className="bg-light rounded p-3">
                          <div className="mb-2">
                            <small className="text-muted">
                              <i className="fas fa-reply me-1"></i>
                              <strong>{comment.created_by || comment.author || '익명'}</strong>님에게 답글 작성
                            </small>
                          </div>
                          <textarea
                            className="form-control mb-2"
                            rows="2"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="답글을 입력해주세요..."
                          />
                          <div className="d-flex justify-content-end">
                            <button
                              className="btn btn-sm btn-secondary me-2"
                              onClick={handleCancelReply}
                            >
                              취소
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleReplySubmit(comment.comment_id || comment.id)}
                            >
                              <i className="fas fa-paper-plane me-1"></i>
                              답글 등록
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 대댓글 목록 - 부모 댓글 박스 안에 포함 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="replies-section">
                        <hr className="my-3" />
                        <div className="replies-header mb-2">
                          <small className="text-muted">
                            <i className="fas fa-comments me-1"></i>
                            답글 {comment.replies.length}개
                          </small>
                        </div>
                        {comment.replies.map((reply, index) => (
                          <div key={reply.comment_id || reply.id} 
                               className={`reply-item ps-3 border-start border-2 border-secondary ${
                                 index < comment.replies.length - 1 ? 'mb-3' : ''
                               }`}>
                            <div className="bg-light rounded p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="reply-meta">
                                  <i className="fas fa-reply text-primary me-2"></i>
                                  <strong className="me-2">{reply.created_by || reply.author || '익명'}</strong>
                                  <small className="text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    {reply.formattedCreatedAt || 
                                     (reply.created_at ? new Date(reply.created_at).toLocaleString() : '')}
                                  </small>
                                  {reply.updated_at && reply.updated_at !== reply.created_at && (
                                    <small className="text-muted ms-2">
                                      <i className="fas fa-edit me-1"></i>
                                      수정됨
                                    </small>
                                  )}
                                </div>
                                <div className="reply-actions">
                                  {editingComment === (reply.comment_id || reply.id) ? (
                                    <div>
                                      <button
                                        className="btn btn-sm btn-success me-1"
                                        onClick={() => handleUpdateComment(reply.comment_id || reply.id)}
                                      >
                                        <i className="fas fa-check"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={handleCancelEdit}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() => handleEditComment(reply)}
                                      >
                                        <i className="fas fa-edit"></i>
                                        수정
                                      </button>
                                      &nbsp;&nbsp;
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteComment(reply.comment_id || reply.id)}
                                      >
                                        <i className="fas fa-trash"></i>
                                        삭제
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="reply-content">
                                {editingComment === (reply.comment_id || reply.id) ? (
                                  <textarea
                                    className="form-control"
                                    rows="2"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                  />
                                ) : (
                                  <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {reply.content}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;