import React, { useState, useRef } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';
import { useSearchParams, useParams } from 'react-router-dom';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

const BoardWrite = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  
  // URL에서 boardNum 파라미터 읽기 (대소문자 주의!)
  const boardnumFromUrl = searchParams.get('boardNum') || 'BOD002';
  const boardNum = searchParams.get('boardNum') || 'BOD002'; // 쿼리 파라미터에서 가져옴
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    boardnum: boardnumFromUrl, // URL에서 읽은 값으로 초기화
    class_id: classId,
    file: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [file,setFile] = useState(null);

  // 디버깅용 로그
  React.useEffect(() => {
    console.log('URL에서 가져온 boardNum:', boardnumFromUrl);
    console.log('현재 formData.boardnum:', formData.boardnum);
    console.log('classId:', classId);
  }, [boardnumFromUrl, formData.boardnum, classId]);

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
    if(file){
      //파일크기제한(10MB)
      if(file.size > 10*1024*1024){
        alert('파일 크기는 10MB 이하로 업로드해주세요.');
        return;
      }
        setFile(file);
    }
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

      // 서버로 전송할 데이터 준비
      const data = new FormData();
     data.append('title', formData.title.trim());
     data.append('content', formData.content.trim());
     data.append('boardnum', formData.boardnum);
     data.append('class_id', classId);  // class_id는 반드시 string!
     if (file) data.append('file', file); // 파일이 있을 때만

      // 올바른 API 엔드포인트 사용
      const response = await fetch(`http://localhost:8080/api/myclass/board/write/${classId}`, {
        method: 'POST',
        credentials: 'include',
        body: data,
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
        window.location.href = `/myclass/board/list/${classId}?boardNum=${boardNum}`;
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
      window.location.href = `/myclass/board/list/${classId}?boardNum=${formData.boardnum}`;
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
          <a href={`/myclass/board/list/${classId}?boardNum=${formData.boardnum}`}>게시판</a>
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
    </div>
  );
};

export default BoardWrite;