// src/pages/Home.js
import List from './course/List'
import React, { useState, useEffect } from 'react';
import {useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const courses = [
    {
      id: 1,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 2,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 3,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 4,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 5,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 6,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 7,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
    {
      id: 8,
      title: "Python 어째고",
      description: "파이썬의 기초부터 심화까지 체계적으로 배우는 온라인 강의",
      image: "/placeholder.svg?height=120&width=200",
    },
  ];

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
        onClick={handleGetStartedClick}
      >
      <img 
        style={{ height: '300px', width: '100%', marginTop:'-24px'}} 
        src={`/img/main.png?v=${imageTimestamp}`} 
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
                <div className="card-img-top bg-gray-200 d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="img-fluid rounded-top"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
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