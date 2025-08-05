// src/pages/course/CourseDetail.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext'
import axios from 'axios';

const CourseDetail = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth(); 

    useEffect(() => {
        const fetchCourseDetail = async () => {
            const params = new URLSearchParams(location.search);
            const classId = params.get('class_id');

            if (!classId) {
                setError("강의 ID가 URL에 제공되지 않았습니다.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log(`=== API 요청 시작: /course/Detail?class_id=${classId} ===`);

                const response = await axios.get(`http://localhost:8080/course/Detail`, {
                    params: { class_id: classId },
                    withCredentials: true
                });

                console.log('=== 응답 정보 ===', response);

                if (response.status === 200 && response.data) {
                    let fetchedCourseData = null;
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        fetchedCourseData = response.data[0];
                    } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                        fetchedCourseData = response.data.data[0]; 
                    } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                        fetchedCourseData = response.data; 
                    }

                    if (fetchedCourseData && Object.keys(fetchedCourseData).length > 0) {
                        setCourse(fetchedCourseData);
                        console.log('성공적으로 강의 상세 정보를 불러왔습니다:', fetchedCourseData);
                    } else {
                        setError("강의 상세 정보를 찾을 수 없습니다.");
                        setCourse(null);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.error('=== API 요청 실패 ===', err);
                const errorMessage = `강의 상세 정보를 불러오는데 실패했습니다: ${err.message || '알 수 없는 오류'}`;
                setError(errorMessage);
                setCourse(null);
                alert(`서버 연결 오류: ${err.message}\n네트워크 상태와 서버 상태를 확인해주세요.`);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetail();
    }, [location.search]);

    const handleEnroll = () => {
        // AuthContext의 isLoading 상태를 먼저 확인
        if (authLoading) {
            alert("로그인 상태를 확인 중입니다. 잠시 기다려주세요.");
            return;
        }

        if (!course) {
            alert("강의 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        // isAuthenticated() 함수를 사용하여 로그인 여부 확인
        if (isAuthenticated()) {
            // 로그인 되어 있다면 course/payment 페이지로 이동
            navigate(`/course/payment?class_id=${course.classId}`);
        } else {
            // 로그인 되어 있지 않다면 알림창 띄우고 로그인 페이지로 이동
            const confirmLogin = window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?");
            if (confirmLogin) {
                navigate('/Auth/login');
            }
        }
    };
 console.log("course.img", course ? course.img : null);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">강의 상세 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">오류 발생!</h4>
                        <p>{error}</p>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => window.location.reload()}
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-100 d-flex align-items-center justify-content-center">
                <div className="text-center py-5">
                    <h5>강의 정보를 찾을 수 없습니다.</h5>
                    <p className="text-muted">요청하신 강의 ID에 해당하는 정보가 없습니다.</p>
                    <button className="btn btn-secondary mt-3" onClick={() => navigate('/course/list')}>
                        강의 목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-5">
            <div className="container px-4">
                <div className="row">
                    {/* Main Content Area (Left) */}
                    <div className="col-lg-8">
                        {/* Course Header */}
                        <div className="bg-white p-4 rounded shadow-sm mb-4 d-flex align-items-center">
                            <div className="flex-shrink-0 mr-4">
                                <img
                                    src={course.img ? `${course.img}` : "/img/default_course_thumbnail.png"}
                                    alt={course.name || "Course Thumbnail"}
                                    className="img-fluid rounded"
                                    style={{ width: '250px', height: '150px', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <h1 className="mb-2 font-weight-bold">{course.name || '강의 제목 없음'}</h1>
                                <p className="text-muted mb-3">{course.intro || '강의에 대한 간략한 소개가 없습니다.'}</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded shadow-sm mb-4">
                            <h4 className="mb-3">강사 소개</h4>
                            <div className="card-text text-muted" style={{ minHeight: '100px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                                {course.career || "강사 이력 정보가 없습니다."}
                                <hr></hr>
                                {course.introduce || "강사 이력 정보가 없습니다."}

                            </div>
                        </div>

                        <div className="bg-white p-4 rounded shadow-sm mb-4">
                            <h4 className="mb-3">강의 상세</h4>
                            <div className="card-text text-muted" style={{ minHeight: '150px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                                {course.detail || "강의  정보가 여기에 표시됩니다."}
                            </div>
                        </div>

                        {/* 수강평 (Reviews) */}
                          <div className="bg-white p-4 rounded shadow-sm mb-4">
                              <h4 className="mb-3">수강평</h4>
                              <div className="d-flex align-items-center mb-2">
                                  {/* 전체 강의의 평균 별점 표시 */}
                                  {course.mark ? ( // course.mark는 강의 전체의 평균 별점
                                      <>
                                          {Array.from({ length: 5 }).map((_, i) => (
                                              <span key={i} className={`mr-1 ${i < Math.floor(course.mark) ? 'text-warning' : 'text-secondary'}`}>
                                                  &#9733;
                                              </span>
                                          ))}
                                          <span className="ml-2 text-muted">({course.mark.toFixed(1)} / 5.0)</span>
                                      </>
                                  ) : (
                                      <span className="text-muted">평점 정보 없음</span>
                                  )}
                              </div>

                              {course.reviews && course.reviews.length > 0 ? (
                                  <div className="reviews-list mt-3">
                                      {course.reviews.map((review, index) => (
                                          <div key={review.reviewnum || index} className="card-text text-muted mb-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                              <div className="d-flex justify-content-between align-items-center mb-1">
                                                  <div>
                                                      {/* 각 리뷰의 별점 표시 */}
                                                      {Array.from({ length: 5 }).map((_, i) => (
                                                          <span key={i} className={`small ${i < Math.floor(review.rating) ? 'text-warning' : 'text-secondary'}`}>
                                                              &#9733;
                                                          </span>
                                                      ))}
                                                      <span className="ml-2 small text-muted">({review.rating ? review.rating.toFixed(1) : 'N/A'})</span>
                                                  </div>
                                              </div>
                                              <p className="mb-1">{review.content}</p> 
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="card-text text-muted" style={{ minHeight: '80px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                                      아직 작성된 수강 후기가 없습니다. 첫 번째 수강 후기를 남겨보세요!
                                  </div>
                              )}
                          </div>
                    </div>

                    {/* Sidebar Area (Right) */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4 rounded shadow-sm">
                            <div className="d-flex justify-content-between align-items-baseline mb-3">
                                <span className="h3 mb-0 text-primary font-weight-bold">
                                    {course.price ? `${course.price.toLocaleString()}원` : '가격 정보 없음'}
                                </span>
                            </div>
                            <button className="btn btn-primary btn-lg btn-block mb-2" onClick={handleEnroll}>
                                수강신청하기
                            </button>

                            <ul className="list-group list-group-flush mb-4">
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                                    <span className="font-weight-bold text-muted">강사</span>
                                    <span>{course.teacher || '정보 없음'}</span> {/* teacher 필드 사용 */}
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                                    <span className="font-weight-bold text-muted">과목</span>
                                    <span>{course.SUBJECT || '정보 없음'}</span> {/* subject 필드 사용 */}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;