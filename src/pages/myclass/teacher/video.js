// src/components/Video.js
import React, { useState } from 'react';

function Video() {
  const [file, setFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('동영상 파일을 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/video/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const url = await response.text();
        setUploadUrl(url);
        setError('');
      } else {
        setError('❌ 업로드 실패: 권한 또는 서버 문제');
        setUploadUrl('');
      }
    } catch (err) {
      console.error('업로드 중 오류 발생:', err);
      setError('❌ 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h2>동영상 업로드 (React)</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>업로드</button>
      <br /><br />
      {uploadUrl && (
        <div>
          ✅ 업로드 성공:
          <br />
          <a href={uploadUrl} target="_blank" rel="noopener noreferrer">
            {uploadUrl}
          </a>
          <br /><br />
          <video src={uploadUrl} width="640" controls />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Video;