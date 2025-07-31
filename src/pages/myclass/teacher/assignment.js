import React, { useState, useEffect } from 'react';

const TAssignmentForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // URL에서 classId 추출
  const getClassIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('class_id');
  };

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path;
  };

  useEffect(() => {
    fetchClassInfo();
  }, []);

  // 강의 정보 가져오기
  const fetchClassInfo = async () => {
    try {
      setLoading(true);
      const classId = getClassIdFromUrl();
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data);
      } else {
        console.error('강의 정보 가져오기 실패');
        alert('강의 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('강의 정보 가져오기 오류:', error);
      alert('강의 정보를 불러오는 중 오류가 발생했습니다.');
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

  // 폼 검증
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('과제 제목을 입력해주세요.');
      return false;
    }
    if (!formData.content.trim()) {
      alert('과제 내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  // 과제 생성 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      const classId = getClassIdFromUrl();

      const requestData = {
        classId: parseInt(classId),
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: 'MET002' // 과제 타입
      };

      const response = await fetch(`http://localhost:8080/api/myclass/teacher/assignmentForm`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('과제가 성공적으로 등록되었습니다.');
        // 강의 상세 페이지로 이동
        navigate(`/myclass/teacher/classDetail?class_id=${classId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '과제 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('과제 등록 오류:', error);
      alert(error.message || '과제 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">강의 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* 뒤로가기 버튼 */}
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(`/myclass/teacher/classDetail?class_id=${getClassIdFromUrl()}`)}
        >
          <i className="fas fa-arrow-left mr-1"></i> 강의 상세로 돌아가기
        </button>
      </div>

      {/* 헤더 */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <div className="assignment-icon mr-3">
                  <i className="fas fa-clipboard-list fa-2x text-warning"></i>
                </div>
                <div>
                  <h2 className="h4 mb-1 text-gray-800">과제 등록</h2>
                  <p className="text-muted mb-0">
                    <i className="fas fa-chalkboard-teacher mr-1"></i>
                    {classData?.name || '강의명'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-right">
              <span className="badge badge-warning badge-pill">
                <i className="fas fa-clipboard-list mr-1"></i>과제
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 과제 등록 폼 */}
      {/* Changed 'justify-content-center' to an empty string and 'col-lg-8' to 'col-lg-12' */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-edit mr-2"></i>과제 정보 입력
              </h5>
            </div>
            <div className="card-body">
              <div>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    <i className="fas fa-heading mr-1"></i>과제 제목 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="과제 제목을 입력하세요"
                    maxLength="255"
                  />
                  <small className="form-text text-muted">
                    {formData.title.length}/255자
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="content" className="form-label">
                    <i className="fas fa-align-left mr-1"></i>과제 내용 <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    rows="12"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="과제 내용을 상세히 입력하세요.&#10;&#10;예시:&#10;- 과제 목표: ...&#10;- 제출 방법: ...&#10;- 평가 기준: ...&#10;- 주의사항: ..."
                    maxLength="255"
                  />
                  <small className="form-text text-muted">
                    {formData.content.length}/255자
                  </small>
                </div>

                <div className="form-actions">
                  <hr />
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/myclass/teacher/classDetail?class_id=${getClassIdFromUrl()}`)}
                    >
                      <i className="fas fa-times mr-1"></i>취소
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={handleSubmit}
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1"></i>등록 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-1"></i>과제 등록
                        </>
                      )}
                    </button>
                  </div>
                </div>
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

        .badge-outline-warning {
          background-color: transparent !important;
          border: 1px solid #ffc107;
          color: #ffc107;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-control:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
        }

        .text-gray-500 {
          color: #6b7280 !important;
        }

        .text-gray-800 {
          color: #1f2937 !important;
        }

        .form-actions {
          margin-top: 2rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        textarea.form-control {
          resize: vertical;
          min-height: 300px;
        }

        .card-header {
          background-color: #f8f9fc;
          border-bottom: 1px solid #e3e6f0;
        }

        .form-switch .form-check-input {
          width: 2.5rem;
          margin-left: -2.75rem;
        }
      `}</style>
    </div>
  );
};

export default TAssignmentForm;