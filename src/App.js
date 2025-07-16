import React from 'react';
import Layout from './layout/Layout';
import Join from './pages/join';
import Video from './pages/myclass/teacher/video';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import CourseList from './pages/course/list';

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
              </Routes>
            </div>
          </div>
        </div>
      </Layout>
    </BrowserRouter>
  );
}
export default App; // 이 줄이 있는지 확인!