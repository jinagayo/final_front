import React, { useState } from 'react';
import axios from 'axios';

function VideoUploader() {
  const [file, setFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);

  const BACKEND_URL = 'http://localhost:8080'; // Spring Boot 서버 주소

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setIsUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택해주세요');
      return;
    }

    try {
      // 1. Spring Boot 서버에서 presigned URL 요청
      const response = await axios.post(`http://localhost:8080/video/upload`, null, {
        params: { filename: file.name },
        withCredentials: true // 인증이 필요한 경우
      });

      const { uploadUrl, key } = response.data;
      setUploadUrl(uploadUrl);
      setVideoKey(key);

      // 2. S3로 직접 PUT 업로드
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      });

      setIsUploaded(true);
    } catch (err) {
      console.error('업로드 실패:', err);
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>강의 동영상 업로드</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>S3에 업로드</button>

      {isUploaded && (
        <div style={{ marginTop: '1rem' }}>
          ✅ 업로드 완료! 영상 key: <code>{videoKey}</code>
        </div>
      )}
    </div>
  );
}

export default VideoUploader;