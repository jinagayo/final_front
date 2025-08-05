import React, { useState, useEffect, useRef} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Users,
  SkipBack, SkipForward, Star, BookOpen, MessageCircle, Download, Clock
} from 'lucide-react';



export default function LectureViewer() {
const lastSentProgress = useRef(0);
const videoRef = useRef();
 const userId = localStorage.getItem('userId');
 const { meterId } = useParams(); 
 const [classData, setClassData] = useState(null);
 const [lectures, setLectures] = useState([]);
 const [isMuted, setIsMuted] = useState(false);
 const [currentTime, setCurrentTime] = useState(1530); // 25분 30초
 const [duration] = useState(5400); // 90분
 const [activeTab, setActiveTab] = useState('overview');
 const [meterial, setMeterial] = useState(null);
 const [videoUrl, setVideoUrl] = useState('');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
   const BACKEND_URL = 'http://localhost:8080';
 const [note, setNote] = useState('');
 const [isNoteLoading, setIsNoteLoading] = useState(false);
 const [noteSaved, setNoteSaved] = useState(false);
 const [isEditMode, setIsEditMode] = useState(false); 
 const [originalNote, setOriginalNote] = useState('');

console.log("userId: " + userId)

function shouldSendProgress(current) {
  if (current !== lastSentProgress && current % 5 === 0) {
    lastSentProgress.current = current;
    return true;
  }
  return false;
}

// 노트 불러오기
useEffect(() => {
  if (!meterId || !userId) return;
  setIsNoteLoading(true);
  axios.get(`${BACKEND_URL}/video/${meterId}/note`, {
    params: { stdId: userId },
    withCredentials: true,
  })
    .then(res => {
      const content = res.data.content || '';
      setNote(content);
      setOriginalNote(content);  // 👈 최초 값 저장
    })
    .catch(() => setNote(''))
    .finally(() => setIsNoteLoading(false));
}, [meterId, userId]);

// 노트 저장
const handleNoteSave = async () => {
  try {
    await axios.post(`${BACKEND_URL}/video/${meterId}/note`, {
      stdId: userId,
      content: note
    }, { withCredentials: true });
    setNoteSaved(true);
    setIsEditMode(false);     // 👈 저장 후 읽기모드
    setOriginalNote(note);    // 👈 원본값 갱신
    setTimeout(() => setNoteSaved(false), 1500);
  } catch (err) {
    alert('저장 실패!');
  }
};

const handleEditClick = () => {
  setIsEditMode(true);
};

const handleCancelEdit = () => {
  setNote(originalNote);
  setIsEditMode(false);
};
   
   useEffect(() => {
  const fetchMaterial = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/video/material/${meterId}`, {
        withCredentials: true,
      });
      setMeterial(res.data); // 예: { id: 3, content: 'videos/abc.mp4' }
    } catch (err) {
      console.error('강의 메타데이터 가져오기 실패', err);
    }
  };

  fetchMaterial();
}, []);

useEffect(() => {
  console.log('meterial:', meterial);
  if (!meterial || !meterial.classId) return; // 조건 강화

  const fetchClassData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/myclass/teacher/class/${meterial.classId}`, {
        withCredentials: true,
      });
      console.log('📦 classData 응답:', res.data);
      setClassData(res.data);
    
    } catch (err) {
      console.error('강의 클래스 정보 로딩 실패:', err);
    }
  };
  console.log("classData:" + classData);
  console.log("📌 meterial.detail:", meterial.detail);

  const fetchLectures = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/myclass/teacher/class/${meterial.classId}/lectures`, 
        {
          params: {studentId: userId},
          withCredentials: true,
      });
       console.log('📦 강의 목록 응답:', res.data);
      setLectures(res.data.data || []);
    } catch (err) {
       if (err.response) {
      console.error('강의 목록 로딩 실패:', err.response.status, err.response.data);
    } else {
      console.error('강의 목록 로딩 실패:', err.message);
    }
    }
  };

  fetchClassData();
  fetchLectures();
}, [meterial]);

console.log(lectures);


  useEffect(() => {
    if (!meterial || !meterial.content) return; // 값 없으면 실행 X

  const fetchVideoUrl = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/video/stream`, {
        params: { key: meterial.content }, // 예: videos/xxx.mp4
        withCredentials: true,
      });
      setVideoUrl(res.data.videoUrl);
    } catch (err) {
      console.error('영상 시청 URL 가져오기 실패', err);
    }
  };

  fetchVideoUrl();
}, [meterial]);

