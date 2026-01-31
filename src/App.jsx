import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, Zap, Image as ImageIcon, MonitorPlay, Aperture, Gift,
  UserCheck, UserX, Star, StarOff, Armchair, Edit3, Upload, FileText, Play, RotateCcw, Hash
} from 'lucide-react';

// --- Firebase 模組 ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, setDoc,
  doc, onSnapshot, query, orderBy, deleteDoc, writeBatch
} from "firebase/firestore";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDUZeeaWvQZJORdDv4PdAHQK-SqXFIDsy4",
  authDomain: "eventpass-77522.firebaseapp.com",
  projectId: "eventpass-77522",
  storageBucket: "eventpass-77522.firebasestorage.app",
  messagingSenderId: "504395632009",
  appId: "1:504395632009:web:3c13603d03203dece8a558",
  measurementId: "G-SP74GNKJFQ"
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Init Error:", error);
}

const ADMIN_PASSWORD = "admin"; 

// --- 🔥 強制樣式注入器 ---
const StyleInjector = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
    if (!document.querySelector('#tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);
  return null;
};

const translations = {
  zh: {
    title: "Tesla Annual Dinner",
    sub: "2025 影音震撼版",
    guestMode: "參加者登記",
    guestDesc: "Guest Registration",
    adminMode: "工作人員入口",
    adminDesc: "Staff Only",
    projectorMode: "大螢幕投影",
    projectorDesc: "Lucky Draw Screen",
    login: "系統驗證",
    pwdPlace: "請輸入密碼",
    enter: "登入",
    wrongPwd: "密碼錯誤",
    regTitle: "賓客登記",
    regSub: "系統將依資料自動分配座位",
    name: "姓名 (Name)",
    phone: "電話 (Mobile)",
    email: "電子郵件 (Email)",
    company: "公司/備註 (選填)",
    generateBtn: "確認登記 / Submit",
    back: "返回",
    yourCode: "您的入場憑證",
    yourSeat: "您的座位",
    showToStaff: "資料已同步！請出示給工作人員掃描",
    next: "完成 (Finish)",
    scan: "極速掃描",
    draw: "銀河抽獎",
    list: "賓客名單",
    seating: "座位表查詢",
    total: "總人數",
    arrived: "已到場",
    scanCam: "啟動掃描鏡頭",
    stopCam: "停止掃描",
    manual: "手動輸入 ID",
    success: "簽到成功",
    duplicate: "重複：此人已入場",
    error: "無效代碼",
    regSuccess: "登記成功",
    notFound: "查無此人",
    errPhone: "錯誤：此電話號碼已存在",
    errEmail: "錯誤：此 Email 已存在",
    errPhoto: "請拍攝或上傳一張照片！",
    errIncomplete: "請填寫所有必填欄位",
    drawBtn: "啟動抽獎 (Space)",
    running: "搜尋幸運兒...",
    winner: "✨ 恭喜中獎 ✨",
    claim: "確認領獎 (Enter)",
    needMore: "等待更多賓客入場...",
    export: "導出名單",
    checkin: "簽到",
    cancel: "取消",
    logout: "登出",
    cloudStatus: "雲端連線正常",
    winnersList: "中獎名單",
    prizeTitle: "獎品池",
    setPrize: "新增",
    prizePlace: "輸入獎品 (如:現金獎)",
    prizeQty: "數量",
    currentPrize: "正在抽取",
    markWin: "設為中獎",
    unmarkWin: "取消中獎",
    delete: "刪除",
    table: "桌號",
    seat: "座位",
    addSeat: "新增",
    searchSeat: "搜尋姓名/電話/桌號...",
    seatTBD: "待定 (請洽櫃台)",
    importCSV: "導入 CSV",
    downloadTemp: "下載範本",
    importSuccess: "導入成功！",
    resetWinner: "重抽此獎"
  },
  en: {
    title: "Tesla Annual Dinner",
    sub: "2025 Cinematic Edition",
    guestMode: "Guest Registration",
    guestDesc: "For Attendees",
    adminMode: "Staff Portal",
    adminDesc: "For Event Team",
    projectorMode: "Projector View",
    projectorDesc: "For Big Screen",
    login: "Security Check",
    pwdPlace: "Password",
    enter: "Login",
    wrongPwd: "Wrong Password",
    regTitle: "Registration",
    regSub: "Seat assigned automatically",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    company: "Company (Optional)",
    generateBtn: "Submit Registration",
    back: "Back",
    yourCode: "Entry Pass",
    yourSeat: "Your Seat",
    showToStaff: "Synced! Show to staff.",
    next: "Finish",
    scan: "Scanner",
    draw: "Galaxy Draw",
    list: "Guest List",
    seating: "Seating Plan",
    total: "Total",
    arrived: "Arrived",
    scanCam: "Start Camera",
    stopCam: "Stop Camera",
    manual: "Manual Input",
    success: "Verified & Checked-in",
    duplicate: "Already Checked-in",
    error: "Invalid Code",
    regSuccess: "Registration Successful",
    notFound: "Not Found",
    errPhone: "Phone already exists",
    errEmail: "Email already exists",
    errPhoto: "Photo is required!",
    errIncomplete: "Fill all fields",
    drawBtn: "Start Draw (Space)",
    running: "Searching...",
    winner: "✨ GRAND PRIZE ✨",
    claim: "Confirm (Enter)",
    needMore: "Waiting for guests...",
    export: "Export CSV",
    checkin: "Check-in",
    cancel: "Cancel",
    logout: "Logout",
    cloudStatus: "Connected",
    winnersList: "Winners List",
    prizeTitle: "Prize Pool",
    setPrize: "Add",
    prizePlace: "Enter Prize Name",
    prizeQty: "Qty",
    currentPrize: "Drawing For",
    markWin: "Mark Win",
    unmarkWin: "Remove Win",
    delete: "Delete",
    table: "Table",
    seat: "Seat",
    addSeat: "Add",
    searchSeat: "Search Name/Phone/Table...",
    seatTBD: "TBD (Ask Staff)",
    importCSV: "Import CSV",
    downloadTemp: "Template",
    importSuccess: "Import Successful!",
    resetWinner: "Re-draw"
  }
};

const normalizePhone = (p) => String(p).replace(/[^0-9]/g, '');
const normalizeEmail = (e) => String(e).trim().toLowerCase();
const compressImage = (source, isFile = true) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.6)); 
        };
        if(isFile) {
            const reader = new FileReader();
            reader.readAsDataURL(source);
            reader.onload = (e) => img.src = e.target.result;
        } else {
            img.src = source;
        }
    });
};

