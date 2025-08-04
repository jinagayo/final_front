import React, { useState, useEffect, useRef } from 'react';

const StudentTestTake = () => {
  // URL에서 meterial_id 추출
  const getMeterialIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meterial_id') || '1';
  };

  // 상태 관리
  const [data, setData] = useState(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useRef를 사용하여 최신 상태값 참조
  const timeLeftRef = useRef(0);
  const isSubmittingRef = useRef(false);

  // timeLeft가 변경될 때마다 ref 업데이트
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // API 데이터 가져오기
  useEffect(() => {
    const fetchTestData = async () => {
      const meterialId = getMeterialIdFromUrl();
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/myclass/test?meterial_id=${meterialId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('로그인이 필요합니다.');
            return;
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const testData = await response.json();
        console.log("테스트 데이터:", testData);
        
        if (testData && testData.title) {
          setData(testData);
          console.log("테스트 데이터 로드 완료");
        } else {
          setError('테스트 데이터를 찾을 수 없습니다.');
        }

      } catch (e) {
        console.error("테스트 데이터를 가져오지 못했습니다:", e);
        setError('테스트 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  // 자동 제출 함수 (useCallback 대신 일반 함수로 정의)
  const handleAutoSubmit = async () => {
    if (isSubmittingRef.current) {
      console.log('이미 제출 중입니다.');
      return;
    }
    
    console.log('시간 종료로 인한 자동 제출 시작');
    alert('시험 시간이 종료되어 자동으로 제출됩니다.');
    await handleSubmit(true);
  };

  // 타이머 효과 - 개선된 버전
  useEffect(() => {
    let timer;
    
    if (testStarted && timeLeft > 0 && !isSubmitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // 시간이 0이 되면 자동 제출
          if (newTime <= 0 && !isSubmittingRef.current) {
            // setTimeout을 사용하여 상태 업데이트 후 자동 제출
            setTimeout(() => {
              handleAutoSubmit();
            }, 100);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [testStarted, timeLeft, isSubmitting]);

  // 시험 시작
  const handleStartTest = () => {
    setShowStartModal(false);
    setTestStarted(true);
    setTimeLeft(data.time * 60); // 분을 초로 변환
  };

  // 답안 변경
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 제출 처리 - 개선된 버전
  const handleSubmit = async (isAutoSubmit = false) => {
    // 이미 제출 중이면 중복 실행 방지
    if (isSubmitting) {
      console.log('이미 제출 중입니다.');
      return;
    }

    if (!isAutoSubmit) {
      const confirmSubmit = window.confirm('정말로 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.');
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      const meterialId = getMeterialIdFromUrl();
      
      // TestSubEntity 형태로 답안 데이터 변환
      const testSubList = data.questions.map((question, index) => ({
        testsubId: 0, // 새로 생성되는 경우 0 (자동 생성)
        testnum: question.testId, // 문제번호 (TEST 테이블의 testid와 매핑)
        studId: null, // 백엔드에서 세션으로부터 가져올 예정
        submit: answers[index] || '', // 제출한 답
        correct: false // 백엔드에서 계산
      }));

      console.log('제출 데이터:', testSubList);

      // API 호출 - List<TestSubDTO>로 직접 전송
      const response = await fetch(`http://localhost:8080/api/myclass/testsubmit?meterial_id=${meterialId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testSubList) // 배열을 직접 전송
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`제출 실패: ${errorData.message || '알 수 없는 오류'}`);
      }

      alert('시험이 성공적으로 제출되었습니다.');
      
      // 제출 성공 후 페이지 이동
      // 1. 뒤로가기 시도
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // 2. 뒤로갈 페이지가 없으면 시험 시작 화면으로 다시 이동 (새로고침)
        window.location.reload();
      }
      
    } catch (error) {
      console.error('제출 오류:', error);
      alert(`제출 중 오류가 발생했습니다: ${error.message}`);
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 모든 타이머 정리
      console.log('컴포넌트 언마운트 - 타이머 정리');
    };
  }, []);

  // 로딩 중일 때
  if (loading && !isSubmitting) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <h4>시험 데이터를 불러오는 중...</h4>
          <p className="text-muted">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 제출 중일 때
  if (isSubmitting) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <i className="fas fa-paper-plane fa-spin fa-3x text-success mb-3"></i>
          <h4>시험을 제출하는 중...</h4>
          <p className="text-muted">잠시만 기다려주세요. 페이지를 새로고침하지 마세요.</p>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h4>오류가 발생했습니다</h4>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary mr-2"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo mr-1"></i>
            다시 시도
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
          >
            <i className="fas fa-arrow-left mr-1"></i>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (!data || !data.questions || data.questions.length === 0) {
    return (
      <div className="no-data-container">
        <div className="no-data-content">
          <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h4>시험 데이터가 없습니다</h4>
          <p className="text-muted mb-4">등록된 시험 문제가 없거나 삭제된 시험입니다.</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
          >
            <i className="fas fa-arrow-left mr-1"></i>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 시험 시작/결과 보기 모달
  if (showStartModal) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h4>
              <i className={`fas ${data.submit ? 'fa-chart-bar' : 'fa-clipboard-check'} mr-2`}></i>
              {data.submit ? '시험 결과 확인' : '시험 시작'}
            </h4>
          </div>
          <div className="modal-body">
            <div className="test-info">
              <h5 className="text-primary mb-3">{data.title}</h5>
              <p className="text-muted mb-3">{data.content}</p>
              
              <div className="info-grid">
                <div className="info-item">
                  <i className="fas fa-clock text-warning"></i>
                  <span>제한시간: {data.time}분</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-question-circle text-info"></i>
                  <span>문제수: {data.questions.length}문제</span>
                </div>
              </div>

              {data.submit ? (
                <div className="alert alert-success mt-4">
                  <i className="fas fa-check-circle mr-2"></i>
                  <strong>시험 완료</strong>
                  <p className="mb-0 mt-2">이미 시험을 완료하셨습니다. 결과를 확인하실 수 있습니다.</p>
                </div>
              ) : (
                <div className="alert alert-warning mt-4">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>주의사항</strong>
                  <ul className="mb-0 mt-2">
                    <li>시험 시작 후에는 뒤로가기를 할 수 없습니다.</li>
                    <li>제한시간이 지나면 자동으로 제출됩니다.</li>
                    <li>한 번 제출하면 수정할 수 없습니다.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-secondary mr-2" 
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/';
                }
              }}
            >
              <i className="fas fa-arrow-left mr-1"></i>
              돌아가기
            </button>
            {data.submit ? (
              <button 
                className="btn btn-success" 
                onClick={() => window.location.href = `/myclass/test/result?meterial_id=${getMeterialIdFromUrl()}`}
              >
                <i className="fas fa-chart-bar mr-1"></i>
                결과 보기
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleStartTest}
              >
                <i className="fas fa-play mr-1"></i>
                시험 시작
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 메인 시험 화면
  return (
    <div className="container-fluid">
      {/* 헤더 - 시험 정보 및 타이머 */}
      <div className="test-header">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h4 className="mb-1">{data.title}</h4>
            <p className="text-muted mb-0">{data.content}</p>
          </div>
          <div className="col-md-4 text-right">
            <div className="timer-display">
              <i className="fas fa-clock mr-2"></i>
              <span className={`timer ${timeLeft <= 300 ? 'timer-warning' : ''}`}>
                남은 시간: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* 문제 네비게이션 */}
        <div className="col-md-3">
          <div className="question-nav">
            <h6 className="mb-3">
              <i className="fas fa-list mr-2"></i>
              문제 목록
            </h6>
            <div className="nav-grid">
              {data.questions.map((_, index) => (
                <button
                  key={index}
                  className={`nav-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {/* 진행 상황 */}
            <div className="progress-info mt-4">
              <div className="progress-item">
                <span className="badge badge-success">
                  {Object.keys(answers).length}
                </span>
                <span>답변 완료</span>
              </div>
              <div className="progress-item">
                <span className="badge badge-secondary">
                  {data.questions.length - Object.keys(answers).length}
                </span>
                <span>미답변</span>
              </div>
            </div>
          </div>
        </div>

        {/* 문제 영역 */}
        <div className="col-md-9">
          <div className="question-area">
            {data.questions.map((question, index) => (
              <div
                key={index}
                className={`question-card ${currentQuestion === index ? 'active' : 'hidden'}`}
              >
                <div className="question-header">
                  <h5>
                    <span className="question-number">{question.probno}</span>
                    {question.question}
                  </h5>
                </div>

                <div className="question-content">
                  {question.type === 'TES001' ? (
                    // 객관식
                    <div className="choices">
                      {[1, 2, 3, 4].map(num => (
                        <label key={num} className="choice-label">
                          <input
                            type="radio"
                            name={`question_${index}`}
                            value={num.toString()}
                            checked={answers[index] === num.toString()}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                          />
                          <span className="choice-text">
                            <span className="choice-number">{num}</span>
                            {question[`choice${num}`]}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    // 주관식
                    <div className="subjective-answer">
                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder="답안을 입력하세요..."
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* 문제 네비게이션 버튼 */}
                <div className="question-navigation">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <i className="fas fa-chevron-left mr-1"></i>
                    이전 문제
                  </button>
                  
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentQuestion(Math.min(data.questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === data.questions.length - 1}
                  >
                    다음 문제
                    <i className="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 제출 버튼 */}
          <div className="submit-section">
            <div className="submit-info">
              <p className="text-muted mb-2">
                <i className="fas fa-info-circle mr-1"></i>
                답변 완료: {Object.keys(answers).length} / {data.questions.length}
              </p>
            </div>
            <button
              className={`btn btn-lg ${Object.keys(answers).length === data.questions.length ? 'btn-success' : 'btn-warning'}`}
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  제출 중...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  시험 제출
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-header, .modal-footer {
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-footer {
          border-top: 1px solid #e9ecef;
          border-bottom: none;
          text-align: right;
        }

        .modal-body {
          padding: 20px;
        }

        .info-grid {
          display: flex;
          gap: 20px;
          margin: 20px 0;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .test-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .timer-display {
          background: rgba(255, 255, 255, 0.1);
          padding: 10px 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .timer {
          font-size: 1.1rem;
          font-weight: bold;
        }

        .timer-warning {
          color: #ff6b6b !important;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .question-nav {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 20px;
        }

        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
          gap: 8px;
          margin-bottom: 20px;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          border-color: #007bff;
          background: #f8f9fa;
        }

        .nav-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .nav-btn.answered {
          background: #28a745;
          color: white;
          border-color: #28a745;
        }

        .nav-btn.answered.active {
          background: #1e7e34;
        }

        .progress-info {
          border-top: 1px solid #e9ecef;
          padding-top: 15px;
        }

        .progress-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .question-area {
          background: white;
          border-radius: 8px;
          min-height: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .question-card {
          padding: 30px;
        }

        .question-card.hidden {
          display: none;
        }

        .question-header {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f8f9fa;
        }

        .question-number {
          display: inline-block;
          background: #007bff;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
          margin-right: 15px;
          font-size: 0.9rem;
        }

        .choices {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .choice-label {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0;
        }

        .choice-label:hover {
          border-color: #007bff;
          background: #f8f9ff;
        }

        .choice-label input[type="radio"] {
          margin-right: 15px;
          transform: scale(1.2);
        }

        .choice-text {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .choice-number {
          display: inline-block;
          background: #6c757d;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          text-align: center;
          line-height: 24px;
          margin-right: 12px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .choice-label input[type="radio"]:checked + .choice-text .choice-number {
          background: #007bff;
        }

        .choice-label input[type="radio"]:checked {
          accent-color: #007bff;
        }

        .subjective-answer textarea {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          font-size: 1rem;
          resize: vertical;
          min-height: 120px;
        }

        .subjective-answer textarea:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .question-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .submit-section {
          background: white;
          border-radius: 8px;
          padding: 25px;
          margin-top: 20px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .submit-info {
          margin-bottom: 15px;
        }

        .btn-lg {
          padding: 12px 30px;
          font-size: 1.1rem;
          font-weight: bold;
        }

        /* 로딩 및 에러 스타일 */
        .loading-container, .error-container, .no-data-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .loading-content, .error-content, .no-data-content {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 90%;
        }

        .loading-content i {
          color: #007bff;
        }

        .error-content i {
          color: #dc3545;
        }

        .no-data-content i {
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .test-header .row > div {
            text-align: center !important;
            margin-bottom: 10px;
          }
          
          .timer-display {
            margin-top: 10px;
          }
          
          .question-nav {
            margin-bottom: 20px;
          }
          
          .nav-grid {
            grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
          }
          
          .nav-btn {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }
          
          .question-card {
            padding: 20px;
          }
          
          .question-navigation {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentTestTake;