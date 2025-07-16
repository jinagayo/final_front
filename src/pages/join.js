import React, { useEffect, useState } from 'react';

function Join() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/join/join')
      .then((res) => res.text()) // 문자열 응답이므로 .text() 사용
      .then((data) => {
         console.log('백엔드 응답:', data);
        setMessage(data);
      })
      .catch((err) => {
        console.error('API 호출 에러:', err);
      });
  }, []);

  return (
    <div>
      <h2>백엔드 메시지:</h2>
      <p>{message}</p>
    </div>
  );
}

export default Join;