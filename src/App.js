import React from 'react';
import Layout from './layout/Layout';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import CourseList from './pages/course/List';
import TCourseList from './pages/myclass/teacher/classList';
import TCourseDetail from './pages/myclass/teacher/classDetail';
import CourseRoutes from './routes/CourseRoutes';
import AdminRoutes from './routes/AdminRoutes';
import Join from "./pages/Join";
import Login from './pages/Login';
import TeacherVideo from './pages/myclass/teacher/video';
import PendingTeachers from './pages/admin/PendingTeachers'
import OAuthCallback from './pages/OAuthCallback';
import KakaoCallback from './pages/KakaoCallback';

import { AuthProvider } from './contexts/AuthContext';
import { Import } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 로그인/회원가입 관련 라우트 */}

          <Route path="/teacher/video" element={<TeacherVideo />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/join" element={<Join />} />
          <Route path="/join/signup/student" element={<Join />} />
          <Route path="/join/signup/teacher" element={<Join />} /> 
          <Route path="/oauth" element={<OAuthCallback />} />
          <Route path="/kakao/callback" element={<KakaoCallback />} />

          {/* 공통 레이아웃을 사용하는 메인 페이지들 */}
          <Route element={<Layout />}>
            <Route path="/" element={
              <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                    <Home />
                  </div>
                </div>
              </div>
            } />
            <Route path="/course/list" element={
              <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                    <CourseList />
                  </div>
                </div>
              </div>
            } />
            {/* 강사 권한 승인 페이지*/}
            <Route path="/admin/teacher-approval" element={
              <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                    <PendingTeachers />
                  </div>
                </div>
              </div>
            } />
           <Route path="myclass/teacher/classList" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TCourseList />
            </div>
              </div>
              </div>
  } />
            <Route path="myclass/teacher/classDetail" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TCourseDetail />
            </div>
              </div>
              </div>
  } />
          </Route>
   
  
          
          {/* 강의 관련 라우트 */}
          <Route path="/course/*" element={<CourseRoutes />} />
          {/* 관리자 관련 라우트 */}
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;