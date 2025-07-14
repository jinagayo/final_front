import React from 'react';
import Layout from './layout/Layout';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import CourseList from './pages/course/List';

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
              </Routes>
            </div>
          </div>
        </div>
      </Layout>
    </BrowserRouter>
  );
}

export default App; // 이 줄이 있는지 확인!