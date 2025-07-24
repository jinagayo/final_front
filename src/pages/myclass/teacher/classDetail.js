import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const TClassDetail = () => {
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchLectures();
    }
  }, [classId]);

  // 강사 권한 확인
  const isTeacher = () => user?.position === '2' || user?.position === 'teacher';

  if (!isTeacher()) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          강사 권한이 필요합니다.
        </div>
      </div>
    );
  }

  // 클래스 세부 정보 가져오기
  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data.data);
      } else {
        console.error('강의 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('강의 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 강좌 목록 가져오기
  const fetchLectures = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}/lectures`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLectures(data.data || []);
      } else {
        console.error('강의 목록 가져오기 실패');
        // 더미 데이터로 설정 (개발용)
        setLectures([
          { id: 1, title: '자료형과 변수', description: 'int형 double형 등 다양한 자료형 정리하기' },
          { id: 2, title: '조건문 만들기', description: 'if문 while문 for문 switch문 정리하기' },
          { id: 3, title: '반복문 활용', description: '' },
          { id: 4, title: '객체 지향변수', description: '' },
          { id: 5, title: '총 정리', description: '' },
          { id: 6, title: '테스트 점검', description: '' },
          { id: 7, title: 'math 활용', description: '' }
        ]);
      }
    } catch (error) {
      console.error('강의 목록 가져오기 오류:', error);
      // 더미 데이터로 설정 (개발용)
      setLectures([
        { id: 1, title: '자료형과 변수', description: 'int형 double형 등 다양한 자료형 정리하기' },
        { id: 2, title: '조건문 만들기', description: 'if문 while문 for문 switch문 정리하기' },
        { id: 3, title: '반복문 활용', description: '' },
        { id: 4, title: '객체 지향변수', description: '' },
        { id: 5, title: '총 정리', description: '' },
        { id: 6, title: '테스트 점검', description: '' },
        { id: 7, title: 'math 활용', description: '' }
      ]);
    }
  };

  // 강의 목록으로 돌아가기
  const goBackToList = () => {
    window.location.href = '/teacher/classList';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">강의 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px' }}>
      <div className="container">
        <div className="row">
          {/* 왼쪽 강의 정보 */}
          <div className="col-md-4">
            <div style={{ backgroundColor: '#fff5e6', borderRadius: '15px', padding: '30px', textAlign: 'center' }}>
              {/* Java 로고 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#f39c12', 
                  borderRadius: '10px', 
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  ☕
                </div>
                <h3 style={{ marginTop: '15px', color: '#2c3e50', fontWeight: 'bold' }}>java</h3>
              </div>

              {/* 강의 제목 */}
              <h4 style={{ color: '#2c3e50', marginBottom: '20px', fontWeight: 'bold' }}>
                {classData?.title || '즐거운 자바 강의'}
              </h4>

              {/* 강의 정보 */}
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#7f8c8d', fontSize: '14px' }}>가격: </span>
                <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                  {classData?.price ? `${classData.price.toLocaleString()}원` : '45000원'}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ color: '#7f8c8d', fontSize: '14px' }}>수강생: </span>
                <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                  {classData?.studentCount || '40'}명
                </span>
                <span style={{ 
                  backgroundColor: '#e74c3c', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  Q&A
                </span>
              </div>

              {/* 강의 상태 버튼 */}
              <button 
                style={{ 
                  backgroundColor: '#3498db', 
                  border: 'none', 
                  color: 'white', 
                  padding: '12px 30px', 
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                강의 상태변경하기
              </button>
            </div>
          </div>

          {/* 오른쪽 커리큘럼 */}
          <div className="col-md-8">
            <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '30px' }}>
              <h5 style={{ color: '#2c3e50', marginBottom: '20px', fontWeight: 'bold' }}>커리큘럼</h5>
              
              <div className="table-responsive">
                <table className="table table-borderless">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                      <th style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', width: '15%' }}>강의 차시</th>
                      <th style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', width: '30%' }}>강의명</th>
                      <th style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', width: '55%' }}>강의 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lectures.length > 0 ? (
                      lectures.map((lecture, index) => (
                        <tr key={lecture.id || index} style={{ borderBottom: '1px solid #ecf0f1' }}>
                          <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '500' }}>
                            {index + 1}차시
                          </td>
                          <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '500' }}>
                            {lecture.title}
                          </td>
                          <td style={{ padding: '15px', color: '#7f8c8d' }}>
                            {lecture.description || ''}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <i className="fas fa-book fa-3x text-muted mb-3"></i>
                          <p className="text-muted">등록된 강의가 없습니다.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="row mt-4">
          <div className="col-12">
            <button
              className="btn btn-secondary"
              onClick={goBackToList}
              style={{ 
                padding: '10px 30px',
                borderRadius: '8px',
                border: 'none'
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              강의 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TClassDetail;