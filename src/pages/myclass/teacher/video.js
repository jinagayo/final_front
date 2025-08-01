import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

function VideoUploader() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [uploadUrl, setUploadUrl] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDetail, setLectureDetail] = useState('');
  const [classData, setClassData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null); // ✅ 미리보기 URL
  const { user } = useAuth();
  const { classId } = useParams();
   const S3_BASE_URL = "https://my-lecture-video.s3.ap-northeast-2.amazonaws.com/";

function getImageUrl(img) {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return S3_BASE_URL + img;
}

  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchLectures();
    }
  }, [classId]);

  useEffect(() => {
    if (isUploaded) {
      alert('✅ 업로드가 완료되었습니다!');
      navigate(`/myclass/teacher/classDetail?class_id=${classId}`);
    }
  }, [isUploaded, navigate]);

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

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/myclass/teacher/class/${classId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClassData(data.data);
      } else {
        console.error('강의 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('강의 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(classData)

  const fetchLectures = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/myclass/teacher/class/${classId}/lectures`, {
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
    } finally {
      setLoading(false);
    }
  };

  // ✅ 파일 선택 시 video preview URL 생성
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsUploaded(false);
    setVideoKey('');
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setVideoPreviewUrl(url);
    }
  };

  // ✅ metadata 로드 시 duration 추출
  const handleLoadedMetadata = (e) => {
    const dur = e.target.duration;
    setDuration(dur);
    console.log('🎬 비디오 길이:', dur, '초');
  };

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

      if (!key) {
        alert('업로드 키가 유효하지 않습니다.');
        return;
      }

      await axios.post(`${BACKEND_URL}/video/save`, {
        title: lectureTitle,
        key: key,
        classId: classId,
        detail: lectureDetail,
        duration: Math.floor(duration), // 초 단위
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
    <div style={{
      position: 'relative',
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
      alignItems: 'start',
      minHeight: 'calc(100vh - 150px)',
      paddingBottom: '60px'
    }}>
      <div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 18 }}>강의 차시 {lectures.length + 1}</label>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 18 }}>강의명:</label>
          <input
            type="text"
            value={lectureTitle}
            onChange={e => setLectureTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 18 }}>강의내용:</label>
          <textarea
            value={lectureDetail}
            onChange={e => setLectureDetail(e.target.value)}
            style={{ width: '100%', height: '130px', padding: '12px', borderRadius: 4, border: '1px solid #ccc' }}
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
            fontWeight: 600
          }}>
            동영상 업로드
          </label>
        </div>

        {file && !isUploaded && (
          <p style={{ color: '#555' }}>선택된 파일: {file.name}</p>
        )}

        {/* ✅ 보이지 않는 video 태그로 duration 추출 */}
        {videoPreviewUrl && (
          <video
            src={videoPreviewUrl}
            onLoadedMetadata={handleLoadedMetadata}
            style={{ display: 'none' }}
          />
        )}
      </div>

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
             src={getImageUrl(classData?.img)}
            alt="강의 이미지"
            style={{ width: '100%', height: '250px', borderRadius: '10px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '250px', backgroundColor: '#fff5e6', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '80px', height: '80px', backgroundColor: '#f39c12',
              borderRadius: '10px', marginBottom: '15px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white'
            }}>
              ☕
            </div>
            <h3 style={{ color: '#e67e22' }}>java</h3>
          </div>
        )}
        <div style={{ color: '#1b385e', fontWeight: 700, fontSize: 22, textAlign: 'center' }}>
          {classData?.name}
        </div>
      </div>

      <div style={{ position: 'absolute', right: '40px', bottom: '40px' }}>
        <button
          onClick={handleUpload}
          style={{
            backgroundColor: '#3973ce',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 600,
            border: 'none'
          }}
        >
          업로드하기
        </button>
      </div>
    </div>
  );
}

export default VideoUploader;
