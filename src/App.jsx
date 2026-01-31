import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, QrCode, Trophy, Download, Plus, CheckCircle, 
  XCircle, Search, Trash2, ScanLine, Camera, 
  ArrowRight, UserPlus, LogOut, Globe, Mail,
  Lock, ChevronLeft, AlertTriangle, Star
} from 'lucide-react';

// --- 1. 設定 ---
const ADMIN_PASSWORD = "admin"; 

const translations = {
  zh: {
    title: "EventPass V13",
    sub: "豪華視覺特效版",
    guestMode: "參加者登記",
    guestDesc: "自助獲取入場憑證",
    adminMode: "工作人員後台",
    adminDesc: "連續掃描與管理",
    login: "系統登入",
    pwdPlace: "輸入後台密碼",
    enter: "進入系統",
    wrongPwd: "密碼錯誤",
    regTitle: "活動登記",
    regSub: "請填寫資料以獲取入場碼",
    name: "姓名",
    phone: "電話號碼",
    email: "電子郵件",
    company: "公司/備註 (選填)",
    getPass: "領取入場證",
    yourPass: "您的入場憑證",
    saveTip: "請截圖保存，入場時出示",
    next: "下一位",
    scan: "極速掃描",
    draw: "幸運轉盤",
    list: "名單管理",
    total: "總人數",
    arrived: "已到場",
    scanCam: "啟動連續掃描",
    stopCam: "停止掃描",
    manual: "手動輸入 ID",
    processing: "處理中...",
    success: "簽到成功",
    duplicate: "重複掃描",
    error: "無效代碼",
    welcome: "歡迎回來",
    regSuccess: "登記並簽到",
    notFound: "查無此人",
    errPhone: "此電話已被註冊",
    errEmail: "此 Email 已被註冊",
    errIncomplete: "請填寫完整資料",
    drawBtn: "開始轉動 (空白鍵)",
    spinning: "好運轉動中...",
    winner: "✨ 恭喜中獎 ✨",
    claim: "確認領獎 (Enter)",
    needMore: "需要至少 2 位符合資格者",
    export: "導出名單",
    checkin: "簽到",
    cancel: "取消",
    logout: "登出"
  },
  en: {
    title: "EventPass V13",
    sub: "Deluxe Visual Version",
    guestMode: "Guest Registration",
    guestDesc: "Get your entry pass",
    adminMode: "Admin Dashboard",
    adminDesc: "Continuous Scan & Mgmt",
    login: "Admin Login",
    pwdPlace: "Password",
    enter: "Login",
    wrongPwd: "Wrong Password",
    regTitle: "Registration",
    regSub: "Fill details to get QR pass",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    company: "Company (Optional)",
    getPass: "Get Entry Pass",
    yourPass: "Your Entry Pass",
    saveTip: "Screenshot this for entry",
    next: "Next Person",
    scan: "Speed Scan",
    draw: "Lucky Draw",
    list: "Guest List",
    total: "Total",
    arrived: "Arrived",
    scanCam: "Start Speed Scan",
    stopCam: "Stop Scan",
    manual: "Manual Input",
    processing: "Processing...",
    success: "Success",
    duplicate: "Duplicate",
    error: "Invalid Code",
    welcome: "Welcome Back",
    regSuccess: "Registered & Checked-in",
    notFound: "Not Found",
    errPhone: "Phone already taken",
    errEmail: "Email already taken",
    errIncomplete: "Fill all fields",
    drawBtn: "Spin (Space)",
    spinning: "Spinning...",
    winner: "✨ WINNER ✨",
    claim: "Confirm (Enter)",
    needMore: "Need 2+ eligible guests",
    export: "Export CSV",
    checkin: "Check-in",
    cancel: "Cancel",
    logout: "Logout"
  }
};

// --- 2. 工具組件 ---
const Confetti = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    // 增加粒子數量到 300，並增加金色
    const p = Array.from({length:300}).map(()=>({
        x:Math.random()*c.width,
        y:Math.random()*c.height,
        c:['#FFD700', '#FF4500', '#00BFFF', '#32CD32', '#FF69B4', '#FFFFFF'][Math.floor(Math.random()*6)],
        s:Math.random()*8+2,
        d:Math.random()*5
    }));
    const draw = () => { 
        ctx.clearRect(0,0,c.width,c.height); 
        p.forEach(i=>{
            i.y+=i.s; i.x+=Math.sin(i.d); 
            if(i.y>c.height){i.y=0;i.x=Math.random()*c.width;}
            ctx.fillStyle=i.c;
            ctx.beginPath(); ctx.arc(i.x, i.y, i.s/2, 0, Math.PI*2); ctx.fill();
        }); 
        requestAnimationFrame(draw); 
    };
    draw();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]"/>;
};

// --- 3. 獨立頁面 ---

const LoginView = ({ t, onLogin, onBack }) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1519681393798-38e43269d877?auto=format&fit=crop&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
      <div className="relative bg-black/40 border border-white/10 p-8 rounded-3xl w-full max-w-sm backdrop-blur-xl shadow-2xl animate-in zoom-in duration-500">
        <button onClick={onBack} className="text-white/60 hover:text-white mb-6 flex items-center transition-colors"><ChevronLeft size={20}/> {t.sub}</button>
        <h2 className="text-3xl font-bold text-white mb-2">{t.login}</h2>
        <form onSubmit={e=>{e.preventDefault(); if(pwd===ADMIN_PASSWORD)onLogin(); else setErr(true);}}>
          <input type="password" autoFocus value={pwd} onChange={e=>{setPwd(e.target.value);setErr(false)}} placeholder={t.pwdPlace} className="w-full bg-white/10 border border-white/10 text-white p-4 rounded-xl mb-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-center tracking-widest placeholder:tracking-normal"/>
          {err && <div className="text-red-400 text-sm text-center mb-4">{t.wrongPwd}</div>}
          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">{t.enter}</button>
        </form>
      </div>
    </div>
  );
};

const GuestView = ({ t, onBack, checkDuplicate }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:'',phone:'',email:'',company:''});
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const dup = checkDuplicate(form.phone, form.email);
    if(dup === 'phone') { setErr(t.errPhone); return; }
    if(dup === 'email') { setErr(t.errEmail); return; }
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
          <button onClick={onBack} className="absolute left-6 top-6 text-white/80 hover:text-white z-10"><ChevronLeft/></button>
          <h2 className="relative z-10 text-2xl font-bold mt-2">{t.regTitle}</h2>
          <p className="relative z-10 text-blue-100 text-sm">{t.regSub}</p>
        </div>
        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center"><AlertTriangle size={16} className="mr-2"/>{err}</div>}
              {['name','phone','email','company'].map(f => (
                <div key={f}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t[f]} {f!=='company'&&'*'}</label>
                  <input required={f!=='company'} type={f==='email'?'email':f==='phone'?'tel':'text'} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={form[f]} onChange={e=>{setErr('');setForm({...form,[f]:e.target.value})}} />
                </div>
              ))}
              <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 mt-4">{t.getPass}</button>
            </form>
          ) : (
            <div className="text-center animate-in zoom-in">
              <div className="bg-white p-4 border-2 border-dashed border-blue-200 rounded-2xl inline-block mb-6 shadow-sm">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({...form,type:'new_reg',id:Date.now().toString()}))}`} alt="QR" className="w-48 h-48 object-contain"/>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{form.name}</h3>
              <p className="text-slate-500 text-sm mb-8">{t.saveTip}</p>
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
    if(type === 'success') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  };

  const handleScan = useCallback((text) => {
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
          setTimeout(() => setScanRes(null), 1500);
      };

      let person = null;
      let isNew = false;

      if (data.type === 'new_reg') {
          person = attendees.find(p => p.phone === data.phone || p.email === data.email);
          if (!person) {
              person = { id: Date.now().toString(), name: data.name, phone: data.phone, email: data.email, company: data.company, checkedIn: true, checkInTime: new Date().toISOString() };
              setAttendees(prev => [person, ...prev]);
              isNew = true;
          }
      } else {
          let tid = data.id || data;
          person = attendees.find(x => x.id === tid);
      }

      if (!person) processResult('error', t.notFound, null);
      else if (person.checkedIn && !isNew) processResult('duplicate', t.duplicate, person);
      else {
          if (!isNew) setAttendees(prev => prev.map(x => x.id === person.id ? {...x, checkedIn: true, checkInTime: new Date().toISOString()} : x));
          processResult('success', isNew ? t.regSuccess : t.success, person);
      }
    } catch (e) {}
  }, [attendees, setAttendees, t]);

  useEffect(() => {
    if (!isScan || tab !== 'scan') return;
    let s;
    const init = () => {
      if(!window.Html5QrcodeScanner) return;
      s = new window.Html5QrcodeScanner("reader", { fps: 15, qrbox: {width:250, height:250}, aspectRatio: 1.0, showTorchButtonIfSupported: true }, false);
      s.render(handleScan, () => {});
    };
    if(window.Html5QrcodeScanner) init();
    else { const sc = document.createElement('script'); sc.src = "https://unpkg.com/html5-qrcode"; sc.onload = init; document.body.appendChild(sc); }
    return () => { if(s) try{s.clear()}catch(e){} };
  }, [isScan, tab, handleScan]);

  const Wheel = ({ list }) => {
    const [rot, setRot] = useState(0);
    const [spin, setSpin] = useState(false);
    useEffect(() => {
      const k = (e) => { if(e.code==='Space' && !spin && list.length>=2) { e.preventDefault(); run(); }};
      window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
    }, [spin, list]);
    const run = () => {
      setSpin(true);
      const winIdx = Math.floor(Math.random() * list.length);
      const angle = 360/list.length;
      setRot(rot + 1800 + (360 - winIdx*angle) + (Math.random()-0.5)*angle*0.8);
      setTimeout(() => { setSpin(false); setWinner(list[winIdx]); setDrawHistory(prev=>[list[winIdx], ...prev]); }, 4500);
    };
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {/* 豪華輪盤樣式 */}
        <div className="relative w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full border-[12px] border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.4)] overflow-hidden bg-white transition-all duration-500 box-content">
          {/* 外圈燈光裝飾 */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/50 pointer-events-none z-10 opacity-50"></div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-xl filter"></div>
          
          <svg width="100%" height="100%" viewBox="0 0 300 300" style={{transform:`rotate(${rot}deg)`, transition: spin?'transform 4.5s cubic-bezier(0.2,0.8,0.2,1)':'none'}}>
            {list.map((p,i)=>{
               const a = 360/list.length; const s = i*a, e = (i+1)*a;
               const x1=150+150*Math.cos((s-90)*Math.PI/180), y1=150+150*Math.sin((s-90)*Math.PI/180);
               const x2=150+150*Math.cos((e-90)*Math.PI/180), y2=150+150*Math.sin((e-90)*Math.PI/180);
               // 豪華配色
               const colors = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', '#B10DC9'];
               return <path key={i} d={`M 150 150 L ${x1} ${y1} A 150 150 0 ${e-s<=180?0:1} 1 ${x2} ${y2} Z`} fill={colors[i%colors.length]} stroke="#fff" strokeWidth="2"/>
            })}
          </svg>
          
          {/* 中心裝飾 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
             <Trophy size={24} className="text-white"/>
          </div>
        </div>
        <button disabled={spin} onClick={run} className="mt-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-12 py-4 rounded-full font-bold text-2xl shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 border border-slate-700">{spin?t.spinning:t.drawBtn}</button>
      </div>
    );
  };

  const eligible = attendees.filter(p => p.checkedIn && !drawHistory.some(h=>h.id===p.id));

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
                        <h3 className="text-4xl font-black text-white mb-2 drop-shadow-md">{scanRes.msg}</h3>
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
              {!isScan && <div className="mt-8 w-full max-w-md"><input onKeyDown={e=>{if(e.key==='Enter')handleScan(e.target.value)}} placeholder={t.manual} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center outline-none focus:ring-2 focus:ring-emerald-500"/></div>}
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
                <div className="font-bold text-slate-600">{t.total}: {attendees.length} | <span className="text-emerald-600">{t.arrived}: {attendees.filter(x=>x.checkedIn).length}</span></div>
                <button onClick={()=>{const csv="Name,Phone,Email,Status\n"+attendees.map(p=>`${p.name},${p.phone},${p.email},${p.checkedIn?'Checked':'Pending'}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:'text/csv'}));a.download="list.csv";a.click();}} className="text-xs font-bold bg-white border px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"><Download size={14}/> CSV</button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0"><tr><th className="p-3 pl-4">{t.name}</th><th className="p-3">{t.phone}</th><th className="p-3">{t.email}</th><th className="p-3 text-right">{t.checkin}</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{attendees.map(p=>(<tr key={p.id} className="hover:bg-slate-50"><td className="p-3 pl-4 font-bold text-slate-700">{p.name}</td><td className="p-3 text-slate-500 text-sm font-mono">{p.phone}</td><td className="p-3 text-slate-500 text-sm">{p.email}</td><td className="p-3 text-right"><button onClick={()=>setAttendees(attendees.map(x=>x.id===p.id?{...x,checkedIn:!x.checkedIn}:x))} className={`px-4 py-1 rounded-full text-xs font-bold border ${p.checkedIn?'bg-emerald-50 text-emerald-600 border-emerald-200':'bg-white text-slate-400 border-slate-200'}`}>{p.checkedIn?t.checkin:t.cancel}</button><button onClick={()=>setAttendees(attendees.filter(x=>x.id!==p.id))} className="ml-2 p-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button></td></tr>))}</tbody>
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
            {/* 聚光燈效果 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-500/30 to-transparent blur-[100px] pointer-events-none"></div>
            
            <Trophy className="mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-bounce" size={140} />
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-[0.5em] text-shadow-lg opacity-80">{t.winner}</h2>
            
            {/* 巨大中獎名字 */}
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 mb-6 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] scale-110">
                {winner.name}
            </h1>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 inline-block px-10 py-4 rounded-full mb-12">
                <p className="text-3xl text-white/90 font-mono tracking-widest">{winner.phone}</p>
            </div>
            
            <div>
                <button autoFocus onClick={()=>setWinner(null)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-16 py-6 rounded-full font-bold text-3xl shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-transform hover:scale-105 active:scale-95 border-2 border-white/30">
                    {t.claim}
                </button>
            </div>
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

  useEffect(() => { const d=localStorage.getItem('ep_data'); if(d)setAttendees(JSON.parse(d)); const h=localStorage.getItem('ep_hist'); if(h)setDrawHistory(JSON.parse(h)); }, []);
  useEffect(() => { localStorage.setItem('ep_data', JSON.stringify(attendees)); }, [attendees]);
  useEffect(() => { localStorage.setItem('ep_hist', JSON.stringify(drawHistory)); }, [drawHistory]);

  const checkDuplicate = (p, e) => {
    if(attendees.some(x => x.phone.trim() === p.trim())) return 'phone';
    if(attendees.some(x => x.email.trim().toLowerCase() === e.trim().toLowerCase())) return 'email';
    return null;
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
  if(view === 'guest') return <GuestView t={t} onBack={()=>setView('landing')} checkDuplicate={checkDuplicate} />;
  if(view === 'login') return <LoginView t={t} onLogin={()=>setView('admin')} onBack={()=>setView('landing')} />;
  if(view === 'admin') return <AdminDashboard t={t} onLogout={()=>setView('landing')} attendees={attendees} setAttendees={setAttendees} drawHistory={drawHistory} setDrawHistory={setDrawHistory} />;
}