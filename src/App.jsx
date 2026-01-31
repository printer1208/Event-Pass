import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, Zap, Image as ImageIcon, MonitorPlay, Aperture, Gift,
  UserCheck, UserX, Star, StarOff, Armchair, Edit3, Upload, FileText, Play
} from 'lucide-react';

// --- Firebase 模組 ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, setDoc,
  doc, onSnapshot, query, orderBy, deleteDoc 
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
    sub: "2025 數位抽獎版",
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
    draw: "數位抽獎",
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
    running: "搜尋中...",
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
    setPrize: "設定",
    prizePlace: "輸入獎品 (如: 頭獎 Model 3)",
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
    importSuccess: "導入成功！"
  },
  en: {
    title: "Tesla Annual Dinner",
    sub: "2025 Digital Draw",
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
    draw: "Digital Draw",
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
    running: "Scanning...",
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
    setPrize: "Set",
    prizePlace: "Enter Prize Name",
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
    importSuccess: "Import Successful!"
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
    const p = Array.from({length:200}).map(()=>({x:Math.random()*c.width, y:Math.random()*c.height,c:['#E82127','#FFFFFF','#808080'][Math.floor(Math.random()*3)],s:Math.random()*8+2,d:Math.random()*5}));
    const draw = () => { ctx.clearRect(0,0,c.width,c.height); p.forEach(i=>{i.y+=i.s;i.x+=Math.sin(i.d);if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}ctx.fillStyle=i.c;ctx.beginPath();ctx.arc(i.x,i.y,i.s/2,0,Math.PI*2);ctx.fill();}); requestAnimationFrame(draw); };
    draw();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
};

// 🔥 V42 新增：數位快速抽獎組件 (取代 WheelComponent)
const DigitalDrawComponent = ({ list, t, onDrawEnd }) => {
    const [displayUser, setDisplayUser] = useState(list[0]);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    // 啟動抽獎
    const start = () => {
        if (list.length < 2) return;
        setIsRunning(true);
        // 極速跳動 (每 50ms 換一張圖)
        intervalRef.current = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * list.length);
            setDisplayUser(list[randomIdx]);
        }, 50);

        // 5 秒後自動停止
        setTimeout(() => {
            stop();
        }, 5000);
    };

    // 停止抽獎
    const stop = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // 最終選定得獎者
        const winnerIdx = Math.floor(Math.random() * list.length);
        const finalWinner = list[winnerIdx];
        setDisplayUser(finalWinner);
        setIsRunning(false);
        
        // 延遲一點點再彈出大視窗，製造緊張感
        setTimeout(() => {
            onDrawEnd(finalWinner);
        }, 500);
    };

    // 鍵盤控制 (空白鍵啟動)
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
        <div className="flex flex-col items-center justify-center h-full w-full relative">
            {/* 數位跳動框 */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 border-4 border-red-600 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.5)] bg-black flex items-center justify-center">
                {displayUser ? (
                    <>
                        <img src={displayUser.photo} className="w-full h-full object-cover opacity-80" alt="candidate" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 text-center">
                            <h2 className="text-3xl font-bold text-white truncate">{displayUser.name}</h2>
                            <p className="text-white/50 text-lg font-mono">{displayUser.phone.slice(-4).padStart(displayUser.phone.length, '*')}</p>
                        </div>
                    </>
                ) : (
                    <User size={100} className="text-white/20"/>
                )}
                
                {/* 掃描線特效 */}
                {isRunning && <div className="absolute top-0 left-0 w-full h-2 bg-white/50 shadow-[0_0_20px_white] animate-[scan_1s_linear_infinite]"></div>}
            </div>

            <button 
                disabled={isRunning} 
                onClick={start} 
                className="mt-12 bg-white text-black px-16 py-4 rounded-full font-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 uppercase tracking-widest"
            >
                {isRunning ? t.running : t.drawBtn}
            </button>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// --- Login View ---
const LoginView = ({ t, onLogin, onBack }) => {
    const [pwd, setPwd] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if(pwd === ADMIN_PASSWORD) onLogin(); else { alert(t.wrongPwd); setPwd(''); } };
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
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

