import React from 'react';
import LayoutMain from './layout/LayoutMain';
import Layout from './layout/Layout';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import CourseList from './pages/course/List';
import Join from "./pages/Join";
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 로그인/회원가입 관련 라우트 */}
          <Route path="auth/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/join/signup/student" element={<Join />} />
          <Route path="/join/signup/teacher" element={<Join />} />

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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;