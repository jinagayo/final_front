import React, { useState, useEffect } from 'react';

const AssignmentSubmissions = () => {
  const [assignmentData, setAssignmentData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [comment, setComment] = useState('');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, submitted, not_submitted

  // URL에서 meterial_id 파라미터 추출
  const getMaterialIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meterial_id') || '1';
  };

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path;
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // 제출물 데이터 가져오기
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const materialId = getMaterialIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/AssignmentList?meterial_id=${materialId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // 데이터 구조에 따라 설정
        if (data.length > 0) {
          setAssignmentData(data[0].meterial); // 첫 번째 항목의 과제 정보
          setSubmissions(data);
        }
      } else {
        console.error('제출물 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('제출물 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 저장
  const handleSaveComment = async () => {
    if (!selectedSubmission || !comment.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    try {
      const updatedSubmission = {
        ...selectedSubmission.sub,
        progress: comment.trim()
      };

      const response = await fetch(`http://localhost:8080/api/myclass/teacher/submission/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSubmission)
      });

      if (response.ok) {
        alert('댓글이 저장되었습니다.');
        setCommentModalOpen(false);
        setComment('');
        setSelectedSubmission(null);
        fetchSubmissions(); // 데이터 새로고침
      } else {
        alert('댓글 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('댓글 저장 오류:', error);
      alert('댓글 저장 중 오류가 발생했습니다.');
    }
  };

  // 파일 다운로드
  const handleDownloadFile = (submission) => {
    if (!submission.sub?.content) {
      alert('제출된 파일이 없습니다.');
      return;
    }
    
    // 실제 구현에서는 파일 다운로드 API 호출
    console.log('파일 다운로드:', submission.sub.content);
    
    // 임시로 새 창에서 파일 URL 열기
    if (submission.sub.content.startsWith('http')) {
      window.open(submission.sub.content, '_blank');
    } else {
      // 파일명이나 경로인 경우 다운로드 API 호출
      window.open(`http://localhost:8080/api/files/download/${submission.sub.content}`, '_blank');
    }
  };

  // 댓글 모달 열기
  const openCommentModal = (submission) => {
    setSelectedSubmission(submission);
    setComment(submission.sub?.progress || '');
    setCommentModalOpen(true);
  };

  // 제출 상태에 따른 필터링
  const getFilteredSubmissions = () => {
    switch (filterStatus) {
      case 'submitted':
        return submissions.filter(item => item.sub?.content);
      case 'not_submitted':
        return submissions.filter(item => !item.sub?.content);
      default:
        return submissions;
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

  const getSubmissionStats = () => {
    const submitted = submissions.filter(item => item.sub?.content).length;
    const total = submissions.length;
    return { submitted, total, rate: total > 0 ? ((submitted / total) * 100).toFixed(1) : 0 };
  };

  // 뒤로가기 함수 - assignmentList로 meterial_id와 함께 이동
  const goBack = () => {
    const materialId = getMaterialIdFromUrl();
    window.location.href = `/myclass/teacher/AssignmentList?meterial_id=${materialId}`;
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">과제 제출 현황을 불러오는 중입니다...</p>
      </div>
    );
  }

  const stats = getSubmissionStats();
  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="container-fluid">
      {/* 뒤로가기 버튼 */}
      <div className="mb-3">
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={goBack}
        >
          <i className="fas fa-arrow-left mr-1"></i> 과제 목록으로 돌아가기
        </button>
      </div>

      {/* 과제 정보 카드 */}
      {assignmentData && (
        <div className="card shadow mb-4">
          <div className="card-header bg-warning text-white">
            <div className="d-flex align-items-center">
              <i className="fas fa-clipboard-list fa-lg mr-3"></i>
              <div>
                <h5 className="mb-0">{assignmentData.title}</h5>
                <small>과제 번호: {assignmentData.meterId} | 순서: {assignmentData.seq}</small>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <h6 className="text-gray-800 mb-3">과제 내용</h6>
                <div className="assignment-content p-3 bg-light rounded">
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                    {assignmentData.content || '과제 내용이 없습니다.'}
                  </p>
                </div>
                {assignmentData.detail && (
                  <>
                    <h6 className="text-gray-800 mt-4 mb-3">추가 설명</h6>
                    <div className="assignment-detail p-3 bg-light rounded">
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                        {assignmentData.detail}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="col-md-4">
                <div className="submission-stats">
                  <h6 className="text-gray-800 mb-3">제출 현황</h6>
                  <div className="stats-card p-3 border rounded">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="stat-item">
                          <div className="stat-number text-primary font-weight-bold">{stats.total}</div>
                          <div className="stat-label text-muted small">전체</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="stat-item">
                          <div className="stat-number text-success font-weight-bold">{stats.submitted}</div>
                          <div className="stat-label text-muted small">제출</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="stat-item">
                          <div className="stat-number text-warning font-weight-bold">{stats.rate}%</div>
                          <div className="stat-label text-muted small">제출률</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 제출물 목록 */}
      <div className="card shadow">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-users mr-2"></i>
              학생 제출 현황 ({filteredSubmissions.length})
            </h5>
            <div className="filter-buttons">
              <div className="btn-group" role="group">
                <button 
                  className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilterStatus('all')}
                >
                  전체 ({submissions.length})
                </button>
                <button 
                  className={`btn btn-sm ${filterStatus === 'submitted' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilterStatus('submitted')}
                >
                  제출완료 ({stats.submitted})
                </button>
                <button 
                  className={`btn btn-sm ${filterStatus === 'not_submitted' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilterStatus('not_submitted')}
                >
                  미제출 ({stats.total - stats.submitted})
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-inbox fa-3x text-gray-300 mb-3"></i>
              <p className="text-gray-500">
                {filterStatus === 'submitted' && '제출된 과제가 없습니다.'}
                {filterStatus === 'not_submitted' && '미제출 학생이 없습니다.'}
                {filterStatus === 'all' && '등록된 학생이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="submissions-list">
              {filteredSubmissions.map((item, index) => (
                <div key={item.sub?.metersubId || index} className="submission-item border rounded p-3 mb-3">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <div className="student-info">
                        <div className="d-flex align-items-center">
                          <div className="student-avatar mr-3">
                            <div className="avatar-circle">
                              {item.name ? item.name.charAt(0) : 'S'}
                            </div>
                          </div>
                          <div>
                            <h6 className="mb-1">{item.name || '이름 없음'}</h6>
                            <small className="text-muted">{item.sub?.stdId || 'ID 없음'}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="submission-status">
                        {item.sub?.content ? (
                          <span className="badge badge-success">
                            <i className="fas fa-check mr-1"></i>제출완료
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <i className="fas fa-clock mr-1"></i>미제출
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="submission-actions">
                        {item.sub?.content ? (
                          <button 
                            className="btn btn-sm btn-outline-primary mr-2"
                            onClick={() => handleDownloadFile(item)}
                          >
                            <i className="fas fa-download mr-1"></i>다운로드
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="comment-section">
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => openCommentModal(item)}
                        >
                          <i className="fas fa-comment mr-1"></i>
                          {item.sub?.progress ? '댓글 수정' : '댓글 작성'}
                        </button>
                        {item.sub?.progress && (
                          <div className="mt-1">
                            <small className="text-success">
                              <i className="fas fa-check-circle mr-1"></i>댓글 작성됨
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 기존 댓글 표시 */}
                  {item.sub?.progress && (
                    <div className="mt-3 pt-3 border-top">
                      <div className="existing-comment">
                        <h6 className="text-gray-700 mb-2">
                          <i className="fas fa-comment-dots mr-2"></i>강사 댓글
                        </h6>
                        <div className="comment-content p-2 bg-light rounded">
                          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {item.sub.progress}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 댓글 작성 모달 */}
      {commentModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-comment-edit mr-2"></i>
                  {selectedSubmission?.name}님 과제에 댓글 작성
                </h5>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setCommentModalOpen(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="comment">댓글 내용</label>
                  <textarea
                    id="comment"
                    className="form-control"
                    rows="5"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="학생에게 전달할 피드백을 작성해주세요..."
                  />
                  <small className="form-text text-muted">
                    작성한 댓글은 학생이 확인할 수 있습니다.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setCommentModalOpen(false)}
                >
                  취소
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveComment}
                >
                  <i className="fas fa-save mr-1"></i>저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .assignment-content, .assignment-detail {
          background-color: #f8f9fa;
          border-left: 4px solid #ffc107;
        }
        
        .stats-card {
          background-color: #f8f9fc;
        }
        
        .stat-item {
          padding: 10px 0;
        }
        
        .stat-number {
          font-size: 1.5rem;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .submission-item {
          transition: all 0.2s ease-in-out;
          background-color: #fff;
        }
        
        .submission-item:hover {
          background-color: #f8f9fc;
          border-color: #007bff !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .student-avatar {
          flex-shrink: 0;
        }
        
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .badge {
          padding: 6px 12px;
          font-size: 0.75rem;
        }
        
        .existing-comment {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }
        
        .comment-content {
          background-color: white;
          border: 1px solid #dee2e6;
        }
        
        .modal.show {
          padding-right: 0 !important;
        }
        
        .text-gray-300 {
          color: #d1d5db !important;
        }
        
        .text-gray-500 {
          color: #6b7280 !important;
        }
        
        .text-gray-700 {
          color: #374151 !important;
        }
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
        
        .submissions-list {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .filter-buttons .btn-group {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .submission-status {
          text-align: center;
        }
        
        .submission-actions {
          text-align: center;
        }
        
        .comment-section {
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .submission-item .row {
            flex-direction: column;
          }
          
          .submission-item .col-md-3 {
            margin-bottom: 15px;
            text-align: center;
          }
          
          .student-info .d-flex {
            justify-content: center;
          }
          
          .filter-buttons {
            margin-top: 15px;
          }
          
          .modal-dialog {
            margin: 10px;
          }
        }
        
        .btn-group .btn {
          border-radius: 0;
        }
        
        .btn-group .btn:first-child {
          border-top-left-radius: 0.25rem;
          border-bottom-left-radius: 0.25rem;
        }
        
        .btn-group .btn:last-child {
          border-top-right-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
        
        .submission-item:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default AssignmentSubmissions;