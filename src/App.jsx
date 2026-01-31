import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Loader2, Phone, User,
  Cloud, RefreshCw
} from 'lucide-react';

// --- Firebase 模組 ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, 
  doc, onSnapshot, query, orderBy, deleteDoc 
} from "firebase/firestore";

// =================================================================
// ✅ 已整合您的 Firebase 設定
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PASSWORD = "admin"; 

const translations = {
  zh: {
    title: "EventPass V17",
    sub: "雲端即時同步版",
    guestMode: "參加者登記",
    guestDesc: "手機登記，後台即時顯示",
    adminMode: "工作人員後台",
    adminDesc: "多裝置同步管理",
    login: "系統登入",
    pwdPlace: "輸入後台密碼",
    enter: "進入系統",
    wrongPwd: "密碼錯誤",
    regTitle: "活動登記",
    regSub: "資料將自動上傳至雲端",
    name: "姓名",
    phone: "電話號碼",
    email: "電子郵件",
    company: "公司/備註 (選填)",
    generateBtn: "送出登記",
    back: "返回",
    yourCode: "您的入場憑證",
    showToStaff: "資料已同步雲端！請出示此碼掃描簽到",
    next: "登記下一位",
    scan: "極速掃描",
    draw: "幸運轉盤",
    list: "雲端名單",
    total: "總人數",
    arrived: "已到場",
    scanCam: "啟動連續掃描",
    stopCam: "停止掃描",
    manual: "手動輸入 ID",
    success: "簽到成功 (雲端同步)",
    duplicate: "注意：已簽到過",
    error: "無效代碼",
    regSuccess: "登記成功",
    notFound: "查無此人",
    errPhone: "錯誤：此電話號碼已存在！",
    errEmail: "錯誤：此 Email 已存在！",
    errIncomplete: "請填寫所有必填欄位",
    drawBtn: "開始轉動 (空白鍵)",
    spinning: "好運轉動中...",
    winner: "✨ 恭喜中獎 ✨",
    claim: "確認領獎 (Enter)",
    needMore: "需要至少 2 位已簽到者",
    export: "導出名單",
    checkin: "簽到",
    cancel: "取消",
    logout: "登出",
    cloudStatus: "雲端連線正常"
  },
  en: {
    title: "EventPass V17",
    sub: "Cloud Sync Version",
    guestMode: "Guest Registration",
    guestDesc: "Register on phone, sync to admin",
    adminMode: "Admin Dashboard",
    adminDesc: "Multi-device Sync",
    login: "Admin Login",
    pwdPlace: "Password",
    enter: "Login",
    wrongPwd: "Wrong Password",
    regTitle: "Registration",
    regSub: "Data uploads to cloud instantly",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    company: "Company (Optional)",
    generateBtn: "Submit",
    back: "Back",
    yourCode: "Your Entry Pass",
    showToStaff: "Synced! Show QR to check-in",
    next: "Next Person",
    scan: "Speed Scan",
    draw: "Lucky Draw",
    list: "Cloud List",
    total: "Total",
    arrived: "Arrived",
    scanCam: "Start Speed Scan",
    stopCam: "Stop Scan",
    manual: "Manual Input",
    success: "Synced & Checked-in",
    duplicate: "Already Checked-in",
    error: "Invalid Code",
    regSuccess: "Registration Successful",
    notFound: "Not Found",
    errPhone: "Error: Phone already exists!",
    errEmail: "Error: Email already exists!",
    errIncomplete: "Fill all fields",
    drawBtn: "Spin (Space)",
    spinning: "Spinning...",
    winner: "✨ WINNER ✨",
    claim: "Confirm (Enter)",
    needMore: "Need 2+ checked-in guests",
    export: "Export CSV",
    checkin: "Check-in",
    cancel: "Cancel",
    logout: "Logout",
    cloudStatus: "Cloud Connected"
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
    const p = Array.from({length:300}).map(()=>({x:Math.random()*c.width, y:Math.random()*c.height,c:['#FFD700', '#FF4500', '#00BFFF', '#32CD32', '#FF69B4', '#FFFFFF'][Math.floor(Math.random()*6)],s:Math.random()*8+2,d:Math.random()*5}));
    const draw = () => { ctx.clearRect(0,0,c.width,c.height); p.forEach(i=>{i.y+=i.s;i.x+=Math.sin(i.d);if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}ctx.fillStyle=i.c;ctx.beginPath();ctx.arc(i.x,i.y,i.s/2,0,Math.PI*2);ctx.fill();}); requestAnimationFrame(draw); };
    draw();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
};

