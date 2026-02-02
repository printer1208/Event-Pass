import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, Zap, Image as ImageIcon, MonitorPlay, Aperture, Gift,
  UserCheck, UserX, Star, StarOff, Armchair, Edit3, Upload, FileText, Play, RotateCcw, Grid, Briefcase, Database
} from 'lucide-react';

// --- Firebase ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, setDoc,
  doc, onSnapshot, query, orderBy, deleteDoc, writeBatch
} from "firebase/firestore";

// ==========================================
// 1. 設定與常數
// ==========================================

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

// ==========================================
// 2. 翻譯與資料
// ==========================================

const translations = {
  zh: {
    title: "Tesla Annual Dinner", sub: "2025 視覺平衡版",
    guestMode: "參加者登記", adminMode: "接待處 (簽到)", prizeMode: "舞台控台", projectorMode: "大螢幕投影",
    login: "系統驗證", pwdPlace: "請輸入密碼", enter: "登入", wrongPwd: "密碼錯誤",
    regTitle: "賓客登記", regSub: "系統將依資料自動分配座位",
    name: "姓名", phone: "電話", email: "電郵", dept: "部門",
    generateBtn: "確認登記", back: "返回", yourCode: "入場憑證", yourSeat: "您的座位",
    showToStaff: "請出示給工作人員掃描", next: "完成",
    scan: "極速掃描", draw: "抽獎控制", prizeList: "獎品管理",
    list: "賓客名單", seating: "座位查詢", total: "總人數", arrived: "已到場",
    scanCam: "啟動掃描", stopCam: "停止", manual: "手動輸入 ID",
    success: "簽到成功", duplicate: "已入場", error: "無效代碼", regSuccess: "登記成功", notFound: "查無此人",
    errPhone: "電話已存在", errEmail: "Email已存在", errPhoto: "需照片", errIncomplete: "請填寫完整",
    drawBtn: "啟動抽獎 (ENTER)", running: "抽獎中", winner: "✨ 恭喜中獎 ✨", claim: "確認領獎 (Enter)",
    needMore: "等待中...", export: "導出", checkin: "簽到", cancel: "取消", logout: "登出",
    prizeTitle: "獎品池", setPrize: "新增", prizePlace: "獎品名稱", currentPrize: "正在抽取",
    markWin: "設為得主", resetWinner: "重置", select: "選取",
    importCSV: "導入 CSV", downloadTemp: "範本", importSuccess: "成功",
    table: "桌號", seat: "座號", addSeat: "新增座位", searchSeat: "搜尋姓名/電話/桌號...",
    searchList: "搜尋姓名/電話/Email...", seatTBD: "待定 (請洽櫃台)", wonPrize: "獲獎紀錄",
    addGuest: "新增賓客", clearAll: "清空所有得獎者",
    drawn: "已抽出", winnerIs: "得主", noPhoto: "無照片",
    genDummy: "生成 100 筆測試資料", clearGuests: "清空所有賓客", confirmClearGuests: "確定要刪除所有賓客資料嗎？這將無法復原。",
    genDummySeat: "生成 100 筆測試座位", clearSeats: "清空座位表", confirmClearSeats: "確定要清空所有座位表嗎？",
    checkSeat: "查詢座位", inputHint: "輸入電話或 Email 查詢", backToReg: "返回登記",
    seatResult: "查詢結果", status: "狀態", notCheckedIn: "未簽到", registered: "已登記", notRegistered: "未登記",
    youWon: "恭喜獲得", nextRound: "按 ENTER 進入下一輪",
    winnerLabel: "得主"
  },
  en: {
    title: "Tesla Annual Dinner", sub: "2025 Visual Balance",
    guestMode: "Registration", adminMode: "Reception", prizeMode: "Stage Control", projectorMode: "Projector",
    login: "Security", pwdPlace: "Password", enter: "Login", wrongPwd: "Error",
    regTitle: "Register", regSub: "Auto seat assignment",
    name: "Name", phone: "Phone", email: "Email", dept: "Dept",
    generateBtn: "Submit", back: "Back", yourCode: "Entry Pass", yourSeat: "Your Seat",
    showToStaff: "Show to Staff", next: "Finish",
    scan: "Scanner", draw: "Control", prizeList: "Prizes",
    list: "Guest List", seating: "Seating", total: "Total", arrived: "Arrived",
    scanCam: "Scan", stopCam: "Stop", manual: "Manual Input",
    success: "Success", duplicate: "Duplicate", error: "Invalid", regSuccess: "Registered", notFound: "Not Found",
    errPhone: "Phone exists", errEmail: "Email exists", errPhoto: "Photo required", errIncomplete: "Fill all",
    drawBtn: "Start (ENTER)", running: "Running", winner: "WINNER", claim: "Confirm (Enter)",
    needMore: "Waiting...", export: "Export", checkin: "Check-in", cancel: "Cancel", logout: "Logout",
    prizeTitle: "Prizes", setPrize: "Add", prizePlace: "Prize Name", currentPrize: "Drawing",
    markWin: "Mark Win", resetWinner: "Reset", select: "Select",
    importCSV: "Import", downloadTemp: "Template", importSuccess: "Done",
    table: "Table", seat: "Seat", addSeat: "Add Seat", searchSeat: "Search Name/Phone/Email...",
    searchList: "Search Name/Phone/Email...", seatTBD: "TBD", wonPrize: "Prize",
    addGuest: "Add Guest", clearAll: "Clear All Winners",
    drawn: "Drawn", winnerIs: "Winner", noPhoto: "No Photo",
    genDummy: "Gen 100 Dummy", clearGuests: "Clear All Guests", confirmClearGuests: "Are you sure to delete ALL guests? This cannot be undone.",
    genDummySeat: "Gen 100 Dummy Seats", clearSeats: "Clear Seats", confirmClearSeats: "Delete ALL seating plan?",
    checkSeat: "Check Seat", inputHint: "Enter Phone or Email", backToReg: "Back to Register",
    seatResult: "Result", status: "Status", notCheckedIn: "Not In", registered: "Registered", notRegistered: "Not Reg",
    youWon: "Congratulations!", nextRound: "Press ENTER for Next Round",
    winnerLabel: "WINNER"
  }
};

// ==========================================
// 3. 工具與基礎組件
// ==========================================

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

