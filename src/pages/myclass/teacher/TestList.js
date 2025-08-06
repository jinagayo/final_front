import React, { useState, useEffect } from 'react';

const TeacherTestList = () => {
  // URL에서 meterial_id 추출
  const getMeterialIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('meterial_id') || '49';
  };

  // 상태 관리
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // 'name', 'score'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [searchTerm, setSearchTerm] = useState('');

  // API 데이터 가져오기
  useEffect(() => {
    const fetchTestResults = async () => {
      const meterialId = getMeterialIdFromUrl();
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/myclass/teacher/testList?meterial_id=${meterialId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('접근 권한이 없습니다.');
            return;
          }
          throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }
        
        const testData = await response.json();
        console.log("테스트 결과 데이터:", testData);
        
        if (testData) {
          // 백엔드 데이터 구조에 맞게 수정
          const transformedData = {
            title: testData.title,
            students: testData.submit || [] // submit 배열을 students로 변환
          };
          setData(transformedData);
          console.log("변환된 데이터:", transformedData);
        } else {
          setError('테스트 결과 데이터를 찾을 수 없습니다.');
        }

      } catch (e) {
        console.error("테스트 결과 데이터를 가져오지 못했습니다:", e);
        setError('테스트 결과 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  // 정렬 함수
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // 데이터 정렬 및 필터링
  const getSortedAndFilteredData = () => {
    if (!data || !data.students) return [];

    let filtered = data.students.filter(student =>
      student.student.toLowerCase().includes(searchTerm.toLowerCase()) // studentName -> student로 수정
    );

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.student; // studentName -> student로 수정
          bValue = b.student;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'submitTime':
          aValue = new Date(a.submitTime);
          bValue = new Date(b.submitTime);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // 점수에 따른 등급 반환
  const getScoreGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'success' };
    if (score >= 80) return { grade: 'B', color: 'info' };
    if (score >= 70) return { grade: 'C', color: 'warning' };
    if (score >= 60) return { grade: 'D', color: 'secondary' };
    return { grade: 'F', color: 'danger' };
  };

  // 시간 포맷팅
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 학생 결과 상세보기로 이동
  const handleViewDetail = (subId) => {
    const meterialId = getMeterialIdFromUrl();
    window.location.href = `/myclass/teacher/testDetail?meterialSub_id=${subId}`;
  };

  // 통계 계산
  const getStatistics = () => {
    if (!data || !data.students) return null;

    const scores = data.students.map(s => s.score);
    const totalStudents = scores.length;
    const averageScore = totalStudents > 0 ? (scores.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1) : 0;
    const maxScore = totalStudents > 0 ? Math.max(...scores) : 0;
    const minScore = totalStudents > 0 ? Math.min(...scores) : 0;

    const gradeDistribution = {
      A: scores.filter(s => s >= 90).length,
      B: scores.filter(s => s >= 80 && s < 90).length,
      C: scores.filter(s => s >= 70 && s < 80).length,
      D: scores.filter(s => s >= 60 && s < 70).length,
      F: scores.filter(s => s < 60).length
    };

    return {
      totalStudents,
      averageScore,
      maxScore,
      minScore,
      gradeDistribution
    };
  };

  const statistics = getStatistics();
  const sortedData = getSortedAndFilteredData();

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
          <h4>테스트 결과를 불러오는 중...</h4>
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
  if (!data || !data.students || data.students.length === 0) {
    return (
      <div className="no-data-container">
        <div className="no-data-content">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h4>제출한 학생이 없습니다</h4>
          <p className="text-muted mb-4">아직 테스트를 제출한 학생이 없거나 데이터를 찾을 수 없습니다.</p>
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

  return (
    <div className="container-fluid">
      {/* 헤더 */}
      <div className="test-results-header">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h3 className="mb-1">
              <i className="fas fa-chart-bar mr-2"></i>
              {data.title || '테스트 결과'}
            </h3>
            <p className="text-muted mb-0">학생들의 테스트 결과를 확인하세요</p>
          </div>
          <div className="col-md-4 text-right">
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
      </div>

      {/* 통계 카드 */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card">
              <div className="stat-icon bg-primary">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-number">{statistics.totalStudents}</h4>
                <p className="stat-label">제출 학생 수</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card">
              <div className="stat-icon bg-info">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-number">{statistics.averageScore}</h4>
                <p className="stat-label">평균 점수</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card">
              <div className="stat-icon bg-success">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-number">{statistics.maxScore}</h4>
                <p className="stat-label">최고 점수</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="stat-card">
              <div className="stat-icon bg-warning">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-number">{statistics.minScore}</h4>
                <p className="stat-label">최저 점수</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 등급 분포 */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="grade-distribution">
              <h6 className="mb-3">
                <i className="fas fa-chart-pie mr-2"></i>
                등급 분포
              </h6>
              <div className="grade-bars">
                {Object.entries(statistics.gradeDistribution).map(([grade, count]) => {
                  const gradeInfo = getScoreGrade(grade === 'A' ? 95 : grade === 'B' ? 85 : grade === 'C' ? 75 : grade === 'D' ? 65 : 55);
                  const percentage = statistics.totalStudents > 0 ? (count / statistics.totalStudents * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={grade} className="grade-bar">
                      <div className="grade-info">
                        <span className={`badge badge-${gradeInfo.color} mr-2`}>{grade}</span>
                        <span>{count}명 ({percentage}%)</span>
                      </div>
                      <div className="progress" style={{height: '20px', backgroundColor: '#e9ecef'}}>
                        <div 
                          className={`progress-bar bg-${gradeInfo.color}`}
                          style={{width: `${percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 검색 및 정렬 */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="학생 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="sort-controls">
            <label className="mr-2">정렬:</label>
            <select 
              className="form-control d-inline-block w-auto"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [column, order] = e.target.value.split('-');
                setSortBy(column);
                setSortOrder(order);
              }}
            >
              <option value="score-desc">점수 높은순</option>
              <option value="score-asc">점수 낮은순</option>
              <option value="name-asc">이름 가나다순</option>
              <option value="name-desc">이름 역순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 학생 결과 목록 */}
      <div className="students-list">
        <div className="list-header">
          <div className="row">
            <div className="col-md-6">
              <strong>학생 정보</strong>
            </div>
            <div className="col-md-3 text-center">
              <strong>점수</strong>
            </div>
            <div className="col-md-3 text-center">
              <strong>등급</strong>
            </div>
          </div>
        </div>

        {sortedData.map((student, index) => {
          const gradeInfo = getScoreGrade(student.score);
          
          return (
            <div 
              key={student.student} 
              className="student-item clickable"
              onClick={() => handleViewDetail(student.subId)}
              title="클릭하여 상세 결과 보기"
            >
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="student-info">
                    <div className="student-rank">#{index + 1}</div>
                    <div className="student-details">
                      <h6 className="student-name">{student.student}</h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 text-center">
                  <div className={`score-display score-${gradeInfo.color}`}>
                    {student.score}점
                  </div>
                </div>
                <div className="col-md-3 text-center">
                  <span className={`badge badge-${gradeInfo.color} grade-badge`}>
                    {gradeInfo.grade}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 검색 결과가 없을 때 */}
      {sortedData.length === 0 && searchTerm && (
        <div className="no-results">
          <div className="text-center py-5">
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5>검색 결과가 없습니다</h5>
            <p className="text-muted">'{searchTerm}'에 해당하는 학생을 찾을 수 없습니다.</p>
            <button 
              className="btn btn-secondary"
              onClick={() => setSearchTerm('')}
            >
              검색 초기화
            </button>
          </div>
        </div>
      )}

      <style>{`
        .test-results-header {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #495057;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-left: 4px solid transparent;
          display: flex;
          align-items: center;
          height: 100%;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: white;
          font-size: 1.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 5px;
          color: #2c3e50;
        }

        .stat-label {
          color: #7f8c8d;
          margin-bottom: 0;
          font-size: 0.9rem;
        }

        .grade-distribution {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .grade-bars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .grade-bar {
          text-align: center;
        }

        .grade-info {
          margin-bottom: 8px;
          font-weight: 500;
        }

        .search-box {
          position: relative;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .search-box input {
          padding-left: 45px;
          border-radius: 25px;
          border: 2px solid #e9ecef;
        }

        .search-box input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .sort-controls {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .sort-controls select {
          margin-left: 10px;
          border-radius: 6px;
        }

        .students-list {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .list-header {
          background: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          color: #495057;
        }

        .student-item {
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .student-item.clickable {
          cursor: pointer;
        }

        .student-item:hover {
          background: #f8f9ff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .student-item:last-child {
          border-bottom: none;
        }

        .student-info {
          display: flex;
          align-items: center;
        }

        .student-rank {
          background: #6c757d;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
          font-size: 0.9rem;
        }

        .student-details h6 {
          margin-bottom: 2px;
          font-weight: 600;
          color: #2c3e50;
        }

        .student-id {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 0;
        }

        .score-display {
          font-size: 1.25rem;
          font-weight: bold;
          padding: 8px 12px;
          border-radius: 8px;
          display: inline-block;
        }

        .score-success {
          background: #d4edda;
          color: #155724;
        }

        .score-info {
          background: #d1ecf1;
          color: #0c5460;
        }

        .score-warning {
          background: #fff3cd;
          color: #856404;
        }

        .score-secondary {
          background: #e2e3e5;
          color: #383d41;
        }

        .score-danger {
          background: #f8d7da;
          color: #721c24;
        }

        .grade-badge {
          font-size: 1rem;
          padding: 8px 12px;
        }

        .submit-time {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .no-results {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
          .test-results-header .row > div {
            text-align: center !important;
            margin-bottom: 10px;
          }
          
          .grade-bars {
            grid-template-columns: 1fr;
          }
          
          .sort-controls {
            justify-content: flex-start;
            margin-top: 15px;
          }
          
          .list-header {
            display: none;
          }
          
          .student-item {
            padding: 15px;
          }
          
          .student-item .row > div {
            margin-bottom: 10px;
          }
          
          .student-info {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .student-rank {
            margin-bottom: 10px;
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherTestList;