// src/pages/Home.js
import List from './course/List'
import React, { useState, useEffect } from 'react';
import {useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState(null);
  const [courses, setCourses] = useState([]); // 하드코딩된 배열을 state로 변경

  useEffect(() => {
    const fetchBanner = async() => {
      try{
        const res = await fetch("http://localhost:8080/api/admin/banner/latest",{
          credentials: 'include'
        });
        const data = await res.json();
        console.log("📦 받아온 데이터:", data); // 전체 데이터 확인
        
        setBannerUrl(data.url);  // 받아온 S3 URL 사용
        
        // 백엔드에서 받은 강의 리스트를 프론트엔드 형식에 맞게 변환
        if(data.courses && data.courses.length > 0) {
          const formattedCourses = data.courses.map(course => ({
            id: course.classId,
            title: course.name,
            description: course.intro,
            image: course.img || "/placeholder.svg?height=120&width=200"
          }));
          setCourses(formattedCourses);
        }
      }catch(err){
        console.error("배너 이미지 및 강의 리스트 불러오기 실패:", err);
        setBannerUrl("/img/main.png");  //fallback
        // 에러 시 빈 배열로 설정
        setCourses([]);
      }
    };
    fetchBanner();
  },[])

  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  // 기존 하드코딩된 courses 배열은 제거됨 (위에서 state로 관리)

  const handleCourseClick = (courseId) => {
    console.log('Course clicked:', courseId);
  };

  const handleGetStartedClick = () => {
    navigate("/course/List");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Large Banner */}
      <div 
        className="relative bg-slate-800 text-white p-8 md:p-12 lg:p-16 cursor-pointer hover:bg-slate-700 transition-colors"
        style={{
        height: '300px',      // 배너 영역 고정
        padding: 0,           // 혹시 p-8 등 패딩 때문에 이미지가 안차보일 수 있음. 필요 없으면 padding:0
         overflow: 'hidden',   // 이미지 넘치면 잘라내기
       }}
        onClick={handleGetStartedClick}
        
      >
      <img 
         style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',       // 요거!
        objectPosition: 'center', // 중간 잘라서 꽉차게
        display: 'block',         // 가끔 inline block이라서 생기는 문제 방지
        marginTop: 0,             // 혹시나 marginTop 있으면 0
      }}
        src={bannerUrl}
        alt="main"
        onClick={(e) => {
          e.stopPropagation();
          handleGetStartedClick();
        }}
      />
      </div>

      {/* Course Grid Container */}
      <div className="container-fluid px-4 py-5">
        <div className="row">
          {courses.map((course) => (
            <div key={course.id} className="col-lg-3 col-md-6 mb-4">
              <div 
                className="card h-100 shadow-sm border-0 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                {/* Card Image */}
               <div className="card-img-top bg-gray-200"
     style={{
       height: '150px',
       width: '100%',
       overflow: 'hidden',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center'
     }}>
  <img
    src={course.image || "/placeholder.svg"}
    alt={course.title}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }}
  />
</div>
                
                {/* Card Body */}
                <div className="card-body p-4">
                  <h5 className="card-title font-weight-bold text-dark mb-2">{course.title}</h5>
                  <p className="card-text text-muted small">{course.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;