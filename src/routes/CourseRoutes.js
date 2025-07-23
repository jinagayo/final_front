import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import CourseList from '../pages/course/list';
import CourseDetail from '../pages/course/detail';

function CourseRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="List" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CourseList />
              </div>
            </div>
          </div>
        } />
        <Route path="Detail" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CourseDetail />
              </div>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default CourseRoutes;