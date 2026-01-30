import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, Keyboard, 
  Sparkles, ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, KeyRound, ChevronLeft, AlertTriangle
} from 'lucide-react';

// --- 1. 設定與語言包 ---
const ADMIN_PASSWORD = "admin888"; 

const translations = {
  zh: {
    appTitle: "EventPass V10",
    appSubtitle: "嚴格防重 & 桌面優化版",
    portalGuest: "參加者登記入口",
    portalGuestDesc: "自助填寫資料領取入場證",
    portalAdmin: "管理員後台",
    portalAdminDesc: "掃描簽到、抽獎與名單管理",
    loginTitle: "管理員登入",
    passwordPlace: "請輸入後台密碼",
    loginBtn: "登入系統",
    wrongPwd: "密碼錯誤，請重試",
    guestTitle: "自助登記",
    guestSub: "填寫資料以獲取入場 QR Code",
    name: "姓名",
    phone: "電話",
    email: "電子郵件",
    company: "公司/備註 (選填)",
    generateBtn: "確認並生成入場證",
    back: "返回",
    yourCode: "您的入場憑證",
    showToStaff: "請截圖或向工作人員出示此畫面",
    nextPerson: "登記下一位",
    scanTitle: "掃描簽到",
    drawTitle: "幸運轉盤",
    listTitle: "名單管理",
    total: "總數",
    checkedIn: "已到",
    scanNext: "掃描下一位",
    startSpin: "開始轉動 (空白鍵)",
    spinning: "好運轉動中...",
    congrats: "✨ 恭喜中獎 ✨",
    confirmWin: "確認領獎 (Enter)",
    search: "搜尋...",
    openCamera: "開啟相機",
    closeCamera: "關閉相機",
    manualInput: "手動輸入 ID 或電話",
    confirm: "確認",
    scanSuccess: "簽到成功！",
    scanDuplicate: "注意：此人已簽到過",
    scanError: "無效的 QR Code",
    welcomeBack: "發現重複資料：已自動轉為簽到舊用戶",
    regSuccess: "登記並簽到成功",
    notFound: "找不到此參加者",
    errPhoneDup: "登記失敗：此【電話】已經被使用過！",
    errEmailDup: "登記失敗：此【Email】已經被使用過！",
    errIncomplete: "請填寫所有必填欄位",
    drawNeedMore: "至少需要 2 位符合資格者",
    logout: "登出",
    checkinBtn: "簽到",
    cancelCheckin: "取消"
  },
  en: {
    appTitle: "EventPass V10",
    appSubtitle: "Strict Validation Version",
    portalGuest: "Guest Registration",
    portalGuestDesc: "Self-service registration portal",
    portalAdmin: "Admin Dashboard",
    portalAdminDesc: "Scan, Lucky Draw & Management",
    loginTitle: "Admin Login",
    passwordPlace: "Enter Admin Password",
    loginBtn: "Login",
    wrongPwd: "Wrong password, try again",
    guestTitle: "Guest Registration",
    guestSub: "Enter details to get Entry QR",
    name: "Name",
    phone: "Phone",
    email: "Email",
    company: "Company (Optional)",
    generateBtn: "Generate Pass",
    back: "Back",
    yourCode: "Your Entry Pass",
    showToStaff: "Show this to staff",
    nextPerson: "Register Next Person",
    scanTitle: "Scan Check-in",
    drawTitle: "Lucky Draw",
    listTitle: "Guest List",
    total: "Total",
    checkedIn: "Arrived",
    scanNext: "Scan Next",
    startSpin: "Spin Now (Space)",
    spinning: "Spinning...",
    congrats: "✨ WINNER ✨",
    confirmWin: "Claim Prize (Enter)",
    search: "Search...",
    openCamera: "Open Camera",
    closeCamera: "Close Camera",
    manualInput: "Manual Input ID/Phone",
    confirm: "Confirm",
    scanSuccess: "Check-in Success!",
    scanDuplicate: "Warning: Already Checked-in",
    scanError: "Invalid QR",
    welcomeBack: "Data Exists: Checked-in Existing User",
    regSuccess: "Registered & Checked-in",
    notFound: "Not Found",
    errPhoneDup: "Error: Phone Number already exists!",
    errEmailDup: "Error: Email Address already exists!",
    errIncomplete: "Missing required fields",
    drawNeedMore: "Need 2+ eligible guests",
    logout: "Logout",
    checkinBtn: "Check-in",
    cancelCheckin: "Cancel"
  }
};

