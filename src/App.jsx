import React, { useState, useEffect, useRef, useCallback } from 'react';
// 🔥 V260: THE "SAFE 8" FINAL FIX - Strictly restricted imports to 8 core icons.
// - Icons: User, Search, Plus, Camera, ChevronLeft, ChevronRight, X, Check.
// - All usage of other icons (Trophy, MapPin, FileText, Trash2, etc.) has been replaced in JSX.
// - Unchecked circles are now rendered with CSS borders to avoid needing 'Circle' icon.
// - This eliminates ANY possibility of "undefined component" errors.
// - Visuals: "TESLA" (no 2026) text and 320-guest logic preserved.
import { 
  User, Search, Plus, Camera, 
  ChevronLeft, ChevronRight, X, Check
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

const ADMIN_PASSWORD = "Tesla3500"; 

// --- Default Avatar (Base64 for stability) ---
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23555555' stroke='%23333333' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

// ==========================================
// 2. Gemini AI Service (Disabled for Stability)
// ==========================================
const GeminiService = {
  async generateText(prompt) { return ""; },
  async generateSpeech(text) { return null; }
};

// ==========================================
// 3. 翻譯與資料
// ==========================================

const translations = {
  zh: {
    title: "Tesla Annual Dinner", sub: "",
    guestMode: "參加者登記", adminMode: "接待處 (簽到)", prizeMode: "舞台控台", projectorMode: "大螢幕投影",
    login: "系統驗證", pwdPlace: "請輸入密碼", enter: "登入", wrongPwd: "密碼錯誤",
    regTitle: "賓客登記", regSub: "請輸入電話或 Email",
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
    table: "桌號", seat: "座號", addSeat: "新增/修改座位", searchSeat: "搜尋姓名/電話/桌號...",
    searchList: "搜尋姓名/電話/Email...", seatTBD: "待定 (請洽櫃台)", wonPrize: "獲獎紀錄",
    addGuest: "新增賓客", clearAll: "清空所有得獎者",
    drawn: "已抽出", winnerIs: "得主", noPhoto: "無照片",
    genDummy: "生成 320 筆測試資料", clearGuests: "清空所有賓客", confirmClearGuests: "確定要刪除所有賓客資料嗎？這將無法復原。",
    genDummySeat: "生成 320 筆測試座位", clearSeats: "清空座位表", confirmClearSeats: "確定要清空所有座位表嗎？",
    checkSeat: "查詢座位", inputHint: "輸入姓名、電話或 Email 查詢", backToReg: "返回登記",
    seatResult: "查詢結果", status: "狀態", notCheckedIn: "未簽到", registered: "已登記", notRegistered: "未登記",
    youWon: "恭喜獲得", nextRound: "已自動存檔・按 ENTER 繼續",
    winnerLabel: "得主", saveTicket: "下載入場憑證", screenshotHint: "請截圖保存此畫面作為入場憑證",
    pendingCheckin: "Pending Checkin", checkedInStatus: "Checked In", deleteSelected: "刪除選取", confirmSave: "確認儲存",
    uploadBtn: "上傳照片", photoBtn: "拍照",
    edit: "修改", update: "更新", cancelEdit: "取消",
    number: "#"
  },
  en: {
    title: "Tesla Annual Dinner", sub: "",
    guestMode: "Registration", adminMode: "Reception", prizeMode: "Stage Control", projectorMode: "Projector",
    login: "Security", pwdPlace: "Password", enter: "Login", wrongPwd: "Error",
    regTitle: "Register", regSub: "Enter Phone or Email",
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
    table: "Table", seat: "Seat", addSeat: "Add/Edit Seat", searchSeat: "Search Name/Phone/Email...",
    searchList: "Search Name/Phone/Email...", seatTBD: "TBD", wonPrize: "Prize",
    addGuest: "Add Guest", clearAll: "Clear All Winners",
    drawn: "Drawn", winnerIs: "Winner", noPhoto: "No Photo",
    genDummy: "Gen 320 Dummy", clearGuests: "Clear All Guests", confirmClearGuests: "Are you sure to delete ALL guests? This cannot be undone.",
    genDummySeat: "Gen 320 Dummy Seats", clearSeats: "Clear Seats", confirmClearSeats: "Delete ALL seating plan?",
    checkSeat: "Check Seat", inputHint: "Enter Name, Phone or Email", backToReg: "Back to Register",
    seatResult: "Result", status: "Status", notCheckedIn: "Not In", registered: "Registered", notRegistered: "Not Reg",
    youWon: "Congratulations!", nextRound: "AUTO SAVED • PRESS ENTER >>> NEXT",
    winnerLabel: "WINNER", saveTicket: "Download Ticket", screenshotHint: "Please screenshot this screen as your entry pass",
    pendingCheckin: "Pending Checkin", checkedInStatus: "Checked In", deleteSelected: "Delete Selected", confirmSave: "Confirm Save",
    uploadBtn: "Upload", photoBtn: "Take Photo",
    edit: "Edit", update: "Update", cancelEdit: "Cancel",
    number: "#"
  }
};

// ==========================================
// 4. 工具與基礎組件
// ==========================================

const normalizePhone = (p) => String(p || '').replace(/[^0-9]/g, '');
const normalizeEmail = (e) => String(e || '').trim().toLowerCase();
const compressImage = (source, isFile = true) => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // 🔥 V201: Increased MAX_WIDTH from 300 to 800 for clearer photos on large projector screens
            const MAX_WIDTH = 800; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // 🔥 V201: Increased quality to 0.7
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
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
    document.body.style.fontFamily = "'Universal Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    
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
    if(!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const p = Array.from({length:300}).map(()=>({x:Math.random()*c.width, y:Math.random()*c.height,c:['#E82127','#FFFFFF','#808080', '#FFD700'][Math.floor(Math.random()*4)],s:Math.random()*8+2,d:Math.random()*5}));
    let animId;
    const draw = () => { 
        ctx.clearRect(0,0,c.width,c.height); 
        p.forEach(i=>{i.y+=i.s;i.x+=Math.sin(i.d);if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}ctx.fillStyle=i.c;ctx.beginPath();ctx.arc(i.x,i.y,i.s/2,0,Math.PI*2);ctx.fill();}); 
        animId = requestAnimationFrame(draw); 
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
};

const SoundController = {
  ctx: null, oscList: [], bgm: null,
  playlist: ['/draw_music.m4a'], 
  init: function() { 
      const AC = window.AudioContext || window.webkitAudioContext; 
      if (AC) this.ctx = new AC(); 
  },
  startSuspense: function() {
      if (!this.ctx) this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
      this.stopAll();
      
      const track = this.playlist[Math.floor(Math.random() * this.playlist.length)];
      this.bgm = new Audio(track);
      this.bgm.loop = true;
      this.bgm.volume = 1.0;

      const playFallback = () => {
          console.warn("Music failed/blocked, playing tense synth fallback.");
          this.playTenseSynth();
      };

      this.bgm.onerror = playFallback;
      
      this.bgm.play().catch((e) => {
          console.log("Audio play blocked/failed:", e);
          playFallback();
      });
  },
  playTenseSynth: function() {
      if (!this.ctx) return;
      
      this.oscList.forEach(o => o.stop());
      this.oscList = [];

      let beatDuration = 0.15; 
      let nextTime = this.ctx.currentTime;
      
      const scheduleBeats = () => {
          if (this.oscList.length === 0 || this.oscList[0].stopped) return; 
          
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          
          osc.type = 'sine'; 
          osc.frequency.setValueAtTime(800 + Math.random() * 200, nextTime);
          
          osc.connect(g);
          g.connect(this.ctx.destination);
          
          g.gain.setValueAtTime(0.3, nextTime);
          g.gain.exponentialRampToValueAtTime(0.001, nextTime + 0.1);
          
          osc.start(nextTime);
          osc.stop(nextTime + 0.1);
          
          nextTime += beatDuration;
          beatDuration = Math.max(0.05, beatDuration * 0.95);
          
          setTimeout(scheduleBeats, beatDuration * 1000);
      };
      
      this.oscList.push({ stopped: false, stop: function(){ this.stopped = true; } });
      scheduleBeats();
  },
  stopAll: function() { 
      this.oscList.forEach(o => o.stop()); 
      this.oscList = []; 
      
      if (this.bgm) { 
          this.bgm.pause(); 
          this.bgm.currentTime = 0; 
          this.bgm = null; 
      }
  },
  playWin: function() {
      this.stopAll(); 
      if (!this.ctx) return; const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
          const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
          osc.type = 'triangle'; osc.frequency.value = freq; osc.connect(g); g.connect(this.ctx.destination);
          g.gain.setValueAtTime(0.5, t + i*0.08); g.gain.exponentialRampToValueAtTime(0.01, t + i*0.08 + 2.5);
          osc.start(t + i*0.08); osc.stop(t + i*0.08 + 2.5);
      });
  },
  playSuccess: function() {
      if (!this.ctx) this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(1000, this.ctx.currentTime); 
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(); g.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.1);
      osc.stop(this.ctx.currentTime + 0.1);
  },
  playError: function() {
      if (!this.ctx) this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const beep = (t) => {
          const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, t); 
          osc.connect(g); g.connect(this.ctx.destination);
          osc.start(t); g.gain.exponentialRampToValueAtTime(0.00001, t + 0.1);
          osc.stop(t + 0.1);
      };
      beep(now); beep(now + 0.15);
  }
};