// --- Guest View ---
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

  const startCamera = async () => {
      setErr('');
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } });
          setIsCameraOpen(true);
          setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(e => console.log("Play error:", e)); } }, 100);
      } catch (e) { fileInputRef.current.click(); }
  };
  const takePhoto = async () => {
      if(!videoRef.current) return;
      const canvas = document.createElement('canvas');
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const xOffset = (videoRef.current.videoWidth - size) / 2;
      const yOffset = (videoRef.current.videoHeight - size) / 2;
      ctx.drawImage(videoRef.current, xOffset, yOffset, size, size, 0, 0, size, size);
      const rawBase64 = canvas.toDataURL('image/jpeg');
      const stream = videoRef.current.srcObject;
      if(stream) stream.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
      const compressed = await compressImage(rawBase64, false);
      setPhoto(compressed);
  };
  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if(file) { const compressed = await compressImage(file, true); setPhoto(compressed); setErr(''); }
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); 
    if(!photo) { setErr(t.errPhoto); return; }
    setLoading(true);
    const cleanPhone = normalizePhone(form.phone); const cleanEmail = normalizeEmail(form.email);
    const dup = checkDuplicate(cleanPhone, cleanEmail);
    if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; }
    if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; }

    let assignedTable = ""; let assignedSeat = "";
    const emailMatch = seatingPlan.find(s => normalizeEmail(s.email) === cleanEmail);
    const phoneMatch = seatingPlan.find(s => normalizePhone(s.phone) === cleanPhone);

    if(emailMatch) { assignedTable = emailMatch.table; assignedSeat = emailMatch.seat; }
    else if(phoneMatch) { assignedTable = phoneMatch.table; assignedSeat = phoneMatch.seat; }
    
    setMatchSeat({ table: assignedTable, seat: assignedSeat });

    try {
        if (!db) throw new Error("Firebase not initialized");
        const docRef = await addDoc(collection(db, "attendees"), { 
            name: form.name, phone: cleanPhone, email: cleanEmail, company: form.company, 
            table: assignedTable, seat: assignedSeat,
            photo: photo, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() 
        });
        setNewId(docRef.id); setStep(2);
    } catch (error) { console.error(error); setErr("Network Error."); }
    setLoading(false);
  };
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none"></div>
      <div className="relative bg-neutral-900/80 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-8 text-white text-center relative">
          {!isCameraOpen && <button onClick={onBack} className="absolute left-6 top-6 text-white/70 hover:text-white z-10"><ChevronLeft/></button>}
          <h2 className="text-2xl font-bold tracking-wide relative z-10">{t.regTitle}</h2>
          <p className="text-white/80 text-xs mt-2 uppercase tracking-widest relative z-10">{t.regSub}</p>
        </div>
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {err && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center animate-pulse"><AlertTriangle size={16} className="mr-2"/>{err}</div>}
              <div className="flex flex-col items-center mb-4">
                  {isCameraOpen ? (
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border-2 border-red-500 shadow-2xl">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                          <button type="button" onClick={takePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:scale-110 transition-transform"><Aperture className="w-full h-full p-2 text-black"/></button>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-3 w-full">
                          <div className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden relative shadow-lg ${photo ? 'border-red-500' : 'border-white/30'}`}>
                              {photo ? <img src={photo} alt="Selfie" className="w-full h-full object-cover" /> : <User size={48} className="text-white/20"/>}
                          </div>
                          <div className="flex gap-2">
                              <button type="button" onClick={startCamera} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><Camera size={14}/> {t.photoBtn}</button>
                              <button type="button" onClick={()=>fileInputRef.current.click()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"><ImageIcon size={14}/> {t.uploadBtn}</button>
                          </div>
                      </div>
                  )}
                  <input type="file" accept="image/*" capture="user" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>
              </div>
              {!isCameraOpen && (
                  <div className="space-y-3">
                    {['name', 'phone', 'email'].map((field) => (
                        <div key={field} className="relative group">
                            <div className="absolute top-3.5 left-4 text-white/30 group-focus-within:text-red-500 transition-colors">{field === 'name' ? <User size={18}/> : field === 'phone' ? <Phone size={18}/> : <Mail size={18}/>}</div>
                            <input required type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} className="w-full bg-white/5 border border-white/10 text-white p-3 pl-12 rounded-xl outline-none focus:border-red-500 focus:bg-white/10 transition-all placeholder:text-white/20" placeholder