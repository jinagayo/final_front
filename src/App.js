import React from 'react';
import Layout from './layout/Layout';
import './styles/css/sb-admin-2.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from './pages/Home';
import CourseList from './pages/course/List';
import Join from "./pages/Join"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join" element={<Join />} />
        <Route path="/join/signup/student" element={<Join />} />
        <Route path="/join/signup/teacher" element={<Join />} />
        
        <Route path="/*" element={
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
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;