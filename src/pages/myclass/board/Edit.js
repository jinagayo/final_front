import React, { useState, useEffect } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
const BoardEdit = () => {
  const { classId, boardId } = useParams();
  const { boardnum } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    boardnum: ''
  });
  
    // Froala Editor 설정
  const froalaConfig = {
    placeholderText: '게시글 내용을 입력하세요',
    charCounterCount: true,
    charCounterMax: 10000,
    height: 300,
    toolbarButtons: {
      'moreText': {
        'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'textColor', 'backgroundColor', 'clearFormatting']
      },
      'moreParagraph': {
        'buttons': ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOLSimple', 'formatUL', 'outdent', 'indent']
      },
      'moreRich': {
        'buttons': ['insertLink', 'insertImage', 'insertTable', 'insertHR']
      },
      'moreMisc': {
        'buttons': ['undo', 'redo', 'fullscreen', 'html']
      }
    }
  };
    // Froala Editor 내용 변경 처리
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };
  // 원본 데이터 (취소 시 비교용)
  const [originalData, setOriginalData] = useState({});
  
  const currentBoardnum = new URLSearchParams(window.location.search).get('boardnum') || 'BOD002';
  console.log("boardId:" + boardId);
  console.log("boardnum" + boardnum);
  useEffect(() => {
    fetchPostData();
  }, [boardId]);

  // 기존 게시글 데이터 가져오기
  const fetchPostData = async () => {
    try {
      setLoading(true);
      
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
      
      const response = await fetch(`http://localhost:8080/api/myclass/board/edit/${classId}/${boardId}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('수정 권한이 없습니다.');
        } else if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        } else if (response.status === 404) {
          throw new Error('게시글을 찾을 수 없습니다.');
        } else {
          throw new Error(`서버 오류: ${response.status}`);
        }
      }
      
      const apiResponse = await response.json();
      
      if (apiResponse.success) {
        const postData = {
          title: apiResponse.data.title || apiResponse.data.subject || '',
          content: apiResponse.data.content || '',
          boardnum: apiResponse.data.boardnum || currentBoardnum
        };
        
        setFormData(postData);
        setOriginalData(postData);
      } else {
        throw new Error(apiResponse.message || '데이터를 불러올 수 없습니다.');
      }
      
    } catch (err) {
      setError(err.message);
      console.error('게시글 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return false;
    }
    
    if (formData.title.length > 200) {
      alert('제목은 200자 이내로 입력해주세요.');
      return false;
    }
    
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return false;
    }
    
    if (formData.content.length > 10000) {
      alert('내용은 10,000자 이내로 입력해주세요.');
      return false;
    }
    
    return true;
  };

  // 변경사항 확인
  const hasChanges = () => {
    return formData.title !== originalData.title || 
           formData.content !== originalData.content;
  };

  // 수정 제출
  const handleSubmit = async (e) => {
    console.log('=== handleSubmit 함수 시작 ===');
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!hasChanges()) {
      alert('변경된 내용이 없습니다.');
      return;
    }
    
    if (!window.confirm('게시글을 수정하시겠습니까?')) {
      return;
    }
    
    setSaving(true);
    
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
      
      const response = await fetch(`http://localhost:8080/api/myclass/board/edit/${classId}/${boardId}`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          boardnum: formData.boardnum,
          class_id : classId
        })
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('수정 권한이 없습니다.');
        } else if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        } else {
          throw new Error('게시글 수정에 실패했습니다.');
        }
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert('게시글이 수정되었습니다.');
        // 상세 페이지로 이동
        navigate(`/myclass/board/detail/${classId}/${boardId}?boardNum=${currentBoardnum}`);
      } else {
        throw new Error(result.message || '게시글 수정에 실패했습니다.');
      }
      
    } catch (err) {
      alert(err.message);
      console.error('게시글 수정 오류:', err);
    } finally {
      setSaving(false);
    }
  };    

  // 취소 처리
  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('변경된 내용이 있습니다. 정말로 취소하시겠습니까?')) {
        navigate(`/myclass/board/detail/${classId}/${boardId}?boardNum=${currentBoardnum}`);
      }
    } else {
      navigate(`/myclass/board/detail/${classId}/${boardId}?boardNum=${currentBoardnum}`);
    }
  };

  // 목록으로 이동
  const handleList = () => {
    if (hasChanges()) {
      if (window.confirm('변경된 내용이 있습니다. 정말로 목록으로 이동하시겠습니까?')) {
        navigate(`/myclass/board/list/${classId}?boardNum=${currentBoardnum}`);
      }
    } else {
      navigate(`/myclass/board/list/${classId}?boardNum=${currentBoardnum}`);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
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
          <button className="btn btn-secondary mt-2" onClick={() => navigate(-1)}>
            이전 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <h1 className="mt-4">게시물 수정</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/board/list">게시판</a>
        </li>
        <li className="breadcrumb-item">
          <a href={`/board/detail/${boardId}`}>상세보기</a>
        </li>
        <li className="breadcrumb-item active">수정</li>
      </ol>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-edit me-1"></i>
          게시물 수정
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* 제목 입력 */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                제목 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="제목을 입력해주세요 (최대 200자)"
                maxLength="200"
                disabled={saving}
                required
              />
              <div className="form-text">
                {formData.title.length}/200자
              </div>
            </div>

            {/* 내용 입력 */}
            <div className="mb-3">
              <label htmlFor="content" className="form-label">내용 <span className="text-danger">*</span></label>
              <div id="editor">
                <FroalaEditorComponent
                  tag='textarea'
                  config={froalaConfig}
                  model={formData.content}
                  onModelChange={handleContentChange}
                />
              </div>
            </div>

            {/* 변경사항 알림 */}
            {hasChanges() && (
              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                변경된 내용이 있습니다. 수정 버튼을 클릭하여 저장하세요.
              </div>
            )}

            {/* 버튼 그룹 */}
            <div className="d-flex justify-content-between">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={handleList}
                disabled={saving}
              >
                <i className="fas fa-list me-1"></i>
                목록
              </button>
              
              <div>
                <button 
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <i className="fas fa-times me-1"></i>
                  취소
                </button>
                
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !hasChanges()}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      수정 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      수정 완료
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 미리보기 카드 */}
      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-eye me-1"></i>
          미리보기
        </div>
        <div className="card-body">
          <h5 className="card-title">
            {formData.title || '제목을 입력해주세요'}
          </h5>
          <hr />
          <div className="card-text" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
            {formData.content || '내용을 입력해주세요'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardEdit;