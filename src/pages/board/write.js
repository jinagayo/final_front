import React, { useState, useRef } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';

import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

const BoardWrite = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    boardnum: 'BOD001',
    class_id: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

  // URL에서 boardnum 파라미터 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const boardnumFromUrl = urlParams.get('boardnum') || 'BOD001';
  
  React.useEffect(() => {
    console.log('URL에서 가져온 boardnum:', boardnumFromUrl);
    console.log('현재 formData.boardnum:', formData.boardnum);
    setFormData(prev => ({ ...prev, boardnum: boardnumFromUrl }));
  }, [boardnumFromUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Froala Editor 내용 변경 처리
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 인증 토큰 가져오기
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

      // 서버로 전송할 데이터 준비
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        boardnum: formData.boardnum,
        class_id: formData.class_id || null,
        file: formData.file ? formData.file.name : null
      };

      console.log('전송 데이터:', submitData);
      console.log('요청 URL:', `http://localhost:8080/board/write/${formData.boardnum}`);

      const response = await fetch(`http://localhost:8080/board/write/${formData.boardnum}`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('권한이 없습니다. 로그인 상태를 확인해주세요.');
        } else if (response.status === 401) {
          throw new Error('로그인이 필요합니다.');
        } else {
          throw new Error('게시글 작성에 실패했습니다.');
        }
      }

      const result = await response.json();
      console.log('서버 응답:', result);

      if (result.success) {
        alert('게시글이 성공적으로 작성되었습니다.');
        window.location.href = `/board/list?boardnum=${formData.boardnum}`;
      } else {
        throw new Error(result.message || '게시글 작성에 실패했습니다.');
      }

    } catch (err) {
      console.error('게시글 작성 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용이 삭제됩니다.')) {
      window.location.href = `/board/list?boardnum=${formData.boardnum}`;
    }
  };

  const getBoardTitle = (boardnum) => {
    console.log("getBoardTitle + " + boardnum)
    switch (boardnum) {
      case 'BOD002': return '공지사항';
      case 'BOD003': return '자유게시판';
      case 'BOD001': return 'Q&A';
      default: return '게시판';
    }
  };

  return (
    <div className="container-fluid px-4 m-3">
      <h1 className="mt-4">{getBoardTitle(formData.boardnum)} 작성</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href={`/board/list?boardnum=${formData.boardnum}`}>게시판</a>
        </li>
        <li className="breadcrumb-item active">게시글 작성</li>
      </ol>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-pen me-1"></i>
          새 게시글 작성
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* 제목 */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">제목 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="게시글 제목을 입력하세요"
                required
              />
            </div>

            {/* 내용 - Froala Editor */}
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

            {/* 파일 첨부 */}
            <div className="mb-4">
              <label htmlFor="file" className="form-label">파일 첨부</label>
              <input
                type="file"
                className="form-control"
                id="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.hwp,.zip"
              />
              <div className="form-text">
                최대 10MB까지 업로드 가능합니다. (jpg, png, pdf, doc, hwp, zip 등)
              </div>
              {formData.file && (
                <div className="mt-2">
                  <small className="text-success">
                    <i className="fas fa-file me-1"></i>
                    선택된 파일: {formData.file.name} ({Math.round(formData.file.size / 1024)}KB)
                  </small>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, file: null }));
                      fileInputRef.current.value = '';
                    }}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                <i className="fas fa-times me-1"></i>
                취소
              </button>
              
              <div>
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  disabled={loading}
                  onClick={() => {
                    alert('임시저장 기능은 추후 구현 예정입니다.');
                  }}
                >
                  <i className="fas fa-save me-1"></i>
                  임시저장
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      등록 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-1"></i>
                      등록
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 작성 가이드 */}
      <div className="card">
        <div className="card-header">
          <i className="fas fa-info-circle me-1"></i>
          작성 가이드
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>게시글 작성 시 주의사항</h6>
              <ul className="small text-muted">
                <li>제목과 내용은 필수 입력 항목입니다.</li>
                <li>상대방을 배려하는 언어를 사용해주세요.</li>
                <li>광고성 게시글은 삭제될 수 있습니다.</li>
                <li>저작권을 침해하는 내용은 금지됩니다.</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>리치 에디터 사용법</h6>
              <ul className="small text-muted">
                <li>툴바를 사용해 텍스트 서식을 지정하세요.</li>
                <li>이미지와 링크를 삽입할 수 있습니다.</li>
                <li>표와 수평선도 추가 가능합니다.</li>
                <li>HTML 모드로 직접 편집도 가능합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardWrite;