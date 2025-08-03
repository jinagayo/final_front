import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import CourseList from '../pages/course/List';
import CourseDetail from '../pages/course/Detail';
import CoursePayment from '../pages/course/Payment';
import CoursePaymentEnd from '../pages/course/PaymentEnd';
import CourseApplicationList from '../pages/course/teacher/List';
import CourseApplication from '../pages/course/teacher/Application';

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
        <Route path="Payment" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CoursePayment />
              </div>
            </div>
          </div>
        } />
        <Route path="PaymentEnd" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CoursePaymentEnd />
              </div>
            </div>
          </div>
        } />
        <Route path="/teacher/List" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CourseApplicationList />
              </div>
            </div>
          </div>
        } />
        <Route path="/teacher/Application" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <CourseApplication />
              </div>
            </div>
          </div>
        } />
      </Route>


      
      
      
    </Routes>
  );
}

export default CourseRoutes;