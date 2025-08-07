import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // ⭐ 추가

const TCourseList = () => {
 const [courses, setCourses] = useState([]);
 const [loading, setLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;
 const [totalPages, setTotalPages] = useState(0);
 const [totalElements, setTotalElements] = useState(0);

 // ⭐ 권한 관련 state 추가
 const [isAuthorized, setIsAuthorized] = useState(false);
 const [authLoading, setAuthLoading] = useState(true);
 const [error, setError] = useState(null);

 const { user } = useAuth();
 const navigate = useNavigate(); // ⭐ 추가

 // ⭐ 권한 체크 함수
 const checkAuth = async () => {
   try {
     setAuthLoading(true);
     setError(null);

     const response = await fetch('http://localhost:8080/auth/check', {
       credentials: 'include'
     });

     if (response.ok) {
       const data = await response.json();
       
       if (data.isLoggedIn && (data.position === "2" || data.position === "3")) {
         setIsAuthorized(true);
       } else if (!data.isLoggedIn) {
         throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
       } else {
         throw new Error('접근 권한이 없습니다. 강사 권한이 필요합니다.');
       }
     } else {
       throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
     }
   } catch (error) {
     console.error('권한 체크 실패:', error);
     setError(error.message);
     setIsAuthorized(false);
   } finally {
     setAuthLoading(false);
   }
 };

 // ⭐ 권한 체크 useEffect
 useEffect(() => {
   checkAuth();
 }, [navigate]);

// ⭐ 데이터 로딩 useEffect (권한 확인 후)
useEffect(() => {
  if (isAuthorized) {
    fetchMyCourses();
  }
}, [currentPage, searchTerm, isAuthorized]);

// 내 클래스 목록 가져오기
const fetchMyCourses = async () => {
  try {
    setLoading(true);

    const params = new URLSearchParams({
      page: currentPage.toString(),
      size: itemsPerPage.toString(),
      search: searchTerm || ''
    });

    // endpoint를 강사용으로 고정
    const response = await fetch(`http://localhost:8080/api/myclass/teacher/classList?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.data)
      setCourses(data.data || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } else {
      // ⭐ 위의 코드와 동일하게 수정
      if (response.status === 401 || response.status === 403) {
        setError("강사 권한이 없습니다. 로그인해주세요.");
        navigate('/auth/login');
        return;
      }
      throw new Error(`HTTP 에러! 상태: ${response.status}`);
    }
  } catch (error) {
    console.error('강의 목록 가져오기 오류:', error);
    // ⭐ 위의 코드와 동일하게 수정
    setError("데이터를 불러오는 데 실패했습니다: " + error.message);
    setCourses([]);
  } finally {
    setLoading(false);
  }
};

 // 강사 권한 확인 (필요하면 사용)
 const isTeacher = () => user?.position === '2' || user?.position === 'teacher';

 // ⭐ 권한 체크 중일 때
if (loading) {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">강의 목록을 불러오는 중...</p>
      </div>
    </div>
  );
}

// ⭐ 데이터 로딩 에러 화면 추가
if (error) {
  return (
    <div className="container-fluid px-4 py-5">
      <div className="card-body">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">오류 발생</h4>
          <p>{error}</p>
          <hr />
          <div className="mb-0">
            <button 
              className="btn btn-outline-danger" 
              onClick={() => {
                setError(null);
                if (isAuthorized) {
                  fetchMyCourses();
                }
              }}
            >
              다시 시도
            </button>
            {error.includes('권한') && (
              <div className="mt-2">
                <small className="text-muted">
                  강사 권한이 필요합니다. 로그인 상태와 권한을 확인해주세요.
                </small>
                <br />
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => navigate('/auth/login')}
                >
                  로그인 페이지로 이동
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

 // ⭐ 권한이 없을 때
 if (!isAuthorized) {
   return null;
 }

 // 클래스 상세로 이동
 const goToCourseDetail = (classId) => {
   window.location.href = `/myclass/teacher/classDetail?class_id=${classId}`;
 };

 // 검색어 변경
 const handleSearchChange = (term) => {
   setSearchTerm(term);
   setCurrentPage(1);
 };

 // 페이지 변경
 const handlePageChange = (page) => {
   setCurrentPage(page);
 };

 // 페이지 번호 생성
 const getPageNumbers = () => {
   const maxVisiblePages = 5;
   const pages = [];

   if (totalPages <= maxVisiblePages) {
     for (let i = 1; i <= totalPages; i++) {
       pages.push(i);
     }
   } else {
     const half = Math.floor(maxVisiblePages / 2);
     let start = Math.max(1, currentPage - half);
     let end = Math.min(totalPages, start + maxVisiblePages - 1);

     if (end - start + 1 < maxVisiblePages) {
       start = Math.max(1, end - maxVisiblePages + 1);
     }

     for (let i = start; i <= end; i++) {
       pages.push(i);
     }
   }
   return pages;
 };

 // Q&A 개수에 따른 스타일
 const getQnABadgeStyle = (qnaCount) => {
   if (qnaCount > 0) {
     return { backgroundColor: '#ff4757', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' };
   }
   return {};
 };

 return (
   <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
     {/* 로딩 상태 */}
     {loading ? (
       <div className="text-center py-5">
         <div className="spinner-border text-primary" role="status">
           <span className="sr-only">Loading...</span>
         </div>
         <p className="mt-2">강의 목록을 불러오는 중...</p>
       </div>
     ) : (
       <>
         {/* 클래스 테이블 */}
         <div className="table-responsive">
           <table className="table table-borderless">
             <thead style={{ backgroundColor: '#f8f9fa' }}>
               <tr>
                 <th style={{ padding: '15px', fontWeight: 'bold',  textAlign: 'center'}}>강의명</th>
                 <th style={{ padding: '15px', fontWeight: 'bold', textAlign: 'center' }}>강의 수</th>
                 <th style={{ padding: '15px', fontWeight: 'bold', textAlign: 'center' }}>Q&A</th>
               </tr>
             </thead>
             <tbody>
               {courses.length > 0 ? (
                 courses.map((course, index) => 
                   <tr 
                     key={course.id || index}
                     style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                     onClick={() => goToCourseDetail(course.classId)}
                     onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
                     onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                   >
                     <td style={{ padding: '15px' }}>
                       <div className="d-flex align-items-center">
                         <div 
                           style={{ 
                             width: '8px', 
                             height: '8px', 
                             backgroundColor: '#4834d4', 
                             borderRadius: '50%', 
                             marginRight: ' 10px' 
                           }}
                         ></div>
                         <span style={{ fontWeight: '500' }}>{course.name}</span>
                         
                       </div>
                     </td>
                     <td style={{ padding: '15px', textAlign: 'center' }}>
                       {course.lectureCount || 0}
                     </td>
                     <td style={{ padding: '15px', textAlign: 'center' }}>
                       {course.qnaCount > 0 ? (
                         <span style={getQnABadgeStyle(course.qnaCount)}>
                           {course.qnaCount}
                         </span>
                       ) : (
                         course.qnaCount || 0
                       )}
                     </td>
                   </tr>
                   
                 )): (
                 <tr>
                   <td colSpan="4" className="text-center py-5">
                     <i className="fas fa-book fa-3x text-muted mb-3"></i>
                     <p className="text-muted">
                       {searchTerm ? '검색 결과가 없습니다.' : '개설한 강의가 없습니다.'}
                     </p>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>

         {/* 페이징 */}
         {totalPages > 1 && (
           <div className="d-flex justify-content-center align-items-center mt-4">
             <nav aria-label="Page navigation">
               <ul className="pagination mb-0">
                 {/* 이전 페이지 */}
                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                   <button
                     className="page-link border-0 bg-transparent"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     style={{ 
                       color: currentPage === 1 ? '#6c757d' : '#4834d4',
                       fontSize: '18px',
                       padding: '8px 12px'
                     }}
                   >
                     <i className="fas fa-chevron-left"></i>
                   </button>
                 </li>

                 {/* 페이지 번호들 */}
                 {getPageNumbers().map((pageNumber) => (
                   <li key={pageNumber} className="page-item mx-1">
                     <button
                       className={`page-link border-0 ${
                         pageNumber === currentPage 
                           ? 'text-white' 
                           : 'bg-transparent'
                       }`}
                       onClick={() => handlePageChange(pageNumber)}
                       style={{
                         minWidth: '40px',
                         height: '40px',
                         borderRadius: '6px',
                         fontWeight: pageNumber === currentPage ? 'bold' : 'normal',
                         backgroundColor: pageNumber === currentPage ? '#4834d4' : 'transparent',
                         color: pageNumber === currentPage ? 'white' : '#4834d4',
                         boxShadow: pageNumber === currentPage ? '0 2px 4px rgba(72,52,212,0.3)' : 'none'
                       }}
                     >
                       {pageNumber}
                     </button>
                   </li>
                 ))}

                 {/* 다음 페이지 */}
                 <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                   <button
                     className="page-link border-0 bg-transparent"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     style={{ 
                       color: currentPage === totalPages ? '#6c757d' : '#4834d4',
                       fontSize: '18px',
                       padding: '8px 12px'
                     }}
                   >
                     <i className="fas fa-chevron-right"></i>
                   </button>
                 </li>
               </ul>
             </nav>
           </div>
         )}
       </>
     )}
   </div>
 );
};

export default TCourseList;