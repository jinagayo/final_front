import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from "react-router-dom";

const TClassDetail = () => {
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
  if (!classId || isNaN(Number(classId))) {
    console.warn("잘못된 classId:", classId);
    return;
  }
  fetchClassDetail();
  fetchLectures();
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
  console.log(classData)

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
        setLectures([]);
      }
    } catch (error) {
      console.error('강의 목록 가져오기 오류:', error);
      setLectures([]);
      setLoading(false);
    }
  };

  // 강의 목록으로 돌아가기
  const goBackToList = () => {
    window.location.href = '/myclass/teacher/classList';
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
        {/* 상단 이미지와 강의 정보 */}
        <div className="row" style={{ marginBottom: '40px' }}>
          {/* 왼쪽 이미지 */}
          <div className="col-md-4">
            <div style={{ marginBottom: '20px' }}>
              {classData?.img ? (
                <img 
                 src={classData.img}
                  alt="강의 이미지"
                style={{
                   width: '100%',
                   height: '250px',
                   borderRadius: '10px',
                   objectFit: 'cover',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
               }}
              />
              ) : (
                // 이미지 없을 때 임시 아이콘/색상 대체
                <div style={{
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#fff5e6',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#f39c12',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    ☕
                  </div>
                  <h3 style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '24px', margin: 0 }}>java</h3>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽 강의 정보 */}
          <div className="col-md-8">
            <div style={{ padding: '20px 0' }}>
              {/* 강의 제목 */}
              <h2 style={{ color: '#2c3e50', marginBottom: '30px', fontWeight: 'bold', fontSize: '28px' }}>
                {classData?.name || '즐거운 자바 강의'}
              </h2>

              {/* 강의 정보 */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ color: '#7f8c8d', fontSize: '18px' }}>가격: </span>
                <span style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '18px' }}>
                  {classData?.price ? `${classData.price.toLocaleString()}원` : '45000원'}
                </span>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <span style={{ color: '#7f8c8d', fontSize: '18px' }}>수강생: </span>
                <span style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '18px' }}>
                  {classData?.studentCount || '40'}명
                </span>
              </div>

 
            <div style={{display: 'flex',gap: '20px' }}>
              {/* 강의 업로드 버튼 */}
              <Link
                to={`/myclass/teacher/video/${classId}`}
                style={{ 
                  backgroundColor: '#3498db', 
                  border: 'none', 
                  color: 'white', 
                  padding: '15px 40px', 
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'inline-block',  //버튼처럼 보이게
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                강의 업로드
              </Link>

                {/* 과제 업로드 버튼 */}
              <Link
                to={`/myclass/teacher/video/${classId}`}
                style={{ 
                  backgroundColor: '#3498db', 
                  border: 'none', 
                  color: 'white', 
                  padding: '15px 40px', 
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'inline-block',  //버튼처럼 보이게
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                과제 업로드
              </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 커리큘럼 섹션 */}
        <div className="row">
          <div className="col-12">
            <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '30px' }}>
              <h5 style={{ color: '#2c3e50', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>커리큘럼</h5>
              
              <div className="table-responsive">
                <table className="table table-borderless">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                      <th style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', width: '15%' }}>강의 차시</th>
                      <th style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', width: '30%' }}>강의명</th>
                      <th style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50', width: '30%' }}>강의내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lectures.length > 0 ? (
                      lectures.map((lecture, index) => (
                        <tr key={lecture.id || index} 
                          style={{
                             borderBottom: '1px solid #ecf0f1',
                             cursor: 'pointer'
                             }}
                             onClick={()=> navigate(`/myclass/videoView/${lecture.meterId}`)}>
                          <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '500' }}>
                            {index + 1}차시
                          </td>
                          <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '500' }}>
                            {lecture.title}
                          </td>
                           <td style={{ padding: '15px', color: '#2c3e50', fontWeight: '500' }}>
                            {lecture.detail}
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
                padding: '10px 15px',
                borderRadius: '8px',
                border: 'none'
              }}
            >
              ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TClassDetail;