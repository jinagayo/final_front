import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PasswordVerification from './PasswordVerification';
import ProfileEdit from './ProfileEdit';

export default function Info() {
  const { user, isLoading } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [subjectList, setSubjectList] = useState([]); // 과목 목록 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('info'); // 'info', 'password', 'edit'
  
  // 학생/강사 정보 편집 상태
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [studentEditData, setStudentEditData] = useState({});
  const [teacherEditData, setTeacherEditData] = useState({});
  const S3_BASE_URL = "https://my-lecture-video.s3.ap-northeast-2.amazonaws.com/";
  const getImageUrl = (img) => {
  if (!img) return "/img/undraw_profile.svg";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return S3_BASE_URL + img;
};

  // 권한 확인 함수들
  const isStudent = () => user?.position === '1';
  const isTeacher = () => user?.position === '2';
  const isAdmin = () => user?.position === '3';

  // 과목 코드로 이름 찾기 함수
  const getSubjectNameByCode = (code) => {
    console.log('=== getSubjectNameByCode 호출 ===');
    console.log('검색할 코드:', code);
    console.log('subjectList:', subjectList);
    console.log('subjectList 길이:', subjectList.length);
    
    if (!code || !subjectList.length) {
      console.log('코드가 없거나 리스트가 비어있음');
      return '-';
    }
    
    // 각 항목 확인
    subjectList.forEach((item, index) => {
      console.log(`항목 ${index}:`, item);
      console.log(`  - code: "${item["code"]}" (타입: ${typeof item["code"]})`);
      console.log(`  - name: "${item["name"]}"`);
    });
    
    const subject = subjectList.find(item => {
      console.log(`비교: "${item["code"]}" === "${code}"`, item["code"] === code);
      return item["code"] === code;
    });
    
    console.log('찾은 결과:', subject);
    return subject ? subject["name"] : code;
  };

  // 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.user_id) return;

      try {
        setLoading(true);
        
        // 기본 사용자 정보 가져오기
        const userResponse = await fetch(`http://localhost:8080/api/Mypage/Profile`, {
          credentials: 'include'
        });
        
        if (!userResponse.ok) {
          throw new Error('사용자 정보를 불러오는데 실패했습니다.');
        }
        
        const userData = await userResponse.json();
        setUserDetails(userData);

        // 권한별 추가 정보 가져오기
        if (isStudent()) {
          try {
            const studentResponse = await fetch(`http://localhost:8080/api/Mypage/Student`, {
              credentials: 'include'
            });
            if (studentResponse.ok) {
              const studentData = await studentResponse.json();
              setStudentInfo(studentData);
              setStudentEditData(studentData || {});
            } else {
              setStudentInfo(null);
              setStudentEditData({});
            }
          } catch (error) {
            console.log('학생 정보가 없습니다.');
            setStudentInfo(null);
            setStudentEditData({});
          }
        } else if (isTeacher()) {
          try {
            const teacherResponse = await fetch(`http://localhost:8080/api/Mypage/Teacher`, {
              credentials: 'include'
            });
            if (teacherResponse.ok) {
              const teacherData = await teacherResponse.json();
              console.log('=== 전체 응답 데이터 ===', teacherData);
              console.log('=== teacher 데이터 ===', teacherData.teacher);
              console.log('=== list 데이터 ===', teacherData.list);
              
              // 서버에서 받은 데이터 구조에 맞게 처리
              const teacher = teacherData.teacher || teacherData;
              const subjects = teacherData.list || [];
              
              console.log('=== 처리된 강사 정보 ===', teacher);
              console.log('=== 처리된 과목 목록 ===', subjects);
              console.log('=== 강사의 subId ===', teacher?.subId);
              console.log('=== 강사의 subId ===', teacher?.subId);
              
              setTeacherInfo(teacher);
              setTeacherEditData(teacher || {});
              setSubjectList(subjects);
            } else {
              setTeacherInfo(null);
              setTeacherEditData({});
            }
          } catch (error) {
            console.log('강사 정보가 없습니다.');
            setTeacherInfo(null);
            setTeacherEditData({});
          }
        }

      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchUserData();
    }
  }, [user, isLoading]);

  console.log(userDetails)

  // 학생 정보 저장/업데이트
  const handleStudentInfoUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/Mypage/StudentUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(studentEditData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setStudentInfo(updatedData);
        setStudentEditData(updatedData);
        setIsEditingStudent(false);
        alert('학생 정보가 성공적으로 저장되었습니다.');
      } else {
        throw new Error('학생 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('학생 정보 저장 오류:', error);
      alert('학생 정보 저장 중 오류가 발생했습니다.');
    }
  };

  // 강사 정보 저장/업데이트
  const handleTeacherInfoUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/Mypage/TeacherUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(teacherEditData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        // 서버 응답 구조에 맞게 처리
        const teacher = updatedData.teacher || updatedData;
        setTeacherInfo(teacher);
        setTeacherEditData(teacher);
        setIsEditingTeacher(false);
        alert('강사 정보가 성공적으로 저장되었습니다.');
      } else {
        throw new Error('강사 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('강사 정보 저장 오류:', error);
      alert('강사 정보 저장 중 오류가 발생했습니다.');
    }
  };

  // 입력값 변경 핸들러
  const handleStudentInputChange = (field, value) => {
    setStudentEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeacherInputChange = (field, value) => {
    setTeacherEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 비밀번호 확인 성공 시
  const handlePasswordVerified = () => {
    setCurrentView('edit');
  };

  // 프로필 수정 완료 시
  const handleProfileEditComplete = (updatedUserData) => {
    setUserDetails(updatedUserData);
    setCurrentView('info');
  };

  if (isLoading || loading) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
        <p className="text-gray-500">사용자 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  // 비밀번호 확인 화면
  if (currentView === 'password') {
    return (
      <PasswordVerification
        onVerified={handlePasswordVerified}
        onCancel={() => setCurrentView('info')}
      />
    );
  }

  // 프로필 수정 화면
  if (currentView === 'edit') {
    return (
      <ProfileEdit
        userDetails={userDetails}
        onComplete={handleProfileEditComplete}
        onCancel={() => setCurrentView('info')}
      />
    );
  }

  // 기본 정보 화면
  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">마이페이지</h1>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentView('password')}
        >
          <i className="fas fa-edit fa-sm mr-2"></i>
          프로필 수정
        </button>
      </div>

      <div className="row">
        {/* 프로필 카드 */}
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">프로필</h6>
            </div>
            <div className="card-body text-center">
              <div className="profile-image-container mb-3">
              <img 
            src={getImageUrl(userDetails?.img)}
             alt="Profile" 
             className="rounded-circle shadow"
            style={{
             width: '120px',
            height: '120px',
           objectFit: 'cover',
           border: '4px solid #f8f9fc'
           }}
            />
              </div>
              <h5 className="font-weight-bold text-gray-800 mb-1">
                {userDetails?.name || 'Unknown'}
              </h5>
              <p className="text-gray-600 mb-2">{userDetails?.user_id}</p>
              <div className="mb-3">
                <span className="badge badge-info">
                  {isStudent() && '학생'}
                  {isTeacher() && '강사'}
                  {isAdmin() && '관리자'}
                </span>
              </div>
              <p className="text-gray-600 small mb-0">
                가입일: {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="col-xl-8 col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">기본 정보</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">이름</label>
                  <p className="form-control-static">{userDetails?.name || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">이메일</label>
                  <p className="form-control-static">{userDetails?.email || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">전화번호</label>
                  <p className="form-control-static">{userDetails?.phone || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">생년월일</label>
                  <p className="form-control-static">
                     {userDetails?.birthday
    ? (() => {
        const b = userDetails.birthday;
        if (b instanceof Date && !isNaN(b)) {
          // Date 객체
          return b.toLocaleDateString('ko-KR');
        }
        if (typeof b === 'number') {
          // 숫자(timestamp)
          return new Date(b).toLocaleDateString('ko-KR');
        }
        if (typeof b === 'string') {
          // 문자열(YYYY-MM-DD 또는 ISO)
          // 'YYYY-MM-DD' 포맷도 파싱 가능하게 변경
          let dateObj;
          if (b.includes('T')) {
            dateObj = new Date(b);
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(b)) {
            // YYYY-MM-DD → YYYY-MM-DDT00:00:00
            dateObj = new Date(b + 'T00:00:00');
          } else {
            dateObj = new Date(b);
          }
          if (!isNaN(dateObj)) {
            return dateObj.toLocaleDateString('ko-KR');
          }
        }
        return '-';
      })()
    : '-'}
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label font-weight-bold">주소</label>
                  <p className="form-control-static">
                    {userDetails?.addressnum && `(${userDetails.addressnum}) `}
                    {userDetails?.address1} {userDetails?.address2}
                    {!userDetails?.address1 && '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 학생 정보 */}
      {isStudent() && (
        <div className="card shadow mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-weight-bold text-primary">학생 정보</h6>
            <div>
              {!isEditingStudent ? (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditingStudent(true)}
                >
                  <i className="fas fa-edit fa-sm mr-1"></i>
                  {studentInfo ? '수정' : '입력'}
                </button>
              ) : (
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleStudentInfoUpdate}
                  >
                    <i className="fas fa-save fa-sm mr-1"></i>
                    저장
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setIsEditingStudent(false);
                      setStudentEditData(studentInfo || {});
                    }}
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="card-body">
            {isEditingStudent ? (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">학위</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentEditData.degree || ''}
                    onChange={(e) => handleStudentInputChange('degree', e.target.value)}
                    placeholder="학위를 입력하세요"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">수상 경력</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentEditData.award || ''}
                    onChange={(e) => handleStudentInputChange('award', e.target.value)}
                    placeholder="수상 경력을 입력하세요"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">보유 기술</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentEditData.skill || ''}
                    onChange={(e) => handleStudentInputChange('skill', e.target.value)}
                    placeholder="보유 기술을 입력하세요"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">자격증</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentEditData.license || ''}
                    onChange={(e) => handleStudentInputChange('license', e.target.value)}
                    placeholder="자격증을 입력하세요"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">외국어</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentEditData.language || ''}
                    onChange={(e) => handleStudentInputChange('language', e.target.value)}
                    placeholder="외국어 능력을 입력하세요"
                  />
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">학위</label>
                  <p className="form-control-static">{studentInfo?.degree || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">수상 경력</label>
                  <p className="form-control-static">{studentInfo?.award || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">보유 기술</label>
                  <p className="form-control-static">{studentInfo?.skill || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">자격증</label>
                  <p className="form-control-static">{studentInfo?.license || '-'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">외국어</label>
                  <p className="form-control-static">{studentInfo?.language || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 강사 정보 */}
      {isTeacher() && (
        <div className="card shadow mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-weight-bold text-primary">강사 정보</h6>
            <div>
              {!isEditingTeacher ? (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditingTeacher(true)}
                >
                  <i className="fas fa-edit fa-sm mr-1"></i>
                  {teacherInfo ? '수정' : '입력'}
                </button>
              ) : (
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleTeacherInfoUpdate}
                  >
                    <i className="fas fa-save fa-sm mr-1"></i>
                    저장
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setIsEditingTeacher(false);
                      setTeacherEditData(teacherInfo || {});
                    }}
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="card-body">
            {isEditingTeacher ? (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">담당 과목</label>
                  <select
                    className="form-control"
                    value={teacherEditData.subId || ''}
                    onChange={(e) => handleTeacherInputChange('subId', e.target.value)}
                  >
                    <option value="">과목을 선택하세요</option>
                    {subjectList.map((subject, index) => (
                      <option key={subject["code"] || index} value={subject["code"]}>
                        {subject["name"]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">경력</label>
                  <input
                    type="text"
                    className="form-control"
                    value={teacherEditData.career || ''}
                    onChange={(e) => handleTeacherInputChange('career', e.target.value)}
                    placeholder="경력을 입력하세요"
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label font-weight-bold">자기소개</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={teacherEditData.introduce || ''}
                    onChange={(e) => handleTeacherInputChange('introduce', e.target.value)}
                    placeholder="자기소개를 입력하세요"
                  />
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">담당 과목</label>
                  <p className="form-control-static">
                    {getSubjectNameByCode(teacherInfo?.subId)}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label font-weight-bold">경력</label>
                  <p className="form-control-static">{teacherInfo?.career || '-'}</p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label font-weight-bold">자기소개</label>
                  <p className="form-control-static" style={{whiteSpace: 'pre-wrap'}}>
                    {teacherInfo?.introduce || '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .form-control-static {
          padding: 0.375rem 0;
          margin-bottom: 0;
          background: transparent;
          border: none;
          border-radius: 0;
        }
        
        .profile-image-container {
          position: relative;
          display: inline-block;
        }
        
        .card {
          border: none;
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
        }
        
        .card-header {
          background-color: #f8f9fc;
          border-bottom: 1px solid #e3e6f0;
        }
      `}</style>
    </div>
  );
}