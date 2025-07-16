import React from 'react';
import LayoutMain from './layout/LayoutMain';
import Layout from './layout/Layout';
import Join from './pages/join';
import Video from './pages/myclass/teacher/video';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';

import CourseList from './pages/course/list';

import CourseRoutes from './routes/CourseRoutes'; // 코스 관련 라우팅 분리


function App() {
  return (
    <BrowserRouter>

      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card shadow mb-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course/list" element={<CourseList />} />
                <Route path="/join" element={<Join />} />
                <Route path="/teacher/video" element={<Video />} />
                       <Route path="/" element={<LayoutMain><Home /></LayoutMain>} />
                 {/* 다른 페이지는 별도 라우팅 파일에서 처리 */}
                <Route path="/course/*" element={<CourseRoutes />} />
              </Routes>
            </div>
          </div>
        </div>
      </Layout>
    </BrowserRouter>
  );
}
export default App; // 이 줄이 있는지 확인!

