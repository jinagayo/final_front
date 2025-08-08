import React from 'react';
import Layout from './layout/Layout';
import LayoutMain from './layout/LayoutMain';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import CourseList from './pages/course/List';
import CourseRoutes from './routes/CourseRoutes';
import ClassRoutes from './routes/ClassRoutes';
import AdminRoutes from './routes/AdminRoutes';
import MypageRoutes from './routes/MypageRoutes';
import Join from "./pages/Join";
import Login from './pages/Login';
import PendingTeachers from './pages/admin/PendingTeachers'
import OAuthCallback from './pages/OAuthCallback';
import KakaoCallback from './pages/KakaoCallback';
import { AuthProvider } from './contexts/AuthContext';
import { Import } from 'lucide-react';
import LectureViewer from './pages/myclass/videoView';
import VideoUploader from './pages/myclass/teacher/video';
import TCourseList from './pages/myclass/teacher/classList';
import TCourseDetail from './pages/myclass/teacher/classDetail';
import BoardRouters from './routes/BoardRoutes';
import SearchResults from './components/SearchResult';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 로그인/회원가입 관련 라우트 (레이아웃 없음) */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/join" element={<Join />} />
          <Route path="/join/signup/student" element={<Join />} />
          <Route path="/join/signup/teacher" element={<Join />} /> 
          <Route path="/oauth" element={<OAuthCallback />} />
          <Route path="/kakao/callback" element={<KakaoCallback />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />

          {/* 메인 페이지만 LayoutMain 사용 (사이드바 접힌 상태) */}
          <Route element={<LayoutMain />}>
            <Route path="/" element={
              <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                    <Home />
                  </div>
                </div>
              </div>
            } />
          </Route>

          {/* 나머지 모든 페이지는 Layout 사용 (사이드바 펼친 상태) */}
          <Route element={<Layout />}>
            <Route path="/course/List" element={
              <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                    <CourseList />
                  </div>
                </div>
              </div>
            } />
            
            {/* 강사 권한 승인 페이지 */}
            <Route path="/admin/teacher-approval" element={
              <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                    <PendingTeachers />
                  </div>
                </div>
              </div>
            } />
            
            {/* 클래스 관련 라우트 */}
            <Route path="/myclass/*" element={<ClassRoutes />} />
            
            {/* 수강신청 관련 라우트 */}
            <Route path="/course/*" element={<CourseRoutes />} />
            
            {/* 관리자 관련 라우트 */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* 마이페이지 관련 라우트 */}
            <Route path="/mypage/*" element={<MypageRoutes />} />
            
            {/* 게시판 관련 라우트 */}
            <Route path='/board/*' element={<BoardRouters/>} />
            
            {/* 검색 결과 라우트 */}
            <Route path="/search" element={<SearchResults />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;