// --- 2. 基礎組件 ---
const Confetti = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({length: 200}).map(() => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      w: Math.random() * 10 + 5, h: Math.random() * 10 + 5,
      color: ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800', '#ffd700'][Math.floor(Math.random() * 8)],
      speed: Math.random() * 3 + 2, angle: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 10
    }));
    let animationId;
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save(); ctx.translate(p.x + p.w/2, p.y + p.h/2); ctx.rotate(p.angle * Math.PI/180); ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore();
        p.y += p.speed; p.angle += p.rotationSpeed;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
      });
      animationId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationId);
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

const SoundController = {
  ctx: null,
  init: function() { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); },
  playTick: function() {
    if (!this.ctx) this.init(); if (this.ctx.state === 'suspended') this.ctx.resume(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.type = 'square'; osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime+0.05);
    osc.start(); osc.stop(this.ctx.currentTime+0.05);
  },
  playWin: function() {
    if (!this.ctx) this.init(); if (this.ctx.state === 'suspended') this.ctx.resume(); if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(523.25, t); osc.frequency.setValueAtTime(1046.50, t+0.3);
    gain.gain.setValueAtTime(0.3, t); gain.gain.linearRampToValueAtTime(0, t+1.0);
    osc.start(); osc.stop(t+1.0);
  }
};

const LuckyWheel = ({ candidates, onComplete, t }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F1948A'];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isSpinning && candidates.length >= 2) {
        e.preventDefault(); spin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, candidates]);

  const spin = () => {
    if (isSpinning || candidates.length < 1) return;
    setIsSpinning(true); SoundController.init();
    
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const sliceAngle = 360 / candidates.length;
    const targetRotation = rotation + 1800 + (360 - (winnerIndex * sliceAngle)) + ((Math.random()-0.5)*sliceAngle*0.8);
    setRotation(targetRotation);
    let count = 0;
    const interval = setInterval(() => { count++; if(count%5===0 || Math.random()>0.7) SoundController.playTick(); }, 100);
    setTimeout(() => { clearInterval(interval); setIsSpinning(false); SoundController.playWin(); onComplete(candidates[winnerIndex]); }, 4500);
  };

  const renderWheel = () => {
    const num = candidates.length;
    if (num === 1) return <circle cx="150" cy="150" r="150" fill={colors[0]} />;
    return candidates.map((p, i) => {
      const start = (i*360)/num, end = ((i+1)*360)/num;
      const x1 = 150+150*Math.cos((start-90)*Math.PI/180), y1 = 150+150*Math.sin((start-90)*Math.PI/180);
      const x2 = 150+150*Math.cos((end-90)*Math.PI/180), y2 = 150+150*Math.sin((end-90)*Math.PI/180);
      const large = end-start<=180?0:1;
      return (
        <g key={i}>
            <path d={`M 150 150 L ${x1} ${y1} A 150 150 0 ${large} 1 ${x2} ${y2} Z`} fill={colors[i%colors.length]} stroke="white" strokeWidth="2" />
            {num < 20 && (
                <text
                    x={150 + 100 * Math.cos(((start+end)/2 - 90) * Math.PI / 180)}
                    y={150 + 100 * Math.sin(((start+end)/2 - 90) * Math.PI / 180)}
                    fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle"
                    transform={`rotate(${(start+end)/2}, ${150 + 100 * Math.cos(((start+end)/2 - 90) * Math.PI / 180)}, ${150 + 100 * Math.sin(((start+end)/2 - 90) * Math.PI / 180)})`}
                >
                    {p.name.substring(0, 6)}
                </text>
            )}
        </g>
      );
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] rounded-full border-8 border-white/20 bg-white overflow-hidden shadow-2xl transition-all duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-md"></div>
        <svg width="100%" height="100%" viewBox="0 0 300 300" style={{transform:`rotate(${rotation}deg)`, transition: isSpinning?'transform 4.5s cubic-bezier(0.2,0.8,0.2,1)':'none'}}>
          {renderWheel()}
        </svg>
      </div>
      <button onClick={spin} disabled={isSpinning} className={`mt-8 px-12 py-4 rounded-full text-2xl font-bold shadow-lg text-white transition-transform active:scale-95 ${isSpinning?'bg-slate-300':'bg-gradient-to-r from-rose-500 to-orange-500 hover:scale-105'}`}>
        {isSpinning ? t.spinning : t.startSpin}
      </button>
      <p className="mt-4 text-slate-400 text-sm hidden md:block">提示：按下空白鍵 (Space) 即可抽獎</p>
    </div>
  );
};

// --- 3. 獨立頁面 ---
const AdminLogin = ({ onLogin, onBack, t }) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); if(pwd===ADMIN_PASSWORD) onLogin(); else {setErr(true); setPwd('');} };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center text-sm"><ChevronLeft size={16}/> {t.back}</button>
        <div className="text-center mb-6"><div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600"><Lock size={32}/></div><h2 className="text-2xl font-bold text-slate-800">{t.loginTitle}</h2></div>
        <form onSubmit={handleSubmit}><input type="password" autoFocus value={pwd} onChange={e=>{setPwd(e.target.value);setErr(false);}} placeholder={t.passwordPlace} className="w-full p-3 border rounded-xl mb-4 text-center text-lg outline-none focus:ring-2 focus:ring-indigo-500"/>{err&&<p className="text-red-500 text-sm text-center mb-4">{t.wrongPwd}</p>}<button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold">{t.loginBtn}</button></form>
      </div>
    </div>
  );
};

const GuestPortal = ({ onBack, t, checkDuplicate }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '' });
  const [err, setErr] = useState('');
  
  const handleSubmit = (e) => { 
      e.preventDefault(); 
      // 嚴格防重檢查 (Strict Duplicate Check)
      const dupResult = checkDuplicate(form.phone, form.email);
      if(dupResult === 'phone'){ setErr(t.errPhoneDup); return; }
      if(dupResult === 'email'){ setErr(t.errEmailDup); return; }
      
      setStep(2); 
  };
  const handleReset = () => { setForm({ name: '', phone: '', email: '', company: '' }); setStep(1); setErr(''); };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
        {step === 1 ? (
          <>
            <button onClick={onBack} className="text-slate-400 mb-4 flex items-center text-sm"><ChevronLeft size={16}/> {t.back}</button>
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-slate-800">{t.guestTitle}</h2><p className="text-slate-500 text-sm">{t.guestSub}</p></div>
            
            {err && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center font-bold animate-pulse"><XCircle size={20} className="mr-2"/>{err}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder={t.name} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"/>
              <input required type="tel" placeholder={t.phone} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"/>
              <input required type="email" placeholder={t.email} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"/>
              <input placeholder={t.company} value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"/>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">{t.generateBtn}</button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{form.name}</h2><p className="text-blue-600 font-medium mb-6">{t.yourCode}</p>
            <div className="bg-white p-2 border-2 border-dashed border-slate-200 rounded-xl inline-block mb-6"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({...form,type:'new_reg',id:Date.now().toString()}))}`} alt="QR" className="w-48 h-48 object-contain"/></div>
            <p className="text-xs text-slate-400 mb-6">{t.showToStaff}</p><button onClick={handleReset} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">{t.nextPerson}</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 3.4 管理員後台
const AdminDashboard = ({ onLogout, attendees, setAttendees, drawHistory, setDrawHistory, checkDuplicate, t }) => {
  const [activeTab, setActiveTab] = useState('scan');
  const [scanResult, setScanResult] = useState(null);
  const [winnerModal, setWinnerModal] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const handleKey = (e) => { if(winnerModal && e.key === 'Enter') setWinnerModal(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [winnerModal]);

  const handleScan = (text) => {
    try {
      let data = text; try { data = JSON.parse(text); } catch(e){}
      
      // 處理掃描結果：如果是自助登記 QR (new_reg)
      if (data && data.type === 'new_reg') {
        const exist = attendees.find(p => p.phone === data.phone || p.email === data.email);
        
        if(exist) {
           // 1. 如果資料已存在，且未簽到 -> 執行簽到
           if(!exist.checkedIn) { 
               setAttendees(prev=>prev.map(p=>p.id===exist.id?{...p,checkedIn:true,checkInTime:new Date().toISOString()}:p)); 
               setScanResult({type:'success', msg:t.welcomeBack, person:exist}); 
           }
           // 2. 如果資料已存在，且已簽到 -> 報錯 (重複)
           else {
               setScanResult({type:'duplicate', msg:t.scanDuplicate, person:exist}); 
           }
        } else {
           // 3. 全新資料 -> 註冊並簽到
           const np = {id:data.id||Date.now().toString(),name:data.name,phone:data.phone,email:data.email,company:data.company,checkedIn:true,checkInTime:new Date().toISOString()};
           setAttendees(prev=>[np,...prev]); 
           setScanResult({type:'success', msg:t.regSuccess, person:np});
        }
        return;
      }
      
      // 處理掃描結果：如果是舊 ID
      let tid = data.id || data; const p = attendees.find(x=>x.id===tid||x.phone===tid||x.email===tid);
      if(!p) setScanResult({type:'error',msg:t.notFound});
      else if(p.checkedIn) setScanResult({type:'duplicate',msg:t.scanDuplicate,person:p}); 
      else { setAttendees(prev=>prev.map(x=>x.id===p.id?{...x,checkedIn:true,checkInTime:new Date().toISOString()}:x)); setScanResult({type:'success',msg:t.scanSuccess,person:p}); }
    } catch(e) { setScanResult({type:'error',msg:t.scanError}); }
  };

  useEffect(() => {
    if (!isScanning || activeTab !== 'scan') return;
    let s; const init = () => { if(!window.Html5QrcodeScanner)return; s=new window.Html5QrcodeScanner("reader",{fps:10,qrbox:{width:250,height:250},aspectRatio:1.0},false); s.render(handleScan,()=>{}); };
    if(window.Html5QrcodeScanner) init(); else { const sc=document.createElement('script'); sc.src="https://unpkg.com/html5-qrcode"; sc.onload=init; document.body.appendChild(sc); }
    return () => { if(s) try{s.clear()}catch(e){} };
  }, [isScanning, activeTab]);

  const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h => h.id === p.id));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {winnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in backdrop-blur-sm">
          <Confetti />
          <div className="bg-slate-900 border-4 border-yellow-500 p-12 rounded-3xl text-center max-w-4xl w-full mx-4 animate-in zoom-in shadow-[0_0_100px_rgba(234,179,8,0.5)]">
            <Trophy className="mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={120} />
            <h3 className="text-4xl font-bold mb-6 text-white tracking-widest uppercase">{t.congrats}</h3>
            <p className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-4 drop-shadow-sm">{winnerModal.name}</p>
            <p className="text-2xl text-slate-400 mb-10 tracking-widest">{winnerModal.email}</p>
            <button onClick={()=>setWinnerModal(null)} className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-bold text-2xl hover:scale-105 transition-transform shadow-lg shadow-orange-500/30">{t.confirmWin}</button>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600"><QrCode /> Admin Panel</div>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-500 flex items-center text-sm gap-1"><LogOut size={16}/> {t.logout}</button>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {activeTab === 'scan' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center min-h-[500px] flex flex-col justify-center">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-2"><ScanLine className="text-indigo-600"/> {t.scanTitle}</h2>
            {!scanResult ? (
              <div className="w-full flex flex-col items-center">
                {isScanning ? (
                  <div className="bg-black rounded-xl overflow-hidden relative w-full max-w-sm min-h-[300px] shadow-xl">
                    <div id="reader" className="w-full h-full"></div>
                    <button onClick={()=>setIsScanning(false)} className="absolute top-2 right-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs z-10 hover:bg-white/30">{t.closeCamera}</button>
                  </div>
                ) : (
                  <button onClick={()=>setIsScanning(true)} className="py-12 w-full max-w-sm border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center text-slate-500 hover:bg-slate-50 hover:border-indigo-400 transition-all"><Camera size={48} className="mb-2"/><span>{t.openCamera}</span></button>
                )}
                <div className="flex gap-2 w-full max-w-sm mt-6">
                   <input onKeyDown={(e)=>{if(e.key==='Enter')handleScan(e.target.value)}} placeholder={t.manualInput} className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            ) : (
              <div className="animate-in zoom-in py-8">
                {scanResult.type==='success' && <CheckCircle size={100} className="text-green-500 mx-auto mb-6 drop-shadow-lg"/>}
                {scanResult.type==='duplicate' && <AlertTriangle size={100} className="text-amber-500 mx-auto mb-6 drop-shadow-lg animate-bounce"/>}
                {scanResult.type==='error' && <XCircle size={100} className="text-red-500 mx-auto mb-6 drop-shadow-lg"/>}
                <h3 className={`text-4xl font-bold mb-4 ${scanResult.type==='duplicate' ? 'text-amber-600' : scanResult.type==='error'?'text-red-600':'text-slate-800'}`}>{scanResult.msg}</h3>
                {scanResult.person && <div className="text-xl bg-slate-50 p-6 rounded-2xl inline-block mt-4 min-w-[300px] border border-slate-200"><div className="font-bold text-3xl mb-2 text-slate-800">{scanResult.person.name}</div><div className="text-slate-500">{scanResult.person.email}</div><div className="text-slate-400 text-sm mt-2">{scanResult.person.phone}</div></div>}
                <div className="mt-10"><button onClick={()=>setScanResult(null)} className="bg-slate-800 text-white px-10 py-4 rounded-full shadow-lg font-bold text-lg hover:bg-slate-700 transition-transform active:scale-95">{t.scanNext}</button></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'draw' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center min-h-[500px]">
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-slate-700"><Trophy className="text-yellow-500"/> {t.drawTitle}</h2>
            {eligible.length < 2 ? <div className="py-20 text-slate-400 text-xl">{t.drawNeedMore}<br/><span className="text-sm mt-2 block">目前資格人數: {eligible.length}</span></div> : <LuckyWheel candidates={eligible} onComplete={(p)=>{setWinnerModal(p); setDrawHistory([p, ...drawHistory]);}} t={t} />}
            {drawHistory.length > 0 && (
                <div className="mt-12 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Winners List</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {drawHistory.map((h, i) => <span key={h.id} className="bg-white text-rose-600 px-4 py-2 rounded-lg text-sm font-bold border border-rose-100 shadow-sm flex items-center gap-2"><span className="bg-rose-100 text-rose-600 w-5 h-5 rounded-full flex items-center justify-center text-xs">{drawHistory.length - i}</span> {h.name}</span>)}
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
             <div className="p-4 bg-slate-50 border-b">
                 <form onSubmit={(e)=>{
                     e.preventDefault(); 
                     const dupCheck = checkDuplicate(adminForm.phone, adminForm.email);
                     if(dupCheck === 'phone'){ alert(t.errPhoneDup); return; }
                     if(dupCheck === 'email'){ alert(t.errEmailDup); return; }
                     
                     if(!adminForm.name||!adminForm.phone||!adminForm.email) return; 
                     setAttendees([{id:Date.now().toString(),...adminForm,checkedIn:false},...attendees]); setAdminForm({name:'',phone:'',email:''});
                 }} className="flex flex-wrap gap-2">
                     <input placeholder={t.name} value={adminForm.name} onChange={e=>setAdminForm({...adminForm,name:e.target.value})} className="px-3 py-2 text-sm border rounded-lg flex-1 min-w-[120px]" />
                     <input placeholder={t.phone} value={adminForm.phone} onChange={e=>setAdminForm({...adminForm,phone:e.target.value})} className="px-3 py-2 text-sm border rounded-lg flex-1 min-w-[120px]" />
                     <input placeholder={t.email} value={adminForm.email} onChange={e=>setAdminForm({...adminForm,email:e.target.value})} className="px-3 py-2 text-sm border rounded-lg flex-1 min-w-[150px]" />
                     <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Add</button>
                 </form>
             </div>
             <div className="p-4 border-b flex justify-between items-center bg-white">
                <span className="font-bold text-sm text-slate-500">{t.total}: {attendees.length} / {t.checkedIn}: {attendees.filter(x=>x.checkedIn).length}</span>
                <button onClick={()=>{const csv="Name,Phone,Email,Status\n"+attendees.map(p=>`${p.name},${p.phone},${p.email},${p.checkedIn?'Checked-in':'Pending'}`).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:'text/csv'})); a.download="GuestList.csv"; a.click();}} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600 transition-colors"><Download size={16}/> CSV Export</button>
             </div>
             <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                {attendees.map(p => (
                   <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div><div className="font-bold text-slate-800">{p.name}</div><div className="text-xs text-slate-500 flex items-center gap-2 mt-1"><span>{p.phone}</span><span className="text-slate-300">|</span><span className="flex items-center"><Mail size={10} className="mr-1"/>{p.email}</span></div></div>
                      <div className="flex gap-2 items-center">
                         <button 
                            onClick={()=>setAttendees(attendees.map(x=>x.id===p.id?{...x,checkedIn:!x.checkedIn}:x))} 
                            className={`px-4 py-2 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-sm ${p.checkedIn?'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200':'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}
                         >
                            {p.checkedIn ? t.checkinBtn + " (OK)" : t.cancelCheckin}
                         </button>
                         <button onClick={()=>setAttendees(attendees.filter(x=>x.id!==p.id))} className="p-2 md:p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t pb-safe z-30 flex justify-around p-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[ {id:'scan',icon:Camera,l:t.scanTitle}, {id:'draw',icon:Trophy,l:t.drawTitle}, {id:'list',icon:Users,l:t.listTitle} ].map(tab=>(<button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center p-3 transition-colors ${activeTab===tab.id?'text-indigo-600':'text-slate-400 hover:text-slate-600'}`}><tab.icon size={24} strokeWidth={activeTab===tab.id?2.5:2}/><span className="text-[10px] mt-1 font-medium">{tab.l}</span></button>))}
      </nav>
    </div>
  );
};

// --- 4. Main App ---
export default function App() {
  const [lang, setLang] = useState('zh'); const t = translations[lang];
  const [view, setView] = useState('home'); 
  const [attendees, setAttendees] = useState([]);
  const [drawHistory, setDrawHistory] = useState([]);

  useEffect(() => { const d=localStorage.getItem('eventpass_data'); if(d)setAttendees(JSON.parse(d)); const h=localStorage.getItem('eventpass_history'); if(h)setDrawHistory(JSON.parse(h)); }, []);
  useEffect(() => { localStorage.setItem('eventpass_data', JSON.stringify(attendees)); }, [attendees]);
  useEffect(() => { localStorage.setItem('eventpass_history', JSON.stringify(drawHistory)); }, [drawHistory]);

  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');
  
  // 核心檢查邏輯 (Return which field is dup)
  const checkDuplicate = (phone, email) => {
      const pClean = phone.trim();
      const eClean = email.trim().toLowerCase();
      
      const phoneDup = attendees.some(p => p.phone.trim() === pClean);
      if(phoneDup) return 'phone';
      
      const emailDup = attendees.some(p => p.email.trim().toLowerCase() === eClean);
      if(emailDup) return 'email';
      
      return null;
  };

  switch (view) {
    case 'guest': return <GuestPortal onBack={()=>setView('home')} t={t} checkDuplicate={checkDuplicate} />;
    case 'admin-login': return <AdminLogin onLogin={()=>setView('admin-dash')} onBack={()=>setView('home')} t={t} />;
    case 'admin-dash': return <AdminDashboard onLogout={()=>setView('home')} attendees={attendees} setAttendees={setAttendees} drawHistory={drawHistory} setDrawHistory={setDrawHistory} checkDuplicate={checkDuplicate} t={t} />;
    default:
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <button onClick={toggleLang} className="absolute top-6 right-6 text-white flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors font-medium z-10"><Globe size={18}/> {lang === 'zh' ? 'EN' : '中文'}</button>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"><div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"></div><div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[100px]"></div></div>
          <div className="mb-12 text-center z-10">
            <div className="flex justify-center mb-6"><div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl text-white"><QrCode size={48}/></div></div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">{t.appTitle}</h1>
            <p className="text-slate-400 text-xl font-light">{t.appSubtitle}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl px-4 z-10">
            <button onClick={() => setView('guest')} className="flex-1 flex flex-col items-start justify-between p-8 bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-[1.02] text-white rounded-3xl transition-all shadow-2xl group min-h-[200px] border border-white/10">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><UserPlus size={24}/></div>
              <div className="text-left w-full"><h3 className="font-bold text-2xl mb-2">{t.portalGuest}</h3><p className="text-blue-100 opacity-80">{t.portalGuestDesc}</p></div>
              <ArrowRight className="self-end mt-4 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"/>
            </button>
            <button onClick={() => setView('admin-login')} className="flex-1 flex flex-col items-start justify-between p-8 bg-slate-800 hover:bg-slate-750 hover:scale-[1.02] text-white rounded-3xl transition-all shadow-2xl border border-slate-700 group min-h-[200px]">
              <div className="bg-slate-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-rose-400"><Lock size={24}/></div>
              <div className="text-left w-full"><h3 className="font-bold text-2xl mb-2">{t.portalAdmin}</h3><p className="text-slate-400">{t.portalAdminDesc}</p></div>
              <ArrowRight className="self-end mt-4 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-slate-400"/>
            </button>
          </div>
          <div className="absolute bottom-8 text-slate-700 text-sm">Pass: {ADMIN_PASSWORD}</div>
        </div>
      );
  }
}