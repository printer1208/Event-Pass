import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, Zap, Image as ImageIcon, MonitorPlay, Aperture, Gift
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

// --- 🔥 關鍵修復：強制樣式注入器 (找回黑底與動畫) ---
const StyleInjector = () => {
  useEffect(() => {
    // 1. 強制設定 Body 樣式為全黑
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
    
    // 2. 確保 Tailwind CDN 存在
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
    sub: "2025 全功能整合版",
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
    regSub: "請上傳照片以便抽獎",
    name: "姓名 (Name)",
    phone: "電話 (Mobile)",
    email: "電子郵件 (Email)",
    photoBtn: "開啟相機 / 選擇照片",
    photoRetake: "重拍",
    generateBtn: "確認登記 / Submit",
    back: "返回",
    yourCode: "您的入場憑證",
    showToStaff: "資料已同步！請出示給工作人員掃描",
    next: "完成 (Finish)",
    scan: "極速掃描",
    draw: "頭像轉盤",
    list: "賓客名單",
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
    drawBtn: "啟動轉盤 (Space)",
    spinning: "鎖定目標中...",
    winner: "✨ 恭喜中獎 ✨",
    claim: "確認領獎 (Enter)",
    needMore: "等待更多賓客入場...",
    export: "導出名單",
    checkin: "簽到",
    cancel: "取消",
    logout: "登出",
    cloudStatus: "雲端連線正常",
    winnersList: "中獎名單",
    prizeTitle: "當前獎項",
    setPrize: "設定",
    prizePlace: "輸入獎品 (如: 頭獎 Model 3)",
    currentPrize: "正在抽取"
  },
  en: {
    title: "Tesla Annual Dinner",
    sub: "2025 All-in-One",
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
    regSub: "Please take a selfie for lucky draw",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    photoBtn: "Camera / Upload",
    photoRetake: "Retake",
    generateBtn: "Submit Registration",
    back: "Back",
    yourCode: "Entry Pass",
    showToStaff: "Synced! Show to staff.",
    next: "Finish",
    scan: "Scanner",
    draw: "Photo Wheel",
    list: "Guest List",
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
    drawBtn: "Spin (Space)",
    spinning: "Locking Target...",
    winner: "✨ GRAND PRIZE ✨",
    claim: "Confirm (Enter)",
    needMore: "Waiting for guests...",
    export: "Export CSV",
    checkin: "Check-in",
    cancel: "Cancel",
    logout: "Logout",
    cloudStatus: "Connected",
    winnersList: "Winners List",
    prizeTitle: "Current Prize",
    setPrize: "Set",
    prizePlace: "Enter Prize Name",
    currentPrize: "Drawing For"
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

// --- 獨立輪盤組件 (包含獎品顯示) ---
const WheelComponent = ({ list, t, onDrawEnd }) => {
    const [rot, setRot] = useState(0);
    const [spin, setSpin] = useState(false);
    const WHEEL_RADIUS = list.length > 30 ? 280 : 200; 
    
    useEffect(() => { const k=(e)=>{if(e.code==='Space'&&!spin&&list.length>=2){e.preventDefault();run()}}; window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k); }, [spin, list]);
    
    const run = async () => {
      setSpin(true);
      const winIdx = Math.floor(Math.random()*list.length);
      const angle = 360/list.length;
      setRot(rot + 1800 + (360 - winIdx * angle));
      setTimeout(async () => { setSpin(false); onDrawEnd(list[winIdx]); }, 4500);
    };

    return (
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <div className="relative flex items-center justify-center transition-all duration-500" style={{ width: WHEEL_RADIUS*2 + 100, height: WHEEL_RADIUS*2 + 100 }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
          <div className="absolute inset-0 rounded-full transition-transform duration-[4500ms] cubic-bezier(0.1, 0, 0.2, 1)" style={{ transform: `rotate(${rot}deg)` }}>
             {list.map((p, i) => {
                 const angle = (360 / list.length) * i;
                 return (
                     <div key={p.id} className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-white shadow-lg overflow-hidden transform origin-center" style={{ transform: `rotate(${angle}deg) translate(0, -${WHEEL_RADIUS}px) rotate(-${angle}deg)` }}>
                         {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white">{p.name.substring(0, 2).toUpperCase()}</div>}
                     </div>
                 );
             })}
             <div className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full m-12"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-neutral-900 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 z-20">
              <Zap size={40} className="text-red-500 fill-current"/>
          </div>
        </div>
        <button disabled={spin} onClick={run} className="mt-8 bg-white text-black px-12 py-4 rounded-full font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-200 hover:scale-105 transition-all disabled:opacity-50 border border-white tracking-widest uppercase relative z-40">
            {spin ? t.spinning : t.drawBtn}
        </button>
      </div>
    );
};

const LoginView = ({ t, onLogin, onBack }) => (
  <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
    <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-red-700/30 rounded-full blur-[120px] pointer-events-none"></div>
    <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-neutral-800/30 rounded-full blur-[120px] pointer-events-none"></div>
    <div className="relative bg-neutral-900/60 border border-white/10 p-10 rounded-3xl w-full max-w-sm backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500">
      <button onClick={onBack} className="text-white/50 hover:text-white mb-8 flex items-center transition-colors text-sm uppercase tracking-widest"><ChevronLeft size={16} className="mr-1"/> {t.back}</button>
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.login}</h2></div>
      <form onSubmit={e=>{e.preventDefault(); if(e.target[0].value===ADMIN_PASSWORD)onLogin(); else alert(t.wrongPwd);}}>
        <input type="password" autoFocus placeholder={t.pwdPlace} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl mb-6 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-center tracking-[0.3em] placeholder:tracking-normal placeholder:text-white/20"/>
        <button className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-900/40 transition-all active:scale-95 uppercase tracking-widest text-sm">{t.enter}</button>
      </form>
    </div>
  </div>
);

const GuestView = ({ t, onBack, checkDuplicate }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:'',phone:'',email:'',company:''});
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [newId, setNewId] = useState(null);
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
    try {
        if (!db) throw new Error("Firebase not initialized");
        const docRef = await addDoc(collection(db, "attendees"), { name: form.name, phone: cleanPhone, email: cleanEmail, company: form.company, photo: photo, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() });
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {err && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center animate-pulse"><AlertTriangle size={16} className="mr-2"/>{err}</div>}
              <div className="flex flex-col items-center mb-6">
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
                  <div className="space-y-4">
                    {['name', 'phone', 'email'].map((field) => (
                        <div key={field} className="relative group">
                            <div className="absolute top-3.5 left-4 text-white/30 group-focus-within:text-red-500 transition-colors">{field === 'name' ? <User size={18}/> : field === 'phone' ? <Phone size={18}/> : <Mail size={18}/>}</div>
                            <input required type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} className="w-full bg-white/5 border border-white/10 text-white p-3 pl-12 rounded-xl outline-none focus:border-red-500 focus:bg-white/10 transition-all placeholder:text-white/20" placeholder={t[field]} value={form[field]} onChange={e=>{setErr('');setForm({...form,[field]:e.target.value})}} />
                        </div>
                    ))}
                    <button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-6 flex justify-center items-center disabled:opacity-70 uppercase tracking-wider text-sm">{loading ? <Loader2 className="animate-spin mr-2"/> : null}{t.generateBtn}</button>
                  </div>
              )}
            </form>
          ) : (
            <div className="text-center animate-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({id: newId}))}`} alt="QR" className="w-48 h-48 object-contain"/>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1 font-bold tracking-wider"><Cloud size={10}/> SAVED</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{form.name}</h3>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">{t.showToStaff}</p>
              <button onClick={()=>{setStep(1);setForm({name:'',phone:'',email:'',company:''});setPhoto(null)}} className="w-full bg-white/10 text-white border border-white/20 p-4 rounded-xl font-bold hover:bg-white/20 transition-colors uppercase tracking-widest text-sm">{t.next}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🔥 Admin Dashboard (Updated)
const AdminDashboard = ({ t, onLogout, attendees, setAttendees, drawHistory, setDrawHistory, currentPrize, setCurrentPrize }) => {
  const [tab, setTab] = useState('scan');
  const [isScan, setIsScan] = useState(false);
  const [scanRes, setScanRes] = useState(null);
  const [newPrizeName, setNewPrizeName] = useState("");
  const lastScanTimeRef = useRef(0);
  const lastScannedCodeRef = useRef('');

  // 更新獎品設定
  const handleSetPrize = async (e) => {
      e.preventDefault();
      if(newPrizeName && db) {
          await setDoc(doc(db, "config", "settings"), { currentPrize: newPrizeName }, { merge: true });
          setNewPrizeName("");
      }
  };

  const handleScan = useCallback(async (text) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1500) return;
    if (text === lastScannedCodeRef.current && now - lastScanTimeRef.current < 5000) return;
    try {
      let data = JSON.parse(text);
      lastScanTimeRef.current = now; lastScannedCodeRef.current = text;
      const processResult = (resultType, msg, person) => { setScanRes({ type: resultType, msg, p: person }); setTimeout(() => setScanRes(null), 2000); };
      let targetId = data.id || data;
      if (!targetId && data.type === 'new_reg') {
          const cleanP = normalizePhone(data.phone);
          const p = attendees.find(x => x.phone === cleanP);
          if (p) targetId = p.id;
      }
      const person = attendees.find(x => x.id === targetId);
      if (!person) processResult('error', t.notFound, null);
      else if (person.checkedIn) processResult('duplicate', t.duplicate, person);
      else {
          if (!db) return;
          await updateDoc(doc(db, "attendees", person.id), { checkedIn: true, checkInTime: new Date().toISOString() });
          processResult('success', t.success, person);
      }
    } catch (e) { console.error(e); }
  }, [attendees, t]);

  useEffect(() => {
    if (!isScan || tab !== 'scan') return;
    let s; const init = () => { if(!window.Html5QrcodeScanner)return; s=new window.Html5QrcodeScanner("reader",{fps:15,qrbox:{width:250,height:250},aspectRatio:1.0,showTorchButtonIfSupported:true},false); s.render(handleScan,()=>{}); };
    if(window.Html5QrcodeScanner) init(); else { const sc = document.createElement('script'); sc.src = "https://unpkg.com/html5-qrcode"; sc.onload = init; document.body.appendChild(sc); }
    return () => { if(s) try{s.clear()}catch(e){} };
  }, [isScan, tab, handleScan]);

  const toggleCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: !person.checkedIn, checkInTime: !person.checkedIn ? new Date().toISOString() : null }); };
  const deletePerson = async (id) => { if(confirm('Delete user?') && db) await deleteDoc(doc(db, "attendees", id)); };

  const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h=>h.attendeeId===p.id));

  return (
    <div className="min-h-[100dvh] bg-neutral-950 flex flex-col font-sans text-white">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white"><QrCode size={18}/></div> {t.adminMode}</div>
        <button onClick={onLogout} className="text-white/50 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"><LogOut size={16}/> {t.logout}</button>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* 獎品管理區 */}
        <div className="w-full max-w-md mb-6 bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm"><span className="text-white/50 uppercase tracking-widest">{t.prizeTitle}</span><span className="text-yellow-400 font-bold">{currentPrize || "---"}</span></div>
            <form onSubmit={handleSetPrize} className="flex gap-2">
                <input value={newPrizeName} onChange={e=>setNewPrizeName(e.target.value)} placeholder={t.prizePlace} className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none"/>
                <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">{t.setPrize}</button>
            </form>
        </div>

        <div className="flex justify-center mb-8 bg-white/5 p-1 rounded-2xl shadow-lg border border-white/10 w-fit backdrop-blur-sm">
          {[ {id:'scan',icon:ScanLine,l:t.scan}, {id:'list',icon:Users,l:t.list} ].map(i=> (
            <button key={i.id} onClick={()=>{setTab(i.id);setIsScan(false);setScanRes(null)}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm tracking-wide ${tab===i.id?'bg-red-600 text-white shadow-md':'text-white/50 hover:bg-white/10 hover:text-white'}`}><i.icon size={16}/> {i.l}</button>
          ))}
        </div>
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-full min-h-[600px] overflow-hidden relative flex flex-col items-center justify-center">
          {tab === 'scan' && (
            <div className="h-full w-full flex flex-col items-center justify-center p-8">
              {isScan ? (
                <div className="bg-black rounded-3xl overflow-hidden relative w-full max-w-lg shadow-2xl border border-white/20">
                  <div id="reader" className="w-full"></div>
                  {scanRes && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 ${scanRes.type==='success'?'bg-emerald-600/90':scanRes.type==='duplicate'?'bg-amber-600/90':'bg-red-600/90'}`}>
                        <div className="bg-white text-black p-6 rounded-full shadow-lg mb-4 animate-bounce">{scanRes.type==='success' ? <CheckCircle size={48}/> : scanRes.type==='duplicate' ? <AlertTriangle size={48}/> : <XCircle size={48}/>}</div>
                        <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md text-center px-4 tracking-widest">{scanRes.msg}</h3>
                        {scanRes.p && <p className="text-white text-xl font-bold border-b-2 border-white pb-1">{scanRes.p.name}</p>}
                    </div>
                  )}
                  <button onClick={()=>setIsScan(false)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 hover:bg-red-600 text-white border border-white/30 backdrop-blur px-6 py-2 rounded-full text-sm transition-all z-20">{t.stopCam}</button>
                </div>
              ) : (
                <button onClick={()=>setIsScan(true)} className="group flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-white/20 rounded-3xl hover:bg-white/5 hover:border-red-500/50 transition-all cursor-pointer">
                  <div className="bg-white/10 text-white w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 transition-all"><Camera size={40}/></div>
                  <span className="font-bold text-white/50 group-hover:text-white transition-colors">{t.scanCam}</span>
                </button>
              )}
            </div>
          )}
          {tab === 'list' && (
            <div className="h-full w-full flex flex-col">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="font-bold text-white flex items-center gap-3"><span className="text-white/50 text-sm font-normal">{t.total}: {attendees.length}</span> <span className="w-[1px] h-4 bg-white/20"></span> <span className="text-emerald-400">{t.arrived}: {attendees.filter(x=>x.checkedIn).length}</span></div>
                <button onClick={()=>{const csv="Name,Phone,Email,Status\n"+attendees.map(p=>`${p.name},${p.phone},${p.email},${p.checkedIn?'Checked':'Pending'}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:'text/csv'}));a.download="list.csv";a.click();}} className="text-xs font-bold bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 flex items-center gap-2 transition-colors"><Download size={14}/> CSV</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs text-white/40 uppercase tracking-widest border-b border-white/10"><tr><th className="p-4 pl-6">Avatar</th><th className="p-4">{t.name}</th><th className="p-4">{t.phone}</th><th className="p-4">{t.email}</th><th className="p-4 text-right">{t.checkin}</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {attendees.map(p=>{
                        const isWinner = drawHistory.some(h => h.attendeeId === p.id);
                        return (
                          <tr key={p.id} className={`transition-colors group ${isWinner ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`}>
                            <td className="p-4 pl-6">{p.photo ? <img src={p.photo} alt="User" className="w-10 h-10 rounded-full object-cover border border-white/20"/> : <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><User size={16}/></div>}</td>
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                                {p.name}
                                {isWinner && <Trophy size={16} className="text-yellow-500 fill-current animate-pulse"/>}
                            </td>
                            <td className="p-4 text-white/60 text-sm font-mono">{p.phone}</td>
                            <td className="p-4 text-white/60 text-sm">{p.email}</td>
                            <td className="p-4 text-right flex justify-end gap-2">
                              <button onClick={()=>toggleCheckIn(p)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${p.checkedIn?'bg-emerald-500/20 text-emerald-400 border-emerald-500/50':'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}>{p.checkedIn?t.checkin:t.cancel}</button>
                              <button onClick={()=>deletePerson(p.id)} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// 🔥 Projector View (Updated)
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
        if (db) await addDoc(collection(db, "winners"), { 
            attendeeId: winner.id, 
            name: winner.name, 
            phone: winner.phone, 
            photo: winner.photo, 
            prize: currentPrize || "Grand Prize", // 寫入獎品
            wonAt: new Date().toISOString() 
        });
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
                {/* 顯示當前獎品 */}
                <div className="mb-6 text-center animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl text-yellow-500 uppercase tracking-widest mb-1 font-bold">{t.currentPrize}</h3>
                    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{currentPrize || "LUCKY DRAW"}</h1>
                </div>

                <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center min-h-[500px]">
                    {eligible.length < 2 ? (
                        <div className="text-center text-white/30"><Trophy size={100} className="mx-auto mb-6 opacity-20"/><p className="text-2xl">{t.needMore}</p><p className="text-sm mt-2 font-mono">Current: {eligible.length}</p></div>
                    ) : (
                        <WheelComponent list={eligible} t={t} onDrawEnd={handleDrawEnd} />
                    )}
                </div>
                
                {/* 中獎名單 (含獎品名稱) */}
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
                        {winner.photo && <img src={winner.photo} className="w-80 h-80 rounded-full border-[10px] border-yellow-400 object-cover shadow-[0_0_50px_rgba(234,179,8,0.5)] mb-8 animate-in zoom-in duration-700"/>}
                        <h1 className="text-7xl md:text-9xl font-black text-white mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110">{winner.name}</h1>
                        <p className="text-white/30 text-sm mt-8">Press ENTER to continue</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
  const [lang, setLang] = useState('zh'); const t = translations[lang];
  const [view, setView] = useState('landing');
  const [attendees, setAttendees] = useState([]);
  const [drawHistory, setDrawHistory] = useState([]);
  const [currentPrize, setCurrentPrize] = useState("");

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "attendees"), orderBy("createdAt", "desc"));
    const unsubAttendees = onSnapshot(q, (snapshot) => { setAttendees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubWinners = onSnapshot(collection(db, "winners"), (snapshot) => { setDrawHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubConfig = onSnapshot(doc(db, "config", "settings"), (doc) => { if (doc.exists()) setCurrentPrize(doc.data().currentPrize); });
    return () => { unsubAttendees(); unsubWinners(); unsubConfig(); };
  }, []);

  const checkDuplicate = (p, e) => {
    if(attendees.some(x => normalizePhone(x.phone) === normalizePhone(p))) return 'phone';
    if(attendees.some(x => normalizeEmail(x.email) === normalizeEmail(e))) return 'email';
    return null;
  };

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
  if(view === 'guest') return <><StyleInjector/><GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} /></>;
  if(view === 'login_admin') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('admin')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_projector') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('projector')} onBack={()=>setView('landing')} /></>;
  if(view === 'admin') return <><StyleInjector/><AdminDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} drawHistory={drawHistory} setDrawHistory={setDrawHistory} currentPrize={currentPrize} setCurrentPrize={setCurrentPrize} /></>;
  if(view === 'projector') return <><StyleInjector/><ProjectorView t={t} onBack={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} /></>;
}