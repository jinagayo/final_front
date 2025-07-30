import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Users,
  SkipBack, SkipForward, Star, BookOpen, MessageCircle, Download, Clock
} from 'lucide-react';

export default function LectureViewer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { meterId } = useParams(); 
  const [classData, setClassData] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(1530); // 25분 30초
  const [duration] = useState(5400); // 90분
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
 const [meterial, setMeterial] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  console.log("meterId:" + meterId);
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

  const progress = (currentTime / duration) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
          <div>
          <h1 className="text-2xl font-bold">{classData?.name || '강의 제목 로딩 중...'}</h1>
          <p className="text-gray-400 text-sm">{classData?.teacherName || '강사명'}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>1,247명 수강중</span>
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
               />
              ) : (
               <p>동영상을 불러오는 중...</p>
            )}

            {/* Controls */}
            <div className="bg-gray-800 rounded-xl p-4 mt-4">
              <div className="w-full h-1.5 bg-gray-600 rounded-full mb-3">
                <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SkipBack className="w-5 h-5 cursor-pointer hover:text-blue-400" />
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <SkipForward className="w-5 h-5 cursor-pointer hover:text-blue-400" />
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    <div className="w-20 bg-gray-600 h-1.5 rounded-full">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: `${volume}%` }}></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-300">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{playbackSpeed}x</span>
                  <Settings className="w-5 h-5" />
                  <Maximize className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800 rounded-xl mt-4">
              <div className="flex border-b border-gray-700">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-center ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><BookOpen className="inline-block w-4 h-4 mr-1" /> 강의 개요</button>
                <button onClick={() => setActiveTab('notes')} className={`flex-1 py-3 text-center ${activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><MessageCircle className="inline-block w-4 h-4 mr-1" /> 강의 노트</button>
                <button onClick={() => setActiveTab('resources')} className={`flex-1 py-3 text-center ${activeTab === 'resources' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><Download className="inline-block w-4 h-4 mr-1" /> 자료실</button>
              </div>
              <div className="p-6 text-sm text-gray-300">
                {activeTab === 'overview' && (
                  <ul className="list-disc ml-6 space-y-2">
                    <li>React State의 개념과 useState Hook 사용법</li>
                    <li>컴포넌트 라이프사이클과 useEffect Hook</li>
                    <li>상태 관리 베스트 프랙티스와 실습 예제</li>
                  </ul>
                )}
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
              <div key={lec.id} className={`p-4 rounded-lg ${lec.id == meterId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} flex flex-col`}>
              <div className="flex justify-between">
              <h3 className="text-sm font-medium">{lec.title}</h3>
              {lec.completed && <div className="w-2 h-2 bg-green-400 rounded-full" />}
              </div>
            <div className="flex justify-between text-xs mt-1">
            <span>{lec.duration ? `${Math.floor(lec.duration / 60)}분` : '시간정보 없음'}</span>
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
                <span>2/5</span>
              </div>
              <div className="w-full bg-gray-600 h-2 rounded-full mb-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-xs text-gray-400">전체 진도율 40%</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