const Confetti = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const p = Array.from({length:300}).map(()=>({x:Math.random()*c.width, y:Math.random()*c.height,c:['#E82127','#FFFFFF','#808080'][Math.floor(Math.random()*3)],s:Math.random()*8+2,d:Math.random()*5}));
    const draw = () => { ctx.clearRect(0,0,c.width,c.height); p.forEach(i=>{i.y+=i.s;i.x+=Math.sin(i.d);if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}ctx.fillStyle=i.c;ctx.beginPath();ctx.arc(i.x,i.y,i.s/2,0,Math.PI*2);ctx.fill();}); requestAnimationFrame(draw); };
    draw();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
};

// --- 🔊 史詩級音效控制器 (Web Audio API) ---
const SoundController = {
  ctx: null,
  oscList: [],
  
  init: function() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
  },
  
  // 播放緊張的鼓聲與低頻 (Galaxy Tension)
  startSuspense: function() {
      if (!this.ctx) this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const now = this.ctx.currentTime;
      
      // 1. 低頻 Drone (持續音)
      const drone = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      drone.type = 'sawtooth';
      drone.frequency.value = 50; // 低頻
      drone.connect(droneGain);
      droneGain.connect(this.ctx.destination);
      droneGain.gain.setValueAtTime(0.1, now);
      droneGain.gain.linearRampToValueAtTime(0.3, now + 5); // 越來越大聲
      drone.start(now);
      this.oscList.push({stop: () => { 
          droneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
          setTimeout(() => drone.stop(), 500);
      }});

      // 2. 急促的電子脈衝
      const pulse = setInterval(() => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
          osc.connect(g);
          g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.1, this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.1);
      }, 100); // 100ms 一次，非常快

      this.oscList.push({stop: () => clearInterval(pulse)});
  },
  
  stopAll: function() {
      this.oscList.forEach(o => o.stop());
      this.oscList = [];
  },

  playWin: function() {
      this.stopAll();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // 勝利號角
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          osc.connect(g);
          g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.4, t + i*0.1);
          g.gain.exponentialRampToValueAtTime(0.01, t + i*0.1 + 2);
          osc.start(t + i*0.1);
          osc.stop(t + i*0.1 + 2);
      });
  }
};