// --- 獨立頁面 ---

const LoginView = ({ t, onLogin, onBack }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center">
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
    <div className="relative bg-white/10 border border-white/20 p-8 rounded-3xl w-full max-w-sm backdrop-blur-xl shadow-2xl animate-in zoom-in">
      <button onClick={onBack} className="text-white/60 hover:text-white mb-6 flex items-center transition-colors"><ChevronLeft size={20}/> {t.sub}</button>
      <h2 className="text-3xl font-bold text-white mb-2">{t.login}</h2>
      <div className="flex items-center gap-2 mb-6 text-emerald-400 text-xs font-mono"><Cloud size={14}/> {t.cloudStatus}</div>
      <form onSubmit={e=>{e.preventDefault(); if(e.target[0].value===ADMIN_PASSWORD)onLogin(); else alert(t.wrongPwd);}}>
        <input type="password" autoFocus placeholder={t.pwdPlace} className="w-full bg-slate-800/50 border border-white/10 text-white p-4 rounded-xl mb-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-center tracking-widest"/>
        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95">{t.enter}</button>
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
    
    // 1. 本地快速檢查 (基於已同步的列表)
    const dup = checkDuplicate(cleanPhone, cleanEmail);
    if(dup === 'phone') { setErr(t.errPhone); setLoading(false); return; }
    if(dup === 'email') { setErr(t.errEmail); setLoading(false); return; }

    try {
        // 2. 寫入 Firebase
        const docRef = await addDoc(collection(db, "attendees"), {
            name: form.name,
            phone: cleanPhone,
            email: cleanEmail,
            company: form.company,
            checkedIn: false,
            checkInTime: null,
            createdAt: new Date().toISOString()
        });
        
        setNewId(docRef.id); // 使用 Firebase 生成的 ID
        setStep(2);
    } catch (error) {
        console.error("Error adding document: ", error);
        setErr("Upload Failed. Check network.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white text-center relative">
          <button onClick={onBack} className="absolute left-6 top-6 text-white/80 hover:text-white z-10"><ChevronLeft/></button>
          <h2 className="text-2xl font-bold mt-2">{t.regTitle}</h2>
          <div className="flex justify-center items-center gap-1 text-blue-100 text-sm mt-1 opacity-90"><Cloud size={14}/> {t.regSub}</div>
        </div>
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center border border-red-100 animate-pulse"><AlertTriangle size={16} className="mr-2"/>{err}</div>}
              <div className="space-y-4">
                <div className="relative"><User className="absolute top-3.5 left-3.5 text-slate-400" size={18}/><input required className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder={t.name + " *"} value={form.name} onChange={e=>{setErr('');setForm({...form,name:e.target.value})}} /></div>
                <div className="relative"><Phone className="absolute top-3.5 left-3.5 text-slate-400" size={18}/><input required type="tel" className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder={t.phone + " *"} value={form.phone} onChange={e=>{setErr('');setForm({...form,phone:e.target.value})}} /></div>
                <div className="relative"><Mail className="absolute top-3.5 left-3.5 text-slate-400" size={18}/><input required type="email" className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder={t.email + " *"} value={form.email} onChange={e=>{setErr('');setForm({...form,email:e.target.value})}} /></div>
                <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder={t.company} value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
              </div>
              <button disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 mt-4 flex justify-center items-center disabled:opacity-70">{loading ? <Loader2 className="animate-spin mr-2"/> : null}{t.generateBtn}</button>
            </form>
          ) : (
            <div className="text-center animate-in zoom-in">
              <div className="bg-white p-4 border-2 border-dashed border-blue-200 rounded-2xl inline-block mb-6 shadow-sm relative">
                {/* 雲端版：只需傳送 ID */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({id: newId}))}`} alt="QR" className="w-48 h-48 object-contain"/>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1"><Cloud size={10}/> CLOUD SAVED</div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{form.name}</h3>
              <p className="text-slate-500 text-sm mb-8">{t.showToStaff}</p>
              <button onClick={()=>{setStep(1);setForm({name:'',phone:'',email:'',company:''})}} className="w-full bg-blue-50 text-blue-600 p-4 rounded-xl font-bold hover:bg-blue-100 transition-colors">{t.next}</button>
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

  // Firebase 雲端掃描處理
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

      // 1. 在雲端資料中尋找 (attendees 已經是即時同步的)
      let targetId = data.id || data;
      // 兼容舊格式
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
          // 2. 更新雲端資料庫
          const personRef = doc(db, "attendees", person.id);
          await updateDoc(personRef, {
              checkedIn: true,
              checkInTime: new Date().toISOString()
          });
          // 不需要手動 setAttendees，onSnapshot 會自動更新畫面
          processResult('success', t.success, person);
      }
    } catch (e) {
      console.error(e);
    }
  }, [attendees, t]);

  useEffect(() => {
    if (!isScan || tab !== 'scan') return;
    let s;
    const init = () => { if(!window.Html5QrcodeScanner)return; s=new window.Html5QrcodeScanner("reader",{fps:15,qrbox:{width:250,height:250},aspectRatio:1.0,showTorchButtonIfSupported:true},false); s.render(handleScan,()=>{}); };
    if(window.Html5QrcodeScanner) init(); else { const sc = document.createElement('script'); sc.src = "https://unpkg.com/html5-qrcode"; sc.onload = init; document.body.appendChild(sc); }
    return () => { if(s) try{s.clear()}catch(e){} };
  }, [isScan, tab, handleScan]);

  // 更新簽到狀態 (Firebase)
  const toggleCheckIn = async (person) => {
      const personRef = doc(db, "attendees", person.id);
      await updateDoc(personRef, {
          checkedIn: !person.checkedIn,
          checkInTime: !person.checkedIn ? new Date().toISOString() : null
      });
  };

  // 刪除資料 (Firebase)
  const deletePerson = async (id) => {
      if(confirm('Delete this user?')) {
          await deleteDoc(doc(db, "attendees", id));
      }
  };

  // 抽獎邏輯 (Firebase)
  const Wheel = ({ list }) => {
    const [rot, setRot] = useState(0);
    const [spin, setSpin] = useState(false);
    useEffect(() => { const k=(e)=>{if(e.code==='Space'&&!spin&&list.length>=2){e.preventDefault();run()}}; window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k); }, [spin, list]);
    
    const run = async () => {
      setSpin(true);
      const winIdx = Math.floor(Math.random()*list.length);
      const angle = 360/list.length;
      setRot(rot+1800+(360-winIdx*angle)+(Math.random()-0.5)*angle*0.8);
      
      // 動畫結束後
      setTimeout(async () => {
          setSpin(false);
          const winner = list[winIdx];
          setWinner(winner);
          
          // 寫入中獎紀錄到 Firebase
          await addDoc(collection(db, "winners"), {
              attendeeId: winner.id,
              name: winner.name,
              phone: winner.phone,
              wonAt: new Date().toISOString()
          });
      }, 4500);
    };

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full border-[12px] border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.4)] overflow-hidden bg-white transition-all duration-500 box-content">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/50 pointer-events-none z-10 opacity-50"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-xl filter"></div>
          <svg width="100%" height="100%" viewBox="0 0 300 300" style={{transform:`rotate(${rot}deg)`, transition: spin?'transform 4.5s cubic-bezier(0.2,0.8,0.2,1)':'none'}}>
            {list.map((p,i)=>{ const a=360/list.length;const s=i*a,e=(i+1)*a;const x1=150+150*Math.cos((s-90)*Math.PI/180),y1=150+150*Math.sin((s-90)*Math.PI/180);const x2=150+150*Math.cos((e-90)*Math.PI/180),y2=150+150*Math.sin((e-90)*Math.PI/180);const c=['#FF4136','#FF851B','#FFDC00','#2ECC40','#0074D9','#B10DC9'];return <path key={i} d={`M 150 150 L ${x1} ${y1} A 150 150 0 ${e-s<=180?0:1} 1 ${x2} ${y2} Z`} fill={c[i%6]} stroke="#fff" strokeWidth="2"/> })}
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white"><Trophy size={24} className="text-white"/></div>
        </div>
        <button disabled={spin} onClick={run} className="mt-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-12 py-4 rounded-full font-bold text-2xl shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 border border-slate-700">{spin?t.spinning:t.drawBtn}</button>
      </div>
    );
  };

  const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h=>h.attendeeId===p.id));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-xl"><QrCode className="text-amber-500"/> {t.adminMode}</div>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-500 text-sm flex items-center gap-2"><LogOut size={16}/> {t.logout}</button>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-center mb-8 bg-white p-1 rounded-2xl shadow-sm w-fit mx-auto border border-slate-100">
          {[ {id:'scan',icon:ScanLine,l:t.scan}, {id:'draw',icon:Trophy,l:t.draw}, {id:'list',icon:Users,l:t.list} ].map(i=> (
            <button key={i.id} onClick={()=>{setTab(i.id);setIsScan(false);setScanRes(null)}} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${tab===i.id?'bg-slate-900 text-white shadow-md':'text-slate-500 hover:bg-slate-50'}`}><i.icon size={18}/> {i.l}</button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 min-h-[600px] overflow-hidden relative">
          {tab === 'scan' && (
            <div className="h-full flex flex-col items-center justify-center p-8 min-h-[600px]">
              {isScan ? (
                <div className="bg-black rounded-3xl overflow-hidden relative w-full max-w-lg shadow-2xl border-4 border-slate-900">
                  <div id="reader" className="w-full"></div>
                  {scanRes && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 ${scanRes.type==='success'?'bg-emerald-500/80':scanRes.type==='duplicate'?'bg-amber-500/80':'bg-red-500/80'}`}>
                        <div className="bg-white p-6 rounded-full shadow-lg mb-4 animate-bounce">
                            {scanRes.type==='success' ? <CheckCircle size={48} className="text-emerald-600"/> : scanRes.type==='duplicate' ? <AlertTriangle size={48} className="text-amber-600"/> : <XCircle size={48} className="text-red-600"/>}
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md text-center px-4">{scanRes.msg}</h3>
                        {scanRes.p && <p className="text-white/90 text-xl font-bold">{scanRes.p.name}</p>}
                    </div>
                  )}
                  <button onClick={()=>setIsScan(false)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-red-500 hover:text-white text-white backdrop-blur px-6 py-2 rounded-full text-sm transition-colors z-20">{t.stopCam}</button>
                </div>
              ) : (
                <button onClick={()=>setIsScan(true)} className="group flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-slate-300 rounded-3xl hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Camera size={40}/></div>
                  <span className="font-bold text-slate-500 group-hover:text-emerald-600">{t.scanCam}</span>
                </button>
              )}
            </div>
          )}

          {tab === 'draw' && (
            <div className="h-full flex flex-col items-center justify-center p-8 min-h-[600px]">
              {eligible.length < 2 ? <div className="text-center text-slate-400"><Trophy size={64} className="mx-auto mb-4 opacity-20"/><p>{t.needMore}</p></div> : <Wheel list={eligible} />}
            </div>
          )}

          {tab === 'list' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                <div className="font-bold text-slate-600 flex items-center gap-2"><Cloud size={16} className="text-blue-500"/> {t.total}: {attendees.length} | <span className="text-emerald-600">{t.arrived}: {attendees.filter(x=>x.checkedIn).length}</span></div>
                <button onClick={()=>{const csv="Name,Phone,Email,Status\n"+attendees.map(p=>`${p.name},${p.phone},${p.email},${p.checkedIn?'Checked':'Pending'}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:'text/csv'}));a.download="list.csv";a.click();}} className="text-xs font-bold bg-white border px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"><Download size={14}/> CSV</button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0"><tr><th className="p-3 pl-4">{t.name}</th><th className="p-3">{t.phone}</th><th className="p-3">{t.email}</th><th className="p-3 text-right">{t.checkin}</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{attendees.map(p=>(<tr key={p.id} className="hover:bg-slate-50"><td className="p-3 pl-4 font-bold text-slate-700">{p.name}</td><td className="p-3 text-slate-500 text-sm font-mono">{p.phone}</td><td className="p-3 text-slate-500 text-sm">{p.email}</td><td className="p-3 text-right"><button onClick={()=>toggleCheckIn(p)} className={`px-4 py-1 rounded-full text-xs font-bold border ${p.checkedIn?'bg-emerald-50 text-emerald-600 border-emerald-200':'bg-white text-slate-400 border-slate-200'}`}>{p.checkedIn?t.checkin:t.cancel}</button><button onClick={()=>deletePerson(p.id)} className="ml-2 p-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {winner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in backdrop-blur-md">
          <Confetti />
          <div className="relative text-center w-full max-w-5xl mx-auto px-4 animate-in zoom-in duration-500">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-500/30 to-transparent blur-[100px] pointer-events-none"></div>
            <Trophy className="mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-bounce" size={140} />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-[0.5em] text-shadow-lg opacity-80">{t.winner}</h2>
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 mb-6 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] scale-110">{winner.name}</h1>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 inline-block px-10 py-4 rounded-full mb-12"><p className="text-3xl text-white/90 font-mono tracking-widest">{winner.phone}</p></div>
            <div><button autoFocus onClick={()=>setWinner(null)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-16 py-6 rounded-full font-bold text-3xl shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-transform hover:scale-105 active:scale-95 border-2 border-white/30">{t.claim}</button></div>
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

  // --- Firebase 即時監聽 (Realtime Listeners) ---
  useEffect(() => {
    if (!db) return;
    
    // 1. 監聽參加者名單 (按時間排序)
    const q = query(collection(db, "attendees"), orderBy("createdAt", "desc"));
    const unsubAttendees = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAttendees(list);
    });

    // 2. 監聽中獎名單
    const unsubWinners = onSnapshot(collection(db, "winners"), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDrawHistory(list);
    });

    return () => { unsubAttendees(); unsubWinners(); };
  }, []);

  const checkDuplicate = (p, e) => {
    if(attendees.some(x => normalizePhone(x.phone) === normalizePhone(p))) return 'phone';
    if(attendees.some(x => normalizeEmail(x.email) === normalizeEmail(e))) return 'email';
    return null;
  };

  // onRegister 傳遞給 GuestView 來寫入 Firebase
  const handleGuestRegister = async (newPerson) => {
      // 這裡實際上是由 GuestView 內部的 addDoc 完成的，這裡只是佔位或做額外處理
  };

  if(view === 'landing') return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>
      <button onClick={()=>setLang(l=>l==='zh'?'en':'zh')} className="absolute top-6 right-6 text-white/50 hover:text-white flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full transition-all z-10"><Globe size={16}/> {lang.toUpperCase()}</button>
      <div className="z-10 text-center mb-16"><div className="inline-flex p-6 bg-white/5 rounded-[2rem] mb-8 border border-white/10 backdrop-blur shadow-[0_0_50px_rgba(79,70,229,0.3)]"><QrCode size={64} className="text-indigo-400"/></div><h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-6 tracking-tight">{t.title}</h1><p className="text-indigo-300/80 text-xl font-light tracking-widest uppercase">{t.sub}</p></div>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl z-10 px-4">
        <button onClick={()=>setView('guest')} className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-10 rounded-[2.5rem] text-left transition-all hover:scale-[1.02] shadow-2xl border border-white/10"><div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity"><UserPlus size={120} className="text-white"/></div><h3 className="text-3xl font-bold text-white mb-2">{t.guestMode}</h3><p className="text-blue-100 text-lg opacity-80">{t.guestDesc}</p><div className="mt-12 flex items-center text-white font-bold text-lg group-hover:translate-x-2 transition-transform bg-white/20 w-fit px-6 py-2 rounded-full backdrop-blur-sm">{t.enter} <ArrowRight size={20} className="ml-2"/></div></button>
        <button onClick={()=>setView('login')} className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[2.5rem] text-left transition-all hover:scale-[1.02] border border-white/10 shadow-2xl"><div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity text-white"><Lock size={120}/></div><h3 className="text-3xl font-bold text-white mb-2">{t.adminMode}</h3><p className="text-slate-400 text-lg">{t.adminDesc}</p><div className="mt-12 flex items-center text-white font-bold text-lg group-hover:translate-x-2 transition-transform bg-white/10 w-fit px-6 py-2 rounded-full backdrop-blur-sm">{t.enter} <ArrowRight size={20} className="ml-2"/></div></button>
      </div>
    </div>
  );
  if(view === 'guest') return <GuestView t={t} onBack={()=>setView('landing')} onRegister={handleGuestRegister} checkDuplicate={checkDuplicate} />;
  if(view === 'login') return <LoginView t={t} onLogin={()=>setView('admin')} onBack={()=>setView('landing')} />;
  if(view === 'admin') return <AdminDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} drawHistory={drawHistory} setDrawHistory={setDrawHistory} />;
}