// --- Galaxy Canvas (Visuals: Tesla Big Text & All-Photo Particles) ---
const GalaxyCanvas = ({ list, t, onDrawEnd, disabled }) => {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const particles = useRef([]);
    const frameId = useRef(null);
    const mode = useRef('mosaic'); 

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return; // Allow empty list for init
        
        const ctx = canvas.getContext('2d');
        
        const resize = () => { 
            // 🔥 V98: 使用容器的寬高，確保填滿中間區域
            canvas.width = container.clientWidth; 
            canvas.height = container.clientHeight; 
            initParticles();
        };
        
        const initParticles = () => {
            const w = canvas.width;
            const h = canvas.height;
            // V95: Min particles for text shape
            const minParticles = 600; // Increased density
            const totalParticles = Math.max(list.length, minParticles);
            
            // 1. Generate TESLA Text Mask
            const offCanvas = document.createElement('canvas');
            offCanvas.width = w;
            offCanvas.height = h;
            const offCtx = offCanvas.getContext('2d');
            
            offCtx.fillStyle = '#000';
            offCtx.fillRect(0, 0, w, h);
            offCtx.fillStyle = '#fff';
            
            // 🔥 V98: Bigger Font
            const fontSize = Math.min(w * 0.4, h * 0.95); 
            offCtx.font = `900 ${fontSize}px sans-serif`; 
            offCtx.textAlign = 'center';
            offCtx.textBaseline = 'middle';
            offCtx.fillText("TESLA", w / 2, h / 2);
            
            const imgData = offCtx.getImageData(0,0,w,h).data;
            
            // 2. Smart Size Calculation
            let whitePixels = 0;
            const sampleStep = 4;
            for(let y=0; y<h; y+=sampleStep) {
                for(let x=0; x<w; x+=sampleStep) {
                     if(imgData[(y * w + x) * 4] > 100) whitePixels++;
                }
            }
            const totalWhiteArea = whitePixels * sampleStep * sampleStep;
            const areaPerPerson = totalWhiteArea / totalParticles;
            let particleSize = Math.floor(Math.sqrt(areaPerPerson));
            
            if(particleSize < 4) particleSize = 4; 
            // V98: Allow even bigger particles if few people
            if(particleSize > 150) particleSize = 150; 

            const step = particleSize;
            let validPoints = [];
            for(let y=step/2; y<h; y+=step) {
                for(let x=step/2; x<w; x+=step) {
                    const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
                    if(imgData[idx] > 100) validPoints.push({x: x - step/2, y: y - step/2});
                }
            }

            // Shuffle valid points
            for (let i = validPoints.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [validPoints[i], validPoints[j]] = [validPoints[j], validPoints[i]];
            }

            // 3. Assign Particles (Clone real guests to fill gaps)
            const particleArray = [];
            const countToGenerate = Math.max(validPoints.length, totalParticles);
            
            for(let i=0; i < countToGenerate; i++) {
                const pt = validPoints[i % validPoints.length] || {x: Math.random()*w, y: Math.random()*h};
                
                // 🔥 V103: Force photo for ALL particles (Shadow Clone)
                let p = null;
                let img = null;

                if (list.length > 0) {
                    // Cycle through real guests to reuse photos
                    const guestIndex = i % list.length;
                    p = list[guestIndex];
                    img = new Image();
                    img.src = p.photo && p.photo.startsWith('http') ? p.photo : `https://i.pravatar.cc/300?u=${p.id}`;
                } else {
                    p = { id: `dummy_${i}`, name: '?' };
                }

                particleArray.push({
                    id: p.id + `_${i}`, 
                    x: pt.x, 
                    y: pt.y,
                    targetX: pt.x, 
                    targetY: pt.y,
                    vx: 0, vy: 0,
                    size: step, 
                    img: img,
                    data: p,
                    angle: 0,
                    color: ['#E82127','#FFFFFF','#808080','#333333'][Math.floor(Math.random()*4)]
                });
            }
            particles.current = particleArray;
        };

        resize();
        window.addEventListener('resize', resize);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current.forEach(p => {
                if (mode.current === 'galaxy') {
                    p.x += p.vx; p.y += p.vy;
                    p.angle += 0.05;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                } else {
                    p.x += (p.targetX - p.x) * 0.1;
                    p.y += (p.targetY - p.y) * 0.1;
                    p.angle = 0;
                }
                
                ctx.save();
                // 🔥 V108: Huge particles during draw (80%)
                const currentSize = mode.current === 'galaxy' ? p.size * 0.8 : p.size; 
                
                if (mode.current === 'galaxy') {
                     ctx.translate(p.x + p.size/2, p.y + p.size/2);
                     ctx.rotate(p.angle);
                     ctx.beginPath(); 
                     ctx.arc(0, 0, currentSize/2, 0, Math.PI * 2); 
                     ctx.clip();
                     
                     if (p.img && p.img.complete && p.img.naturalWidth !== 0) {
                         ctx.drawImage(p.img, -currentSize/2, -currentSize/2, currentSize, currentSize);
                     } else {
                         ctx.fillStyle = p.color; 
                         ctx.fillRect(-currentSize/2, -currentSize/2, currentSize, currentSize); 
                     }
                } else {
                     // Mosaic
                     const gap = 0.5;
                     ctx.beginPath();
                     ctx.rect(p.x, p.y, p.size - gap, p.size - gap);
                     ctx.clip();
                     
                     if (p.img && p.img.complete && p.img.naturalWidth !== 0) {
                         ctx.drawImage(p.img, p.x, p.y, p.size - gap, p.size - gap);
                         ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                         ctx.lineWidth = 0.5;
                         ctx.strokeRect(p.x, p.y, p.size - gap, p.size - gap);
                     } else {
                         ctx.fillStyle = p.color; 
                         ctx.fillRect(p.x, p.y, p.size - gap, p.size - gap); 
                     }
                }
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
        particles.current.forEach(p => { 
            p.vx = (Math.random() - 0.5) * 50; 
            p.vy = (Math.random() - 0.5) * 50; 
        });
        SoundController.startSuspense();
        setTimeout(stop, 5000); 
    };

    const stop = () => {
        const winnerIdx = Math.floor(Math.random() * list.length);
        const winner = list[winnerIdx];
        setIsRunning(false);
        mode.current = 'mosaic';
        SoundController.playWin();
        setTimeout(() => onDrawEnd(winner), 500);
    };

    useEffect(() => {
        const handleKey = (e) => { 
            if (e.key === 'Enter' && !isRunning && !disabled) { 
                e.preventDefault(); 
                start(); 
            } 
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isRunning, list, disabled]);

    return (
        <div className="w-full h-full relative overflow-hidden">
            <canvas ref={canvasRef} className="block w-full h-full" />
            {isRunning && <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"><h1 className="text-9xl font-black text-white/10 drop-shadow-2xl animate-pulse uppercase tracking-widest bg-black/0 backdrop-blur-sm px-12 py-6 rounded-3xl">{t.running}</h1></div>}
        </div>
    );
};

// ==========================================
// 5. 頁面組件 (Views) - Defined before App
// ==========================================

const LoginView = ({ t, onLogin, onBack }) => {
    const [pwd, setPwd] = useState('');
    const inputRef = useRef(null);
    useEffect(() => { const timer = setTimeout(() => { if(inputRef.current) inputRef.current.focus(); }, 100); return () => clearTimeout(timer); }, []);
    const handleSubmit = (e) => { e.preventDefault(); if(pwd === ADMIN_PASSWORD) onLogin(); else { alert(t.wrongPwd); setPwd(''); } };
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
        <div className="relative bg-neutral-900/80 border border-white/20 p-10 rounded-3xl w-full max-w-sm backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500 z-50">
          <button onClick={onBack} className="text-white/50 hover:text-white mb-8 flex items-center transition-colors text-sm uppercase tracking-widest"><ChevronLeft size={16} className="mr-1"/> {t.back}</button>
          <div className="text-center mb-8"><h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.login}</h2></div>
          <form onSubmit={handleSubmit}><input ref={inputRef} type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={t.pwdPlace} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl mb-6 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-center tracking-[0.3em] placeholder:tracking-normal placeholder:text-white/20"/><button type="submit" className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-900/40 transition-all active:scale-95 uppercase tracking-widest text-sm">{t.enter}</button></form>
        </div>
      </div>
    );
};

const GuestView = ({ t, onBack, checkDuplicate, seatingPlan, attendees }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:'',phone:'',email:'',company:'',table:'',seat:''});
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [newId, setNewId] = useState(null);
  const [matchedSeat, setMatchSeat] = useState(null); 
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const startCamera = async () => { setErr(''); try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } }); setIsCameraOpen(true); setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(e => console.log("Play error:", e)); } }, 100); } catch (e) { fileInputRef.current.click(); } };
  const takePhoto = async () => { if(!videoRef.current) return; const canvas = document.createElement('canvas'); const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d'); const xOffset = (videoRef.current.videoWidth - size) / 2; const yOffset = (videoRef.current.videoHeight - size) / 2; ctx.drawImage(videoRef.current, xOffset, yOffset, size, size, 0, 0, size, size); const rawBase64 = canvas.toDataURL('image/jpeg'); const stream = videoRef.current.srcObject; if(stream) stream.getTracks().forEach(track => track.stop()); setIsCameraOpen(false); const compressed = await compressImage(rawBase64, false); setPhoto(compressed); };
  const handleFileChange = async (e) => { const file = e.target.files[0]; if(file) { const compressed = await compressImage(file, true); setPhoto(compressed); setErr(''); } };
  const handleSubmit = async (e) => { e.preventDefault(); setErr(''); if(!photo) { setErr(t.errPhoto); return; } setLoading(true); const cleanPhone = normalizePhone(form.phone); const cleanEmail = normalizeEmail(form.email); const dup = checkDuplicate(cleanPhone, cleanEmail); if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; } if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; } let assignedTable = ""; let assignedSeat = ""; const emailMatch = seatingPlan.find(s => normalizeEmail(s.email) === cleanEmail); const phoneMatch = seatingPlan.find(s => normalizePhone(s.phone) === cleanPhone); if(emailMatch) { assignedTable = emailMatch.table; assignedSeat = emailMatch.seat; } else if(phoneMatch) { assignedTable = phoneMatch.table; assignedSeat = phoneMatch.seat; } setMatchSeat({ table: assignedTable, seat: assignedSeat }); try { if (!db) throw new Error("Firebase not initialized"); const docRef = await addDoc(collection(db, "attendees"), { name: form.name, phone: cleanPhone, email: cleanEmail, company: form.company, table: assignedTable, seat: assignedSeat, photo: photo, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() }); setNewId(docRef.id); setStep(2); } catch (error) { console.error(error); setErr("Network Error."); } setLoading(false); };
  
  const handleSeatSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const isEmail = q.includes('@');
    const target = isEmail ? normalizeEmail(q) : normalizePhone(q);
    let found = attendees.find(a => isEmail ? normalizeEmail(a.email) === target : normalizePhone(a.phone) === target);
    let status = t.registered;
    if (!found) {
        found = seatingPlan.find(s => isEmail ? normalizeEmail(s.email) === target : normalizePhone(s.phone) === target);
        status = t.notRegistered;
    }
    if (found) { setSearchResult({ ...found, status }); setErr(""); } else { setSearchResult(null); setErr(t.notFound); }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
      <div className="relative bg-neutral-900/80 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-8 text-white text-center relative">
          {!isCameraOpen && <button onClick={onBack} className="absolute left-6 top-6 text-white/70 hover:text-white z-10"><ChevronLeft/></button>}
          <h2 className="text-2xl font-bold tracking-wide relative z-10">{t.regTitle}</h2>
          <p className="text-white/80 text-xs mt-2 uppercase tracking-widest relative z-10">{t.regSub}</p>
        </div>
        <div className="p-8">
            {isSearchMode ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <h3 className="text-xl font-bold text-center mb-4 text-yellow-500">{t.checkSeat}</h3>
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute top-3.5 left-4 text-white/30" size={18}/>
                            <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white p-3 pl-12 rounded-xl outline-none focus:border-yellow-500 transition-all placeholder:text-white/20" placeholder={t.inputHint} />
                        </div>
                        <button onClick={handleSeatSearch} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white p-3 rounded-xl font-bold shadow-lg transition-all">{t.searchList}</button>
                    </div>
                    {err && <div className="text-red-400 text-center text-sm bg-red-500/10 p-2 rounded-lg">{err}</div>}
                    {searchResult && (
                        <div className="mt-4 p-5 bg-white/10 rounded-2xl border border-yellow-500/50 text-center shadow-lg">
                            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                                <span className="text-sm text-yellow-500">{t.seatResult}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${searchResult.status === t.registered ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>{searchResult.status}</span>
                            </div>
                            <div className="text-2xl font-bold mb-2">{searchResult.name}</div>
                            <div className="text-sm text-white/60 mb-4">{searchResult.dept}</div>
                            {/* 🔥 V88 Fix: Uniform Font Size */}
                            <div className="text-3xl font-black text-white bg-white/10 p-3 rounded-xl inline-block border border-white/20">
                                Table {searchResult.table || '-'} / Seat {searchResult.seat || '-'}
                            </div>
                        </div>
                    )}
                    <button onClick={()=>{setIsSearchMode(false);setSearchResult(null);setSearchQuery("");setErr("")}} className="w-full text-white/50 hover:text-white text-sm mt-4 underline">{t.backToReg}</button>
                </div>
            ) : (
                <>
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
                            <button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-6 flex justify-center items-center disabled:opacity-70 uppercase tracking-wider text-sm">{loading ? <Loader2 className="animate-spin mr-2"/> : null}{t.generateBtn}</button>
                            <div className="pt-4 mt-4 border-t border-white/10 text-center">
                                <button type="button" onClick={()=>setIsSearchMode(true)} className="text-yellow-500 text-sm hover:text-yellow-400 flex items-center justify-center gap-1 mx-auto transition-colors"><Search size={14}/> {t.checkSeat}</button>
                            </div>
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
                </>
            )}
        </div>
      </div>
    </div>
  );
};

