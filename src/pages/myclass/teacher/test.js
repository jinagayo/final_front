import React, { useState, useEffect } from 'react';

const TestCreate = () => {
  const [testInfo, setTestInfo] = useState({
    title: '',
    content: ''
  });
  
  const [questions, setQuestions] = useState([
    {
      probno: 1,
      question: '',
      type: 'TES001', // 객관식
      choice1: '',
      choice2: '',
      choice3: '',
      choice4: '',
      answer: ''
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // URL에서 classId 추출
  const getClassIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('class_id') || '1';
  };

  const navigate = (path) => {
    console.log('Navigate to:', path);
    window.location.href = path;
  };

  // 테스트 기본 정보 변경
  const handleTestInfoChange = (field, value) => {
    setTestInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 문제 추가
  const addQuestion = () => {
    const newQuestion = {
      probno: questions.length + 1,
      question: '',
      type: 'TES001',
      choice1: '',
      choice2: '',
      choice3: '',
      choice4: '',
      answer: ''
    };
    
    setQuestions(prev => [...prev, newQuestion]);
  };

  // 문제 삭제
  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      alert('최소 1개의 문제는 있어야 합니다.');
      return;
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // 문제 번호 재정렬
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      probno: i + 1
    }));
    
    setQuestions(reorderedQuestions);
  };

  // 문제 내용 변경
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    
    // 에러 제거
    if (errors[`question_${index}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`question_${index}_${field}`]: ''
      }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    // 테스트 기본 정보 검사
    if (!testInfo.title.trim()) {
      newErrors.title = '테스트 제목을 입력해주세요.';
    }
    
    if (!testInfo.content.trim()) {
      newErrors.content = '테스트 설명을 입력해주세요.';
    }
    
    // 문제별 검사
    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}_question`] = '문제를 입력해주세요.';
      }
      
      if (question.type === 'TES001') {
        // 객관식 검사
        if (!question.choice1.trim()) newErrors[`question_${index}_choice1`] = '선택지 1을 입력해주세요.';
        if (!question.choice2.trim()) newErrors[`question_${index}_choice2`] = '선택지 2를 입력해주세요.';
        if (!question.choice3.trim()) newErrors[`question_${index}_choice3`] = '선택지 3을 입력해주세요.';
        if (!question.choice4.trim()) newErrors[`question_${index}_choice4`] = '선택지 4를 입력해주세요.';
        
        if (!question.answer || !['1', '2', '3', '4'].includes(question.answer)) {
          newErrors[`question_${index}_answer`] = '정답을 선택해주세요.';
        }
      } else {
        // 주관식 검사
        if (!question.answer.trim()) {
          newErrors[`question_${index}_answer`] = '정답을 입력해주세요.';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 테스트 저장 (2단계 API 호출)
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('입력 내용을 확인해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const classId = getClassIdFromUrl();
      
      // 1단계: Material 생성 (테스트 기본 정보)
      const materialData = {
        classId: classId,
        seq: 1, 
        content: testInfo.content,
        type: 'MET003',
        title: testInfo.title,
        time: testInfo.time
      };
      
      console.log('1단계 - Material 데이터 전송:', materialData);
      
      const materialResponse = await fetch(`http://localhost:8080/api/myclass/teacher/testmaterial`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData)
      });

      if (!materialResponse.ok) {
        const errorData = await materialResponse.json();
        throw new Error(`Material 생성 실패: ${errorData.message || '알 수 없는 오류'}`);
      }

      // Material 생성 응답에서 meter_id 추출
      const materialResult = await materialResponse.json();
      const meterId = materialResult.meterId ; 
      
      console.log('Material 생성 완료, meter_id:', meterId);

      // 2단계: Test 문제들 생성
      const testQuestions = questions.map(question => ({
        meterial_id: meterId,
        probno: question.probno,
        question: question.question,
        type: question.type,
        choice1: question.type === 'TES001' ? question.choice1 : null,
        choice2: question.type === 'TES001' ? question.choice2 : null,
        choice3: question.type === 'TES001' ? question.choice3 : null,
        choice4: question.type === 'TES001' ? question.choice4 : null,
        answer: question.answer
      }));
      
      console.log('2단계 - Test 문제 데이터 전송:', testQuestions);
      
      const testResponse = await fetch(`http://localhost:8080/api/myclass/teacher/testquestions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testQuestions)
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        throw new Error(`Test 문제 생성 실패: ${errorData.message || '알 수 없는 오류'}`);
      }

      console.log('Test 문제 생성 완료');
      alert('테스트가 성공적으로 생성되었습니다.');
      navigate(`/myclass/teacher/classDetail?class_id=${classId}`);
      
    } catch (error) {
      console.error('테스트 생성 오류:', error);
      alert(`테스트 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 미리보기 모드
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="container-fluid">
      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-secondary btn-sm mb-2"
            onClick={() => {
              const classId = getClassIdFromUrl();
              navigate(`/myclass/teacher/classDetail?class_id=${classId}`);
            }}
          >
            <i className="fas fa-arrow-left mr-1"></i> 강의 상세로 돌아가기
          </button>
          <h2 className="h3 text-gray-800">
            <i className="fas fa-file-alt text-danger mr-2"></i>
            새 테스트 만들기
          </h2>
        </div>
        <div>
          <button 
            className={`btn ${previewMode ? 'btn-secondary' : 'btn-outline-secondary'} mr-2`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <i className={`fas ${previewMode ? 'fa-edit' : 'fa-eye'} mr-1`}></i>
            {previewMode ? '편집 모드' : '미리보기'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1"></i>
                저장 중...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-1"></i>
                테스트 저장
              </>
            )}
          </button>
        </div>
      </div>

      {!previewMode ? (
        // 편집 모드
        <>
          {/* 테스트 기본 정보 */}
          <div className="card shadow mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-info-circle mr-2"></i>
                테스트 기본 정보
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">
                      테스트 제목 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      placeholder="예: 1차 중간고사, Java 기초 테스트 등"
                      value={testInfo.title}
                      onChange={(e) => handleTestInfoChange('title', e.target.value)}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">
                      테스트 설명 <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                      rows="3"
                      placeholder="테스트에 대한 간단한 설명을 입력하세요"
                      value={testInfo.content}
                      onChange={(e) => handleTestInfoChange('content', e.target.value)}
                    />
                    {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label font-weight-bold">
                      테스트 시간 <span className="text-danger">*</span>
                    </label>
                    <input
                    type="number"
                    className="form-control"
                    name="time"
                    value={testInfo.time}
                    onChange={(e) => handleTestInfoChange('time', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                   <small className="form-text text-muted">분 단위로 입력해주세요</small>
                    {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 문제 목록 */}
          <div className="card shadow">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-list-ol mr-2"></i>
                문제 목록 ({questions.length}문제)
              </h5>
              <button 
                className="btn btn-success btn-sm"
                onClick={addQuestion}
              >
                <i className="fas fa-plus mr-1"></i>문제 추가
              </button>
            </div>
            <div className="card-body">
              {questions.map((question, index) => (
                <div key={index} className="question-card mb-4 p-4 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <span className="badge badge-primary mr-2">{question.probno}</span>
                      문제 {question.probno}
                    </h6>
                    <div>
                      <select
                        className="form-control form-control-sm d-inline-block mr-2"
                        style={{ width: 'auto' }}
                        value={question.type}
                        onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                      >
                        <option value="TES001">객관식</option>
                        <option value="TES002">주관식</option>
                      </select>
                      {questions.length > 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeQuestion(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 문제 내용 */}
                  <div className="form-group">
                    <label className="form-label font-weight-bold">
                      문제 <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors[`question_${index}_question`] ? 'is-invalid' : ''}`}
                      rows="3"
                      placeholder="문제를 입력하세요"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    />
                    {errors[`question_${index}_question`] && (
                      <div className="invalid-feedback">{errors[`question_${index}_question`]}</div>
                    )}
                  </div>

                  {question.type === 'TES001' ? (
                    // 객관식
                    <>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">선택지 1 <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className={`form-control ${errors[`question_${index}_choice1`] ? 'is-invalid' : ''}`}
                              placeholder="첫 번째 선택지"
                              value={question.choice1}
                              onChange={(e) => handleQuestionChange(index, 'choice1', e.target.value)}
                            />
                            {errors[`question_${index}_choice1`] && (
                              <div className="invalid-feedback">{errors[`question_${index}_choice1`]}</div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">선택지 2 <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className={`form-control ${errors[`question_${index}_choice2`] ? 'is-invalid' : ''}`}
                              placeholder="두 번째 선택지"
                              value={question.choice2}
                              onChange={(e) => handleQuestionChange(index, 'choice2', e.target.value)}
                            />
                            {errors[`question_${index}_choice2`] && (
                              <div className="invalid-feedback">{errors[`question_${index}_choice2`]}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">선택지 3 <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className={`form-control ${errors[`question_${index}_choice3`] ? 'is-invalid' : ''}`}
                              placeholder="세 번째 선택지"
                              value={question.choice3}
                              onChange={(e) => handleQuestionChange(index, 'choice3', e.target.value)}
                            />
                            {errors[`question_${index}_choice3`] && (
                              <div className="invalid-feedback">{errors[`question_${index}_choice3`]}</div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">선택지 4 <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className={`form-control ${errors[`question_${index}_choice4`] ? 'is-invalid' : ''}`}
                              placeholder="네 번째 선택지"
                              value={question.choice4}
                              onChange={(e) => handleQuestionChange(index, 'choice4', e.target.value)}
                            />
                            {errors[`question_${index}_choice4`] && (
                              <div className="invalid-feedback">{errors[`question_${index}_choice4`]}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label font-weight-bold">
                          정답 <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-control ${errors[`question_${index}_answer`] ? 'is-invalid' : ''}`}
                          value={question.answer}
                          onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                        >
                          <option value="">정답을 선택하세요</option>
                          <option value="1">1번</option>
                          <option value="2">2번</option>
                          <option value="3">3번</option>
                          <option value="4">4번</option>
                        </select>
                        {errors[`question_${index}_answer`] && (
                          <div className="invalid-feedback">{errors[`question_${index}_answer`]}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    // 주관식
                    <div className="form-group">
                      <label className="form-label font-weight-bold">
                        정답 <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${errors[`question_${index}_answer`] ? 'is-invalid' : ''}`}
                        rows="2"
                        placeholder="정답을 입력하세요"
                        value={question.answer}
                        onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                      />
                      {errors[`question_${index}_answer`] && (
                        <div className="invalid-feedback">{errors[`question_${index}_answer`]}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // 미리보기 모드
        <div className="card shadow">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-eye mr-2"></i>
              테스트 미리보기
            </h5>
          </div>
          <div className="card-body">
            <div className="test-preview">
              <div className="text-center mb-4">
                <h3 className="text-primary">{testInfo.title || '테스트 제목'}</h3>
                <p className="text-muted">{testInfo.content || '테스트 설명'}</p>
                <hr />
              </div>

              {questions.map((question, index) => (
                <div key={index} className="question-preview mb-4 p-3 border-left border-primary">
                  <h6 className="font-weight-bold mb-3">
                    {question.probno}. {question.question || '문제 내용을 입력하세요'}
                  </h6>

                  {question.type === 'TES001' ? (
                    <div className="choices">
                      <div className="mb-2">① {question.choice1 || '선택지 1'}</div>
                      <div className="mb-2">② {question.choice2 || '선택지 2'}</div>
                      <div className="mb-2">③ {question.choice3 || '선택지 3'}</div>
                      <div className="mb-2">④ {question.choice4 || '선택지 4'}</div>
                      {question.answer && (
                        <div className="mt-2">
                          <small className="text-success font-weight-bold">
                            정답: {question.answer}번
                          </small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="border p-3 bg-light rounded mb-2">
                        <small className="text-muted">주관식 답안 작성란</small>
                        <textarea className="form-control mt-2" rows="3" disabled placeholder="학생이 답안을 작성하는 영역"></textarea>
                      </div>
                      {question.answer && (
                        <small className="text-success font-weight-bold">
                          정답: {question.answer}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .question-card {
          background-color: #f8f9fc;
          transition: all 0.2s ease-in-out;
        }
        
        .question-card:hover {
          background-color: #f1f3ff;
        }
        
        .form-label {
          color: #374151;
          font-size: 0.875rem;
        }
        
        .badge-primary {
          background-color: #4f46e5 !important;
        }
        
        .question-preview {
          background-color: #fff;
        }
        
        .border-left {
          border-left: 4px solid !important;
        }
        
        .border-primary {
          border-color: #007bff !important;
        }
        
        .choices div {
          padding: 8px 12px;
          margin: 4px 0;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #e9ecef;
          transition: all 0.2s ease;
        }
        
        .choices div:hover {
          background-color: #e3f2fd;
          border-left-color: #2196f3;
        }
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
        
        .is-invalid {
          border-color: #dc3545;
        }
        
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding: 0.5rem;
          }
          
          .question-card {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TestCreate;