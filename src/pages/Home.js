// src/pages/Home.js
import React from 'react';

const Home = () => {
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
    // 코스 클릭 처리 로직
    console.log('Course clicked:', courseId);
  };

  const handleGetStartedClick = () => {
    // Get Started 버튼 클릭 처리 로직
    console.log('Get Started clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Large Banner */}
      <div 
        className="relative bg-slate-800 text-white p-8 md:p-12 lg:p-16 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={handleGetStartedClick}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm md:text-base font-medium tracking-wider mb-2 opacity-90">ONLINE CODING</div>
            <div className="text-sm md:text-base font-medium tracking-wider mb-6 opacity-90">COURSES</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">CodeSpark</h1>
            <button
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-800 px-8 py-3 rounded-md font-medium text-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleGetStartedClick();
              }}
            >
              Get Started
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-6xl lg:text-8xl opacity-20">{"<"}</div>
            <div className="relative">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <div className="text-2xl lg:text-3xl">🔥</div>
              </div>
            </div>
            <div className="text-6xl lg:text-8xl opacity-20">{">"}</div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img 
                  src={course.image || "/placeholder.svg"} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
