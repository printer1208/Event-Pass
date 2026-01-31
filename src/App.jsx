import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, Zap, Image as ImageIcon, MonitorPlay, Aperture, Gift,
  UserCheck, UserX, Star, StarOff, Armchair, Edit3, Upload, FileText, Play, RotateCcw, Grid
} from 'lucide-react';

// --- Firebase ---
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

// --- Style Injector ---
const StyleInjector = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";
    document.body.style.margin = "0";
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
    title: "Tesla Annual Dinner", sub: "2025 完美場控版",
    guestMode: "參加者登記", adminMode: "接待處 (簽到)", prizeMode: "舞台控台", projectorMode: "大螢幕投影",
    login: "系統驗證", pwdPlace: "請輸入密碼", enter: "登入", wrongPwd: "密碼錯誤",
    regTitle: "賓客登記", regSub: "系統將依資料自動分配座位",
    name: "姓名", phone: "電話", email: "電子郵件",
    photoBtn: "開啟相機 / 自拍", generateBtn: "確認登記",
    yourCode: "入場憑證", showToStaff: "請出示給工作人員掃描",
    next: "完成", scan: "極速掃描", draw: "抽獎控制", prizeList: "獎品管理",
    list: "賓客名單", seating: "座位查詢", total: "總人數", arrived: "已到場",
    scanCam: "啟動掃描鏡頭", stopCam: "停止", manual: "手動輸入 ID",
    success: "簽到成功", duplicate: "重複：此人已入場", error: "無效代碼",
    regSuccess: "登記成功", notFound: "查無此人",
    errPhone: "錯誤：此電話號碼已存在", errEmail: "錯誤：此 Email 已存在",
    errPhoto: "請拍攝或上傳一張照片！", errIncomplete: "請填寫所有必填欄位",
    drawBtn: "啟動抽獎 (Space)", running: "搜尋中...", winner: "✨ 恭喜中獎 ✨", claim: "確認領獎 (Enter)",
    needMore: "等待更多賓客...", export: "導出", checkin: "簽到", cancel: "取消", logout: "登出",
    prizeTitle: "獎品池", setPrize: "新增", prizePlace: "獎品名稱", currentPrize: "正在抽取",
    markWin: "設為得主", resetWinner: "重置", select: "選取",
    importCSV: "導入 CSV", downloadTemp: "下載範本", importSuccess: "導入成功！",
    table: "桌號", seat: "座位", addSeat: "新增座位", searchSeat: "搜尋姓名/電話/桌號...",
    yourSeat: "您的座位", seatTBD: "待定"
  },
  en: {
    title: "Tesla Annual Dinner", sub: "2025 Final Control",
    guestMode: "Registration", adminMode: "Reception", prizeMode: "Stage Control", projectorMode: "Projector",
    login: "Security", pwdPlace: "Password", enter: "Login", wrongPwd: "Error",
    regTitle: "Register", regSub: "Seat assigned automatically",
    name: "Name", phone: "Phone", email: "Email",
    photoBtn: "Photo", generateBtn: "Submit",
    yourCode: "Entry Pass", showToStaff: "Show to Staff",
    next: "Finish", scan: "Scan", draw: "Control", prizeList: "Prize Manager",
    list: "Guest List", seating: "Seating", total: "Total", arrived: "Arrived",
    scanCam: "Scan", stopCam: "Stop", manual: "Manual Input",
    success: "Success", duplicate: "Duplicate", error: "Invalid", regSuccess: "Registered",
    drawBtn: "Start (Space)", running: "Searching...", winner: "WINNER", claim: "Confirm (Enter)",
    needMore: "Waiting...", export: "Export", checkin: "Check-in", cancel: "Cancel", logout: "Logout",
    prizeTitle: "Prizes", setPrize: "Add", prizePlace: "Prize Name", currentPrize: "Drawing",
    markWin: "Mark Win", resetWinner: "Reset", select: "Select",
    importCSV: "Import", downloadTemp: "Template", importSuccess: "Done",
    table: "Table", seat: "Seat", addSeat: "Add Seat", searchSeat: "Search...",
    yourSeat: "Your Seat", seatTBD: "TBD"
  }
};

const normalizePhone = (p) => String(p || '').replace(/[^0-9]/g, '');
const normalizeEmail = (e) => String(e || '').trim().toLowerCase();
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
        } else { img.src = source; }
    });
};

const Confetti = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const p = Array.from({length:300}).map(()=>({x:Math.random()*c.width, y:Math.random()*c.height,c:['#E82127','#FFFFFF','#808080', '#FFD700'][Math.floor(Math.random()*4)],s:Math.random()*8+2,d:Math.random()*5}));
    const draw = () => { ctx.clearRect(0,0,c.width,c.height); p.forEach(i=>{i.y+=i.s;i.x+=Math.sin(i.d);if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}ctx.fillStyle=i.c;ctx.beginPath();ctx.arc(i.x,i.y,i.s/2,0,Math.PI*2);ctx.fill();}); requestAnimationFrame(draw); };
    draw();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
};

// --- Sound ---
const SoundController = {
  ctx: null, oscList: [],
  init: function() { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); },
  startSuspense: function() {
      if (!this.ctx) this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const drone = this.ctx.createOscillator(); const droneGain = this.ctx.createGain();
      drone.type = 'sawtooth'; drone.frequency.value = 40; 
      drone.connect(droneGain); droneGain.connect(this.ctx.destination);
      droneGain.gain.setValueAtTime(0.2, now); droneGain.gain.linearRampToValueAtTime(0.5, now + 5);
      drone.start(now);
      this.oscList.push({stop: () => { droneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5); setTimeout(() => drone.stop(), 500); }});
      let beatTime = 0.5;
      const playBeat = () => {
          const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
          osc.type = 'square'; osc.frequency.value = 60;
          osc.connect(g); g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.3, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
          osc.start(); osc.stop(this.ctx.currentTime + 0.1);
          beatTime *= 0.95; 
          if(beatTime > 0.05) setTimeout(playBeat, beatTime * 1000);
      };
      playBeat();
  },
  stopAll: function() { this.oscList.forEach(o => o.stop()); this.oscList = []; },
  playWin: function() {
      this.stopAll(); if (!this.ctx) return; const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
          const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
          osc.type = 'triangle'; osc.frequency.value = freq; osc.connect(g); g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.5, t + i*0.08); g.gain.exponentialRampToValueAtTime(0.01, t + i*0.08 + 2.5);
          osc.start(t + i*0.08); osc.stop(t + i*0.08 + 2.5);
      });
  }
};

// --- Galaxy Canvas (Updated: Size Down & Winner Remove) ---
const GalaxyCanvas = ({ list, t, onDrawEnd }) => {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const particles = useRef([]);
    const frameId = useRef(null);
    const mode = useRef('mosaic'); 

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || list.length === 0) return;
        const ctx = canvas.getContext('2d');
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize(); window.addEventListener('resize', resize);

        // 🔥 調整：更密集的排列 (Size / 2)
        const cols = Math.ceil(Math.sqrt(list.length * 2.5));
        const size = Math.max(30, canvas.width / cols); 

        particles.current = list.map((p, i) => {
            const img = new Image();
            img.src = p.photo || `https://ui-avatars.com/api/?name=${p.name}&background=random&color=fff&size=128`;
            return {
                id: p.id,
                x: (i % cols) * size, 
                y: Math.floor(i / cols) * size,
                targetX: (i % cols) * size,
                targetY: Math.floor(i / cols) * size,
                vx: 0, vy: 0, size: size, img: img, data: p
            };
        });

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.current.forEach(p => {
                if (mode.current === 'galaxy') {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                } else {
                    p.x += (p.targetX - p.x) * 0.1; p.y += (p.targetY - p.y) * 0.1;
                }
                ctx.save();
                ctx.beginPath(); ctx.arc(p.x + p.size/2, p.y + p.size/2, p.size/2 - 2, 0, Math.PI * 2); ctx.clip();
                if (p.img.complete) ctx.drawImage(p.img, p.x, p.y, p.size, p.size);
                else { ctx.fillStyle = '#333'; ctx.fillRect(p.x, p.y, p.size, p.size); }
                ctx.restore();
            });
            frameId.current = requestAnimationFrame(render);
        };
        render();
        return () => { cancelAnimationFrame(frameId.current); window.removeEventListener('resize', resize); };
    }, [list]);

    const start = () => {
        if(list.length < 2) return;
        setIsRunning(true);
        mode.current = 'galaxy';
        particles.current.forEach(p => { p.vx = (Math.random() - 0.5) * 30; p.vy = (Math.random() - 0.5) * 30; });
        SoundController.startSuspense();
        setTimeout(stop, 5000);
    };

    const stop = () => {
        const winnerIdx = Math.floor(Math.random() * list.length);
        const winner = list[winnerIdx];
        setIsRunning(false);
        mode.current = 'mosaic';
        SoundController.playWin();
        setTimeout(() => onDrawEnd(winner), 800);
    };

    useEffect(() => {
        const handleKey = (e) => { if (e.code === 'Space' && !isRunning) { e.preventDefault(); start(); } };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isRunning, list]);

    return (
        <div className="fixed inset-0 z-0">
            <canvas ref={canvasRef} className="block w-full h-full" />
            {!isRunning && <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50"><button onClick={start} className="bg-red-600 text-white px-12 py-4 rounded-full font-bold text-2xl shadow-2xl border border-white/20 uppercase tracking-widest hover:scale-105 transition-transform">{t.drawBtn}</button></div>}
            {isRunning && <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"><h1 className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(232,33,39,0.8)] animate-pulse uppercase tracking-widest">{t.running}</h1></div>}
        </div>
    );
};

