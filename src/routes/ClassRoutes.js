import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import LectureViewer from '../pages/myclass/videoView';
import VideoUploader from '../pages/myclass/teacher/video';
import TCourseList from '../pages/myclass/teacher/classList';
import TCourseDetail from '../pages/myclass/teacher/classDetail';
import List from '../pages/myclass/List';
import Main from '../pages/myclass/Main';

function ClassRoutes() {
  return (
    <Routes>
 <Route path="teacher/classList" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TCourseList />
            </div>
              </div>
              </div>
  } />
            <Route path="teacher/classDetail" element={
           <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                <TCourseDetail />
            </div>
              </div>
              </div>
  } />  
            <Route path="teacher/video/:classId" element={
               <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                 <VideoUploader />
            </div>
              </div>
              </div>
   } />

           <Route path="videoView/:meterId" element={
               <div className="row">
                <div className="col-lg-12">
                  <div className="card shadow mb-4">
                 < LectureViewer />
            </div>
              </div>
              </div>
   } />

        <Route path="list" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <List />
              </div>
            </div>
          </div>
        } />
        <Route path="Main" element={
          <div className="row">
            <div className="col-lg-12">
              <div className="card shadow mb-4">
                <Main />
              </div>
            </div>
          </div>
        } />


      
    </Routes>
  );
}

export default ClassRoutes;