const completedLectures = lectures.filter(lec => lec.progress >= 50 ).length;
const totalLectures = lectures.length;
const progressPercent = totalLectures > 0
  ? Math.round((completedLectures / totalLectures) * 100)
  : 0;

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const percent = video.currentTime / video.duration;
    const rounded = Math.round(percent * 100);

    if(shouldSendProgress(rounded)){
      sendProgressToServer(rounded);
    }
  };

  const sendProgressToServer = async (progress) => {
    await axios.post(`${BACKEND_URL}/video/progress/update`, {
      meterialId : meterId,
      stdId : userId,
      progress : progress,
    }, {withCredentials: true});
  }



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
          <div>
          <h1 className="text-2xl font-bold">{classData?.name || '강의 제목 로딩 중...'}</h1>
          <p className="text-gray-400 text-sm">{classData?.teacher || '강사명'}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>{classData?.studentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-sm text-gray-300">4.8</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lecture */}
          <div className="lg:col-span-2">
            {/* Video Preview */}
           {videoUrl ? (
              <video
                 ref={videoRef}
                 src={videoUrl}
                crossOrigin="anonymous"
                 controls
                  style={{ width: '100%', borderRadius: '10px', marginTop: '20px' }}
                  onTimeUpdate={handleTimeUpdate}

               />
              ) : (
               <p>동영상을 불러오는 중...</p>
            )}

          
            {/* Tabs */}
            <div className="bg-gray-800 rounded-xl mt-4">
              <div className="flex border-b border-gray-700">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-center ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><BookOpen className="inline-block w-4 h-4 mr-1" /> 강의 개요</button>
                <button onClick={() => setActiveTab('notes')} className={`flex-1 py-3 text-center ${activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><MessageCircle className="inline-block w-4 h-4 mr-1" /> 강의 노트</button>
                <button onClick={() => setActiveTab('resources')} className={`flex-1 py-3 text-center ${activeTab === 'resources' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><Download className="inline-block w-4 h-4 mr-1" /> 자료실</button>
              </div>
              <div className="p-6 text-sm text-gray-300">
                {activeTab === 'overview' && meterial?.detail}
          {activeTab === 'notes' && (
              <div>
              {isNoteLoading ? (
               <div className="text-gray-400">노트 불러오는 중...</div>
               ) : (
                <>
              {isEditMode ? (
                  <>
                 <textarea
                 className="w-full h-40 p-2 rounded bg-gray-900 text-white border border-gray-700 resize-none"
                 value={note}
                  onChange={e => setNote(e.target.value)}
                />
            <div className="flex items-center mt-2">
              <button
                onClick={handleNoteSave}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm font-medium"
              >저장</button>
              <button
                onClick={handleCancelEdit}
                className="ml-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white text-sm font-medium"
              >취소</button>
            </div>
          </>
             ) : (
            <div>
            <div className="min-h-28 whitespace-pre-line text-white bg-gray-900 border border-gray-700 rounded p-3">
              {note || <span className="text-gray-500">아직 작성된 노트가 없습니다.</span>}
            </div>
            <div className="flex items-center mt-2">
              <button
                onClick={handleEditClick}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm font-medium"
              >수정</button>
              {noteSaved && <span className="ml-3 text-green-400 text-xs">저장됨!</span>}
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}
                {activeTab === 'resources' && <p>자료 다운로드 링크 등이 여기에 표시됩니다.</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">강의 목록</h2>
            <div className="space-y-2">
             {lectures.map((lec) => (
              <div key={lec.meterId} className={`p-4 rounded-lg ${lec.meterId == meterId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} flex flex-col`}>
              <div className="flex justify-between">
              <h3 className="text-sm font-medium">{lec.title}</h3>
              {lec.completed && <div className="w-2 h-2 bg-green-400 rounded-full" />}
              </div>
            <div className="flex justify-between text-xs mt-1">
            <span>{lec.time ? `${Math.floor(lec.time / 60)}분` : '시간정보 없음'}</span>
            <Clock className="w-4 h-4 text-gray-400" />
            </div>
            {lec.id == meterId && <div className="mt-2 w-full bg-gray-600 h-1 rounded-full"><div className="bg-white h-1 rounded-full" style={{ width: '28%' }}></div></div>}
           </div>
            ))}
            </div>
         <div className="mt-8 p-4 bg-gray-700 rounded-xl">
  <h3 className="text-sm font-semibold mb-2">학습 진도</h3>
  <div className="flex justify-between text-sm mb-1">
    <span>완료한 강의</span>
    <span>
       {completedLectures}/{totalLectures}
    </span>
  </div>
  <div className="w-full bg-gray-600 h-2 rounded-full mb-1">
    <div
      className="bg-blue-500 h-2 rounded-full"
      style={{ width: `${progressPercent}%` }}
    ></div>
  </div>
  <p className="text-xs text-gray-400">
    전체 진도율 {progressPercent}%
  </p>
</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
