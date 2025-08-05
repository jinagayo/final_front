import React, { useState, useEffect } from 'react';

const TeacherTestResult = () => {
  const getMeterialIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meterialSub_id');
  };

  // 상태 관리
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  // API 데이터 가져오기
  useEffect(() => {
    const fetchResultData = async () => {
      const meterialSub_id = getMeterialIdFromUrl();
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/myclass/teacher/testDetail?meterialSub_id=${meterialSub_id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('로그인이 필요합니다.');
            return;
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const resultData = await response.json();
        console.log("시험 결과 데이터:", resultData);
        
        if (resultData && resultData.title) {
          setData(resultData);
          console.log("시험 결과 데이터 로드 완료");
        } else {
          setError('시험 결과 데이터를 찾을 수 없습니다.');
        }

      } catch (e) {
        console.error("시험 결과 데이터를 가져오지 못했습니다:", e);
        setError('시험 결과 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
  }, []);

  // 점수에 따른 색상 클래스 반환
  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return 'text-success';
    if (numScore >= 80) return 'text-info';
    if (numScore >= 70) return 'text-warning';
    return 'text-danger';
  };

  // 점수에 따른 메시지 반환
  const getScoreMessage = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return '우수';
    if (numScore >= 80) return '양호';
    if (numScore >= 70) return '보통';
    return '미흡';
  };

  // 정답률 계산
  const getCorrectRate = () => {
    if (!data || !data.questions) return 0;
    const correctCount = data.questions.filter(q => q.correct).length;
    return Math.round((correctCount / data.questions.length) * 100);
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <h4>시험 결과를 불러오는 중...</h4>
          <p className="text-muted">잠시만 기다려주세요.</p>
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
            onClick={() => window.history.back()}
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
          <h4>시험 결과가 없습니다</h4>
          <p className="text-muted mb-4">시험 결과를 찾을 수 없습니다.</p>
          <button 
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left mr-1"></i>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* 헤더 - 결과 요약 */}
      <div className="result-header">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h4 className="mb-1">
              <i className="fas fa-chart-bar mr-2"></i>
              {data.title} - 시험 결과
            </h4>
            <p className="text-muted mb-0">{data.content}</p>
          </div>
          <div className="col-md-4 text-right">
            <div className="score-display">
              <div className={`score-value ${getScoreColor(data.score)}`}>
                {data.score}점
              </div>
              <div className="score-label">
                {getScoreMessage(data.score)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon text-success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {data.questions.filter(q => q.correct).length}
              </div>
              <div className="stat-label">정답</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon text-danger">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {data.questions.filter(q => !q.correct).length}
              </div>
              <div className="stat-label">오답</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon text-info">
              <i className="fas fa-percentage"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{getCorrectRate()}%</div>
              <div className="stat-label">정답률</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon text-primary">
              <i className="fas fa-list-ol"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{data.questions.length}</div>
              <div className="stat-label">총 문항</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* 문제 목록 */}
        <div className="col-md-3">
          <div className="question-list">
            <h6 className="mb-3">
              <i className="fas fa-list mr-2"></i>
              문제별 결과
            </h6>
            <div className="question-items">
              {data.questions.map((question, index) => (
                <div
                  key={index}
                  className={`question-item ${selectedQuestion === index ? 'active' : ''} ${question.correct ? 'correct' : 'incorrect'}`}
                  onClick={() => setSelectedQuestion(index)}
                >
                  <div className="question-number">
                    {index + 1}
                  </div>
                  <div className="question-status">
                    <i className={`fas ${question.correct ? 'fa-check' : 'fa-times'}`}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 문제 상세 */}
        <div className="col-md-9">
          <div className="question-detail">
            {data.questions.map((question, index) => (
              <div
                key={index}
                className={`detail-card ${selectedQuestion === index ? 'active' : 'hidden'}`}
              >
                <div className="detail-header">
                  <div className="question-info">
                    <span className="question-num">문제 {index + 1}</span>
                    <span className={`result-badge ${question.correct ? 'correct' : 'incorrect'}`}>
                      <i className={`fas ${question.correct ? 'fa-check' : 'fa-times'} mr-1`}></i>
                      {question.correct ? '정답' : '오답'}
                    </span>
                  </div>
                </div>

                <div className="question-content">
                  <h5 className="question-text">{question.question}</h5>

                  {/* 객관식인 경우 */}
                  {question.choice1 && (
                    <div className="choices-review">
                      {[1, 2, 3, 4].map(num => (
                        <div
                          key={num}
                          className={`choice-item ${
                            question.answer === num.toString() ? 'correct-answer' : ''
                          } ${
                            question.submit === num.toString() && question.answer !== num.toString() ? 'wrong-answer' : ''
                          } ${
                            question.submit === num.toString() && question.answer === num.toString() ? 'user-correct' : ''
                          }`}
                        >
                          <span className="choice-number">{num}</span>
                          <span className="choice-text">{question[`choice${num}`]}</span>
                          {question.answer === num.toString() && (
                            <span className="choice-label correct">정답</span>
                          )}
                          {question.submit === num.toString() && question.answer !== num.toString() && (
                            <span className="choice-label wrong">내 답</span>
                          )}
                          {question.submit === num.toString() && question.answer === num.toString() && (
                            <span className="choice-label user-correct">내 답 (정답)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 주관식인 경우 */}
                  {!question.choice1 && (
                    <div className="subjective-review">
                      <div className="answer-section">
                        <div className="answer-item correct-answer-section">
                          <h6><i className="fas fa-check-circle text-success mr-2"></i>정답</h6>
                          <div className="answer-box">{question.answer}</div>
                        </div>
                        
                        <div className={`answer-item ${question.correct ? 'user-correct-section' : 'user-wrong-section'}`}>
                          <h6>
                            <i className={`fas ${question.correct ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} mr-2`}></i>
                            내 답안
                          </h6>
                          <div className="answer-box">{question.submit || '답안 없음'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 네비게이션 */}
                <div className="detail-navigation">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
                    disabled={selectedQuestion === 0}
                  >
                    <i className="fas fa-chevron-left mr-1"></i>
                    이전 문제
                  </button>
                  
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedQuestion(Math.min(data.questions.length - 1, selectedQuestion + 1))}
                    disabled={selectedQuestion === data.questions.length - 1}
                  >
                    다음 문제
                    <i className="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="bottom-actions">
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => window.history.back()}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              돌아가기
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .result-header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .score-display {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .score-value {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1;
        }

        .score-label {
          font-size: 1rem;
          opacity: 0.9;
          margin-top: 5px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 15px;
        }

        .stat-icon {
          font-size: 2rem;
          margin-right: 15px;
          width: 50px;
          text-align: center;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          line-height: 1;
        }

        .stat-label {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .question-list {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 20px;
        }

        .question-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .question-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .question-item.correct {
          background: #d4edda;
          border-color: #c3e6cb;
        }

        .question-item.incorrect {
          background: #f8d7da;
          border-color: #f5c6cb;
        }

        .question-item.active {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .question-number {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .question-status i {
          font-size: 1.2rem;
        }

        .question-item.correct .question-status i {
          color: #28a745;
        }

        .question-item.incorrect .question-status i {
          color: #dc3545;
        }

        .question-detail {
          background: white;
          border-radius: 8px;
          min-height: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .detail-card {
          padding: 30px;
        }

        .detail-card.hidden {
          display: none;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f8f9fa;
        }

        .question-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .question-num {
          font-size: 1.2rem;
          font-weight: bold;
          color: #495057;
        }

        .result-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .result-badge.correct {
          background: #d4edda;
          color: #155724;
        }

        .result-badge.incorrect {
          background: #f8d7da;
          color: #721c24;
        }

        .question-text {
          margin-bottom: 25px;
          color: #495057;
          line-height: 1.6;
        }

        .choices-review {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .choice-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          position: relative;
        }

        .choice-item.correct-answer {
          background: #d4edda;
          border-color: #c3e6cb;
        }

        .choice-item.wrong-answer {
          background: #f8d7da;
          border-color: #f5c6cb;
        }

        .choice-item.user-correct {
          background: #d1ecf1;
          border-color: #bee5eb;
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

        .choice-text {
          flex: 1;
        }

        .choice-label {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
          position: absolute;
          right: 10px;
        }

        .choice-label.correct {
          background: #28a745;
          color: white;
        }

        .choice-label.wrong {
          background: #dc3545;
          color: white;
        }

        .choice-label.user-correct {
          background: #17a2b8;
          color: white;
        }

        .subjective-review {
          margin-top: 20px;
        }

        .answer-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .answer-item h6 {
          margin-bottom: 10px;
        }

        .answer-box {
          padding: 15px;
          border-radius: 8px;
          border: 2px solid #e9ecef;
          background: #f8f9fa;
          min-height: 80px;
          white-space: pre-wrap;
        }

        .correct-answer-section .answer-box {
          background: #d4edda;
          border-color: #c3e6cb;
        }

        .user-correct-section .answer-box {
          background: #d1ecf1;
          border-color: #bee5eb;
        }

        .user-wrong-section .answer-box {
          background: #f8d7da;
          border-color: #f5c6cb;
        }

        .detail-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .bottom-actions {
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
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

        @media (max-width: 768px) {
          .result-header .row > div {
            text-align: center !important;
            margin-bottom: 10px;
          }
          
          .score-display {
            margin-top: 15px;
          }
          
          .question-list {
            margin-bottom: 20px;
          }
          
          .detail-card {
            padding: 20px;
          }
          
          .detail-navigation {
            flex-direction: column;
            gap: 10px;
          }
          
          .answer-section {
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherTestResult;