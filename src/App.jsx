import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, Zap
} from 'lucide-react';

// --- Firebase 模組 ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, 
  doc, onSnapshot, query, orderBy, deleteDoc 
} from "firebase/firestore";

// =================================================================
// ✅ Firebase Config (已整合您的設定)
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDUZeeaWvQZJORdDv4PdAHQK-SqXFIDsy4",
  authDomain: "eventpass-77522.firebaseapp.com",
  projectId: "eventpass-77522",
  storageBucket: "eventpass-77522.firebasestorage.app",
  messagingSenderId: "504395632009",
  appId: "1:504395632009:web:3c13603d03203dece8a558",
  measurementId: "G-SP74GNKJFQ"
};

// 初始化 Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase 初始化失敗:", error);
}

const ADMIN_PASSWORD = "admin"; 

const translations = {
  zh: {
    title: "Tesla Annual Dinner",
    sub: "2025 年度晚宴",
    guestMode: "參加者登記",
    guestDesc: "Guest Registration",
    adminMode: "工作人員入口",
    adminDesc: "Staff Only",
    login: "Staff Login",
    pwdPlace: "請輸入後台密碼",
    enter: "登入系統",
    wrongPwd: "密碼錯誤",
    regTitle: "賓客登記",
    regSub: "Welcome to Tesla Event",
    name: "姓名 (Name)",
    phone: "電話 (Mobile)",
    email: "電子郵件 (Email)",
    generateBtn: "確認登記 / Submit",
    back: "返回",
    yourCode: "您的入場憑證",
    showToStaff: "資料已同步！請截圖並出示給工作人員掃描",
    next: "完成 (Finish)",
    scan: "極速掃描",
    draw: "幸運轉盤",
    list: "賓客名單",
    total: "總人數",
    arrived: "已到場",
    scanCam: "啟動掃描鏡頭",
    stopCam: "停止掃描",
    manual: "手動輸入 ID",
    success: "簽到成功 (Verified)",
    duplicate: "重複：此人已入場",
    error: "無效代碼",
    regSuccess: "登記成功",
    notFound: "查無此人",
    errPhone: "錯誤：此電話號碼已存在",
    errEmail: "錯誤：此 Email 已存在",
    errIncomplete: "請填寫所有必填欄位",
    drawBtn: "啟動轉盤 (Space)",
    spinning: "加速中...",
    winner: "✨ GRAND PRIZE ✨",
    claim: "確認領獎 (Enter)",
    needMore: "等待更多賓客入場...",
    export: "導出名單",
    checkin: "簽到",
    cancel: "取消",
    logout: "登出",
    cloudStatus: "雲端連線正常"
  },
  en: {
    title: "Tesla Annual Dinner",
    sub: "2025 Event",
    guestMode: "Guest Registration",
    guestDesc: "For Attendees",
    adminMode: "Staff Portal",
    adminDesc: "For Event Team",
    login: "Staff Login",
    pwdPlace: "Password",
    enter: "Login",
    wrongPwd: "Wrong Password",
    regTitle: "Registration",
    regSub: "Welcome to Tesla Event",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    generateBtn: "Submit Registration",
    back: "Back",
    yourCode: "Entry Pass",
    showToStaff: "Synced! Please screenshot & show to staff.",
    next: "Finish",
    scan: "Scanner",
    draw: "Lucky Draw",
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
    errIncomplete: "Fill all fields",
    drawBtn: "Spin (Space)",
    spinning: "Accelerating...",
    winner: "✨ GRAND PRIZE ✨",
    claim: "Confirm (Enter)",
    needMore: "Waiting for guests...",
    export: "Export CSV",
    checkin: "Check-in",
    cancel: "Cancel",
    logout: "Logout",
    cloudStatus: "Connected"
  }
};

// --- 工具 ---
const normalizePhone = (p) => String(p).replace(/[^0-9]/g, '');
const normalizeEmail = (e) => String(e).trim().toLowerCase();

// --- 組件 ---
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

// --- 獨立頁面 (全部強制置中 justify-center) ---

const LoginView = ({ t, onLogin, onBack }) => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    {/* 背景特效 */}
    <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

    <div className="relative bg-black/40 border border-white/10 p-10 rounded-3xl w-full max-w-sm backdrop-blur-2xl shadow-2xl animate-in zoom-in duration-500">
      <button onClick={onBack} className="text-white/50 hover:text-white mb-8 flex items-center transition-colors text-sm uppercase tracking-widest"><ChevronLeft size={16} className="mr-1"/> {t.back}</button>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{t.login}</h2>
        <div className="flex justify-center items-center gap-2 text-emerald-500 text-xs font-mono tracking-wider"><Cloud size={12}/> {t.cloudStatus}</div>
      </div>

      <form onSubmit={e=>{e.preventDefault(); if(e.target[0].value===ADMIN_PASSWORD)onLogin(); else alert(t.wrongPwd);}}>
        <input type="password" autoFocus placeholder={t.pwdPlace} className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl mb-6 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-center tracking-[0.3em] placeholder:tracking-normal placeholder:text-white/20"/>
        <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-900/30 transition-all active:scale-95 uppercase tracking-widest text-sm">{t.enter}</button>
      </form>
    </div>
  </div>
);

const GuestView = ({ t, onBack, checkDuplicate }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:'',phone:'',email:'',company:''});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [newId, setNewId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);

    const cleanPhone = normalizePhone(form.phone);
    const cleanEmail = normalizeEmail(form.email);
    
    const dup = checkDuplicate(cleanPhone, cleanEmail);
    if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; }
    if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; }

    try {
        if (!db) throw new Error("Firebase not initialized");
        const docRef = await addDoc(collection(db, "attendees"), {
            name: form.name,
            phone: cleanPhone,
            email: cleanEmail,
            company: form.company,
            checkedIn: false,
            checkInTime: null,
            createdAt: new Date().toISOString()
        });
        setNewId(docRef.id);
        setStep(2);
    } catch (error) {
        console.error("Error adding document: ", error);
        setErr("Network Error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-950 to-neutral-950 pointer-events-none"></div>
      
      <div className="relative bg-neutral-900/80 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="bg-red-600 p-8 text-white text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
          <button onClick={onBack} className="absolute left-6 top-6 text-white/70 hover:text-white z-10"><ChevronLeft/></button>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold tracking-wide">{t.regTitle}</h2>
            <p className="text-white/80 text-xs mt-2 uppercase tracking-widest">{t.regSub}</p>
          </div>
        </div>
        
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {err && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center animate-pulse"><AlertTriangle size={16} className="mr-2"/>{err}</div>}
              
              <div className="space-y-4">
                {['name', 'phone', 'email'].map((field) => (
                    <div key={field} className="relative group">
                        <div className="absolute top-3.5 left-4 text-white/30 group-focus-within:text-red-500 transition-colors">
                            {field === 'name' ? <User size={18}/> : field === 'phone' ? <Phone size={18}/> : <Mail size={18}/>}
                        </div>
                        <input 
                            required 
                            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                            className="w-full bg-white/5 border border-white/10 text-white p-3 pl-12 rounded-xl outline-none focus:border-red-500 focus:bg-white/10 transition-all placeholder:text-white/20" 
                            placeholder={t[field]} 
                            value={form[field]} 
                            onChange={e=>{setErr('');setForm({...form,[field]:e.target.value})}} 
                        />
                    </div>
                ))}
              </div>

              <button disabled={loading} className="w-full bg-white text-red-600 hover:bg-gray-100 p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 mt-6 flex justify-center items-center disabled:opacity-70 uppercase tracking-wider text-sm">
                  {loading ? <Loader2 className="animate-spin mr-2"/> : null}{t.generateBtn}
              </button>
            </form>
          ) : (
            <div className="text-center animate-in zoom-in duration-300">
              <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({id: newId}))}`} alt="QR" className="w-48 h-48 object-contain"/>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1 font-bold tracking-wider"><Cloud size={10}/> SAVED</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{form.name}</h3>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">{t.showToStaff}</p>
              <button onClick={()=>{setStep(1);setForm({name:'',phone:'',email:'',company:''})}} className="w-full bg-white/10 text-white border border-white/20 p-4 rounded-xl font-bold hover:bg-white/20 transition-colors uppercase tracking-widest text-sm">{t.next}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ t, onLogout, attendees, setAttendees, drawHistory, setDrawHistory }) => {
  const [tab, setTab] = useState('scan');
  const [isScan, setIsScan] = useState(false);
  const [scanRes, setScanRes] = useState(null);
  const [winner, setWinner] = useState(null);
  const lastScanTimeRef = useRef(0);
  const lastScannedCodeRef = useRef('');

  const playSound = (type) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if(type === 'success') { osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime); gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.1); osc.start(); osc.stop(ctx.currentTime+0.1); }
    else { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime); gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.2); osc.start(); osc.stop(ctx.currentTime+0.2); }
  };

  const handleScan = useCallback(async (text) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1500) return;
    if (text === lastScannedCodeRef.current && now - lastScanTimeRef.current < 5000) return;

    try {
      let data = JSON.parse(text);
      lastScanTimeRef.current = now;
      lastScannedCodeRef.current = text;

      const processResult = (resultType, msg, person) => {
          setScanRes({ type: resultType, msg, p: person });
          playSound(resultType === 'success' ? 'success' : 'error');
          setTimeout(() => setScanRes(null), 2000);
      };

      let targetId = data.id || data;
      if (!targetId && data.type === 'new_reg') {
          const cleanP = normalizePhone(data.phone);
          const p = attendees.find(x => x.phone === cleanP);
          if (p) targetId = p.id;
      }

      const person = attendees.find(x => x.id === targetId);

      if (!person) {
          processResult('error', t.notFound, null);
      } else if (person.checkedIn) {
          processResult('duplicate', t.duplicate, person);
      } else {
          if (!db) return;
          const personRef = doc(db, "attendees", person.id);
          await updateDoc(personRef, {
              checkedIn: true,
              checkInTime: new Date().toISOString()
          });
          processResult('success', t.success, person);
      }
    } catch (e) { console.error(e); }
  }, [attendees, t]);

  useEffect(() => {
    if (!isScan || tab !== 'scan') return;
    let s;
    const init = () => { if(!window.Html5QrcodeScanner)return; s=new window.Html5QrcodeScanner("reader",{fps:15,qrbox:{width:250,height:250},aspectRatio:1.0,showTorchButtonIfSupported:true},false); s.render(handleScan,()=>{}); };
    if(window.Html5QrcodeScanner) init(); else { const sc = document.createElement('script'); sc.src = "https://unpkg.com/html5-qrcode"; sc.onload = init; document.body.appendChild(sc); }
    return () => { if(s) try{s.clear()}catch(e){} };
  }, [isScan, tab, handleScan]);

  const toggleCheckIn = async (person) => {
      if (!db) return;
      const personRef = doc(db, "attendees", person.id);
      await updateDoc(personRef, { checkedIn: !person.checkedIn, checkInTime: !person.checkedIn ? new Date().toISOString() : null });
  };

  const deletePerson = async (id) => {
      if(confirm('Delete user?')) { if (!db) return; await deleteDoc(doc(db, "attendees", id)); }
  };

  const Wheel = ({ list }) => {
    const [rot, setRot] = useState(0);
    const [spin, setSpin] = useState(false);
    useEffect(() => { const k=(e)=>{if(e.code==='Space'&&!spin&&list.length>=2){e.preventDefault();run()}}; window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k); }, [spin, list]);
    
    const run = async () => {
      setSpin(true);
      const winIdx = Math.floor(Math.random()*list.length);
      const angle = 360/list.length;
      setRot(rot+1800+(360-winIdx*angle)+(Math.random()-0.5)*angle*0.8);
      
      setTimeout(async () => {
          setSpin(false);
          const winner = list[winIdx];
          setWinner(winner);
          if (!db) return;
          await addDoc(collection(db, "winners"), { attendeeId: winner.id, name: winner.name, phone: winner.phone, wonAt: new Date().toISOString() });
      }, 4500);
    };

    return (
      <div className="flex flex-col items-center justify-center h-full">
        {/* Tesla 風格轉盤 */}
        <div className="relative w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full border-[8px] border-white/20 shadow-[0_0_50px_rgba(232,33,39,0.3)] overflow-hidden bg-neutral-900 transition-all duration-500 box-content">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/10 pointer-events-none z-10"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
          <svg width="100%" height="100%" viewBox="0 0 300 300" style={{transform:`rotate(${rot}deg)`, transition: spin?'transform 4.5s cubic-bezier(0.2,0.8,0.2,1)':'none'}}>
            {list.map((p,i)=>{ const a=360/list.length;const s=i*a,e=(i+1)*a;const x1=150+150*Math.cos((s-90)*Math.PI/180),y1=150+150*Math.sin((s-90)*Math.PI/180);const x2=150+150*Math.cos((e-90)*Math.PI/180),y2=150+150*Math.sin((e-90)*Math.PI/180);
            // 黑紅銀配色
            const c=['#E82127', '#171717', '#404040', '#E82127', '#171717', '#A3A3A3'];
            return <path key={i} d={`M 150 150 L ${x1} ${y1} A 150 150 0 ${e-s<=180?0:1} 1 ${x2} ${y2} Z`} fill={c[i%6]} stroke="#000" strokeWidth="1"/> })}
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-neutral-900 rounded-full shadow-lg flex items-center justify-center border-4 border-white/20"><Zap size={32} className="text-red-500 fill-current"/></div>
        </div>
        <button disabled={spin} onClick={run} className="mt-12 bg-white text-black px-12 py-4 rounded-full font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-200 hover:scale-105 transition-all disabled:opacity-50 border border-white tracking-widest uppercase">{spin?t.spinning:t.drawBtn}</button>
      </div>
    );
  };

  const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h=>h.attendeeId===p.id));

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-white">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl"><div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white"><QrCode size={18}/></div> {t.adminMode}</div>
        <button onClick={onLogout} className="text-white/50 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"><LogOut size={16}/> {t.logout}</button>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="flex justify-center mb-8 bg-white/5 p-1 rounded-2xl shadow-lg border border-white/10 w-fit backdrop-blur-sm">
          {[ {id:'scan',icon:ScanLine,l:t.scan}, {id:'draw',icon:Trophy,l:t.draw}, {id:'list',icon:Users,l:t.list} ].map(i=> (
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
                        <div className="bg-white text-black p-6 rounded-full shadow-lg mb-4 animate-bounce">
                            {scanRes.type==='success' ? <CheckCircle size={48}/> : scanRes.type==='duplicate' ? <AlertTriangle size={48}/> : <XCircle size={48}/>}
                        </div>
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

          {tab === 'draw' && (
            <div className="h-full w-full flex flex-col items-center justify-center p-8">
              {eligible.length < 2 ? <div className="text-center text-white/30"><Trophy size={80} className="mx-auto mb-6 opacity-20"/><p className="text-xl">{t.needMore}</p></div> : <Wheel list={eligible} />}
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
                  <thead className="text-xs text-white/40 uppercase tracking-widest border-b border-white/10"><tr><th className="p-4 pl-6">{t.name}</th><th className="p-4">{t.phone}</th><th className="p-4">{t.email}</th><th className="p-4 text-right">{t.checkin}</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {attendees.map(p=>(
                      <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 pl-6 font-bold text-white">{p.name}</td>
                        <td className="p-4 text-white/60 text-sm font-mono">{p.phone}</td>
                        <td className="p-4 text-white/60 text-sm">{p.email}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={()=>toggleCheckIn(p)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${p.checkedIn?'bg-emerald-500/20 text-emerald-400 border-emerald-500/50':'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}>{p.checkedIn?t.checkin:t.cancel}</button>
                          <button onClick={()=>deletePerson(p.id)} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {winner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-500 backdrop-blur-xl">
          <Confetti />
          <div className="relative text-center w-full max-w-5xl mx-auto px-4 animate-in zoom-in-50 duration-500 flex flex-col items-center">
            {/* 聚光燈效果 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            
            <Trophy className="text-yellow-400 mb-8 drop-shadow-[0_0_50px_rgba(250,204,21,0.6)] animate-bounce" size={120} />
            <h2 className="text-2xl md:text-3xl font-bold text-white/60 mb-4 uppercase tracking-[0.5em]">{t.winner}</h2>
            <h1 className="text-6xl md:text-9xl font-black text-white mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110">{winner.name}</h1>
            <div className="bg-white/10 border border-white/20 backdrop-blur-md px-10 py-4 rounded-full mb-12"><p className="text-2xl text-white font-mono tracking-widest">{winner.phone}</p></div>
            <button autoFocus onClick={()=>setWinner(null)} className="bg-white text-black hover:bg-gray-200 px-16 py-5 rounded-full font-bold text-2xl shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 active:scale-95 uppercase tracking-widest">{t.claim}</button>
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

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "attendees"), orderBy("createdAt", "desc"));
    const unsubAttendees = onSnapshot(q, (snapshot) => { setAttendees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const unsubWinners = onSnapshot(collection(db, "winners"), (snapshot) => { setDrawHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => { unsubAttendees(); unsubWinners(); };
  }, []);

  const checkDuplicate = (p, e) => {
    if(attendees.some(x => normalizePhone(x.phone) === normalizePhone(p))) return 'phone';
    if(attendees.some(x => normalizeEmail(x.email) === normalizeEmail(e))) return 'email';
    return null;
  };

  if(view === 'landing') return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 pointer-events-none"></div>
      
      <button onClick={()=>setLang(l=>l==='zh'?'en':'zh')} className="absolute top-6 right-6 text-white/50 hover:text-white flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full transition-all z-10 text-xs font-mono"><Globe size={14}/> {lang.toUpperCase()}</button>
      
      <div className="z-10 text-center mb-16 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.4)] mb-8 animate-in zoom-in duration-700">
            <QrCode size={48} className="text-white"/>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{t.title}</h1>
        <p className="text-white/40 text-xl font-light tracking-[0.3em] uppercase">{t.sub}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl z-10 px-4">
        <button onClick={()=>setView('guest')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-10 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><UserPlus size={120} className="text-white"/></div>
            <h3 className="text-3xl font-bold text-white mb-2">{t.guestMode}</h3>
            <p className="text-white/50 text-lg">{t.guestDesc}</p>
            <div className="mt-12 flex items-center text-black font-bold text-lg group-hover:translate-x-2 transition-transform bg-white w-fit px-6 py-2 rounded-full">{t.enter} <ArrowRight size={20} className="ml-2"/></div>
        </button>
        <button onClick={()=>setView('login')} className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-10 rounded-[2rem] text-left transition-all hover:scale-[1.02] shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Lock size={120} className="text-white"/></div>
            <h3 className="text-3xl font-bold text-white mb-2">{t.adminMode}</h3>
            <p className="text-white/50 text-lg">{t.adminDesc}</p>
            <div className="mt-12 flex items-center text-white font-bold text-lg group-hover:translate-x-2 transition-transform bg-red-600 w-fit px-6 py-2 rounded-full">{t.enter} <ArrowRight size={20} className="ml-2"/></div>
        </button>
      </div>
    </div>
  );
  if(view === 'guest') return <GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} />;
  if(view === 'login') return <LoginView t={t} onLogin={()=>setView('admin')} onBack={()=>setView('landing')} />;
  if(view === 'admin') return <AdminDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} drawHistory={drawHistory} setDrawHistory={setDrawHistory} />;
}