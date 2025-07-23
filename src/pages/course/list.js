// src/pages/course/List.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const CourseList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // 선택된 과목들
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API에서 강의 목록을 가져오는 함수
  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('=== API 요청 시작 ===');
      console.log('요청 URL:', 'http://localhost:8080/course/List');
      
      const response = await fetch('http://localhost:8080/course/List', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('=== 응답 정보 ===');
      console.log('응답 상태:', response.status);
      console.log('응답 상태 텍스트:', response.statusText);
      console.log('응답 OK 여부:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('에러 응답 내용:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('=== 받은 데이터 분석 ===');
      console.log('받은 데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('Array 여부:', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('배열 길이:', data.length);
        if (data.length > 0) {
          console.log('첫 번째 항목:', data[0]);
          console.log('첫 번째 항목의 키들:', Object.keys(data[0]));
        }
      } else if (data && typeof data === 'object') {
        console.log('객체의 키들:', Object.keys(data));
        // data.success나 data.classes 같은 구조일 수 있음
        if (data.success && data.classes) {
          console.log('data.classes 발견:', data.classes);
          setCourses(data.classes);
          setError(null);
          return;
        } else if (data.data) {
          console.log('data.data 발견:', data.data);
          setCourses(data.data);
          setError(null);
          return;
        }
      }

      // 배열이거나 직접적인 데이터인 경우
      const classesData = Array.isArray(data) ? data : [];
      console.log('최종 설정될 courses:', classesData);
      setCourses(classesData);
      setError(null);

      // 성공했지만 데이터가 없을 때 사용자에게 알림
      if (classesData.length === 0) {
        alert('강의 목록을 성공적으로 가져왔지만 등록된 강의가 없습니다.');
      } else {
        console.log(`성공! ${classesData.length}개의 강의를 불러왔습니다.`);
      }

    } catch (err) {
      console.error('=== API 요청 실패 ===');
      console.error('에러 객체:', err);
      console.error('에러 메시지:', err.message);
      const errorMessage = `강의 목록을 불러오는데 실패했습니다: ${err.message}`;
      setError(errorMessage);
      setCourses([]);
      
      // 로그인처럼 사용자에게 알림
      alert(`서버 연결 오류: ${err.message}\n네트워크 상태와 서버 상태를 확인해주세요.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 모든 과목 목록을 추출하는 함수 (중복 제거)
  const getAllSubjects = () => {
    const subjects = new Set();
    courses.forEach(course => {
      if (course.subject) {
        subjects.add(course.subject);
      }
    });
    return Array.from(subjects).sort();
  };

  const filterOptions = ['전체', '무료', '유료', '할인'];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  // 강의 클릭 시 상세 페이지로 이동
  const handleCourseClick = (courseId) => {
    console.log('Course clicked:', courseId);
    if (courseId) {
      navigate(`/course/Detail?class_id=${courseId}`);
    } else {
      console.error('Course ID is missing');
      alert('강의 정보가 올바르지 않습니다.');
    }
  };

  // 과목 체크박스 처리 함수
  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  // 안전한 필터링 함수
  const filteredCourses = courses.filter(course => {
    // 데이터 구조를 모르므로 안전하게 처리
    const title = course.title || course.name || course.class_name || '';
    const description = course.description || course.intro || '';
    const category = course.category || course.type || '';

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === '전체' || category === selectedFilter;
    
    // 과목 필터링 추가
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(course.subject);
    
    return matchesSearch && matchesFilter && matchesSubject;
  });

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">강의 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">오류 발생!</h4>
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchCourses}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Search Section */}
      <div className="bg-white shadow-sm py-4">
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <form onSubmit={handleSearch} className="d-flex">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder="강의명 또는 강사를 검색해보세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="button">
                      <i className="fas fa-search fa-sm">
                        <img
                          src="/img/searchIcon.png"
                          alt="Search"
                          style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }}
                        />
                      </i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Section */}
      <div className="bg-white border-bottom py-3">
        <div className="container-fluid px-4">
          <div className="row">
            <div className="col-12">
              <h6 className="mb-3">과목별 필터</h6>
              <div className="d-flex flex-wrap">
                {getAllSubjects().map((subject, index) => (
                  <div key={index} className="form-check form-check-inline mr-3 mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`subject-${index}`}
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                    />
                    <label className="form-check-label" htmlFor={`subject-${index}`}>
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
              {selectedSubjects.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    선택된 과목: {selectedSubjects.join(', ')}
                    <button
                      className="btn btn-link btn-sm p-0 ml-2"
                      onClick={() => setSelectedSubjects([])}
                    >
                      전체 해제
                    </button>
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        <div className="row">
          <div className="col-12">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-5">
                <h5>표시할 강의가 없습니다.</h5>
                <p className="text-muted">
                  {courses.length === 0 
                    ? "서버에서 강의 데이터를 받지 못했습니다." 
                    : "검색 조건에 맞는 강의가 없습니다."
                  }
                </p>
              </div>
            ) : (
              <div className="row">
                {filteredCourses.map((course, index) => (
                  <div key={course.classId || course.id || index} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                    <div 
                      className="card h-100 border-0 shadow-sm"
                      onClick={() => handleCourseClick(course.classId || course.Class_id)}
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div className="card-img-top bg-gray-200 d-flex align-items-center justify-content-center" 
                           style={{ height: '140px', backgroundColor: '#e9ecef' }}>
                        <div className="w-100 h-100 bg-gray-300" style={{backgroundColor: '#dee2e6'}}></div>
                      </div>
                      
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-2">
                          <h6 className="card-title font-weight-bold mb-0 mr-2">
                            { course.name  || '제목 없음'}
                          </h6>
                          {course.subject && (
                            <span className="badge badge-primary small">{course.subject}</span>
                          )}
                        </div>
                        <p className="card-text text-muted small mb-2" style={{fontSize: '12px', lineHeight: '1.4'}}>
                          {course.intro || '설명 없음'}
                        </p>
                        {course.price && (
                          <div className="mt-auto">
                            <span className="font-weight-bold text-primary">{course.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;