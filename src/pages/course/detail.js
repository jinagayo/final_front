// src/pages/course/Detail.js
// Detail.js
import React from 'react';
import { useLocation } from 'react-router-dom';

function CourseDetail() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const classId = params.get("class_id");

  return (
    <div>
      <h2>클래스 상세페이지</h2>
      <p>class_id: {classId}</p>
    </div>
  );
}

export default CourseDetail;