// 🔥 Projector View: Fixed Layout with Bottom Button (V112: Visual Balance)
const ProjectorView = ({ t, attendees, drawHistory, onBack, currentPrize, prizes }) => {
    const [winner, setWinner] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // V82: Use attendees but exclude winners
    const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h => h.attendeeId === p.id));
    const currentPrizeWinner = drawHistory.find(h => h.prize === currentPrize);
    
    // 🔥 V96: Trigger Draw (Supports Enter Key)
    const triggerDraw = () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' , code: 'Enter'}));
    };

    useEffect(() => {
        const handleKey = async (e) => { 
            if (winner && e.key === 'Enter' && !isSaving) {
                setIsSaving(true);
                // 1. Write Winner
                if (db) await addDoc(collection(db, "winners"), { 
                    attendeeId: winner.id, 
                    name: winner.name || "", 
                    phone: winner.phone || "", 
                    photo: winner.photo || "", 
                    table: winner.table || "", 
                    seat: winner.seat || "", 
                    prize: currentPrize || "Grand Prize", 
                    wonAt: new Date().toISOString() 
                });
                
                // 2. Auto Next Prize
                if (currentPrize && prizes.length > 0) {
                    const currentIdx = prizes.findIndex(p => p.name === currentPrize);
                    let nextPrize = prizes.find((p, idx) => idx > currentIdx && !drawHistory.some(h => h.prize === p.name));
                    if (!nextPrize) nextPrize = prizes.find(p => !drawHistory.some(h => h.prize === p.name));
                    if (nextPrize && db) {
                        await setDoc(doc(db, "config", "settings"), { currentPrize: nextPrize.name }, { merge: true });
                    }
                }

                // 3. Clear Winner (Back to Galaxy)
                setWinner(null);
                setIsSaving(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [winner, prizes, drawHistory, currentPrize, isSaving]);

    const handleDrawEnd = async (w) => {
        setWinner(w);
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden">
            
            {/* 1. Header (15%) - Fixed & Consistent Font Size */}
            <div className="flex-none h-[15vh] z-30 bg-neutral-900/90 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8 relative shadow-xl w-full">
                 <button onClick={onBack} className="text-white/30 hover:text-white transition-colors mr-6"><ChevronLeft size={32}/></button>
                 <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full">
                    {/* 🔥 V109: Dynamic Header Label */}
                    <span className="text-yellow-500 font-bold tracking-widest uppercase text-5xl whitespace-nowrap">
                        {winner ? t.winnerLabel : t.currentPrize}:
                    </span>
                    {/* 🔥 V106: Fixed text-6xl for consistency */}
                    <h1 className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] leading-tight text-center whitespace-nowrap pb-1">
                        {currentPrize || "WAITING..."}
                    </h1>
                 </div>
                 <div className="w-10"></div>
            </div>

            {/* 2. Canvas Area (Flex 1) - Maximize Space */}
            <div className="flex-1 w-full relative z-10 bg-black overflow-hidden flex items-center justify-center">
                {winner ? (
                     // 🔥 V112: Clean & Balanced Winner Display (Center of screen, no jump)
                    <div className="flex flex-col items-center justify-center h-full w-full relative z-50">
                        <div className="absolute inset-0 pointer-events-none"><Confetti/></div>

                        {/* Photo - Big but balanced */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full animate-pulse"></div>
                            {winner.photo ? <img src={winner.photo} className="relative w-96 h-96 rounded-full border-8 border-yellow-400 object-cover shadow-2xl"/> : <div className="w-96 h-96 rounded-full bg-neutral-800 flex items-center justify-center border-8 border-yellow-400 mb-8"><User size={150}/></div>}
                        </div>
                        
                        {/* 🔥 V112: Smaller Font for Name (6xl) */}
                        <h1 className="text-6xl font-black text-white mb-6 drop-shadow-lg tracking-wide">{winner.name}</h1>
                        
                        {/* 🔥 V112: Smaller Font for Seat (3xl) */}
                        <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-full text-3xl font-bold border border-white/20 flex items-center gap-6 text-yellow-100 shadow-xl">
                            <Armchair size={32}/> 
                            <span>Table {winner.table || '-'}</span>
                            <span className="w-1 h-8 bg-white/20"></span>
                            <span>Seat {winner.seat || '-'}</span>
                        </div>
                        
                        <p className="absolute bottom-4 text-white/30 text-sm animate-pulse">{t.nextRound}</p>
                    </div>
                ) : currentPrizeWinner ? (
                     <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 z-20">
                        <div className="text-2xl text-white/50 font-bold mb-4 uppercase tracking-[0.3em]">{t.drawn}</div>
                        <div className="relative mb-6">
                            {currentPrizeWinner.photo ? <img src={currentPrizeWinner.photo} className="w-64 h-64 rounded-full border-8 border-gray-600 grayscale hover:grayscale-0 transition-all object-cover"/> : <div className="w-64 h-64 rounded-full bg-neutral-800 flex items-center justify-center border-8 border-gray-700 mb-8"><User size={100}/></div>}
                        </div>
                        <h1 className="text-7xl font-black text-gray-400 mt-2">{currentPrizeWinner.name}</h1>
                        <div className="text-white/30 mt-4 text-xl">{t.winnerIs}</div>
                    </div>
                ) : eligible.length > 0 ? (
                    <GalaxyCanvas list={eligible} t={t} onDrawEnd={handleDrawEnd} disabled={!!winner} />
                ) : (
                    <div className="text-center text-white/30"><Trophy size={100} className="mb-6 opacity-20"/><p className="text-2xl">{t.needMore}</p></div>
                )}
            </div>
            
            {/* 3. Footer (15%) - Clean (V105) */}
            <div className="flex-none h-[15vh] z-30 bg-neutral-900/90 backdrop-blur-sm border-t border-white/10 flex flex-col items-center justify-center overflow-hidden w-full relative">
                
                {/* 🔥 V82: Button moved to Footer Center */}
                {eligible.length > 0 && !winner && !currentPrizeWinner && (
                    <div className="">
                        <button onClick={triggerDraw} className="bg-red-600 text-white px-10 py-3 rounded-full font-bold text-xl shadow-2xl border-4 border-black uppercase tracking-widest hover:scale-105 transition-transform animate-pulse flex items-center gap-2">
                            <Play size={24} fill="currentColor"/> {t.drawBtn}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Reception Dashboard, Prize Dashboard, App (Moved to bottom) ---
const ReceptionDashboard = ({ t, onLogout, attendees, setAttendees, seatingPlan, drawHistory }) => {
  const [tab, setTab] = useState('scan');
  const [isScan, setIsScan] = useState(false);
  const [scanRes, setScanRes] = useState(null);
  const [search, setSearch] = useState(""); 
  const [adminForm, setAdminForm] = useState({name:'',phone:'',email:'',dept:'',table:'',seat:''});
  const [seatForm, setSeatForm] = useState({name:'',phone:'',email:'',dept:'',table:'',seat:''});
  const lastTime = useRef(0);

  const filteredList = attendees.filter(p => {
      const s = search.toLowerCase();
      const prizeName = drawHistory.find(h=>h.attendeeId===p.id)?.prize || "";
      const dept = p.dept || "";
      return p.name.toLowerCase().includes(s) || p.phone.includes(s) || (p.email && p.email.toLowerCase().includes(s)) || dept.toLowerCase().includes(s) || prizeName.toLowerCase().includes(s);
  });

  const filteredSeat = seatingPlan.filter(s => {
      const q = search.toLowerCase();
      return (s.name||'').toLowerCase().includes(q) || (s.phone||'').includes(q) || (s.email||'').toLowerCase().includes(q) || (s.dept||'').toLowerCase().includes(q) || (s.table||'').includes(q) || (s.seat||'').toLowerCase().includes(q);
  });

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
        if(c.length>=5) {
            const ref = doc(collection(db, "seating_plan"));
            batch.set(ref, { name: c[0].trim(), phone: normalizePhone(c[1]), email: normalizeEmail(c[2]), dept: c[3]?.trim(), table: c[4]?.trim(), seat: c[5]?.trim()||'' });
        }
    });
    await batch.commit(); alert(t.importSuccess);
  };
  
  // 🔥 V83: Manual Add Guard
  const handleAddGuest = async (e) => {
      e.preventDefault();
      if(!adminForm.name) return;
      
      const cleanPhone = normalizePhone(adminForm.phone);
      const cleanEmail = normalizeEmail(adminForm.email);

      // Check Duplicates
      const phoneExists = attendees.some(a => normalizePhone(a.phone) === cleanPhone && cleanPhone !== '');
      const emailExists = attendees.some(a => normalizeEmail(a.email) === cleanEmail && cleanEmail !== '');

      if (phoneExists) { alert(t.errPhone); return; }
      if (emailExists) { alert(t.errEmail); return; }

      await addDoc(collection(db, "attendees"), { ...adminForm, phone: cleanPhone, email: cleanEmail, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() });
      setAdminForm({name:'',phone:'',email:'',dept:'',table:'',seat:''});
  };

  const handleAddSeating = async (e) => {
      e.preventDefault();
      if(!seatForm.table) return;
      if(db) await addDoc(collection(db, "seating_plan"), { 
          name: seatForm.name, 
          phone: normalizePhone(seatForm.phone), 
          email: normalizeEmail(seatForm.email), 
          dept: seatForm.dept, 
          table: seatForm.table, 
          seat: seatForm.seat 
      });
      setSeatForm({ name:'', phone:'', email: '', dept: '', table: '', seat: '' });
  };

  const handleDeleteSeating = async (id) => { if(confirm('Delete?') && db) await deleteDoc(doc(db, "seating_plan", id)); };
  const toggleCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: !person.checkedIn, checkInTime: !person.checkedIn ? new Date().toISOString() : null }); };
  const toggleCancelCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: false, checkInTime: null }); };
  const deletePerson = async (id) => { if(confirm('Delete?') && db) await deleteDoc(doc(db, "attendees", id)); };
  const downloadTemplate = () => { const content = "\uFEFFName,Phone,Email,Dept,Table,Seat\nElon Musk,0912345678,elon@tesla.com,Engineering,1,A"; const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "seating_template.csv"; link.click(); };

  // 🔥 V93: Smart Dummy Generator (Skip Duplicates)
  const handleGenerateDummy = async () => {
    if (!confirm("確定要生成 100 筆測試資料嗎？\n(系統會自動從現有編號接續生成)")) return;
    
    // 1. 找出目前最大的 Guest ID
    const existingIds = attendees
        .map(a => {
            const match = a.name.match(/^Guest (\d+)$/);
            return match ? parseInt(match[1]) : 0;
        });
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    
    const start = maxId + 1;
    const end = maxId + 100; // V98: 100

    const batch = writeBatch(db);
    for (let i = start; i <= end; i++) {
        // 使用 guest_{i} 作為 ID 確保唯一性
        const ref = doc(db, "attendees", `guest_${i}`);
        // Tesla Brand Colors: Red, Black, White, Grey
        const colors = ['e82127', '000000', 'ffffff', '808080'];
        const color = colors[i % 4];
        const bg = colors[(i+1) % 4];
        
        batch.set(ref, {
            name: `Guest ${i}`,
            phone: `9000${String(i).padStart(4, '0')}`,
            email: `guest${i}@test.com`,
            dept: `Dept ${String.fromCharCode(65 + (i % 5))}`, // A, B, C, D, E
            table: `${Math.ceil(i / 10)}`,
            seat: String.fromCharCode(65 + ((i - 1) % 10)), // A-J
            // V91: Tesla Brand Colors (Pravatar for realism)
            photo: `https://i.pravatar.cc/300?u=guest_${i}`,
            checkedIn: true, // Default Checked In for testing
            checkInTime: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
    }
    
    await batch.commit();
    alert(`已生成 Guest ${start} - Guest ${end}`);
  };

  // 🔥 V84: Bulk Clear Guests
  const handleClearAllGuests = async () => {
    if (!confirm(t.confirmClearGuests)) return;
    const batch = writeBatch(db);
    attendees.forEach(p => {
        const ref = doc(db, "attendees", p.id);
        batch.delete(ref);
    });
    await batch.commit();
    alert("已清空所有賓客！");
  };

  // 🔥 V98: Smart Dummy Seat Generator (Continuous & Sync with Guests)
  const handleGenerateDummySeating = async () => {
    if (!confirm("確定要生成 100 筆新的座位資料嗎？\n(系統會自動從現有編號接續生成)")) return;
    
    // 找出目前最大的 Seat User ID
    const existingIds = seatingPlan
        .map(s => {
            const match = s.name.match(/^Guest (\d+)$/);
            return match ? parseInt(match[1]) : 0;
        });
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    
    const start = maxId + 1;
    const end = maxId + 100;

    const batch = writeBatch(db);
    for (let i = start; i <= end; i++) {
        const ref = doc(collection(db, "seating_plan"));
        batch.set(ref, {
            name: `Guest ${i}`,
            phone: `9000${String(i).padStart(4, '0')}`,
            email: `guest${i}@test.com`, 
            dept: `Dept ${String.fromCharCode(65 + (i % 5))}`,
            table: `${Math.ceil(i / 10)}`,
            seat: String.fromCharCode(65 + ((i - 1) % 10))
        });
    }
    await batch.commit();
    alert(`已生成座位資料 Guest ${start} - Guest ${end}`);
  };

  // 🔥 V87: Bulk Clear Seating
  const handleClearSeating = async () => {
      if(!confirm(t.confirmClearSeats)) return;
      const batch = writeBatch(db);
      seatingPlan.forEach(s => batch.delete(doc(db, "seating_plan", s.id)));
      await batch.commit();
      alert("座位表已清空");
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-950 text-white flex flex-col">
       <header className="p-4 border-b border-white/10 flex justify-between items-center bg-neutral-900"><div className="font-bold text-lg flex gap-2"><QrCode/> Reception</div><button onClick={onLogout}><LogOut size={18}/></button></header>
       <main className="flex-1 p-4 flex flex-col items-center w-full max-w-7xl mx-auto">
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
                      <div className="mb-4 flex gap-2">
                          <div className="relative flex-1"><Search className="absolute top-2.5 left-3 text-white/30" size={16}/><input placeholder={t.searchList} value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none"/></div>
                          {/* 🔥 V83/V84: Data Tools */}
                          <button onClick={handleGenerateDummy} className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 px-3 py-2 rounded-lg text-xs hover:bg-yellow-600 hover:text-white transition-colors flex items-center gap-1"><Database size={14}/> {t.genDummy}</button>
                          {/* 🔥 V84: Clear Guests */}
                          <button onClick={handleClearAllGuests} className="bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-2 rounded-lg text-xs hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"><Trash2 size={14}/> {t.clearGuests}</button>
                      </div>
                      
                      <form onSubmit={handleAddGuest} className="flex gap-2 flex-wrap mb-4 bg-white/5 p-2 rounded-lg">
                          <div className="w-full text-xs text-white/40 mb-1">{t.addGuest}</div>
                          <input placeholder="Name" value={adminForm.name} onChange={e=>setAdminForm({...adminForm,name:e.target.value})} className="bg-white/10 rounded px-2 py-1 flex-1 text-xs outline-none min-w-[80px]"/>
                          <input placeholder="Phone" value={adminForm.phone} onChange={e=>setAdminForm({...adminForm,phone:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-24 text-xs outline-none"/>
                          <input placeholder="Email" value={adminForm.email} onChange={e=>setAdminForm({...adminForm,email:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-32 text-xs outline-none"/>
                          <input placeholder="Dept" value={adminForm.dept} onChange={e=>setAdminForm({...adminForm,dept:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-20 text-xs outline-none"/>
                          <input placeholder="T" value={adminForm.table} onChange={e=>setAdminForm({...adminForm,table:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-10 text-xs outline-none text-center"/>
                          <input placeholder="S" value={adminForm.seat} onChange={e=>setAdminForm({...adminForm,seat:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-10 text-xs outline-none text-center"/>
                          <button className="bg-green-600 px-3 py-1 rounded text-xs"><Plus size={14}/></button>
                      </form>
                      
                      <div className="flex justify-between text-xs text-white/50">
                          <span>Total: {attendees.length}</span>
                          <span className="text-emerald-400">Arrived: {attendees.filter(x=>x.checkedIn).length}</span>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white/5 rounded-b-xl p-2">
                      <table className="w-full text-left border-collapse">
                          <thead className="text-xs text-white/40 uppercase border-b border-white/10">
                              <tr>
                                  <th className="p-2">Name</th>
                                  <th className="p-2 hidden md:table-cell">Phone</th>
                                  <th className="p-2 hidden md:table-cell">Email</th>
                                  <th className="p-2 hidden md:table-cell">Dept</th>
                                  <th className="p-2">Table</th>
                                  <th className="p-2">Seat</th>
                                  {/* 🔥 V89: New Status Column */}
                                  <th className="p-2 text-center">{t.status}</th>
                                  <th className="p-2 text-right">Del</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {filteredList.map(p=>{
                                  const winnerRec = drawHistory.find(h=>h.attendeeId===p.id);
                                  return (
                                      <tr key={p.id} className="hover:bg-white/5 text-sm">
                                          <td className="p-2 font-bold flex items-center gap-2">{p.photo ? <img src={p.photo} className="w-6 h-6 rounded-full object-cover"/> : <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><User size={12}/></div>}{p.name}</td>
                                          <td className="p-2 text-xs text-white/60 hidden md:table-cell">{p.phone}</td>
                                          <td className="p-2 text-xs text-white/60 hidden md:table-cell">{p.email}</td>
                                          <td className="p-2 text-xs text-white/60 hidden md:table-cell">{p.dept}</td>
                                          <td className="p-2 font-mono text-blue-400">{p.table}</td>
                                          <td className="p-2 font-mono">{p.seat}</td>
                                          <td className="p-2 text-xs text-yellow-400 font-bold">{winnerRec ? winnerRec.prize : '-'}</td>
                                          <td className="p-2 text-center">{!p.checkedIn ? <button onClick={()=>toggleCheckIn(p)} className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 px-2 py-1 rounded text-[10px]">{t.checkin}</button> : <button onClick={()=>toggleCancelCheckIn(p)} className="bg-white/5 text-white/40 border border-white/10 px-2 py-1 rounded text-[10px]">{t.cancel}</button>}</td>
                                          <td className="p-2 text-right"><button onClick={()=>deletePerson(p.id)} className="p-1 text-white/30 hover:text-red-500"><Trash2 size={14}/></button></td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {tab==='seating' && (
              <div className="w-full flex-1 flex flex-col gap-4">
                  <div className="flex gap-2">
                      <input placeholder={t.searchSeat} value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 bg-white/10 rounded-lg px-3 py-2 outline-none text-sm"/>
                      <label className="bg-blue-600 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2"><Upload size={16}/> {t.importCSV}<input type="file" hidden accept=".csv" onChange={handleImportSeating}/></label>
                      <button onClick={downloadTemplate} className="bg-white/10 px-3 py-2 rounded-lg"><FileText size={16}/></button>
                      {/* 🔥 V85: Dummy Seating Button */}
                      <button onClick={handleGenerateDummySeating} className="bg-purple-600/20 text-purple-400 border border-purple-600/50 px-3 py-2 rounded-lg text-xs hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-1"><Database size={14}/> {t.genDummySeat}</button>
                      {/* 🔥 V87: Clear Seat */}
                      <button onClick={handleClearSeating} className="bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-2 rounded-lg text-xs hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"><Trash2 size={14}/></button>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg flex flex-wrap gap-2">
                      <div className="w-full text-xs text-white/40 mb-1">{t.addSeat}</div>
                      <input placeholder={t.name} value={seatForm.name} onChange={e=>setSeatForm({...seatForm,name:e.target.value})} className="bg-white/10 rounded px-2 py-1 flex-1 text-xs outline-none min-w-[80px]" />
                      <input placeholder={t.phone} value={seatForm.phone} onChange={e=>setSeatForm({...seatForm,phone:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-20 text-xs outline-none" />
                      <input placeholder={t.email} value={seatForm.email} onChange={e=>setSeatForm({...seatForm,email:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-24 text-xs outline-none" />
                      <input placeholder={t.dept} value={seatForm.dept} onChange={e=>setSeatForm({...seatForm,dept:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-16 text-xs outline-none" />
                      <input placeholder={t.table} value={seatForm.table} onChange={e=>setSeatForm({...seatForm,table:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-10 text-xs outline-none text-center" />
                      <input placeholder={t.seat} value={seatForm.seat} onChange={e=>setSeatForm({...seatForm,seat:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-10 text-xs outline-none text-center" />
                      <button onClick={handleAddSeating} className="bg-green-600 px-3 py-1 rounded text-xs"><Plus size={14}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white/5 rounded-xl p-2">
                      <table className="w-full text-left border-collapse">
                          <thead className="text-xs text-white/40 uppercase border-b border-white/10">
                              <tr>
                                  <th className="p-2">Name</th>
                                  <th className="p-2 hidden md:table-cell">Phone</th>
                                  <th className="p-2 hidden md:table-cell">Email</th>
                                  <th className="p-2 hidden md:table-cell">Dept</th>
                                  <th className="p-2">Table</th>
                                  <th className="p-2">Seat</th>
                                  {/* 🔥 V89: New Status Column */}
                                  <th className="p-2 text-center">{t.status}</th>
                                  <th className="p-2 text-right">Del</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {filteredSeat.map(s=>{
                                  // 🔥 V89: Find attendee status
                                  const match = attendees.find(a => 
                                      (s.phone && normalizePhone(a.phone) === normalizePhone(s.phone)) || 
                                      (s.email && normalizeEmail(a.email) === normalizeEmail(s.email))
                                  );
                                  const isCheckedIn = match?.checkedIn;
                                  
                                  return (
                                      <tr key={s.id} className="hover:bg-white/5 text-sm">
                                          <td className="p-2 font-bold">{s.name}</td>
                                          <td className="p-2 text-xs text-white/60 hidden md:table-cell">{s.phone}</td>
                                          <td className="p-2 text-xs text-white/60 hidden md:table-cell">{s.email}</td>
                                          <td className="p-2 text-xs text-white/60 hidden md:table-cell">{s.dept}</td>
                                          <td className="p-2 font-mono text-blue-400">{s.table}</td>
                                          <td className="p-2 font-mono">{s.seat}</td>
                                          {/* 🔥 V89: Status Indicator */}
                                          <td className="p-2 text-center">
                                              {isCheckedIn ? 
                                                  <span className="text-green-400 bg-green-400/20 px-2 py-1 rounded text-xs border border-green-400/50">已到場</span> : 
                                                  <span className="text-white/30 text-xs border border-white/10 px-2 py-1 rounded">未簽到</span>
                                              }
                                          </td>
                                          <td className="p-2 text-right"><button onClick={()=>handleDeleteSeating(s.id)} className="text-white/20 hover:text-red-500 ml-2"><Trash2 size={14}/></button></td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
       </main>
    </div>
  );
};

const PrizeDashboard = ({ t, onLogout, attendees, drawHistory, currentPrize, setCurrentPrize }) => {
  const [prizes, setPrizes] = useState([]); 
  const [newPrizeName, setNewPrizeName] = useState("");
  const [qty, setQty] = useState("1");
  const [prizeSearch, setPrizeSearch] = useState(""); 
  const fileInputRef = useRef(null);
  useEffect(() => { if (!db) return; const unsub = onSnapshot(query(collection(db, "prizes"), orderBy("createdAt", "asc")), (snapshot) => { setPrizes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }); return () => unsub(); }, []);
  const handleAddPrize = async (e) => { e.preventDefault(); if(newPrizeName && db) { const q = parseInt(qty) || 1; const batch = writeBatch(db); for(let i=1; i<=q; i++) { const newRef = doc(collection(db, "prizes")); batch.set(newRef, { name: q > 1 ? `${newPrizeName} #${i}` : newPrizeName, createdAt: new Date().toISOString() }); } await batch.commit(); setNewPrizeName(""); setQty("1"); } };
  const handleSelectPrize = async (prizeName) => { if(db) await setDoc(doc(db, "config", "settings"), { currentPrize: prizeName }, { merge: true }); };
  const handleDeletePrize = async (id) => { if(confirm('Delete prize?')) await deleteDoc(doc(db, "prizes", id)); };
  const toggleWinnerStatus = async (winnerRecord) => { if(confirm('Reset this prize? Winner will be removed.')) { await deleteDoc(doc(db, "winners", winnerRecord.id)); await setDoc(doc(db, "config", "settings"), { currentPrize: winnerRecord.prize }, { merge: true }); } };
  const handleResetAllWinners = async () => { if (confirm('確定要清空所有中獎紀錄嗎？此操作無法復原。\nAre you sure you want to clear ALL winners?')) { const batch = writeBatch(db); drawHistory.forEach(win => { batch.delete(doc(db, "winners", win.id)); }); batch.commit(); } };
  const handleImportPrizes = async (e) => { const file = e.target.files[0]; if(!file) return; const text = await file.text(); const lines = text.split(/\r\n|\n/).filter(l=>l); const batch = writeBatch(db); lines.forEach(l=>{ const newRef = doc(collection(db, "prizes")); batch.set(newRef, { name: l.trim(), createdAt: new Date().toISOString() }); }); await batch.commit(); alert("Imported!"); };
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
                <form onSubmit={handleAddPrize} className="flex gap-2 mb-4"><input value={newPrizeName} onChange={e=>setNewPrizeName(e.target.value)} placeholder={t.prizePlace} className="flex-[2] bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"/><input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} className="w-16 bg-black/50 border border-white/20 rounded-xl px-2 py-3 text-sm text-center text-white focus:border-red-500 outline-none"/><button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"><Plus size={20}/></button></form>
                <div className="flex gap-2 mb-4 relative"><Search className="absolute top-3 left-3 text-white/30" size={16}/><input value={prizeSearch} onChange={e=>setPrizeSearch(e.target.value)} placeholder="Search Prize..." className="w-full bg-black/30 border border-white/10 pl-10 pr-4 py-2 rounded-lg text-sm outline-none"/><label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-center cursor-pointer transition-colors flex items-center justify-center gap-1"><Upload size={12}/> CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportPrizes}/></label></div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scroll flex flex-col gap-2">
                    {filteredPrizes.map(p=>{ const winnerRecord = drawHistory.find(h => h.prize === p.name); return ( <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${currentPrize===p.name?'bg-red-600/20 border-red-600':'bg-white/5 border-white/10'} ${winnerRecord ? 'opacity-70 bg-black/40' : ''}`}> <div className="flex flex-col"><span className={`font-bold ${currentPrize===p.name?'text-white':'text-white/70'}`}>{p.name}</span>{winnerRecord && <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1 font-bold">🏆 {winnerRecord.name}</span>}</div><div className="flex gap-2">{currentPrize!==p.name && !winnerRecord && <button onClick={()=>handleSelectPrize(p.name)} className="px-3 py-1.5 bg-white/10 hover:bg-green-600 rounded-lg text-xs transition-colors">{t.select}</button>}{currentPrize===p.name && <span className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-bold">{t.active}</span>}{winnerRecord ? <button onClick={()=>toggleWinnerStatus(winnerRecord)} className="p-2 bg-white/10 hover:bg-yellow-600 rounded-lg transition-colors" title={t.resetWinner}><RotateCcw size={14}/></button> : <button onClick={()=>handleDeletePrize(p.id)} className="p-2 bg-white/10 hover:bg-red-600 rounded-lg transition-colors"><Trash2 size={14}/></button>}</div></div> ); })}
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
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2"><Trophy size={20} className="text-yellow-500"/> {t.winnersList}</h3>
                        {drawHistory.length > 0 && (<button onClick={() => { if (confirm('確定要清空所有中獎紀錄嗎？此操作無法復原。\nAre you sure you want to clear ALL winners?')) { const batch = writeBatch(db); drawHistory.forEach(win => { batch.delete(doc(db, "winners", win.id)); }); batch.commit(); } }} className="text-xs bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={12} className="inline mr-1"/> {t.clearAll}</button>)}
                    </div>
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
  const [lang, setLang] = useState('en'); const t = translations[lang];
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
  const checkDuplicate = (p, e) => { if(attendees.some(x => normalizePhone(x.phone) === normalizePhone(p))) return 'phone'; if(attendees.some(x => normalizeEmail(x.email) === normalizeEmail(e))) return 'email'; return null; };
  const handleLoginSuccess = (targetView) => setView(targetView);
  if(view === 'landing') return (
    <div className="min-h-[100dvh] bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      <StyleInjector/>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 pointer-events-none"></div>
      <button onClick={()=>setLang(l=>l==='zh'?'en':'zh')} className="absolute top-6 right-6 text-white/50 hover:text-white flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full transition-all z-10 text-xs font-mono"><Globe size={14}/> {lang.toUpperCase()}</button>
      <div className="z-10 text-center mb-16 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.4)] mb-8 animate-in zoom-in duration-700"><QrCode size={48} className="text-white"/></div>
        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{t.title}</h1>
        <p className="text-white/40 text-xl font-light tracking-[0.3em] uppercase">{t.sub}</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4 w-full max-w-7xl z-10 px-4">
        <button onClick={()=>setView('guest')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ImageIcon size={60} className="text-white"/></div><h3 className="text-xl font-bold text-white mb-1">{t.guestMode}</h3><p className="text-white/50 text-xs">{t.guestDesc}</p><div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-white w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div></button>
        <button onClick={()=>setView('login_admin')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><UserCheck size={60} className="text-white"/></div><h3 className="text-xl font-bold text-white mb-1">{t.adminMode}</h3><p className="text-white/50 text-xs">{t.adminDesc}</p><div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-red-600 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div></button>
        <button onClick={()=>setView('login_prize')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Gift size={60} className="text-white"/></div><h3 className="text-xl font-bold text-white mb-1">{t.prizeMode}</h3><p className="text-white/50 text-xs">{t.prizeDesc}</p><div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-indigo-600 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div></button>
        <button onClick={()=>setView('login_projector')} className="group relative overflow-hidden bg-gradient-to-br from-neutral-800 to-black hover:from-neutral-700 border border-white/20 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity"><MonitorPlay size={60} className="text-yellow-500"/></div><h3 className="text-xl font-bold text-yellow-500 mb-1">{t.projectorMode}</h3><p className="text-white/50 text-xs">{t.projectorDesc}</p><div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-yellow-500 w-fit px-4 py-2 rounded-full">{t.enter} <ArrowRight size={16} className="ml-2"/></div></button>
      </div>
    </div>
  );
  if(view === 'guest') return <><StyleInjector/><GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} seatingPlan={seatingPlan} attendees={attendees} /></>;
  if(view === 'login_admin') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('admin')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_prize') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('prize')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_projector') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('projector')} onBack={()=>setView('landing')} /></>;
  
  if(view === 'admin') return <><StyleInjector/><ReceptionDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} seatingPlan={seatingPlan} drawHistory={drawHistory} /></>;
  if(view === 'prize') return <><StyleInjector/><PrizeDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} setCurrentPrize={setCurrentPrize} prizes={prizes} /></>;
  if(view === 'projector') return <><StyleInjector/><ProjectorView t={t} onBack={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} prizes={prizes} /></>;
}