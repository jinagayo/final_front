import React, { useState, useEffect } from 'react';

const StudentAssignmentView = () => {
  const [assignmentData, setAssignmentData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // URL에서 meterial_id 추출
  const getMeterialIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meterial_id') || '1';
  };

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path;
  };

  useEffect(() => {
    fetchAssignmentData();
    fetchSubmissionData();
  }, []);

  // 과제 정보 가져오기
  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const meterialId = getMeterialIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/assignment?meterial_id=${meterialId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignmentData(data);
      } else {
        console.error('과제 정보 가져오기 실패');
        alert('과제 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('과제 정보 가져오기 오류:', error);
      alert('과제 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 제출 상태 확인
  const fetchSubmissionData = async () => {
    try {
      const meterialId = getMeterialIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/student/assignment/${meterialId}/submission`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionData(data);
      } else if (response.status !== 404) {
        console.error('제출 상태 확인 실패');
      }
    } catch (error) {
      console.error('제출 상태 확인 오류:', error);
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하로 업로드해주세요.');
        return;
      }
      setSelectedFile(file);
    }
  };

  // 파일 업로드 및 제출
  const handleSubmitAssignment = async () => {
    if (!selectedFile) {
      alert('제출할 파일을 선택해주세요.');
      return;
    }

    try {
      setSubmitLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('meterial_id', getMeterialIdFromUrl());

      const response = await fetch('http://localhost:8080/api/myclass/student/assignment/submit', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('과제가 성공적으로 제출되었습니다.');
        setSelectedFile(null);
        // 파일 입력 초기화
        const fileInput = document.getElementById('assignmentFile');
        if (fileInput) fileInput.value = '';
        
        // 제출 상태 다시 확인
        await fetchSubmissionData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '과제 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('과제 제출 오류:', error);
      alert(error.message || '과제 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
      setUploadProgress(0);
    }
  };

  // 재제출 처리
  const handleResubmit = async () => {
    if (!selectedFile) {
      alert('재제출할 파일을 선택해주세요.');
      return;
    }

    if (!window.confirm('기존 제출물을 새로운 파일로 교체하시겠습니까?')) {
      return;
    }

    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('meterial_id', getMeterialIdFromUrl());

      const response = await fetch(`http://localhost:8080/api/myclass/student/assignment/resubmit`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('과제가 성공적으로 재제출되었습니다.');
        setSelectedFile(null);
        const fileInput = document.getElementById('assignmentFile');
        if (fileInput) fileInput.value = '';
        
        await fetchSubmissionData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '과제 재제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('과제 재제출 오류:', error);
      alert(error.message || '과제 재제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 파일 다운로드
  const handleDownloadSubmission = () => {
    if (submissionData?.content) {
      const link = document.createElement('a');
      link.href = submissionData.content.startsWith('/uploads/') 
        ? submissionData.content 
        : `/uploads/${submissionData.content}`;
      link.download = submissionData.content.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">과제 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* 뒤로가기 버튼 */}
      <div className="mb-3">
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(`/myclass/student/classDetail?class_id=${assignmentData?.class_id}`)}
        >
          <i className="fas fa-arrow-left mr-1"></i> 강의로 돌아가기
        </button>
      </div>

      {/* 과제 정보 헤더 */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <div className="assignment-icon mr-3">
                  <i className="fas fa-clipboard-list fa-2x text-warning"></i>
                </div>
                <div>
                  <h2 className="h4 mb-1 text-gray-800">{assignmentData?.title}</h2>
                  <p className="text-muted mb-0">
                    <i className="fas fa-chalkboard-teacher mr-1"></i>
                    {assignmentData?.className}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-right">
              <div className="submission-status">
                {submissionData ? (
                  <div>
                    <span className="badge badge-success badge-pill mb-2">
                      <i className="fas fa-check-circle mr-1"></i>제출 완료
                    </span>
                    <br />
                    <small className="text-muted">
                      제출일: {formatDate(submissionData.created_at)}
                    </small>
                  </div>
                ) : (
                  <span className="badge badge-warning badge-pill">
                    <i className="fas fa-clock mr-1"></i>미제출
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* 과제 내용 */}
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-file-alt mr-2"></i>과제 내용
              </h5>
            </div>
            <div className="card-body">
              <div className="assignment-content">
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {assignmentData?.content || '과제 내용이 없습니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 제출된 과제가 있는 경우 */}
          {submissionData && (
            <div className="card shadow mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-upload mr-2"></i>제출한 과제
                </h5>
              </div>
              <div className="card-body">
                <div className="submitted-file">
                  <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-file fa-2x text-primary mr-3"></i>
                      <div>
                        <h6 className="mb-1">{submissionData.content?.split('/').pop()}</h6>
                        <small className="text-muted">
                          제출일: {formatDate(submissionData.created_at)}
                        </small>
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleDownloadSubmission}
                    >
                      <i className="fas fa-download mr-1"></i>다운로드
                    </button>
                  </div>
                  
                  {/* 선생님 코멘트 */}
                  {submissionData.progress && (
                    <div className="teacher-comment">
                      <div className="comment-header mb-2">
                        <i className="fas fa-comment-dots text-info mr-2"></i>
                        <strong>선생님 코멘트</strong>
                      </div>
                      <div className="comment-content p-3 bg-light rounded">
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                          {submissionData.progress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 제출 영역 */}
        <div className="col-lg-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-paper-plane mr-2"></i>
                {submissionData ? '과제 재제출' : '과제 제출'}
              </h5>
            </div>
            <div className="card-body">
              {!submissionData && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle mr-2"></i>
                  과제를 제출하세요.
                </div>
              )}

              <div className="file-upload-section">
                <div className="form-group">
                  <label htmlFor="assignmentFile" className="form-label">
                    <i className="fas fa-paperclip mr-1"></i>
                    {submissionData ? '새 파일 선택' : '파일 선택'} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="assignmentFile"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.hwp,.txt,.zip,.rar,.ppt,.pptx,.xls,.xlsx"
                  />
                  <small className="form-text text-muted">
                    허용 파일: PDF, Word, HWP, TXT, ZIP, RAR, PPT, Excel (최대 10MB)
                  </small>
                </div>

                {selectedFile && (
                  <div className="selected-file-info mb-3">
                    <div className="d-flex align-items-center p-2 border rounded bg-light">
                      <i className="fas fa-file text-success mr-2"></i>
                      <div className="flex-grow-1">
                        <small className="d-block font-weight-bold">{selectedFile.name}</small>
                        <small className="text-muted">{formatFileSize(selectedFile.size)}</small>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedFile(null);
                          const fileInput = document.getElementById('assignmentFile');
                          if (fileInput) fileInput.value = '';
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="upload-progress mb-3">
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress}%` }}
                      >
                        {uploadProgress}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="submit-actions">
                  {submissionData ? (
                    <button
                      className="btn btn-warning btn-block"
                      onClick={handleResubmit}
                      disabled={!selectedFile || submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1"></i>재제출 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-redo mr-1"></i>과제 재제출
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleSubmitAssignment}
                      disabled={!selectedFile || submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1"></i>제출 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-1"></i>과제 제출
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 제출 가이드 */}
              <hr />
              <div className="submission-guide">
                <h6 className="text-muted mb-2">
                  <i className="fas fa-lightbulb mr-1"></i>제출 안내
                </h6>
                <ul className="small text-muted mb-0">
                  <li>파일 크기는 10MB 이하로 제한됩니다</li>
                  <li>제출 후에도 재제출이 가능합니다</li>
                  <li>마지막 제출물만 평가 대상입니다</li>
                  <li>문제 발생 시 담당 선생님께 문의하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .assignment-icon {
          width: 60px;
          height: 60px;
          background-color: #fff3cd;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .submission-status .badge {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
        }
        
        .assignment-content {
          font-size: 1rem;
          color: #374151;
          line-height: 1.7;
        }
        
        .submitted-file {
          background-color: #f8f9fa;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        
        .teacher-comment {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }
        
        .comment-content {
          border-left: 4px solid #17a2b8;
        }
        
        .selected-file-info {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .upload-progress .progress {
          height: 0.5rem;
        }
        
        .file-upload-section .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .text-gray-500 {
          color: #6b7280 !important;
        }
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .card-header {
          background-color: #f8f9fc;
          border-bottom: 1px solid #e3e6f0;
        }
        
        .submission-guide ul {
          padding-left: 1.2rem;
        }
        
        .submission-guide li {
          margin-bottom: 0.3rem;
        }
        
        .alert {
          border: none;
          border-radius: 0.5rem;
        }
        
        .badge-pill {
          border-radius: 50rem;
        }
      `}</style>
    </div>
  );
};

export default StudentAssignmentView;