// ... (LoginView, GuestView) ...
const LoginView = ({ t, onLogin, onBack }) => {
    const [pwd, setPwd] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if(pwd === ADMIN_PASSWORD) onLogin(); else { alert(t.wrongPwd); setPwd(''); } };
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
        <div className="relative bg-neutral-900/80 border border-white/20 p-10 rounded-3xl w-full max-w-sm backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500 z-50">
          <button onClick={onBack} className="text-white/50 hover:text-white mb-8 flex items-center transition-colors text-sm uppercase tracking-widest"><ChevronLeft size={16} className="mr-1"/> {t.back}</button>
          <div className="text-center mb-8"><h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.login}</h2></div>
          <form onSubmit={handleSubmit}><input type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={t.pwdPlace} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl mb-6 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-center tracking-[0.3em] placeholder:tracking-normal placeholder:text-white/20"/><button type="submit" className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-900/40 transition-all active:scale-95 uppercase tracking-widest text-sm">{t.enter}</button></form>
        </div>
      </div>
    );
};

// 🔥 Guest View (Fix: No Seat Input)
const GuestView = ({ t, onBack, checkDuplicate, seatingPlan }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:'',phone:'',email:'',company:''});
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
  const handleSubmit = async (e) => { e.preventDefault(); setErr(''); if(!photo) { setErr(t.errPhoto); return; } setLoading(true); const cleanPhone = normalizePhone(form.phone); const cleanEmail = normalizeEmail(form.email); const dup = checkDuplicate(cleanPhone, cleanEmail); if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; } if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; } 
  // 自動匹配
  let assignedTable = ""; let assignedSeat = ""; const emailMatch = seatingPlan.find(s => normalizeEmail(s.email) === cleanEmail); const phoneMatch = seatingPlan.find(s => normalizePhone(s.phone) === cleanPhone); if(emailMatch) { assignedTable = emailMatch.table; assignedSeat = emailMatch.seat; } else if(phoneMatch) { assignedTable = phoneMatch.table; assignedSeat = phoneMatch.seat; } setMatchSeat({ table: assignedTable, seat: assignedSeat }); 
  try { if (!db) throw new Error("Firebase not initialized"); const docRef = await addDoc(collection(db, "attendees"), { name: form.name, phone: cleanPhone, email: cleanEmail, company: form.company, table: assignedTable, seat: assignedSeat, photo: photo, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() }); setNewId(docRef.id); setStep(2); } catch (error) { console.error(error); setErr("Network Error."); } setLoading(false); };
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
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
const ProjectorView = ({ t, attendees, drawHistory, onBack, currentPrize, prizes }) => {
    const [winner, setWinner] = useState(null);
    // 嚴格過濾：已簽到 且 不在中獎名單中
    const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h => h.attendeeId === p.id));

    useEffect(() => {
        const handleKey = async (e) => { 
            if (winner && e.key === 'Enter') {
                setWinner(null);
                if (currentPrize && prizes.length > 0) {
                    const currentIdx = prizes.findIndex(p => p.name === currentPrize);
                    const nextAvailablePrize = prizes.find((p, idx) => idx > currentIdx && !drawHistory.some(h => h.prize === p.name));
                    if (nextAvailablePrize && db) {
                        await setDoc(doc(db, "config", "settings"), { currentPrize: nextAvailablePrize.name }, { merge: true });
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [winner, prizes, drawHistory, currentPrize]);

    const handleDrawEnd = async (w) => {
        setWinner(w);
        if (db) await addDoc(collection(db, "winners"), { attendeeId: w.id, name: w.name, phone: w.phone, photo: w.photo, table: w.table, seat: w.seat, prize: currentPrize || "Grand Prize", wonAt: new Date().toISOString() });
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
            <button onClick={onBack} className="absolute top-6 left-6 text-white/30 hover:text-white z-50 transition-colors"><ChevronLeft size={24}/></button>
            
            {/* 上層 Header (20%) - 加上背景防重疊 */}
            <div className="absolute top-0 left-0 w-full h-[20vh] z-40 flex flex-col items-center justify-end pb-4 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none">
                 <div className="bg-black/40 backdrop-blur-md px-10 py-4 rounded-3xl border border-white/10 text-center pointer-events-auto">
                    <h3 className="text-xl text-yellow-500 uppercase tracking-widest font-bold mb-1">{t.currentPrize}</h3>
                    <h1 className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{currentPrize || "WAITING..."}</h1>
                 </div>
            </div>

            {/* 中層 Canvas (60%) */}
            <div className="absolute inset-0 z-10">
                {eligible.length > 0 ? (
                    <GalaxyCanvas list={eligible} t={t} onDrawEnd={handleDrawEnd} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/30"><Trophy size={100} className="mb-6 opacity-20"/><p className="text-2xl">{t.needMore}</p></div>
                )}
            </div>
            
            {/* 下層 Marquee (20%) */}
            <div className="absolute bottom-0 left-0 w-full h-[20vh] z-40 flex items-start justify-center pt-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                {drawHistory.length > 0 && (
                    <div className="w-full max-w-7xl overflow-x-auto px-10 pb-4">
                        <div className="flex gap-4 justify-center">
                            {drawHistory.map(h => (
                                <div key={h.id} className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shrink-0">
                                    <span className="text-yellow-400 font-bold text-xs">{h.prize}</span>
                                    <div className="w-[1px] h-3 bg-white/20"></div>
                                    <span className="font-bold text-sm">{h.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {winner && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                    <Confetti/>
                    <Trophy className="text-yellow-400 mb-6 drop-shadow-[0_0_50px_rgba(250,204,21,0.8)] animate-bounce" size={100} />
                    <h2 className="text-3xl font-bold text-white/80 mb-6 tracking-[0.5em]">{t.winner}</h2>
                    {winner.photo ? <img src={winner.photo} className="w-80 h-80 rounded-full border-8 border-yellow-400 object-cover shadow-[0_0_100px_rgba(234,179,8,0.5)] mb-8"/> : <div className="w-64 h-64 rounded-full bg-neutral-800 flex items-center justify-center border-8 border-yellow-400 mb-8"><User size={100}/></div>}
                    <h1 className="text-8xl font-black text-white mb-4">{winner.name}</h1>
                    {winner.table && <div className="bg-white/20 px-8 py-3 rounded-full text-2xl font-bold border border-white/30 flex items-center gap-3"><Armchair/> Table {winner.table}</div>}
                    <p className="mt-10 text-white/30 text-sm">Press ENTER to continue</p>
                </div>
            )}
        </div>
    );
};

// --- Reception Dashboard (Fix: CSV Import & Winner Mark) ---
const ReceptionDashboard = ({ t, onLogout, attendees, setAttendees, seatingPlan, drawHistory }) => {
  const [tab, setTab] = useState('scan');
  const [isScan, setIsScan] = useState(false);
  const [scanRes, setScanRes] = useState(null);
  const [search, setSearch] = useState(""); 
  const [adminForm, setAdminForm] = useState({name:'',phone:'',email:'',table:'',seat:''});
  const lastTime = useRef(0);

  const filteredSeat = seatingPlan.filter(s => (s.name||'').includes(search) || (s.phone||'').includes(search) || s.table.includes(search));

  const handleScan = useCallback(async (text) => {
    const now = Date.now();
    if(now - lastTime.current < 2000) return;
    try {
        const data = JSON.parse(text);
        lastTime.current = now;
        let targetId = data.id || (data.type==='new_reg' && attendees.find(x=>x.phone===normalizePhone(data.phone))?.id);
        const p = attendees.find(x=>x.id===targetId);
        if(!p) setScanRes({type:'error', msg:t.notFound});
        else if(p.checkedIn) setScanRes({type:'duplicate', msg:t.duplicate, p});
        else {
             if(db) updateDoc(doc(db, "attendees", p.id), { checkedIn: true, checkInTime: new Date().toISOString() });
             setScanRes({type:'success', msg:t.success, p});
        }
        setTimeout(()=>setScanRes(null), 2000);
    } catch(e){}
  }, [attendees]);

  useEffect(() => {
    if(!isScan) return;
    let s; const init = () => { if(window.Html5QrcodeScanner) { s=new window.Html5QrcodeScanner("reader",{fps:10,qrbox:250},false); s.render(handleScan,()=>{}); }};
    if(window.Html5QrcodeScanner) init(); else { const sc=document.createElement('script'); sc.src="https://unpkg.com/html5-qrcode"; sc.onload=init; document.body.appendChild(sc); }
    return ()=>{if(s)try{s.clear()}catch(e){}};
  }, [isScan, handleScan]);

  const handleImportSeating = async (e) => {
    const file = e.target.files[0]; if(!file)return;
    const text = await file.text(); const lines = text.split(/\r\n|\n/).slice(1);
    const batch = writeBatch(db);
    lines.forEach(l => {
        const c = l.split(',');
        if(c.length>=4) {
            const ref = doc(collection(db, "seating_plan"));
            batch.set(ref, { name: c[0].trim(), phone: normalizePhone(c[1]), email: normalizeEmail(c[2]), table: c[3].trim(), seat: c[4]?.trim()||'' });
        }
    });
    await batch.commit(); alert(t.importSuccess);
  };
  
  const handleAddGuest = async (e) => {
      e.preventDefault();
      if(!adminForm.name) return;
      await addDoc(collection(db, "attendees"), { ...adminForm, phone: normalizePhone(adminForm.phone), email: normalizeEmail(adminForm.email), checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() });
      setAdminForm({name:'',phone:'',email:'',table:'',seat:''});
  };

  const toggleCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: !person.checkedIn, checkInTime: !person.checkedIn ? new Date().toISOString() : null }); };
  const toggleCancelCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: false, checkInTime: null }); };
  const deletePerson = async (id) => { if(confirm('Delete?') && db) await deleteDoc(doc(db, "attendees", id)); };

  const downloadTemplate = () => { const content = "\uFEFFName,Phone,Email,Table,Seat\nElon Musk,0912345678,elon@tesla.com,1,A"; const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "seating_template.csv"; link.click(); };

  return (
    <div className="min-h-[100dvh] bg-neutral-950 text-white flex flex-col">
       <header className="p-4 border-b border-white/10 flex justify-between items-center bg-neutral-900"><div className="font-bold text-lg flex gap-2"><QrCode/> Reception</div><button onClick={onLogout}><LogOut size={18}/></button></header>
       <main className="flex-1 p-4 flex flex-col items-center w-full max-w-5xl mx-auto">
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
              {['scan','list','seating'].map(k=><button key={k} onClick={()=>{setTab(k);setIsScan(false)}} className={`px-4 py-2 rounded-lg text-sm ${tab===k?'bg-blue-600':'text-white/50'}`}>{t[k]}</button>)}
          </div>
          
          {tab==='scan' && (
              <div className="w-full max-w-md">
                  {isScan ? <div id="reader" className="bg-black rounded-xl overflow-hidden mb-4"></div> : <button onClick={()=>setIsScan(true)} className="w-full py-12 border-2 border-dashed border-white/20 rounded-xl text-white/50 flex flex-col items-center gap-2 hover:bg-white/5"><Camera size={32}/> {t.scanCam}</button>}
                  {scanRes && <div className={`p-4 rounded-xl text-center font-bold ${scanRes.type==='success'?'bg-green-600':'bg-red-600'}`}>{scanRes.msg} {scanRes.p?.name}</div>}
              </div>
          )}

          {tab==='list' && (
              <div className="w-full flex-1 flex flex-col h-[70vh]">
                  <div className="p-4 bg-white/5 rounded-t-xl border-b border-white/10">
                      <form onSubmit={handleAddGuest} className="flex gap-2 flex-wrap">
                          <input placeholder="Name" value={adminForm.name} onChange={e=>setAdminForm({...adminForm,name:e.target.value})} className="bg-white/10 rounded px-2 py-1 flex-1 text-sm outline-none"/>
                          <input placeholder="Phone" value={adminForm.phone} onChange={e=>setAdminForm({...adminForm,phone:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-24 text-sm outline-none"/>
                          <input placeholder="Email" value={adminForm.email} onChange={e=>setAdminForm({...adminForm,email:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-32 text-sm outline-none"/>
                          <input placeholder="Tab" value={adminForm.table} onChange={e=>setAdminForm({...adminForm,table:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-12 text-sm outline-none"/>
                          <button className="bg-green-600 px-3 py-1 rounded text-sm"><Plus size={16}/></button>
                      </form>
                  </div>
                  
                  <div className="p-2 bg-white/5 border-b border-white/10 flex justify-between text-xs text-white/50 px-4">
                      <span>Total: {attendees.length}</span>
                      <span className="text-emerald-400">Arrived: {attendees.filter(x=>x.checkedIn).length}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white/5 rounded-b-xl p-2">
                      {attendees.map(p=>{
                          const winnerRec = drawHistory.find(h=>h.attendeeId===p.id);
                          return (
                              <div key={p.id} className="flex justify-between items-center p-3 border-b border-white/10 hover:bg-white/10">
                                  <div className="flex items-center gap-3">
                                      {p.photo ? <img src={p.photo} className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><User size={14}/></div>}
                                      <div>
                                          <div className="font-bold text-sm flex items-center gap-2">{p.name} {winnerRec && <span className="bg-yellow-500 text-black text-[10px] px-1 rounded">🏆 {winnerRec.prize}</span>}</div>
                                          <div className="text-[10px] text-white/50">{p.phone} | {p.email}</div>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs text-white/50 font-mono">T-{p.table}</span>
                                      <button onClick={()=>toggleCheckIn(p)} className={`text-xs px-2 py-1 rounded ${p.checkedIn?'bg-green-600':'bg-white/20'}`}>{p.checkedIn?t.arrived:t.checkin}</button>
                                      <button onClick={()=>deletePerson(p.id)} className="p-1 text-white/30 hover:text-red-500"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {tab==='seating' && (
              <div className="w-full flex-1 flex flex-col gap-4">
                  <div className="flex gap-2">
                      <input placeholder={t.searchSeat} value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 bg-white/10 rounded-lg px-3 py-2 outline-none"/>
                      <label className="bg-blue-600 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2"><Upload size={16}/> {t.importCSV}<input type="file" hidden accept=".csv" onChange={handleImportSeating}/></label>
                      <button onClick={downloadTemplate} className="bg-white/10 px-3 py-2 rounded-lg"><FileText size={16}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-white/5 rounded-xl p-2">
                      {filteredSeat.map(s=>(
                          <div key={s.id} className="flex justify-between p-3 border-b border-white/10">
                              <div><div className="font-bold">{s.name}</div><div className="text-xs text-white/50">{s.phone}</div></div>
                              <div className="text-right text-blue-400 font-mono font-bold">T-{s.table}</div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
       </main>
    </div>
  );
};

// ... PrizeDashboard ...
const PrizeDashboard = ({ t, onLogout, attendees, drawHistory, currentPrize, setCurrentPrize }) => {
  const [prizes, setPrizes] = useState([]); 
  const [newPrizeName, setNewPrizeName] = useState("");
  const [qty, setQty] = useState("1");
  const [prizeSearch, setPrizeSearch] = useState(""); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(query(collection(db, "prizes"), orderBy("createdAt", "asc")), (snapshot) => {
        setPrizes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddPrize = async (e) => {
      e.preventDefault();
      if(newPrizeName && db) {
          const q = parseInt(qty) || 1;
          const batch = writeBatch(db);
          for(let i=1; i<=q; i++) {
              const newRef = doc(collection(db, "prizes"));
              batch.set(newRef, { name: q > 1 ? `${newPrizeName} #${i}` : newPrizeName, createdAt: new Date().toISOString() });
          }
          await batch.commit();
          setNewPrizeName(""); setQty("1");
      }
  };

  const handleSelectPrize = async (prizeName) => { if(db) await setDoc(doc(db, "config", "settings"), { currentPrize: prizeName }, { merge: true }); };
  const handleDeletePrize = async (id) => { if(confirm('Delete prize?')) await deleteDoc(doc(db, "prizes", id)); };
  
  const toggleWinnerStatus = async (winnerRecord) => { 
      if(confirm('Reset this prize? Winner will be removed.')) {
          await deleteDoc(doc(db, "winners", winnerRecord.id));
          await setDoc(doc(db, "config", "settings"), { currentPrize: winnerRecord.prize }, { merge: true });
      }
  };
  
  const handleImportPrizes = async (e) => {
      const file = e.target.files[0]; if(!file) return; const text = await file.text(); const lines = text.split(/\r\n|\n/).filter(l=>l);
      const batch = writeBatch(db); lines.forEach(l=>{ const newRef = doc(collection(db, "prizes")); batch.set(newRef, { name: l.trim(), createdAt: new Date().toISOString() }); }); await batch.commit(); alert("Imported!");
  };
  const downloadTemplate = () => { const content = "\uFEFFName\nGrand Prize\nSecond Prize"; const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "prize_template.csv"; link.click(); };

  const filteredPrizes = prizes.filter(p => p.name.toLowerCase().includes(prizeSearch.toLowerCase()));

  return (
    <div className="min-h-[100dvh] bg-neutral-950 flex flex-col font-sans text-white">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white"><Trophy size={18}/></div> {t.prizeMode}</div>
        <button onClick={onLogout} className="text-white/50 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"><LogOut size={16}/> {t.logout}</button>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="w-full grid md:grid-cols-2 gap-8 h-full">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col h-[700px]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Gift size={20} className="text-red-500"/> {t.prizeList}</h3>
                <form onSubmit={handleAddPrize} className="flex gap-2 mb-4">
                    <input value={newPrizeName} onChange={e=>setNewPrizeName(e.target.value)} placeholder={t.prizePlace} className="flex-[2] bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"/>
                    <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} className="w-16 bg-black/50 border border-white/20 rounded-xl px-2 py-3 text-sm text-center text-white focus:border-red-500 outline-none"/>
                    <button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"><Plus size={20}/></button>
                </form>
                <div className="flex gap-2 mb-4 relative">
                    <Search className="absolute top-3 left-3 text-white/30" size={16}/>
                    <input value={prizeSearch} onChange={e=>setPrizeSearch(e.target.value)} placeholder="Search Prize..." className="w-full bg-black/30 border border-white/10 pl-10 pr-4 py-2 rounded-lg text-sm outline-none"/>
                    <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-center cursor-pointer transition-colors flex items-center justify-center gap-1"><Upload size={12}/> CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportPrizes}/></label>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scroll flex flex-col gap-2">
                    {filteredPrizes.map(p=>{
                        const winnerRecord = drawHistory.find(h => h.prize === p.name);
                        return (
                            <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${currentPrize===p.name?'bg-red-600/20 border-red-600':'bg-white/5 border-white/10'} ${winnerRecord ? 'opacity-70 bg-black/40' : ''}`}>
                                <div className="flex flex-col">
                                    <span className={`font-bold ${currentPrize===p.name?'text-white':'text-white/70'}`}>{p.name}</span>
                                    {winnerRecord && <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1 font-bold">🏆 {winnerRecord.name}</span>}
                                </div>
                                <div className="flex gap-2">
                                    {currentPrize!==p.name && !winnerRecord && <button onClick={()=>handleSelectPrize(p.name)} className="px-3 py-1.5 bg-white/10 hover:bg-green-600 rounded-lg text-xs transition-colors">{t.select}</button>}
                                    {currentPrize===p.name && <span className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-bold">{t.active}</span>}
                                    {winnerRecord ? <button onClick={()=>toggleWinnerStatus(winnerRecord)} className="p-2 bg-white/10 hover:bg-yellow-600 rounded-lg transition-colors" title={t.resetWinner}><RotateCcw size={14}/></button>
                                                  : <button onClick={()=>handleDeletePrize(p.id)} className="p-2 bg-white/10 hover:bg-red-600 rounded-lg transition-colors"><Trash2 size={14}/></button>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-neutral-800 to-black border border-white/20 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-30"><MonitorPlay size={100} className="text-white"/></div>
                    <p className="text-white/50 text-sm uppercase tracking-widest mb-2">{t.currentPrize}</p>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg mb-6">{currentPrize || "---"}</h1>
                    <div className="flex justify-center gap-4">
                        <div className="text-center"><div className="text-2xl font-bold text-white">{attendees.filter(p=>p.checkedIn).length}</div><div className="text-xs text-white/40">Present</div></div>
                        <div className="w-[1px] h-10 bg-white/10"></div>
                        <div className="text-center"><div className="text-2xl font-bold text-white">{attendees.filter(p=>p.checkedIn && !drawHistory.some(h=>h.attendeeId===p.id)).length}</div><div className="text-xs text-white/40">Eligible</div></div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex-1 h-[350px] overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy size={20} className="text-yellow-500"/> {t.winnersList}</h3>
                    <div className="flex-1 overflow-y-auto custom-scroll flex flex-col gap-2">
                        {drawHistory.map(h => (
                            <div key={h.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-yellow-500 text-sm font-bold">{h.prize}</span>
                                <div className="flex items-center gap-2">
                                    {h.photo && <img src={h.photo} className="w-6 h-6 rounded-full object-cover"/>}
                                    <span className="font-bold">{h.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
  const [prizes, setPrizes] = useState([]);

  useEffect(() => {
    if (!db) return;
    const unsubAttendees = onSnapshot(query(collection(db, "attendees"), orderBy("createdAt", "desc")), (snapshot) => { setAttendees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubWinners = onSnapshot(collection(db, "winners"), (snapshot) => { setDrawHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubConfig = onSnapshot(doc(db, "config", "settings"), (doc) => { if (doc.exists()) setCurrentPrize(doc.data().currentPrize); });
    const unsubSeating = onSnapshot(collection(db, "seating_plan"), (snapshot) => { setSeatingPlan(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubPrizes = onSnapshot(query(collection(db, "prizes"), orderBy("createdAt", "asc")), (snapshot) => { setPrizes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => { unsubAttendees(); unsubWinners(); unsubConfig(); unsubSeating(); unsubPrizes(); };
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
      <div className="grid md:grid-cols-4 gap-4 w-full max-w-7xl z-10 px-4">
        {/* Guest */}
        <button onClick={()=>setView('guest')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ImageIcon size={60} className="text-white"/></div>
            <h3 className="text-xl font-bold text-white mb-1">{t.guestMode}</h3><p className="text-white/50 text-xs">{t.guestDesc}</p>
            <div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-white w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
        {/* Admin (Reception) */}
        <button onClick={()=>setView('login_admin')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><UserCheck size={60} className="text-white"/></div>
            <h3 className="text-xl font-bold text-white mb-1">{t.adminMode}</h3><p className="text-white/50 text-xs">{t.adminDesc}</p>
            <div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-red-600 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
        {/* Prize Mgr (New) */}
        <button onClick={()=>setView('login_prize')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Gift size={60} className="text-white"/></div>
            <h3 className="text-xl font-bold text-white mb-1">{t.prizeMode}</h3><p className="text-white/50 text-xs">{t.prizeDesc}</p>
            <div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-indigo-600 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
        {/* Projector */}
        <button onClick={()=>setView('login_projector')} className="group relative overflow-hidden bg-gradient-to-br from-neutral-800 to-black hover:from-neutral-700 border border-white/20 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity"><MonitorPlay size={60} className="text-yellow-500"/></div>
            <h3 className="text-xl font-bold text-yellow-500 mb-1">{t.projectorMode}</h3><p className="text-white/50 text-xs">{t.projectorDesc}</p>
            <div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-yellow-500 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div>
        </button>
      </div>
    </div>
  );
  if(view === 'guest') return <><StyleInjector/><GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} seatingPlan={seatingPlan} /></>;
  if(view === 'login_admin') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('admin')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_prize') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('prize')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_projector') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('projector')} onBack={()=>setView('landing')} /></>;
  
  if(view === 'admin') return <><StyleInjector/><ReceptionDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} seatingPlan={seatingPlan} drawHistory={drawHistory} /></>;
  if(view === 'prize') return <><StyleInjector/><PrizeDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} setCurrentPrize={setCurrentPrize} prizes={prizes} /></>;
  if(view === 'projector') return <><StyleInjector/><ProjectorView t={t} onBack={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} prizes={prizes} /></>;
}