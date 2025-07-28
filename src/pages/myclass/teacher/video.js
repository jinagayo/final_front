import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

function VideoUploader() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);   //업로드할 영상 파일
  const [uploadUrl, setUploadUrl] = useState('');  //s3 pre-signed URL
  const [videoKey, setVideoKey] = useState('');  //S3에 저장된 key
  const [loading, setLoading] = useState(false); 
  const [isUploaded, setIsUploaded] = useState(false);  //업로드 완료 여부
  const [lectureTitle, setLectureTitle] = useState('');  //강의명
  const [lectureDetail, setLectureDetail] = useState('');  //강의명
    const [classData, setClassData] = useState(null);  //강의 클래스 정보
  const { classId } = useParams();
  const [lectures, setLectures] = useState([]);  //기존강의 목록
   const { user } = useAuth();

  const BACKEND_URL = 'http://localhost:8080';

   useEffect(() => {
      if (classId) {
        fetchClassDetail();  //강의 이미지 등 상세정보
        fetchLectures();     //기존 강의 차시 수 계산
      }
    }, [classId]);

    useEffect(() => {
      if(isUploaded){
      alert('✅ 업로드가 완료되었습니다!');
      navigate(`/myclass/teacher/classDetail/${classId}`);
      }
    },[isUploaded, navigate]);

  // 강사 권한 확인
  const isTeacher = () => user?.position === '2' || user?.position === 'teacher';

  if (!isTeacher()) {
    return (
      <div className="container-fluid px-4 py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          강사 권한이 필요합니다.
        </div>
      </div>
    );
  }

  // 클래스 세부 정보 가져오기
  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data.data);   // 프론트에서 classData?.img, classData?.name 사용
      } else {
        console.error('강의 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('강의 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 강좌 목록 가져오기
  const fetchLectures = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/myclass/teacher/class/${classId}/lectures`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLectures(data.data || []);
      } else {
        console.error('강의 목록 가져오기 실패');
        setLectures([]);
      }
    } catch (error) {
      console.error('강의 목록 가져오기 오류:', error);
      setLectures([]);
      setLoading(false);
    }
  };

  //동영상 파일 선택 핸들러
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);  //선택된 파일 저장
    setIsUploaded(false);        //초기화
    setVideoKey('');
  };

  //S3 업로드 핸들러
  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택해주세요');
      return;
    }
    try {
    const response = await axios.post(`${BACKEND_URL}/video/upload`, null, {
      params: { filename: file.name },
      withCredentials: true
    });

    const { uploadUrl, key } = response.data;
    setVideoKey(key);

    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type }
    });

    // 여기서 key 제대로 설정되었는지 확인
    console.log('✅ videoKey:', key);

    // key가 없으면 종료
    if (!key) {
      alert('업로드 키가 유효하지 않습니다.');
      return;
    }

    // 저장 요청 분리
    const saveRes = await axios.post(`${BACKEND_URL}/video/save`, {
      title: lectureTitle,
      key: key,  // state 말고 응답값 그대로 사용
      classId: classId,
      detail: lectureDetail,
    }, {
      withCredentials: true
    });

    setIsUploaded(true);

  } catch (err) {
    console.error('업로드 실패:', err.response?.data || err.message);
    alert('업로드 중 오류가 발생했습니다.');
  }
  };

  return (
    <div
      style={{
        position: 'relative', // ✅ 업로드 버튼을 absolute로 정렬하기 위한 기준
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '40px',
        width: '100%',
        maxWidth: '1100px',
        margin: '40px auto',
        padding: '32px',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 16px rgba(0,0,0,0.05)',
        boxSizing: 'border-box',
        alignItems: 'start',
        minHeight: 'calc(100vh - 150px)',
        paddingBottom: '60px'
      }}
    >
      {/* 왼쪽 입력 영역 */}
      <div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 18, display: 'block', marginBottom: 10 }}>
            강의 차시  {' '}
             {lectures.length + 1}
          </label>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 18, display: 'block', marginBottom: 10 }}>
            강의명:
          </label>
          <input
            type="text"
            value={lectureTitle}
            onChange={e => setLectureTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
          />
        </div>



         <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 18, display: 'block', marginBottom: 10 }}>
            강의내용:
          </label>
          <input
            type="text"
            value={lectureDetail}
            onChange={e => setLectureDetail(e.target.value)}
            style={{
              width: '100%',
              height: '130px',
              padding: '12px',
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
          />
        </div>




  
        <div style={{ marginBottom: 20 }}>
          <input
            type="file"
            id="video-upload"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="video-upload" style={{
            backgroundColor: '#3973ce',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
            display: 'inline-block',
            marginRight: 10
          }}>
            동영상 업로드
          </label>
        </div>

        {file && !isUploaded && (
          <p style={{ color: '#555' }}>
            선택된 파일: {file.name}
          </p>
        )}
    </div>

      {/* 오른쪽 배너 영역 */}
      <div style={{
        backgroundColor: '#fcf6ed',
        borderRadius: 8,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '220px'
      }}>
       {classData?.img ? (
                <img 
                  src={classData?.img?.startsWith('/img/') ? classData.img : `/img/${classData.img}`}
                  alt="강의 이미지"
                  style={{
                    width: '100%',
                    height: '250px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                  }}
                />
              ) : (
                // 이미지 없을 때 임시 아이콘/색상 대체
                <div style={{
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#fff5e6',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#f39c12',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    ☕
                  </div>
                  <h3 style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '24px', margin: 0 }}>java</h3>
                </div>
              )}
        <div style={{ color: '#1b385e', fontWeight: 700, fontSize: 22, textAlign: 'center' }}>
          {classData?.name}
        </div>
      </div>

      {/* 업로드 버튼 오른쪽 하단 고정 */}
      <div style={{
        position: 'absolute',
        right: '40px',
        bottom: '40px'
      }}>
        <button
          onClick={handleUpload}
          style={{
            backgroundColor: '#3973ce',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 600,
            border: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}
        >
          업로드하기
        </button>
      </div>
    </div>
    
  );
}
export default VideoUploader;
