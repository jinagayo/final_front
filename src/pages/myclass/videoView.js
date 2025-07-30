import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Users,
  SkipBack, SkipForward, Star, BookOpen, MessageCircle, Download, Clock
} from 'lucide-react';

export default function LectureViewer() {
 const userId = localStorage.getItem('userId');
  const [isPlaying, setIsPlaying] = useState(false);
  const { meterId } = useParams(); 
  const [classData, setClassData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(1530); // 25분 30초
  const [duration] = useState(5400); // 90분
  const [activeTab, setActiveTab] = useState('overview');
 const [meterial, setMeterial] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [progressInfo, setProgressInfo] = useState({ completed: 0, total: 0 });
const progressPercent = progressInfo.total > 0
  ? Math.round((progressInfo.completed / progressInfo.total) * 100)
  : 0;
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
   const BACKEND_URL = 'http://localhost:8080';
   
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
  if (!meterial || !meterial.class_id) return; // 조건 강화

  const fetchClassData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/myclass/teacher/class/${meterial.class_id}`, {
        withCredentials: true,
      });
      setClassData(res.data.data);
    
    } catch (err) {
      console.error('강의 클래스 정보 로딩 실패:', err);
    }
  };
  console.log(classData);
  console.log("📌 meterial.detail:", meterial.detail);

  const fetchLectures = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/myclass/teacher/class/${meterial.class_id}/lectures`, {
        withCredentials: true,
      });
      setLectures(res.data.data || []);
    } catch (err) {
      console.error('강의 목록 로딩 실패:', err);
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

useEffect(() => {
  if (!classData || !userId) return;
  axios.get(`${BACKEND_URL}/video/progress/class/${classData.classId}/student/${userId}`, {
    withCredentials: true
  }).then(res => {
    setProgressInfo({
      completed: res.data.completed,
      total: res.data.total
    });
  }).catch(err => {
    console.error('진도율 불러오기 실패:', err);
  });
}, [classData, userId]);

const markLectureAsCompleted = async () => {
  try {
    // API 엔드포인트 및 파라미터는 상황에 맞게 수정
    await axios.post(
      `${BACKEND_URL}/video/progress/complete`, // 예시 API
      {
        meterId,
        userId,
      },
      { withCredentials: true }
    );
    // 필요하다면 진도율 다시 불러오기
  } catch (err) {
    console.error('진도 완료 처리 실패:', err);
  }
};

  const progress = (currentTime / duration) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
          <div>
          <h1 className="text-2xl font-bold">{classData?.name || '강의 제목 로딩 중...'}</h1>
          <p className="text-gray-400 text-sm">{classData?.teachId || '강사명'}</p>
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
                 src={videoUrl}
                crossOrigin="anonymous"
                 controls
                  style={{ width: '100%', borderRadius: '10px', marginTop: '20px' }}
                  onTimeUpdate={e => {
                  const current = e.target.currentTime;
                   const total = e.target.duration;
                  if (!hasMarkedComplete && total && current / total >= 0.5) {
                // 50% 넘겼을 때 서버에 완료 요청
               markLectureAsCompleted();
              setHasMarkedComplete(true); // 중복 요청 방지
            }
            }}
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
                {activeTab === 'notes' && <p>노트 내용이 여기에 표시됩니다.</p>}
                {activeTab === 'resources' && <p>자료 다운로드 링크 등이 여기에 표시됩니다.</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">강의 목록</h2>
            <div className="space-y-2">
             {lectures.map((lec) => (
              <div key={lec.meter_id} className={`p-4 rounded-lg ${lec.meter_id == meterId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} flex flex-col`}>
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
      {progressInfo.completed}/{progressInfo.total}
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
