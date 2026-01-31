import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  QrCode, 
  Trophy, 
  Download, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Search, 
  Trash2, 
  Settings,
  RefreshCcw
} from 'lucide-react';

// 簡單的 Confetti (彩帶) 效果組件
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const numberOfPieces = 150;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationId;
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.y += p.speed;
        p.angle += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

export default function App() {
  // --- State 管理 ---
  const [activeTab, setActiveTab] = useState('register'); // register, list, draw
  const [attendees, setAttendees] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', company: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // 抽獎相關 State
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rollingName, setRollingName] = useState('準備抽獎...');
  const [drawHistory, setDrawHistory] = useState([]);

  // --- 初始化與本地存儲 ---
  useEffect(() => {
    const savedData = localStorage.getItem('eventpass_data');
    if (savedData) {
      setAttendees(JSON.parse(savedData));
    }
    const savedHistory = localStorage.getItem('eventpass_history');
    if (savedHistory) {
      setDrawHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eventpass_data', JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem('eventpass_history', JSON.stringify(drawHistory));
  }, [drawHistory]);

  // --- 功能函數 ---

  // 1. 新增參加者
  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newAttendee = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      company: formData.company,
      checkedIn: false,
      checkInTime: null,
      createdAt: new Date().toISOString()
    };

    setAttendees([newAttendee, ...attendees]);
    setFormData({ name: '', phone: '', company: '' });
    alert(`登記成功！${newAttendee.name} 已加入名單。`);
  };

  // 2. 簽到/取消簽到
  const toggleCheckIn = (id) => {
    setAttendees(attendees.map(p => {
      if (p.id === id) {
        return {
          ...p,
          checkedIn: !p.checkedIn,
          checkInTime: !p.checkedIn ? new Date().toISOString() : null
        };
      }
      return p;
    }));
  };

  // 3. 刪除參加者
  const deleteAttendee = (id) => {
    if (window.confirm('確定要刪除這位參加者嗎？')) {
      setAttendees(attendees.filter(p => p.id !== id));
    }
  };

  // 4. 抽獎邏輯
  const eligibleAttendees = attendees.filter(p => p.checkedIn && !drawHistory.some(h => h.id === p.id));

  const startDraw = () => {
    if (eligibleAttendees.length === 0) {
      alert('沒有符合資格的參加者！(需已簽到且未中獎)');
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomPerson = eligibleAttendees[Math.floor(Math.random() * eligibleAttendees.length)];
      setRollingName(randomPerson.name);
      counter++;
      if (counter > 20) { // 滾動次數
        clearInterval(interval);
        const finalWinner = eligibleAttendees[Math.floor(Math.random() * eligibleAttendees.length)];
        setWinner(finalWinner);
        setRollingName(finalWinner.name);
        setIsDrawing(false);
        setDrawHistory([finalWinner, ...drawHistory]);
      }
    }, 100);
  };

  // 5. 導出 CSV
  const exportCSV = () => {
    // UTF-8 BOM for Excel compatibility
    const bom = "\uFEFF";
    const headers = "ID,姓名,電話,公司/備註,狀態,簽到時間,中獎狀態\n";
    
    const rows = attendees.map(p => {
      const status = p.checkedIn ? "已簽到" : "未簽到";
      const time = p.checkInTime ? new Date(p.checkInTime).toLocaleString() : "-";
      const isWinner = drawHistory.some(h => h.id === p.id) ? "已中獎" : "";
      // Escape commas to prevent CSV breakage
      const safeCompany = (p.company || "").replace(/,/g, " ");
      return `${p.id},${p.name},${p.phone},${safeCompany},${status},${time},${isWinner}`;
    }).join("\n");

    const csvContent = bom + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `活動名單_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. 清除所有數據
  const clearAllData = () => {
    if(window.confirm("警告：這將刪除所有參加者和記錄，且無法恢復。確定嗎？")) {
      setAttendees([]);
      setDrawHistory([]);
      localStorage.removeItem('eventpass_data');
      localStorage.removeItem('eventpass_history');
    }
  };

  // --- UI 組件 ---

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {winner && !isDrawing && activeTab === 'draw' && <Confetti />}
      
      {/* 頂部導航 */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <QrCode className="text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              EventPass 活動通
            </h1>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center space-x-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">導出資料</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24">
        
        {/* 統計概覽 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="總登記" value={attendees.length} icon={Users} color="bg-blue-500" />
          <StatCard title="已簽到" value={attendees.filter(a => a.checkedIn).length} icon={CheckCircle} color="bg-green-500" />
          <StatCard title="未簽到" value={attendees.filter(a => !a.checkedIn).length} icon={XCircle} color="bg-amber-500" />
          <StatCard title="已中獎" value={drawHistory.length} icon={Trophy} color="bg-purple-500" />
        </div>

        {/* 內容區域 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          
          {/* 1. 登記 Tab */}
          {activeTab === 'register' && (
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <Plus className="mr-2 text-indigo-600" /> 新增參加者
              </h2>
              <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">姓名 *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="輸入姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">電話 / Email *</label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="輸入聯絡方式"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">公司 / 備註</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="選填"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg shadow-md transition-all active:scale-95"
                >
                  確認登記
                </button>
              </form>
            </div>
          )}

          {/* 2. 名單與簽到 Tab */}
          {activeTab === 'list' && (
            <div className="p-0">
              <div className="p-4 border-b border-slate-100 flex gap-2 sticky top-0 bg-white z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="搜尋姓名或電話..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {attendees.filter(p => 
                  p.name.includes(searchTerm) || p.phone.includes(searchTerm)
                ).length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    暫無資料，請先去「登記」頁面新增。
                  </div>
                ) : (
                  attendees.filter(p => 
                    p.name.includes(searchTerm) || p.phone.includes(searchTerm)
                  ).map(person => (
                    <div key={person.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center space-x-4">
                        {/* 模擬 QR Code 展示 - 點擊圖片可放大 (此處僅做視覺展示) */}
                        <div className="w-12 h-12 bg-white p-1 border rounded shadow-sm shrink-0">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(JSON.stringify({id: person.id, name: person.name}))}`} 
                            alt="QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{person.name}</p>
                          <p className="text-xs text-slate-500">{person.phone}</p>
                          {person.company && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{person.company}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleCheckIn(person.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            person.checkedIn 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {person.checkedIn ? '已簽到' : '未簽到'}
                        </button>
                        <button 
                          onClick={() => deleteAttendee(person.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-slate-100">
                <button onClick={clearAllData} className="text-xs text-red-400 underline hover:text-red-600">重置所有資料</button>
              </div>
            </div>
          )}

          {/* 3. 抽獎 Tab */}
          {activeTab === 'draw' && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">幸運大抽獎</h2>
                <p className="text-slate-500 text-sm">
                  符合資格人數: {eligibleAttendees.length} 人 (已簽到且未中獎)
                </p>
              </div>

              <div className="w-64 h-32 bg-indigo-50 rounded-2xl flex items-center justify-center border-4 border-indigo-100 mb-8 overflow-hidden relative shadow-inner">
                <div className={`text-3xl font-bold transition-all duration-100 ${isDrawing ? 'text-indigo-400 blur-[1px]' : 'text-indigo-700 scale-110'}`}>
                  {rollingName}
                </div>
              </div>

              <button
                onClick={startDraw}
                disabled={isDrawing || eligibleAttendees.length === 0}
                className={`
                  w-48 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform
                  ${isDrawing 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:scale-105 hover:shadow-xl active:scale-95'
                  }
                `}
              >
                {isDrawing ? '抽獎中...' : '開始抽獎'}
              </button>

              {winner && !isDrawing && (
                <div className="mt-8 animate-bounce">
                  <p className="text-sm text-slate-400">恭喜中獎者</p>
                  <p className="text-xl font-bold text-rose-600 mt-1">{winner.name}</p>
                  <p className="text-sm text-slate-400">{winner.phone}</p>
                </div>
              )}

              {/* 中獎名單 */}
              {drawHistory.length > 0 && (
                <div className="mt-12 w-full">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">中獎記錄</h3>
                  <div className="bg-slate-50 rounded-xl p-4 text-left max-h-40 overflow-y-auto">
                    {drawHistory.map((h, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="font-medium text-slate-700">#{drawHistory.length - idx} {h.name}</span>
                        <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* 底部 Tab 導航 */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe z-30">
        <div className="max-w-4xl mx-auto flex justify-around p-2">
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors flex-1 ${activeTab === 'register' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Plus size={24} />
            <span className="text-xs mt-1 font-medium">登記</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors flex-1 ${activeTab === 'list' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={24} />
            <span className="text-xs mt-1 font-medium">名單 & 簽到</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('draw')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors flex-1 ${activeTab === 'draw' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Trophy size={24} />
            <span className="text-xs mt-1 font-medium">抽獎</span>
          </button>
        </div>
      </nav>
    </div>
  );
}