// --- Galaxy Canvas (Visuals) ---
const GalaxyCanvas = ({ list, t, onDrawEnd, disabled }) => {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const particles = useRef([]);
    const frameId = useRef(null);
    const mode = useRef('mosaic'); 

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return; 
        
        const ctx = canvas.getContext('2d');
        
        const resize = () => { 
            if (container.clientWidth === 0 || container.clientHeight === 0) return;
            canvas.width = container.clientWidth; 
            canvas.height = container.clientHeight; 
            // 🔥 V209: Ensure fonts are ready before initializing to prevent wrong text measurements
            document.fonts.ready.then(() => {
                initParticles();
            });
        };
        
        const initParticles = () => {
            const w = canvas.width;
            const h = canvas.height;
            if (w === 0 || h === 0) return; 

            // 🔥 V234: Adjusted minParticles to 320 to match 320 guests exactly.
            const minParticles = 320; 
            const targetCount = list.length > 0 ? list.length : 100;
            const totalParticles = Math.max(targetCount, minParticles);
            
            const offCanvas = document.createElement('canvas');
            offCanvas.width = w;
            offCanvas.height = h;
            const offCtx = offCanvas.getContext('2d');
            
            offCtx.fillStyle = '#000';
            offCtx.fillRect(0, 0, w, h);
            offCtx.fillStyle = '#fff';
            
            // 🔥 V214: MAXIMUM HEIGHT ADJUSTMENT (1.5x)
            const forcedFontSize = h * 1.5; 
            
            // Set Font: Use the heaviest condensed font available
            offCtx.font = `900 ${forcedFontSize}px 'Impact', 'Arial Black', 'Arial', sans-serif`;
            
            // Measure Width
            // 🔥 V247: Changed text from "TESLA 2026" to "TESLA" only.
            const textMetrics = offCtx.measureText("TESLA");
            const textRealWidth = textMetrics.width;
            
            // Force Width Stretch
            const targetWidth = w * 0.95;
            const scaleX = targetWidth / textRealWidth;
            
            // Draw Text with Transformation
            offCtx.save();
            offCtx.translate(w / 2, h / 2); // Move to center
            offCtx.scale(scaleX, 1);        
            offCtx.textAlign = 'center';
            offCtx.textBaseline = 'middle'; 
            // 🔥 V247: Changed text from "TESLA 2026" to "TESLA" only.
            offCtx.fillText("TESLA", 0, h * 0.1); 
            offCtx.restore();
            
            const imgData = offCtx.getImageData(0,0,w,h).data;
            
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
            if(particleSize > 100) particleSize = 100; 

            const step = particleSize;
            let validPoints = [];
            const halfStep = Math.floor(step/2);
            for(let y=halfStep; y<h; y+=step) {
                for(let x=halfStep; x<w; x+=step) {
                    const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
                    if(imgData[idx] > 100) validPoints.push({x: x - halfStep, y: y - halfStep});
                }
            }

            for (let i = validPoints.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [validPoints[i], validPoints[j]] = [validPoints[j], validPoints[i]];
            }

            const particleArray = [];
            const countToGenerate = Math.max(validPoints.length, totalParticles);
            
            for(let i=0; i < countToGenerate; i++) {
                const pt = validPoints[i % validPoints.length] || {x: Math.random()*w, y: Math.random()*h};
                
                let p = null;
                let img = null;
                let isReal = false;

                if (list.length > 0) {
                    const guestIndex = i % list.length;
                    p = list[guestIndex];
                    isReal = true;
                    // 🔥 V203: Relaxed length check
                    const photoSrc = p.photo;
                    img = new window.Image();
                    if (photoSrc && (photoSrc.length > 20 || photoSrc.startsWith('http'))) { 
                        img.src = photoSrc;
                    } else {
                        img.src = DEFAULT_AVATAR;
                    }
                } else {
                    p = { id: `dummy_${i}`, name: '?' };
                    isReal = false;
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
                    color: ['#E82127','#FFFFFF','#808080','#333333'][i%4]
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
                      const gap = 0;
                      ctx.beginPath();
                      ctx.rect(p.x, p.y, p.size - gap, p.size - gap);
                      ctx.clip();
                      
                      if (p.img && p.img.complete && p.img.naturalWidth !== 0) {
                          ctx.drawImage(p.img, p.x, p.y, p.size - gap, p.size - gap);
                          ctx.strokeStyle = 'rgba(255,255,255,0.1)'; 
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
// 5. 頁面組件 (Views)
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
  const [guestInfo, setGuestInfo] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const ticketRef = useRef(null); 
  
  const [isQrLibReady, setIsQrLibReady] = useState(false);
  const qrContainerRef = useRef(null);
  const qrCheckRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector('#qrcode-lib')) {
      const script = document.createElement('script');
      script.id = 'qrcode-lib';
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => setIsQrLibReady(true);
      document.body.appendChild(script);
    } else {
        setIsQrLibReady(true);
    }
  }, []);

  useEffect(() => {
    if (isQrLibReady && newId && qrContainerRef.current) {
        qrContainerRef.current.innerHTML = "";
        try {
            new window.QRCode(qrContainerRef.current, { text: JSON.stringify({id: newId}), width: 192, height: 192, colorDark : "#000000", colorLight : "#ffffff", correctLevel : window.QRCode.CorrectLevel.H });
        } catch (e) { console.error("QR Gen Error", e); }
    }
  }, [isQrLibReady, newId]);

    useEffect(() => {
        if (isQrLibReady && searchResult && searchResult.isAttendee && qrCheckRef.current) {
            qrCheckRef.current.innerHTML = "";
            try {
                new window.QRCode(qrCheckRef.current, { text: JSON.stringify({id: searchResult.id}), width: 128, height: 128, colorDark : "#000000", colorLight : "#ffffff", correctLevel : window.QRCode.CorrectLevel.H });
            } catch (e) { console.error("QR Gen Error", e); }
        }
    }, [isQrLibReady, searchResult]);

  const handleDownloadTicket = async () => {
    // 🔥 V143: Removed Download Logic - Just screenshot
  };

  const startCamera = async () => { setErr(''); try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } }); setIsCameraOpen(true); setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(e => console.log("Play error:", e)); } }, 100); } catch (e) { fileInputRef.current.click(); } };
  const takePhoto = async () => { if(!videoRef.current) return; const canvas = document.createElement('canvas'); const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d'); const xOffset = (videoRef.current.videoWidth - size) / 2; const yOffset = (videoRef.current.videoHeight - size) / 2; ctx.drawImage(videoRef.current, xOffset, yOffset, size, size, 0, 0, size, size); const rawBase64 = canvas.toDataURL('image/jpeg'); const stream = videoRef.current.srcObject; if(stream) stream.getTracks().forEach(track => track.stop()); setIsCameraOpen(false); const compressed = await compressImage(rawBase64, false); setPhoto(compressed); };
  const handleFileChange = async (e) => { const file = e.target.files[0]; if(file) { const compressed = await compressImage(file, true); setPhoto(compressed); setErr(''); } };
  
  const handleSubmit = async (e) => { 
      e.preventDefault(); setErr(''); if(!photo) { setErr(t.errPhoto); return; } 
      setLoading(true); const cleanPhone = normalizePhone(form.phone); const cleanEmail = normalizeEmail(form.email); 
      const dup = checkDuplicate(cleanPhone, cleanEmail); 
      if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; } if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; } 
      let assignedTable = ""; let assignedSeat = ""; let autoName = "VIP Guest"; let autoDept = "-"; 
      
      const emailMatch = seatingPlan.find(s => normalizeEmail(s.email) === cleanEmail); 
      const phoneMatch = seatingPlan.find(s => normalizePhone(s.phone) === cleanPhone); 
      const match = emailMatch || phoneMatch;

      if (match) { 
          assignedTable = match.table; 
          assignedSeat = match.seat; 
          autoName = match.name; 
          autoDept = match.dept; 
      } 
      
      setMatchSeat({ table: assignedTable, seat: assignedSeat }); 
      const finalGuestData = { name: autoName, phone: cleanPhone, email: cleanEmail, company: form.company || "", dept: autoDept, table: assignedTable, seat: assignedSeat, photo: photo, checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() };
      setGuestInfo(finalGuestData); 
      try { if (!db) throw new Error("Firebase not initialized"); const docRef = await addDoc(collection(db, "attendees"), finalGuestData); setNewId(docRef.id); setStep(2); } catch (error) { console.error(error); setErr("Network Error."); } setLoading(false); 
  };
  
  const handleBack = () => {
      if (isSearchMode) {
          setIsSearchMode(false);
          setSearchResult(null);
          setSearchQuery("");
          setErr("");
      } else if (step === 2) {
          setStep(1); 
          setForm({name:'',phone:'',email:'',company:'',table:'',seat:''});
          setPhoto(null);
      } else {
          onBack(); 
      }
  };

  const handleSeatSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    
    const lowerQ = q.toLowerCase();
    const cleanPhone = normalizePhone(q);
    const isEmailInput = q.includes('@');

    // Logic: Matches if Name includes query OR Email matches OR Phone matches
    const isMatch = (item) => {
        if (!item) return false;
        // 1. Name check (partial, case-insensitive)
        const nameMatch = (item.name || '').toLowerCase().includes(lowerQ);
        // 2. Email check (exact match)
        const emailMatch = isEmailInput && normalizeEmail(item.email) === normalizeEmail(q);
        // 3. Phone check (exact, only if input looks like a phone with sufficient digits)
        const phoneMatch = cleanPhone.length > 3 && normalizePhone(item.phone) === cleanPhone;
        
        return nameMatch || emailMatch || phoneMatch;
    };

    let found = attendees.find(isMatch);
    let isAttendee = true; 
    let status = t.registered;
    
    const seatingMatch = seatingPlan.find(isMatch);
    
    if (!found) {
        found = seatingMatch;
        status = t.notRegistered;
        isAttendee = false;
    } else if (seatingMatch) {
         // Merge info if found in both
         found = { ...found, table: seatingMatch.table, seat: seatingMatch.seat, dept: seatingMatch.dept, name: seatingMatch.name };
    }

    if (found) { setSearchResult({ ...found, status, isAttendee }); setErr(""); } else { setSearchResult(null); setErr(t.notFound); }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white">
      <div className="relative bg-neutral-900/80 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 md:p-8 text-white text-center relative">
          {!isCameraOpen && <button onClick={handleBack} className="absolute left-6 top-6 text-white/70 hover:text-white z-50 p-2 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft size={28}/></button>}
          <h2 className="text-3xl font-bold tracking-wide relative z-10">{t.regTitle}</h2>
          {step === 1 && <p className="text-white/80 text-sm mt-2 uppercase tracking-widest relative z-10">{t.regSub}</p>}
        </div>
        <div className="p-6 md:p-8">
            {isSearchMode ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <h3 className="text-2xl font-bold text-center mb-4 text-yellow-500">{t.checkSeat}</h3>
                    <div className="space-y-4">
                        <div className="relative"><Search className="absolute top-4 left-4 text-white/30" size={20}/><input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full bg-white/10 border border-white/10 text-white p-4 pl-12 rounded-xl outline-none focus:border-yellow-500 transition-all placeholder:text-white/20 text-base" placeholder={t.inputHint} /></div>
                        <button onClick={handleSeatSearch} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all text-lg">{t.searchList}</button>
                    </div>
                    {err && <div className="text-red-400 text-center text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{err}</div>}
                    {searchResult && (
                        <div className="mt-6 p-6 bg-white/10 rounded-2xl border border-yellow-500/50 text-center shadow-xl">
                            {/* 🔥 V192: Added Check-in Status to Search Result */}
                            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-2">
                                <span className="text-sm text-yellow-500 font-bold uppercase tracking-wider mt-1">{t.seatResult}</span>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${searchResult.status === t.registered ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>{searchResult.status}</span>
                                    {searchResult.isAttendee && (
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${searchResult.checkedIn ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {searchResult.checkedIn ? t.arrived : t.notCheckedIn}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {searchResult.isAttendee && (<div className="bg-white p-2 rounded-xl inline-block mb-6 shadow-lg"><div ref={qrCheckRef} className="w-32 h-32 flex items-center justify-center bg-white"></div></div>)}
                            <div className="text-3xl font-bold mb-2 text-white">{searchResult.name}</div>
                            <div className="text-base text-white/60 mb-6">{searchResult.dept}</div>
                            <div className="text-4xl font-black text-white bg-white/10 p-4 rounded-xl inline-block border border-white/20 shadow-inner">Table {searchResult.table || '-'}</div>
                        </div>
                    )}
                    <button onClick={()=>{setIsSearchMode(false);setSearchResult(null);setSearchQuery("");setErr("")}} className="w-full text-white/50 hover:text-white text-base mt-6 underline">{t.backToReg}</button>
                </div>
            ) : (
                <>
                  {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {err && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center animate-pulse"><X size={20} className="mr-3"/>{err}</div>}
                      <div className="flex flex-col items-center mb-6">
                          {isCameraOpen ? (
                              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black border-4 border-red-500 shadow-2xl"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" /><button type="button" onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:scale-110 transition-transform shadow-xl"><Camera className="w-full h-full p-4 text-black"/></button></div>
                          ) : (
                              <div className="flex flex-col items-center gap-4 w-full"><div onClick={startCamera} className={`w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden relative shadow-2xl cursor-pointer hover:bg-white/5 transition-colors ${photo ? 'border-red-500' : 'border-white/30'}`}>{photo ? <img src={photo} alt="Selfie" className="w-full h-full object-cover" /> : <Camera size={64} className="text-white/20"/>}</div><div className="flex gap-3"><button type="button" onClick={startCamera} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg"><Camera size={18}/> {t.photoBtn || "Take Photo"}</button><button type="button" onClick={()=>fileInputRef.current.click()} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg"><Plus size={18}/> {t.uploadBtn || "Upload"}</button></div></div>
                          )}
                          <input type="file" accept="image/*" capture="user" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>
                      </div>
                      {!isCameraOpen && (
                          <div className="space-y-4">
                            {['phone', 'email'].map((field) => (<div key={field} className="relative group"><div className="absolute top-4 left-4 text-white/30 group-focus-within:text-red-500 transition-colors">{field === 'phone' ? <User size={20}/> : <Search size={20}/>}</div><input required type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} className="w-full bg-white/5 border border-white/10 text-white p-4 pl-12 rounded-xl outline-none focus:border-red-500 focus:bg-white/10 transition-all placeholder:text-white/20 text-base" placeholder={t[field]} value={form[field]} onChange={e=>{setErr('');setForm({...form,[field]:e.target.value})}} /></div>))}
                            <button disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 p-5 rounded-xl font-bold shadow-xl transition-all active:scale-95 mt-4 flex justify-center items-center disabled:opacity-70 uppercase tracking-wider text-lg">{loading ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></div> : null}{t.generateBtn}</button>
                            <div className="pt-6 mt-6 border-t border-white/10 text-center"><button type="button" onClick={()=>setIsSearchMode(true)} className="text-yellow-500 text-base hover:text-yellow-400 flex items-center justify-center gap-2 mx-auto transition-colors font-bold"><Search size={18}/> {t.checkSeat}</button></div>
                          </div>
                      )}
                    </form>
                  ) : (
                    <div className="text-center animate-in zoom-in duration-300 w-full max-w-sm mx-auto flex flex-col justify-center">
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-center animate-pulse">
                          <p className="font-bold text-xs md:text-sm flex items-center justify-center gap-2"><Camera size={16}/> {t.screenshotHint}</p>
                      </div>

                      <div ref={ticketRef} className="bg-neutral-900 p-5 rounded-3xl border-2 border-yellow-500/50 shadow-2xl relative overflow-hidden w-full">
                           <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl"></div>
                           <h3 className="text-lg font-bold text-yellow-500 text-center mb-3 tracking-widest uppercase border-b border-white/10 pb-3">Tesla Annual Dinner</h3>
                           <div className="bg-white p-2 rounded-xl inline-block mb-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                <div ref={qrContainerRef} className="w-40 h-40 flex items-center justify-center bg-white"></div>
                           </div>
                           <div className="text-yellow-400 text-2xl font-black mb-3 flex justify-center items-center gap-2">
                                <Search size={24}/> <span>Table {matchedSeat?.table || '-'}</span>
                           </div>
                           <div className="text-left text-sm text-white/70 space-y-2 border-t border-white/10 pt-3">
                               <div className="flex justify-between items-center"><span className="text-white/40 text-xs">{t.name}:</span><span className="font-bold text-white text-sm">{guestInfo?.name}</span></div>
                               <div className="flex justify-between items-center"><span className="text-white/40 text-xs">{t.dept}:</span><span className="font-bold text-white text-sm">{guestInfo?.dept}</span></div>
                               <div className="flex justify-between items-center"><span className="text-white/40 text-xs">{t.phone}:</span><span className="font-mono text-white text-sm">{guestInfo?.phone}</span></div>
                           </div>
                      </div>
                      
                      <button onClick={()=>{setStep(1);setForm({name:'',phone:'',email:'',company:''});setPhoto(null)}} className="w-full bg-white/10 text-white border border-white/20 p-3 rounded-xl font-bold hover:bg-white/20 transition-colors uppercase tracking-widest text-sm mt-3">{t.next}</button>
                    </div>
                  )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

// 🔥 ProjectorView: Fixed Layout with Bottom Button (V127: Responsive Header)
const ProjectorView = ({ t, attendees, drawHistory, onBack, currentPrize, prizes, seatingPlan }) => { 
    const [winner, setWinner] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // 🔥 V155: Enhanced Attendee Data (Force Sync from Seating Plan)
    const enrichedAttendees = attendees.map(a => {
        // Always try to find match in seatingPlan to get latest data
        const match = seatingPlan.find(s => 
            (s.email && normalizeEmail(s.email) === normalizeEmail(a.email)) || 
            (s.phone && normalizePhone(s.phone) === normalizePhone(a.phone))
        );
        
        if (match) {
            // Overwrite table/seat/dept with seating plan data
            return { ...a, table: match.table, seat: match.seat, dept: match.dept || a.dept, name: match.name || a.name }; 
        }
        return a;
    });

    // 🔥 V202: Strict Eligibility Check
    // 1. Registration: Guaranteed as we are iterating over 'attendees' (Firestore collection)
    // 2. Check-in: Must strictly be true (p.checkedIn === true) to show photo and draw
    // 3. Not a Winner: Must not be in drawHistory
    const eligible = enrichedAttendees.filter(p => p.checkedIn === true && !drawHistory.some(h => h.attendeeId === p.id));
    
    let currentPrizeWinner = drawHistory.find(h => h.prize === currentPrize);
    
    const triggerDraw = () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' , code: 'Enter'})); };

    // 🔥 V170: Auto-Save logic
    const saveWinnerToDb = async (w) => {
        if (!w || isSaving) return;
        setIsSaving(true);
        if (db) await addDoc(collection(db, "winners"), { 
            attendeeId: w.id, 
            name: w.name || "", 
            phone: w.phone || "", 
            photo: w.photo || "", 
            table: w.table || "", 
            seat: w.seat || "", 
            dept: w.dept || "", 
            prize: currentPrize || "Grand Prize", 
            wonAt: new Date().toISOString() 
        });
        
        // 🔥 V261: Removed auto-advance logic from here. 
        // Prize now only updates when user explicitly moves to next round (ENTER).
        setIsSaving(false);
    };

    // 🔥 V261: New function to handle prize advancement
    const advancePrize = async () => {
         if (currentPrize && prizes.length > 0) {
            const currentIdx = prizes.findIndex(p => p.name === currentPrize);
            // Find next prize that is NOT in drawHistory and NOT the current prize (just in case history is stale)
            let nextPrize = prizes.find((p, idx) => idx > currentIdx && !drawHistory.some(h => h.prize === p.name) && p.name !== currentPrize);
            if (!nextPrize) nextPrize = prizes.find(p => !drawHistory.some(h => h.prize === p.name) && p.name !== currentPrize);
            
            if (nextPrize && db) {
                await setDoc(doc(db, "config", "settings"), { currentPrize: nextPrize.name }, { merge: true });
            }
        }
    };

    useEffect(() => {
        const handleKey = async (e) => { 
            if (winner && e.key === 'Enter') {
                // 🔥 V261: Advance prize BEFORE closing the view
                await advancePrize();
                setWinner(null);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [winner, currentPrize, prizes, drawHistory]); // 🔥 V261: Added dependencies for stable closure

    // 🔥 V170: Auto-save on draw end
    const handleDrawEnd = async (w) => { 
        setWinner(w);
        saveWinnerToDb(w);
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden">
            {/* 🔥 V196: Header Height Restored to 15vh (Bigger) */}
            <div className="flex-none h-[15vh] z-30 bg-neutral-900/90 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 md:px-8 relative shadow-xl w-full">
                 <button onClick={onBack} className="text-white/30 hover:text-white transition-colors mr-4 md:mr-6 flex items-center justify-center"><ChevronLeft size={32}/></button>
                 <div className="flex-1 flex flex-row items-center justify-center gap-2 md:gap-6 w-full overflow-hidden">
                    <span className="text-yellow-500 font-bold tracking-widest uppercase text-xl md:text-3xl lg:text-4xl whitespace-nowrap flex-shrink-0">{winner ? t.winnerLabel : t.currentPrize}:</span>
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] leading-tight text-left whitespace-normal break-words pb-1">{currentPrize || "WAITING..."}</h1>
                 </div>
                 <div className="w-14"></div>
            </div>
            <div className="flex-1 w-full relative z-10 bg-black overflow-hidden flex items-center justify-center">
                {winner ? (
                    <div className="flex flex-col items-center justify-center h-full w-full relative z-50">
                        <div className="absolute inset-0 pointer-events-none"><Confetti/></div>
                        <div className="relative mb-0">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full animate-pulse"></div>
                            {/* 🔥 V197: Winner Photo Enlarged to 72vh with z-index for layering */}
                            <img 
                                src={winner.photo && (winner.photo.length > 20 || winner.photo.startsWith('http')) ? winner.photo : DEFAULT_AVATAR} 
                                className="relative w-[72vh] h-[72vh] rounded-full border-8 border-yellow-400 object-cover shadow-2xl bg-neutral-800 z-10"
                            />
                        </div>
                        {/* 🔥 V197: Text container pulled up (-mt-12) to overlap image bottom */}
                        <div className="flex flex-col items-center gap-2 mb-2 relative z-20 -mt-12">
                            <div className="flex flex-row items-center justify-center gap-5 bg-black/60 backdrop-blur-md px-8 py-2 rounded-full border border-white/20 shadow-2xl">
                                <div className="flex flex-col items-center md:items-end">
                                    <h1 className="text-3xl font-black text-white tracking-wide leading-none">{winner.name}</h1>
                                    {winner.dept && <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider mt-1">{winner.dept}</span>}
                                </div>
                                <div className="w-0.5 h-10 bg-white/20 rounded-full"></div>
                                {/* 🔥 V178: Fix undefined Armchair -> MapPin */}
                                <div className="flex items-center gap-2 text-xl font-bold text-yellow-400"><Search size={24} className="text-white/60"/> <span>Table {winner.table || '-'}</span></div>
                            </div>
                            <div className="text-white/60 font-mono text-sm tracking-[0.2em] bg-black/80 px-5 py-0.5 rounded-full border border-white/10 shadow-lg">{winner.phone}</div>
                        </div>
                        {/* 🔥 V170: Auto-save indication text */}
                        <div className="mt-2 flex gap-4 items-center animate-in fade-in zoom-in duration-300">
                             <p className="text-white/30 text-sm font-mono animate-pulse uppercase tracking-[0.2em]">{t.nextRound}</p>
                        </div>
                    </div>
                ) : currentPrizeWinner ? (
                     <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 z-20">
                        <div className="text-2xl text-white/50 font-bold mb-0 uppercase tracking-[0.3em] relative z-20 top-4 bg-black/30 px-4 rounded-full backdrop-blur-sm">{t.drawn}</div>
                        <div className="relative mb-0">
                            {/* 🔥 V197: Drawn Photo Enlarged to 68vh */}
                            <img 
                                src={currentPrizeWinner.photo && (currentPrizeWinner.photo.length > 20 || currentPrizeWinner.photo.startsWith('http')) ? currentPrizeWinner.photo : DEFAULT_AVATAR} 
                                className="w-[68vh] h-[68vh] rounded-full border-8 border-gray-600 grayscale hover:grayscale-0 transition-all object-cover bg-neutral-800 z-10 relative"
                            />
                        </div>
                        {/* 🔥 V197: Name pulled up (-mt-10) */}
                        <h1 className="text-7xl font-black text-white mt-0 relative z-20 -mt-10 drop-shadow-2xl">{currentPrizeWinner.name}</h1>
                        <div className="text-white/30 mt-2 text-xl font-bold">{t.winnerIs}</div>
                    </div>
                ) : eligible.length > 0 ? (
                    <GalaxyCanvas list={eligible} t={t} onDrawEnd={handleDrawEnd} disabled={!!winner} />
                ) : (
                    <div className="text-center text-white/30"><User size={100} className="mb-6 opacity-20"/><p className="text-2xl">{t.needMore}</p></div>
                )}
            </div>
            {/* 🔥 V195: Footer Height Reduced to 10vh (Kept as requested) */}
            <div className="flex-none h-[10vh] z-30 bg-neutral-900/90 backdrop-blur-sm border-t border-white/10 flex flex-col items-center justify-center overflow-hidden w-full relative">
                {eligible.length > 0 && !winner && !currentPrizeWinner && (
                    <div className="">
                        {/* 🔥 V178: Fix undefined MonitorPlay -> Tv -> Monitor (V188) */}
                        <button onClick={triggerDraw} className="bg-red-600 text-white px-10 py-3 rounded-full font-bold text-xl shadow-2xl border-4 border-black uppercase tracking-widest hover:scale-105 transition-transform animate-pulse flex items-center gap-2"><Camera size={24} fill="currentColor"/> {t.drawBtn}</button>
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
  const [selectedGuestIds, setSelectedGuestIds] = useState(new Set());
  const [selectedSeatIds, setSelectedSeatIds] = useState(new Set());
  const lastTime = useRef(0);
  // 🔥 V256: Added state for seat editing
  const [editingSeatId, setEditingSeatId] = useState(null);

  const filteredList = attendees.filter(p => {
      const s = search.toLowerCase();
      const prizeName = drawHistory.find(h=>h.attendeeId===p.id)?.prize || "";
      const dept = p.dept || "";
      return String(p.name||'').toLowerCase().includes(s) || String(p.phone||'').includes(s) || String(p.email||'').toLowerCase().includes(s) || String(dept||'').toLowerCase().includes(s) || String(prizeName||'').toLowerCase().includes(s);
  });

  const filteredSeat = seatingPlan.filter(s => {
      const q = search.toLowerCase();
      return String(s.name||'').toLowerCase().includes(q) || String(s.phone||'').includes(q) || String(s.email||'').toLowerCase().includes(q) || String(s.dept||'').toLowerCase().includes(q) || String(s.table||'').includes(q) || String(s.seat||'').toLowerCase().includes(q);
  });

  const toggleGuestSelection = (id) => { const newSet = new Set(selectedGuestIds); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedGuestIds(newSet); };
  const toggleAllGuests = () => { if (filteredList.length === 0) return; const allSelected = filteredList.every(p => selectedGuestIds.has(p.id)); const newSet = new Set(selectedGuestIds); filteredList.forEach(p => { if (allSelected) newSet.delete(p.id); else newSet.add(p.id); }); setSelectedGuestIds(newSet); };
  const handleDeleteSelectedGuests = async () => { if (!selectedGuestIds.size) return; if (!confirm(`Are you sure you want to delete ${selectedGuestIds.size} guests?`)) return; const batch = writeBatch(db); selectedGuestIds.forEach(id => { batch.delete(doc(db, "attendees", id)); }); await batch.commit(); setSelectedGuestIds(new Set()); };
  const toggleSeatSelection = (id) => { const newSet = new Set(selectedSeatIds); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedSeatIds(newSet); };
  const toggleAllSeats = () => { if (filteredSeat.length === 0) return; const allSelected = filteredSeat.every(s => selectedSeatIds.has(s.id)); const newSet = new Set(selectedSeatIds); filteredSeat.forEach(s => { if (allSelected) newSet.delete(s.id); else newSet.add(s.id); }); setSelectedSeatIds(newSet); };
  const handleDeleteSelectedSeats = async () => { if (!selectedSeatIds.size) return; if (!confirm(`Are you sure you want to delete ${selectedSeatIds.size} seats?`)) return; const batch = writeBatch(db); selectedSeatIds.forEach(id => { batch.delete(doc(db, "seating_plan", id)); }); await batch.commit(); setSelectedSeatIds(new Set()); };

  const handleScan = useCallback(async (text) => {
    const now = Date.now();
    if(now - lastTime.current < 1000) return;
    try {
        const data = JSON.parse(text);
        lastTime.current = now;
        let targetId = data.id || (data.type==='new_reg' && attendees.find(x=>x.phone===normalizePhone(data.phone))?.id);
        const p = attendees.find(x=>x.id===targetId);
        if(!p) { setScanRes({type:'error', msg:t.notFound}); SoundController.playError(); }
        else if(p.checkedIn) { setScanRes({type:'duplicate', msg:t.duplicate, p}); SoundController.playError(); }
        else { if(db) updateDoc(doc(db, "attendees", p.id), { checkedIn: true, checkInTime: new Date().toISOString() }); setScanRes({type:'success', msg:t.success, p}); SoundController.playSuccess(); }
        setTimeout(()=>setScanRes(null), 1000);
    } catch(e){}
  }, [attendees]);

  useEffect(() => { if(!isScan) return; let s; const init = () => { if(window.Html5QrcodeScanner) { s=new window.Html5QrcodeScanner("reader",{fps:10,qrbox:250,videoConstraints:{facingMode:"environment"}},false); s.render(handleScan,()=>{}); }}; if(window.Html5QrcodeScanner) init(); else { const sc=document.createElement('script'); sc.src="https://unpkg.com/html5-qrcode"; sc.onload=init; document.body.appendChild(sc); } return ()=>{if(s)try{s.clear()}catch(e){}}; }, [isScan, handleScan]);
  const handleImportSeating = async (e) => { const file = e.target.files[0]; if(!file)return; const text = await file.text(); const lines = text.split(/\r\n|\n/).slice(1); const batch = writeBatch(db); lines.forEach(l => { const c = l.split(','); if(c.length>=5) { const ref = doc(collection(db, "seating_plan")); batch.set(ref, { name: c[0].trim(), phone: normalizePhone(c[1]), email: normalizeEmail(c[2]), dept: c[3]?.trim(), table: c[4]?.trim(), seat: c[5]?.trim()||'' }); } }); await batch.commit(); alert(t.importSuccess); };
  const handleAddGuest = async (e) => { e.preventDefault(); if(!adminForm.name) return; const cleanPhone = normalizePhone(adminForm.phone); const cleanEmail = normalizeEmail(adminForm.email); const phoneExists = attendees.some(a => normalizePhone(a.phone) === cleanPhone && cleanPhone !== ''); const emailExists = attendees.some(a => normalizeEmail(a.email) === cleanEmail && cleanEmail !== ''); if (phoneExists) { alert(t.errPhone); return; } if (emailExists) { alert(t.errEmail); return; } let assignedTable = adminForm.table; let assignedSeat = adminForm.seat; let autoName = adminForm.name || "VIP Guest"; let autoDept = adminForm.dept || "-"; const emailMatch = seatingPlan.find(s => normalizeEmail(s.email) === cleanEmail && cleanEmail !== ''); const phoneMatch = seatingPlan.find(s => normalizePhone(s.phone) === cleanPhone && cleanPhone !== ''); const match = emailMatch || phoneMatch; if (match) { if (!assignedTable) assignedTable = match.table; if (!assignedSeat) assignedSeat = match.seat; if (!adminForm.name) autoName = match.name; if (!adminForm.dept) autoDept = match.dept; } await addDoc(collection(db, "attendees"), { ...adminForm, name: autoName, dept: autoDept, phone: cleanPhone, email: cleanEmail, table: assignedTable, seat: assignedSeat, photo: "", checkedIn: false, checkInTime: null, createdAt: new Date().toISOString() }); setAdminForm({name:'',phone:'',email:'',dept:'',table:'',seat:''}); };
  // 🔥 V256: Updated to handle Add or Update logic
  const handleAddSeating = async (e) => { e.preventDefault(); if(!seatForm.table) return; 
    if (editingSeatId && db) {
        await updateDoc(doc(db, "seating_plan", editingSeatId), { 
            name: seatForm.name, 
            phone: normalizePhone(seatForm.phone), 
            email: normalizeEmail(seatForm.email), 
            dept: seatForm.dept, 
            table: seatForm.table, 
            seat: seatForm.seat 
        });
        setEditingSeatId(null);
    } else if (db) {
        await addDoc(collection(db, "seating_plan"), { 
            name: seatForm.name, 
            phone: normalizePhone(seatForm.phone), 
            email: normalizeEmail(seatForm.email), 
            dept: seatForm.dept, 
            table: seatForm.table, 
            seat: seatForm.seat 
        }); 
    }
    setSeatForm({ name:'', phone:'', email: '', dept: '', table: '', seat: '' }); 
  };
  const handleDeleteSeating = async (id) => { if(confirm('Delete?') && db) await deleteDoc(doc(db, "seating_plan", id)); };
  // 🔥 V256: Start Edit Function
  const startEditSeat = (s) => {
    setEditingSeatId(s.id);
    setSeatForm({
        name: s.name || '',
        phone: s.phone || '',
        email: s.email || '',
        dept: s.dept || '',
        table: s.table || '',
        seat: s.seat || ''
    });
  };
  // 🔥 V256: Cancel Edit Function
  const cancelEditSeat = () => {
    setEditingSeatId(null);
    setSeatForm({ name:'', phone:'', email: '', dept: '', table: '', seat: '' });
  };
  const toggleCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: !person.checkedIn, checkInTime: !person.checkedIn ? new Date().toISOString() : null }); };
  const toggleCancelCheckIn = async (person) => { if (db) await updateDoc(doc(db, "attendees", person.id), { checkedIn: false, checkInTime: null }); };
  const deletePerson = async (id) => { if(confirm('Delete?') && db) await deleteDoc(doc(db, "attendees", id)); };
  const downloadTemplate = () => { const content = "\uFEFFName,Phone,Email,Dept,Table,Seat\nElon Musk,0912345678,elon@tesla.com,Engineering,1,A"; const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "seating_template.csv"; link.click(); };
  const handleGenerateDummy = async () => { if (!confirm("確定要生成 320 筆測試資料嗎？")) return; const existingIds = attendees.map(a => { const match = a.name.match(/^Guest (\d+)$/); return match ? parseInt(match[1]) : 0; }); const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0; const start = maxId + 1; const end = maxId + 320; const batch = writeBatch(db); for (let i = start; i <= end; i++) { const ref = doc(db, "attendees", `guest_${i}`); batch.set(ref, { name: `Guest ${i}`, phone: `9000${String(i).padStart(4, '0')}`, email: `guest${i}@test.com`, dept: `Dept ${String.fromCharCode(65 + (i % 5))}`, table: `${Math.ceil(i / 10)}`, seat: String.fromCharCode(65 + ((i - 1) % 10)), photo: `https://i.pravatar.cc/300?u=guest_${i}`, checkedIn: true, checkInTime: new Date().toISOString(), createdAt: new Date().toISOString() }); } await batch.commit(); alert(`已生成 Guest ${start} - Guest ${end}`); };
  const handleClearAllGuests = async () => { if (!confirm(t.confirmClearGuests)) return; const batch = writeBatch(db); attendees.forEach(p => { const ref = doc(db, "attendees", p.id); batch.delete(ref); }); await batch.commit(); alert("已清空所有賓客！"); };
  const handleGenerateDummySeating = async () => { if (!confirm("確定要生成 100 筆新的座位資料嗎？")) return; const existingIds = seatingPlan.map(s => { const match = s.name.match(/^Guest (\d+)$/); return match ? parseInt(match[1]) : 0; }); const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0; const start = maxId + 1; const end = maxId + 100; const batch = writeBatch(db); for (let i = start; i <= end; i++) { const ref = doc(collection(db, "seating_plan")); batch.set(ref, { name: `Guest ${i}`, phone: `9000${String(i).padStart(4, '0')}`, email: `guest${i}@test.com`, dept: `Dept ${String.fromCharCode(65 + (i % 5))}`, table: `${Math.ceil(i / 10)}`, seat: String.fromCharCode(65 + ((i - 1) % 10)) }); } await batch.commit(); alert(`已生成座位資料 Guest ${start} - Guest ${end}`); };
  const handleClearSeating = async () => { if(!confirm(t.confirmClearSeats)) return; const batch = writeBatch(db); seatingPlan.forEach(s => batch.delete(doc(db, "seating_plan", s.id))); await batch.commit(); alert("座位表已清空"); };

  return (
    <div className="min-h-[100dvh] bg-neutral-950 text-white flex flex-col">
       <header className="p-4 border-b border-white/10 flex justify-between items-center bg-neutral-900"><div className="font-bold text-lg flex gap-2"><Search/> Reception</div><button onClick={onLogout}><X size={18}/></button></header>
       <main className="flex-1 p-4 flex flex-col items-center w-full max-w-7xl mx-auto">
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
              {['scan','list','seating'].map(k=><button key={k} onClick={()=>{setTab(k);setIsScan(false)}} className={`px-4 py-2 rounded-lg text-sm ${tab===k?'bg-blue-600':'text-white/50'}`}>{t[k]}</button>)}
          </div>
          {tab==='scan' && ( <div className="w-full max-w-md"> {isScan ? <div id="reader" className="bg-black rounded-xl overflow-hidden mb-4"></div> : <button onClick={()=>setIsScan(true)} className="w-full py-12 border-2 border-dashed border-white/20 rounded-xl text-white/50 flex flex-col items-center gap-2 hover:bg-white/5"><Camera size={32}/> {t.scanCam}</button>} {scanRes && <div className={`p-4 rounded-xl text-center font-bold ${scanRes.type==='success'?'bg-green-600':'bg-red-600'}`}>{scanRes.msg} {scanRes.p?.name}</div>} </div> )}

          {tab==='list' && (
              <div className="w-full flex-1 flex flex-col h-[70vh]">
                  <div className="p-4 bg-white/5 rounded-t-xl border-b border-white/10">
                      <div className="mb-4 flex gap-2 items-center">
                          <div className="relative flex-1"><Search className="absolute top-2.5 left-3 text-white/30" size={16}/><input placeholder={t.searchList} value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none"/></div>
                          {selectedGuestIds.size > 0 && <button onClick={handleDeleteSelectedGuests} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-1 animate-in fade-in zoom-in duration-200 shadow-lg shadow-red-900/40"><X size={14}/> {t.deleteSelected} ({selectedGuestIds.size})</button>}
                          <button onClick={handleGenerateDummy} className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 px-3 py-2 rounded-lg text-xs hover:bg-yellow-600 hover:text-white transition-colors flex items-center gap-1"><Plus size={14}/> {t.genDummy}</button>
                          <button onClick={handleClearAllGuests} className="bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-2 rounded-lg text-xs hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"><X size={14}/> {t.clearGuests}</button>
                      </div>
                      <form onSubmit={handleAddGuest} className="flex gap-2 flex-wrap mb-4 bg-white/5 p-2 rounded-lg">
                          <div className="w-full text-xs text-white/40 mb-1">{t.addGuest}</div>
                          <input placeholder="Name" value={adminForm.name} onChange={e=>setAdminForm({...adminForm,name:e.target.value})} className="bg-white/10 rounded px-2 py-1 flex-1 text-xs outline-none min-w-[80px]"/>
                          <input placeholder="Phone" value={adminForm.phone} onChange={e=>setAdminForm({...adminForm,phone:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-24 text-xs outline-none"/>
                          <input placeholder="Email" value={adminForm.email} onChange={e=>setAdminForm({...adminForm,email:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-32 text-xs outline-none"/>
                          <input placeholder="Dept" value={adminForm.dept} onChange={e=>setAdminForm({...adminForm,dept:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-20 text-xs outline-none"/>
                          <input placeholder="T" value={adminForm.table} onChange={e=>setAdminForm({...adminForm,table:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-10 text-xs outline-none text-center"/>
                          <button className="bg-green-600 px-3 py-1 rounded text-xs"><Plus size={14}/></button>
                      </form>
                      <div className="flex justify-between text-xs text-white/50"><span>Total: {attendees.length}</span><span className="text-emerald-400">Arrived: {attendees.filter(x=>x.checkedIn).length}</span></div>
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-auto bg-white/5 rounded-b-xl p-2">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead className="text-xs text-white/40 uppercase border-b border-white/10">
                              <tr>
                                  <th className="p-3 w-10 text-center"><button onClick={toggleAllGuests} className="hover:text-white transition-colors">{filteredList.length > 0 && filteredList.every(p => selectedGuestIds.has(p.id)) ? <Check size={16}/> : <User size={16}/>}</button></th>
                                  <th className="p-3 text-left">Name</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Dept</th><th className="p-3 text-center">Table</th><th className="p-3 text-left text-yellow-500">{t.wonPrize}</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Del</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {filteredList.map(p=>{
                                  const winnerRec = drawHistory.find(h=>h.attendeeId===p.id);
                                  // 🔥 V155: FORCE SYNC DISPLAY
                                  const match = seatingPlan.find(s => (s.email && normalizeEmail(s.email) === normalizeEmail(p.email)) || (s.phone && normalizePhone(s.phone) === normalizePhone(p.phone)));
                                  const displayTable = match ? match.table : p.table;
                                  const displaySeat = match ? match.seat : p.seat;
                                  const displayName = (p.name === "VIP Guest" && match) ? match.name : p.name;
                                  const isSelected = selectedGuestIds.has(p.id);
                                  return (
                                      <tr key={p.id} className={`hover:bg-white/5 text-sm transition-colors ${isSelected ? 'bg-white/10' : ''}`}>
                                          <td className="p-3 text-center"><button onClick={() => toggleGuestSelection(p.id)} className={`transition-colors ${isSelected ? 'text-blue-400' : 'text-white/20 hover:text-white/50'}`}>{isSelected ? <Check size={16}/> : <User size={16}/>}</button></td>
                                          <td className="p-3"><div className="flex items-center gap-3 font-bold">{p.photo ? <img src={p.photo} className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><User size={14}/></div>}{displayName}</div></td>
                                          <td className="p-3 text-white/60 text-left">{p.phone}</td><td className="p-3 text-white/60 text-left max-w-[150px] truncate" title={p.email}>{p.email}</td><td className="p-3 text-white/60 text-left">{p.dept}</td>
                                          <td className={`p-3 font-mono text-center text-lg ${!displayTable ? 'text-blue-300 italic' : 'text-blue-400'}`}>{displayTable || '-'}</td>
                                          <td className="p-3 text-yellow-400 font-bold text-left">{winnerRec ? winnerRec.prize : '-'}</td>
                                          <td className="p-3 text-center">{!p.checkedIn ? <button onClick={()=>toggleCheckIn(p)} className="bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-1 rounded text-xs hover:bg-red-600 hover:text-white transition-colors">{t.pendingCheckin}</button> : <button onClick={()=>toggleCancelCheckIn(p)} className="bg-green-600/20 text-green-400 border border-green-600/50 px-3 py-1 rounded text-xs hover:bg-red-900/50 hover:text-red-300 transition-colors">{t.checkedInStatus}</button>}</td>
                                          <td className="p-3 text-center"><button onClick={()=>deletePerson(p.id)} className="p-2 text-white/20 hover:text-red-500 rounded-full hover:bg-white/10 transition-colors"><X size={16}/></button></td>
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
                      {selectedSeatIds.size > 0 && <button onClick={handleDeleteSelectedSeats} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-1 animate-in fade-in zoom-in duration-200 shadow-lg shadow-red-900/40"><X size={14}/> {t.deleteSelected} ({selectedSeatIds.size})</button>}
                      <label className="bg-blue-600 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2"><Plus size={16}/> {t.importCSV}<input type="file" hidden accept=".csv" onChange={handleImportSeating}/></label>
                      <button onClick={downloadTemplate} className="bg-white/10 px-3 py-2 rounded-lg"><Search size={16}/></button>
                      <button onClick={handleGenerateDummySeating} className="bg-purple-600/20 text-purple-400 border border-purple-600/50 px-3 py-2 rounded-lg text-xs hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-1"><Plus size={14}/> {t.genDummySeat}</button>
                      <button onClick={handleClearSeating} className="bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-2 rounded-lg text-xs hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"><X size={14}/> {t.clearSeats}</button>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg flex flex-wrap gap-2">
                      <div className="w-full text-xs text-white/40 mb-1">{editingSeatId ? t.edit : t.addSeat}</div>
                      <input placeholder={t.name} value={seatForm.name} onChange={e=>setSeatForm({...seatForm,name:e.target.value})} className="bg-white/10 rounded px-2 py-1 flex-1 text-xs outline-none min-w-[80px]" />
                      <input placeholder={t.phone} value={seatForm.phone} onChange={e=>setSeatForm({...seatForm,phone:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-20 text-xs outline-none" />
                      <input placeholder={t.email} value={seatForm.email} onChange={e=>setSeatForm({...seatForm,email:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-24 text-xs outline-none" />
                      <input placeholder={t.dept} value={seatForm.dept} onChange={e=>setSeatForm({...seatForm,dept:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-16 text-xs outline-none" />
                      <input placeholder={t.table} value={seatForm.table} onChange={e=>setSeatForm({...seatForm,table:e.target.value})} className="bg-white/10 rounded px-2 py-1 w-10 text-xs outline-none text-center" />
                      <button onClick={handleAddSeating} className={`${editingSeatId ? 'bg-orange-600' : 'bg-green-600'} px-3 py-1 rounded text-xs text-white`}>{editingSeatId ? t.update : <Plus size={14}/>}</button>
                      {editingSeatId && <button onClick={cancelEditSeat} className="bg-red-600 px-3 py-1 rounded text-xs text-white">{t.cancelEdit}</button>}
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-auto bg-white/5 rounded-xl p-2">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead className="text-xs text-white/40 uppercase border-b border-white/10">
                              <tr>
                                  <th className="p-3 w-10 text-center"><button onClick={toggleAllSeats} className="hover:text-white transition-colors">{filteredSeat.length > 0 && filteredSeat.every(s => selectedSeatIds.has(s.id)) ? <Check size={16}/> : <User size={16}/>}</button></th>
                                  <th className="p-3 text-center">{t.number}</th>
                                  <th className="p-3 text-left">Name</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Dept</th><th className="p-3 text-center">Table</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {filteredSeat.map((s, index)=>{
                                  const match = attendees.find(a => (s.phone && normalizePhone(a.phone) === normalizePhone(s.phone)) || (s.email && normalizeEmail(a.email) === normalizeEmail(s.email)));
                                  const isCheckedIn = match?.checkedIn;
                                  const isSelected = selectedSeatIds.has(s.id);
                                  return (
                                      <tr key={s.id} className={`hover:bg-white/5 text-sm transition-colors ${isSelected ? 'bg-white/10' : ''}`}>
                                          <td className="p-3 text-center"><button onClick={() => toggleSeatSelection(s.id)} className={`transition-colors ${isSelected ? 'text-blue-400' : 'text-white/20 hover:text-white/50'}`}>{isSelected ? <Check size={16}/> : <User size={16}/>}</button></td>
                                          <td className="p-3 text-center text-white/30">{index + 1}</td>
                                          <td className="p-3 font-bold text-left">{s.name}</td><td className="p-3 text-xs text-white/60 text-left">{s.phone}</td><td className="p-3 text-xs text-white/60 text-left">{s.email}</td><td className="p-3 text-xs text-white/60 text-left">{s.dept}</td><td className="p-3 font-mono text-blue-400 text-center text-lg">{s.table}</td>
                                          <td className="p-3 text-center">{isCheckedIn ? <span className="text-green-400 bg-green-400/20 px-2 py-1 rounded text-xs border border-green-400/50">已到場</span> : <span className="text-white/30 text-xs border border-white/10 px-2 py-1 rounded">未簽到</span>}</td>
                                          <td className="p-3 text-center flex justify-center gap-2">
                                              {/* 🔥 V257: Used User icon for Edit instead of Edit icon to prevent crash */}
                                              <button onClick={()=>startEditSeat(s)} className="p-2 text-white/20 hover:text-orange-500 rounded-full hover:bg-white/10"><User size={16}/></button>
                                              <button onClick={()=>handleDeleteSeating(s.id)} className="p-2 text-white/20 hover:text-red-500 rounded-full hover:bg-white/10"><X size={16}/></button>
                                          </td>
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
  const handleResetAllWinners = async (e) => { if (e) e.preventDefault(); if (confirm('確定要清空所有中獎紀錄嗎？此操作無法復原。\nAre you sure you want to clear ALL winners?')) { const batch = writeBatch(db); drawHistory.forEach(win => { batch.delete(doc(db, "winners", win.id)); }); batch.commit(); } };
  const handleImportPrizes = async (e) => { const file = e.target.files[0]; if(!file) return; const text = await file.text(); const lines = text.split(/\r\n|\n/).filter(l=>l); const batch = writeBatch(db); lines.forEach(l=>{ const newRef = doc(collection(db, "prizes")); batch.set(newRef, { name: l.trim(), createdAt: new Date().toISOString() }); }); await batch.commit(); alert("Imported!"); };
  const filteredPrizes = prizes.filter(p => p.name.toLowerCase().includes(prizeSearch.toLowerCase()));
  return (
    <div className="min-h-[100dvh] bg-neutral-950 flex flex-col font-sans text-white">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white"><User size={18}/></div> {t.prizeMode}</div>
        <button onClick={onLogout} className="text-white/50 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"><X size={16}/> {t.logout}</button>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="w-full grid md:grid-cols-2 gap-8 h-full">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col h-[700px]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={20} className="text-red-500"/> {t.prizeList}</h3>
                <form onSubmit={handleAddPrize} className="flex gap-2 mb-4"><input value={newPrizeName} onChange={e=>setNewPrizeName(e.target.value)} placeholder={t.prizePlace} className="flex-[2] bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"/><input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} className="w-16 bg-black/50 border border-white/20 rounded-xl px-2 py-3 text-sm text-center text-white focus:border-red-500 outline-none"/><button className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"><Plus size={20}/></button></form>
                <div className="flex gap-2 mb-4 relative"><Search className="absolute top-3 left-3 text-white/30" size={16}/><input value={prizeSearch} onChange={e=>setPrizeSearch(e.target.value)} placeholder="Search Prize..." className="w-full bg-black/30 border border-white/10 pl-10 pr-4 py-2 rounded-lg text-sm outline-none"/><label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-center cursor-pointer transition-colors flex items-center justify-center gap-1"><Plus size={12}/> CSV <input type="file" accept=".csv" className="hidden" onChange={handleImportPrizes}/></label></div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scroll flex flex-col gap-2">
                    {filteredPrizes.map(p=>{ const winnerRecord = drawHistory.find(h => h.prize === p.name); return ( <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${currentPrize===p.name?'bg-red-600/20 border-red-600':'bg-white/5 border-white/10'} ${winnerRecord ? 'opacity-70 bg-black/40' : ''}`}> <div className="flex flex-col"><span className={`font-bold ${currentPrize===p.name?'text-white':'text-white/70'}`}>{p.name}</span>{winnerRecord && <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1 font-bold">🏆 {winnerRecord.name}</span>}</div><div className="flex gap-2">{currentPrize!==p.name && !winnerRecord && <button onClick={()=>handleSelectPrize(p.name)} className="px-3 py-1.5 bg-white/10 hover:bg-green-600 rounded-lg text-xs transition-colors">{t.select}</button>}{currentPrize===p.name && <span className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-bold">{t.active}</span>}{winnerRecord ? <button onClick={()=>toggleWinnerStatus(winnerRecord)} className="p-2 bg-white/10 hover:bg-yellow-600 rounded-lg transition-colors" title={t.resetWinner}><X size={14}/></button> : <button onClick={()=>handleDeletePrize(p.id)} className="p-2 bg-white/10 hover:bg-red-600 rounded-lg transition-colors"><X size={14}/></button>}</div></div> ); })}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-neutral-800 to-black border border-white/20 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-30"><Camera size={100} className="text-white"/></div>
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
                        <h3 className="text-lg font-bold flex items-center gap-2"><User size={20} className="text-yellow-500"/> {t.winnersList}</h3>
                        {drawHistory.length > 0 && (<button onClick={handleResetAllWinners} className="text-xs bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><X size={12} className="inline mr-1"/> {t.clearAll}</button>)}
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
}
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
      <button onClick={()=>setLang(l=>l==='zh'?'en':'zh')} className="absolute top-6 right-6 text-white/50 hover:text-white flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full transition-all z-10 text-xs font-mono"><Search size={14}/> {lang.toUpperCase()}</button>
      <div className="z-10 text-center mb-16 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.4)] mb-8 animate-in zoom-in duration-700"><Camera size={48} className="text-white"/></div>
        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{t.title}</h1>
        <p className="text-white/40 text-xl font-light tracking-[0.3em] uppercase">{t.sub}</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4 w-full max-w-7xl z-10 px-4">
        <button onClick={()=>setView('guest')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><User size={60} className="text-white"/></div><h3 className="text-xl font-bold text-white mb-1">{t.guestMode}</h3><p className="text-white/50 text-xs">Register, Check Seat, Get Ticket</p><div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-white w-fit px-4 py-2 rounded-full">{t.enter} <ChevronRight size={16} className="ml-2"/></div></button>
        <button onClick={()=>setView('login_admin')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Search size={60} className="text-white"/></div><h3 className="text-xl font-bold text-white mb-1">{t.adminMode}</h3><p className="text-white/50 text-xs">Check-in, Manage Guests</p><div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-red-600 w-fit px-4 py-2 rounded-full">{t.enter} <ChevronRight size={16} className="ml-2"/></div></button>
        <button onClick={()=>setView('login_prize')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><User size={60} className="text-white"/></div><h3 className="text-xl font-bold text-white mb-1">{t.prizeMode}</h3><p className="text-white/50 text-xs">Manage Prizes, Reset Winners</p><div className="mt-8 flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform bg-indigo-600 w-fit px-4 py-2 rounded-full">{t.enter} <ChevronRight size={16} className="ml-2"/></div></button>
        <button onClick={()=>setView('login_projector')} className="group relative overflow-hidden bg-gradient-to-br from-neutral-800 to-black hover:from-neutral-700 border border-white/20 p-6 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm"><div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity"><Camera size={60} className="text-yellow-500"/></div><h3 className="text-xl font-bold text-yellow-500 mb-1">{t.projectorMode}</h3><p className="text-white/50 text-xs">Big Screen, Lottery Animation</p><div className="mt-8 flex items-center text-black font-bold text-sm group-hover:translate-x-2 transition-transform bg-yellow-500 w-fit px-4 py-2 rounded-full">{t.enter} <ChevronRight size={16} className="ml-2"/></div></button>
      </div>
    </div>
  );
  if(view === 'guest') return <><StyleInjector/><GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} seatingPlan={seatingPlan} attendees={attendees} /></>;
  if(view === 'login_admin') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('admin')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_prize') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('prize')} onBack={()=>setView('landing')} /></>;
  if(view === 'login_projector') return <><StyleInjector/><LoginView t={t} onLogin={()=>handleLoginSuccess('projector')} onBack={()=>setView('landing')} /></>;
  
  if(view === 'admin') return <><StyleInjector/><ReceptionDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} seatingPlan={seatingPlan} drawHistory={drawHistory} /></>;
  if(view === 'prize') return <><StyleInjector/><PrizeDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} setCurrentPrize={setCurrentPrize} prizes={prizes} /></>;
  if(view === 'projector') return <><StyleInjector/><ProjectorView t={t} onBack={()=>setView('landing')} attendees={attendees} drawHistory={drawHistory} currentPrize={currentPrize} prizes={prizes} seatingPlan={seatingPlan} /></>;
}