// 🔥 V43：極速星際漫遊抽獎 (Galaxy High Speed)
const GalaxyDrawComponent = ({ list, t, onDrawEnd }) => {
    const [isRunning, setIsRunning] = useState(false);
    
    // 啟動抽獎
    const start = () => {
        if (list.length < 2) return;
        setIsRunning(true);
        SoundController.startSuspense();

        // 5 秒後停止
        setTimeout(() => {
            stop();
        }, 5000);
    };

    // 停止抽獎
    const stop = () => {
        SoundController.playWin();
        const winnerIdx = Math.floor(Math.random() * list.length);
        const finalWinner = list[winnerIdx];
        
        setIsRunning(false);
        // 延遲以顯示中獎動畫
        setTimeout(() => {
            onDrawEnd(finalWinner);
        }, 500);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space' && !isRunning) {
                e.preventDefault();
                start();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isRunning, list]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
            
            {/* 照片流星雨區域 */}
            <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
                {list.slice(0, 80).map((p, i) => { 
                     // 隨機生成飛行軌跡
                     const delay = Math.random() * 2 + 's'; // 錯開時間
                     const duration = Math.random() * 2 + 1 + 's'; // 速度不同
                     const startLeft = Math.random() * 100 + '%';
                     
                     return (
                         <div 
                             key={p.id}
                             className={`absolute w-24 h-24 rounded-full border-2 border-white/40 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-opacity duration-300
                                        ${isRunning ? 'opacity-100 animate-fly' : 'opacity-20 scale-50'}`}
                             style={{
                                 left: startLeft,
                                 top: '110%', // 從底部開始
                                 animation: isRunning ? `fly ${duration} infinite linear` : 'none',
                                 animationDelay: delay
                             }}
                         >
                             {p.photo ? <img src={p.photo} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-white/20 flex items-center justify-center text-lg font-bold">{p.name.slice(0,1)}</div>}
                         </div>
                     )
                })}
                
                {/* 中央聚焦點 (靜止時顯示) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border-4 border-dashed border-red-500 rounded-full flex items-center justify-center transition-all duration-300 ${isRunning ? 'opacity-100 scale-125 rotate-180 border-white' : 'opacity-30 scale-100'}`}>
                    <Trophy className={`${isRunning ? 'text-white' : 'text-red-600'} animate-pulse`} size={80}/>
                </div>
            </div>

            <button 
                disabled={isRunning} 
                onClick={start} 
                className="absolute bottom-10 bg-white text-black px-16 py-4 rounded-full font-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform disabled:opacity-0 disabled:scale-100 uppercase tracking-widest z-50"
            >
                {t.drawBtn}
            </button>

            <style>{`
                @keyframes fly {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(-800px) scale(1.5); opacity: 0; }
                }
                .animate-fly { will-change: transform, opacity; }
            `}</style>
        </div>
    );
};

// ... LoginView, GuestView (保持 V41 邏輯) ...
const LoginView = ({ t, onLogin, onBack }) => {
    const [pwd, setPwd] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if(pwd === ADMIN_PASSWORD) onLogin(); else { alert(t.wrongPwd); setPwd(''); } };
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-red-700/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-neutral-800/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative bg-neutral-900/80 border border-white/20 p-10 rounded-3xl w-full max-w-sm backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500 z-50">
          <button onClick={onBack} className="text-white/50 hover:text-white mb-8 flex items-center transition-colors text-sm uppercase tracking-widest"><ChevronLeft size={16} className="mr-1"/> {t.back}</button>
          <div className="text-center mb-8"><h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.login}</h2></div>
          <form onSubmit={handleSubmit}>
            <input type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={t.pwdPlace} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl mb-6 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-center tracking-[0.3em] placeholder:tracking-normal placeholder:text-white/20"/>
            <button type="submit" className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-900/40 transition-all active:scale-95 uppercase tracking-widest text-sm">{t.enter}</button>
          </form>
        </div>
      </div>
    );
};
const GuestView = ({ t, onBack, checkDuplicate, seatingPlan }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:'',phone:'',email:'',company:'',table:'',seat:''});
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [newId, setNewId] = useState(null);
  const [matchedSeat, setMatchSeat] = useState(null); 
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => { setErr(''); try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } }); setIsCameraOpen(true); setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(e => console.log("Play error:", e)); } }, 100); } catch (e) { fileInputRef.current.click(); } };
  const takePhoto = async () => { if(!videoRef.current) return; const canvas = document.createElement('canvas'); const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d'); const xOffset = (videoRef.current.videoWidth - size) / 2; const yOffset = (videoRef.current.videoHeight - size) / 2; ctx.drawImage(videoRef.current, xOffset, yOffset, size, size, 0, 0, size, size); const rawBase64 = canvas.toDataURL('image/jpeg'); const stream = videoRef.current.srcObject; if(stream) stream.getTracks().forEach(track => track.stop()); setIsCameraOpen(false); const compressed = await compressImage(rawBase64, false); setPhoto(compressed); };
  const handleFileChange = async (e) => { const file = e.target.files[0]; if(file) { const compressed = await compressImage(file, true); setPhoto(compressed); setErr(''); } };
  const handleSubmit = async (e) => { e.preventDefault(); setErr(''); if(!photo) { setErr(t.errPhoto); return; } setLoading(true); const cleanPhone = normalizePhone(form.phone); const cleanEmail = normalizeEmail(form.email); const dup = checkDuplicate(cleanPhone, cleanEmail); if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; } if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; } let assignedTable = ""; let assignedSeat = ""; const emailMatch = seatingPlan.find(s => normalizeEmail(s.email) === cleanEmail); const phoneMatch = seatingPlan.find(s => normalizePhone(s.phone) === cleanPhone); if(emailMatch) { assignedTable = emailMatch.table; assignedSeat = emailMatch.seat; } else if(phoneMatch) { assignedTable = phoneMatch.table; assignedSeat = phoneMatch.seat; } setMatchSeat({ table: assignedTable, seat: assignedSeat }); try { if (!db) throw new Error("Firebase not initialized"); const docRef = await addDoc(collection(db, "attendees"), { name: form.name, phone: cleanPhone, email: cleanEmail, company: form.company, table: assignedTable, seat: assignedSeat, photo: photo, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() }); setNewId(docRef.id); setStep(2); } catch (error) { console.error(error); setErr("Network Error."); } setLoading(false); };
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none"></div>
      <div className="relative bg-neutral-900/80 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-8 text-white text-center relative">
          {!isCameraOpen && <button onClick={onBack} className="absolute left-6 top-6 text-white/70 hover:text-white z-10"><ChevronLeft/></button>}
          <h2 className="text-2xl font-bold tracking-wide relative z-10">{t.regTitle}</h2>
        </div>
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {err && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center animate-pulse"><AlertTriangle size={16} className="mr-2"/>{err}</div>}
              <div className="flex flex-col items-center mb-4">
                  {isCameraOpen ? (
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border-2 border-red-500 shadow-2xl"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" /><button type="button" onClick={takePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:scale-110 transition-transform"><Aperture className="w-full h-full p-2 text-black"/></button></div>
                  ) : (
                      <div className="flex flex-col items-center gap-3 w-full"><div className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden relative shadow-lg ${photo ? 'border-red-500' : 'border-white/30'}`}>{photo ? <img src={photo} alt="Selfie" className="w-full h-full object-cover" /> : <User size={48} className="text-white/20"/>}</div><div className="flex gap-2"><button type="button" onClick={startCamera} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><Camera size={14}/> {t.photoBtn}</button><button type="button" onClick={()=>fileInputRef.current.click()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><ImageIcon size={14}/> {t.uploadBtn}</button></div></div>
                  )}
                  <input type="file" accept="image/*" capture="user" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>
              </div>
              {!isCameraOpen && (
                  <div className="space-y-3">
                    {['name', 'phone', 'email'].map((field) => (<div key={field} className="relative group"><div className="absolute top-3.5 left-4 text-white/30 group-focus-within:text-red-500 transition-colors">{field === 'name' ? <User size={18}/> : field === 'phone' ? <Phone size={18}/> : <Mail size={18}/>}</div><input required type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} className="w-full bg-white/5 border border-white/10 text-white p-3 pl-12 rounded-xl outline-none focus:border-red-500 focus:bg-white/10 transition-all placeholder:text-white/20" placeholder={t[field]} value={form[field]} onChange={e=>{setErr('');setForm({...form,[field]:e.target.value})}} /></div>))}
                    <input className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white/10 transition-all placeholder:text-white/20" placeholder={t.company} value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
                    <button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-6 flex justify-center items-center disabled:opacity-70 uppercase tracking-wider text-sm">{loading ? <Loader2 className="animate-spin mr-2"/> : null}{t.generateBtn}</button>
                  </div>
              )}
            </form>
          ) : (
            <div className="text-center animate-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({id: newId}))}`} alt="QR" className="w-48 h-48 object-contain"/><div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1 font-bold tracking-wider"><Cloud size={10}/> SAVED</div></div>
              <h3 className="text-2xl font-bold text-white mb-1">{form.name}</h3>
              <div className="text-red-400 text-lg font-bold mb-4 flex justify-center items-center gap-2 bg-white/5 p-2 rounded-lg border border-red-500/30"><Armchair size={18}/> {matchedSeat && matchedSeat.table ? `${t.table} ${matchedSeat.table}` : t.seatTBD} {matchedSeat && matchedSeat.seat ? ` / ${t.seat} ${matchedSeat.seat}` : ""}</div>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">{t.showToStaff}</p>
              <button onClick={()=>{setStep(1);setForm({name:'',phone:'',email:'',company:'',table:'',seat:''});setPhoto(null)}} className="w-full bg-white/10 text-white border border-white/20 p-4 rounded-xl font-bold hover:bg-white/20 transition-colors uppercase tracking-widest text-sm">{t.next}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Projector View ---
const ProjectorView = ({ t, attendees, drawHistory, onBack, currentPrize }) => {
    const [winner, setWinner] = useState(null);
    const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h=>h.attendeeId===p.id));

    useEffect(() => {
        const handleKey = (e) => { if (winner && e.key === 'Enter') setWinner(null); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [winner]);

    const handleDrawEnd = async (winner) => {
        setWinner(winner);
        if (db) await addDoc(collection(db, "winners"), { attendeeId: winner.id, name: winner.name, phone: winner.phone, photo: winner.photo, table: winner.table, seat: winner.seat, prize: currentPrize || "Lucky Draw", wonAt: new Date().toISOString() });
    };

    const ConfettiInner = () => {
        const canvasRef = useRef(null);
        useEffect(() => {
            const c = canvasRef.current; const ctx = c.getContext('2d'); c.width = window.innerWidth; c.height = window.innerHeight;
            const p = Array.from({length:200}).map(()=>({x:Math.random()*c.width, y:Math.random()*c.height,c:['#E82127','#FFFFFF','#808080'][Math.floor(Math.random()*3)],s:Math.random()*8+2,d:Math.random()*5}));
            const draw = () => { ctx.clearRect(0,0,c.width,c.height); p.forEach(i=>{i.y+=i.s;i.x+=Math.sin(i.d);if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}ctx.fillStyle=i.c;ctx.beginPath();ctx.arc(i.x,i.y,i.s/2,0,Math.PI*2);ctx.fill();}); requestAnimationFrame(draw); };
            draw();
        }, []);
        return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none"></div>
            <button onClick={onBack} className="absolute top-6 left-6 text-white/30 hover:text-white z-50 transition-colors"><ChevronLeft size={24}/></button>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10">
                <div className="mb-6 text-center animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl text-yellow-500 uppercase tracking-widest mb-1 font-bold">{t.currentPrize}</h3>
                    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{currentPrize || "LUCKY DRAW"}</h1>
                </div>

                <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center min-h-[500px]">
                    {eligible.length < 2 ? (
                        <div className="text-center text-white/30"><Trophy size={100} className="mx-auto mb-6 opacity-20"/><p className="text-2xl">{t.needMore}</p><p className="text-sm mt-2 font-mono">Current: {eligible.length}</p></div>
                    ) : (
                        // 使用新的 GalaxyDraw
                        <GalaxyDrawComponent list={eligible} t={t} onDrawEnd={handleDrawEnd} />
                    )}
                </div>
                
                {drawHistory.length > 0 && (
                    <div className="w-full max-w-7xl mt-12 overflow-x-auto pb-4 px-4">
                        <div className="flex flex-wrap gap-4 justify-center">
                            {drawHistory.map((h, i) => (
                                <div key={h.id} className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                                    <span className="text-yellow-400 font-bold text-sm border-r border-white/20 pr-3 mr-1">{h.prize || "Prize"}</span>
                                    {h.photo && <img src={h.photo} className="w-8 h-8 rounded-full border border-white/50 object-cover"/>}
                                    <span className="font-bold tracking-wide">{h.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {winner && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-500 backdrop-blur-xl">
                    <div className="absolute inset-0 pointer-events-none"><ConfettiInner/></div>
                    <div className="relative text-center w-full max-w-5xl px-4 animate-in zoom-in-50 duration-500 flex flex-col items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                        <h3 className="text-4xl font-bold text-yellow-400 mb-6 tracking-widest uppercase animate-pulse">{currentPrize || "WINNER"}</h3>
                        <div className="relative">
                            {winner.photo && <img src={winner.photo} className="w-96 h-96 rounded-full border-[10px] border-yellow-400 object-cover shadow-[0_0_80px_rgba(234,179,8,0.6)] mb-8 animate-in zoom-in duration-700"/>}
                            <div className="absolute -bottom-4 right-0 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full flex items-center gap-3">
                                <Armchair size={24} className="text-yellow-400"/>
                                <div className="text-left">
                                    <div className="text-xs text-white/50 uppercase tracking-wider">{t.yourSeat}</div>
                                    <div className="text-xl font-bold text-white">Table {winner.table || '?'} / Seat {winner.seat || '?'}</div>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-8xl md:text-9xl font-black text-white mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110">{winner.name}</h1>
                        <p className="text-3xl text-white/60 font-mono mb-8">{winner.phone}</p>
                        <p className="text-white/30 text-sm">Press ENTER to continue</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// 🔥 Admin Dashboard (Updated with Qty)
const AdminDashboard = ({ t, onLogout, attendees, setAttendees, drawHistory, setDrawHistory, currentPrize, setCurrentPrize, seatingPlan, setSeatingPlan }) => {
  const [tab, setTab] = useState('scan');
  const [isScan, setIsScan] = useState(false);
  const [scanRes, setScanRes] = useState(null);
  
  // 獎品新增表單 (含數量)
  const [prizeForm, setPrizeForm] = useState({ name: "", qty: "1" });
  
  const [seatForm, setSeatForm] = useState({ name: '', phone: '', email: '', table: '', seat: '' });
  const [searchSeat, setSearchSeat] = useState(""); 
  const lastScanTimeRef = useRef(0);

  // 監聽獎品列表
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(query(collection(db, "prizes"), orderBy("createdAt", "asc")), (snapshot) => {
        // 請注意：這裡會列出所有生成的獎品 (例如 100 個現金獎)
        setPrizes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const [prizes, setPrizes] = useState([]);

  // 🔥 批量新增獎品
  const handleAddPrize = async (e) => {
      e.preventDefault();
      if(prizeForm.name && db) {
          const qty = parseInt(prizeForm.qty) || 1;
          const batch = writeBatch(db);
          const createdAt = new Date().toISOString();
          
          for(let i=1; i<=qty; i++) {
              const newRef = doc(collection(db, "prizes"));
              batch.set(newRef, { 
                  // 簡單編號邏輯：名稱 #1, 名稱 #2
                  name: qty > 1 ? `${prizeForm.name} #${i}` : prizeForm.name, 
                  createdAt 
              });
          }
          await batch.commit();
          setPrizeForm({ name: "", qty: "1" });
      }
  };

  const handleSelectPrize = async (prizeName) => {
      if(db) await setDoc(doc(db, "config", "settings"), { currentPrize: prizeName }, { merge: true });
  };
  
  const handleDeletePrize = async (id) => {
      if(confirm('Delete prize?')) await deleteDoc(doc(db, "prizes", id));
  };
  
  // ... 其他 handle 函數保持不變 ...
  const handleScan = useCallback(async (text) => { /*...略...*/ }, [attendees, t]); // 保持原邏輯
  const handleImportSeating = async (e) => { /*...略...*/ }; // 保持原邏輯
  const downloadTemplate = (type) => { /*...略...*/ }; // 保持原邏輯
  const handleAddSeating = async (e) => { /*...略...*/ }; // 保持原邏輯
  const handleDeleteSeating = async (id) => { /*...略...*/ }; // 保持原邏輯
  const toggleCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: true, checkInTime: new Date().toISOString() }); };
  const toggleCancelCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: false, checkInTime: null }); };
  const deletePerson = async (id) => { if(confirm('Delete user?') && db) await deleteDoc(doc(db, "attendees", id)); };
  const toggleWinnerStatus = async (person, winnerRecord) => { /*...略...*/ }; // 保持原邏輯
  const handleUpdateSeat = async (id, table, seat) => { if(db) await updateDoc(doc(db, "attendees", id), { table, seat }); };
  
  // 為了節省長度，這裡復用 V41 的 filteredSeating 邏輯
  const filteredSeating = seatingPlan.filter(s => {
      const term = searchSeat.toLowerCase();
      return (s.name && s.name.toLowerCase().includes(term)) || (s.phone && s.phone.includes(term)) || (s.email && s.email.includes(term)) || (s.table && s.table.includes(term));
  });

  return (
    <div className="min-h-[100dvh] bg-neutral-950 flex flex-col font-sans text-white">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white"><QrCode size={18}/></div> {t.adminMode}</div>
        <button onClick={onLogout} className="text-white/50 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"><LogOut size={16}/> {t.logout}</button>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        
        {/* 獎品管理 (Updated) */}
        <div className="w-full max-w-md mb-6 bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm"><span className="text-white/50 uppercase tracking-widest flex items-center gap-2"><Gift size={14}/> {t.prizeTitle}</span><span className="text-yellow-400 font-bold">{currentPrize || "---"}</span></div>
            <form onSubmit={handleAddPrize} className="flex gap-2">
                <input value={prizeForm.name} onChange={e=>setPrizeForm({...prizeForm, name:e.target.value})} placeholder={t.prizePlace} className="flex-[2] bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none"/>
                <input type="number" min="1" value={prizeForm.qty} onChange={e=>setPrizeForm({...prizeForm, qty:e.target.value})} placeholder={t.prizeQty} className="w-16 bg-black/50 border border-white/20 rounded-lg px-2 py-2 text-sm text-white focus:border-red-500 text-center"/>
                <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors"><Plus size={16}/></button>
            </form>
            
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scroll">
                {prizes.map(p=>{
                    const winnerRecord = drawHistory.find(h => h.prize === p.name);
                    return (
                        <div key={p.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${currentPrize===p.name?'bg-green-500/20 border-green-500/50':'bg-white/5 border-white/10'}`}>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">{p.name}</span>
                                {winnerRecord && <span className="text-[10px] text-yellow-500 flex items-center gap-1">🏆 {winnerRecord.name}</span>}
                            </div>
                            <div className="flex gap-1">
                                {currentPrize!==p.name && !winnerRecord && <button onClick={()=>handleSelectPrize(p.name)} className="p-1.5 bg-white/10 hover:bg-green-600 rounded text-[10px]" title={t.activate}><Play size={12}/></button>}
                                {currentPrize===p.name && <CheckCircle size={16} className="text-green-500 mr-2"/>}
                                <button onClick={()=>handleDeletePrize(p.id)} className="p-1.5 bg-white/10 hover:bg-red-600 rounded text-[10px]" title={t.delete}><Trash2 size={12}/></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="flex justify-center mb-8 bg-white/5 p-1 rounded-2xl shadow-lg border border-white/10 w-fit backdrop-blur-sm">
          {[ {id:'scan',icon:ScanLine,l:t.scan}, {id:'list',icon:Users,l:t.list}, {id:'seating',icon:Armchair,l:t.seating} ].map(i=> (
            <button key={i.id} onClick={()=>{setTab(i.id);setIsScan(false);setScanRes(null)}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wide ${tab===i.id?'bg-red-600 text-white shadow-md':'text-white/50 hover:bg-white/10 hover:text-white'}`}><i.icon size={16}/> {i.l}</button>
          ))}
        </div>
        
        {/* ... (Scan, List, Seating 保持不變，直接復用 V41) ... */}
        {/* 請保留您 V41 的下半部代碼，這部分邏輯是通用的 */}
         <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full min-h-[600px] overflow-hidden relative flex flex-col items-center justify-center">
            {tab==='scan' && <div className="p-8 text-white/50">Scanner Module (Reused from V41)</div>}
            {tab==='list' && <div className="p-8 text-white/50">List Module (Reused from V41)</div>}
            {tab==='seating' && <div className="p-8 text-white/50">Seating Module (Reused from V41)</div>}
        </div>

      </main>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState('zh'); const t = translations[lang];
  const [view, setView] = useState('landing');
  const [attendees, setAttendees] = useState([]);
  const [drawHistory, setDrawHistory] = useState([]);
  const [currentPrize, setCurrentPrize] = useState("");
  const [seatingPlan, setSeatingPlan] = useState([]); 

  useEffect(() => {
    if (!db) return;
    const unsubAttendees = onSnapshot(query(collection(db, "attendees"), orderBy("createdAt", "desc")), (snapshot) => { setAttendees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubWinners = onSnapshot(collection(db, "winners"), (snapshot) => { setDrawHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubConfig = onSnapshot(doc(db, "config", "settings"), (doc) => { if (doc.exists()) setCurrentPrize(doc.data().currentPrize); });
    const unsubSeating = onSnapshot(collection(db, "seating_plan"), (snapshot) => { setSeatingPlan(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => { unsubAttendees(); unsubWinners(); unsubConfig(); unsubSeating(); };
  }, []);

  const checkDuplicate = (p, e) => {
    if(attendees.some(x => normalizePhone(x.phone) === normalizePhone(p))) return 'phone';
    if(attendees.some(x => normalizeEmail(x.email) === normalizeEmail(e))) return 'email';
    return null;
  };
  const handleLoginSuccess = (targetView) => setView(targetView);

  if(view === 'landing') return (
    <div className="min-h-[100dvh] bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      <StyleInjector/>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 pointer-events-none"></div>
      <button onClick={()=>setLang(l=>l==='zh'?'en':'zh')} className="absolute top-6 right-6 text-white/50 hover:text-white flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full transition-all z-10 text-xs font-mono"><Globe size={14}/> {lang.toUpperCase()}</button>
      <div className="z-10 text-center mb-16 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.4)] mb-8 animate-in zoom-in duration-700">
            <QrCode size={48} className="text-white"/>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{t.title}</h1>
        <p className="text-white/40 text-xl font-light tracking-[0.3em] uppercase">{t.sub}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl z-10 px-4">
        <button onClick={()=>setView('guest')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><ImageIcon size={80} className="text-white"/></div>
            <h3 className="text-3xl font-bold text-white mb-2">{t.guestMode}</h3>
            <p className="text-white/50 text-sm">{t.guestDesc}</p>
            <div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-white w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
        <button onClick={()=>setView('login_admin')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Lock size={80} className="text-white"/></div>
            <h3 className="text-3xl font-bold text-white mb-2">{t.adminMode}</h3>
            <p className="text-white/50 text-sm">{t.adminDesc}</p>
            <div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-red-600 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
        <button onClick={()=>setView('login_projector')} className="group relative overflow-hidden bg-gradient-to-br from-neutral-800 to-black hover:from-neutral-700 border border-white/20 p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity"><MonitorPlay size={80} className="text-yellow-500"/></div>
            <h3 className="text-2xl font-bold text-yellow-500 mb-2">{t.projectorMode}</h3>
            <p className="text-white/50 text-sm">{t.projectorDesc}</p>
            <div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-yellow-500 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
      </div>
    </div>
  );
  if(view === 'guest') return <><StyleInjector/><GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} seatingPlan={seatingPlan} /></>;
  if(view === 'login_admin') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('admin')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_projector') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('projector')} onBack={()=>setView('landing')} /></>;
  if(view === 'admin') return <><StyleInjector/><AdminDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} drawHistory={drawHistory} setDrawHistory={setDrawHistory} currentPrize={currentPrize} setCurrentPrize={setCurrentPrize} seatingPlan={seatingPlan} setSeatingPlan={setSeatingPlan} /></>;
  if(view === 'projector') return <><StyleInjector/><ProjectorView t={t} onBack={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} /></>;
}