import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Lock, Save, Wifi, Key, Phone, User, Home, Loader2, Check, Monitor, MessageSquare } from 'lucide-react';

const ADMIN_PASSWORD = "جميلة";

interface ChaletData {
  guestName: string;
  doorPassword: string;
  wifiPassword: string;
  adminPhone: string;
  welcomeMessage?: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4 text-slate-100 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-2xl p-10 md:p-14 rounded-3xl border border-slate-800/60 shadow-2xl w-full max-w-lg relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center mb-12 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              <Lock className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-center tracking-tight">إدارة شاليهات مكتنف</h1>
            <p className="text-slate-400 text-center text-lg">الرجاء إدخال كلمة المرور للوصول إلى لوحة التحكم</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8 relative z-10">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl px-6 py-5 text-center text-xl focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                dir="ltr"
              />
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-base text-center">
                {error}
              </motion.p>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl px-6 py-5 font-semibold text-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard />;
}

const CHALETS = ["chalet1", "chalet2", "chalet3", "chalet4", "chalet5"];

function AdminDashboard() {
  const [selectedChalet, setSelectedChalet] = useState<string | null>(null);
  const [chaletData, setChaletData] = useState<ChaletData>({
    guestName: "",
    doorPassword: "",
    wifiPassword: "",
    adminPhone: "",
    welcomeMessage: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchChaletData = async (chaletId: string) => {
    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, "chalets", chaletId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setChaletData(docSnap.data() as ChaletData);
      } else {
        // Document doesn't exist yet, we will initialize it
        setChaletData({
          guestName: "",
          doorPassword: "",
          wifiPassword: "",
          adminPhone: "",
          welcomeMessage: ""
        });
      }
    } catch (error) {
      console.error("Error fetching chalet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChalet) {
      fetchChaletData(selectedChalet);
    }
  }, [selectedChalet]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChalet) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, "chalets", selectedChalet);
      await setDoc(docRef, chaletData, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 p-4 md:p-6 lg:p-8 font-sans flex flex-col">
      <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 pb-6 border-b border-slate-800/60 shrink-0">
          <div className="text-center md:text-right mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight">إدارة شاليهات مكتنف</h1>
            <p className="text-slate-400 mt-2 lg:text-lg">لوحة التحكم السريعة لتحديث بيانات الضيوف والشاشات</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 flex-1">
          {/* Sidebar - Chalet Selection */}
          <div className="lg:w-1/4 xl:w-1/5 flex-shrink-0">
            <h2 className="text-xl font-semibold mb-6 text-slate-300 hidden lg:block">اختر الشاليه</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
              {CHALETS.map((chalet, index) => (
                <button
                  key={chalet}
                  onClick={() => setSelectedChalet(chalet)}
                  className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 lg:p-5 rounded-2xl border transition-all ${
                    selectedChalet === chalet
                      ? "bg-blue-600/15 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/60 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className={`p-3 rounded-xl hidden sm:block ${selectedChalet === chalet ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg lg:text-xl whitespace-nowrap">شاليه {index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Panel - Edit Form */}
          <div className="lg:w-3/4 xl:w-4/5 flex flex-col">
            {selectedChalet ? (
              <motion.div 
                key={selectedChalet}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl flex-1 flex flex-col"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-800/60 gap-4 shrink-0">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-4">
                    <span className="bg-blue-500 w-2 h-10 rounded-full inline-block shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    إعدادات {selectedChalet.replace('chalet', 'شاليه ')}
                  </h2>
                  <a
                    href={`/tv${selectedChalet.replace('chalet', '')}`}
                    target="_blank"
                    className="text-sm lg:text-base bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-700 px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium"
                  >
                    <Monitor className="w-5 h-5" />
                    فتح الشاشة
                  </a>
                </div>

                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-8 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-slate-300 font-medium ml-2 text-lg">
                          <User className="w-5 h-5 text-slate-500" />
                          اسم الزوج والزوجة
                        </label>
                        <input
                          type="text"
                          value={chaletData.guestName}
                          onChange={(e) => setChaletData({...chaletData, guestName: e.target.value})}
                          placeholder="مثال: محمد وسارة"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-slate-300 font-medium ml-2 text-lg">
                          <Key className="w-5 h-5 text-slate-500" />
                          كلمة مرور الباب
                        </label>
                        <input
                          type="text"
                          value={chaletData.doorPassword}
                          onChange={(e) => setChaletData({...chaletData, doorPassword: e.target.value})}
                          placeholder="مثال: 1234"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-slate-300 font-medium ml-2 text-lg">
                          <Wifi className="w-5 h-5 text-slate-500" />
                          كلمة مرور Wi-Fi
                        </label>
                        <input
                          type="text"
                          value={chaletData.wifiPassword}
                          onChange={(e) => setChaletData({...chaletData, wifiPassword: e.target.value})}
                          placeholder="مثال: Guest2024"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-slate-300 font-medium ml-2 text-lg">
                          <Phone className="w-5 h-5 text-slate-500" />
                          رقم التواصل مع الإدارة
                        </label>
                        <input
                          type="text"
                          value={chaletData.adminPhone}
                          onChange={(e) => setChaletData({...chaletData, adminPhone: e.target.value})}
                          placeholder="مثال: 0500000000"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all text-white placeholder:text-slate-600"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-3 xl:col-span-2">
                        <label className="flex items-center gap-2 text-slate-300 font-medium ml-2 text-lg">
                          <MessageSquare className="w-5 h-5 text-slate-500" />
                          الرسالة الترحيبية (اختياري)
                        </label>
                        <textarea
                          value={chaletData.welcomeMessage || ''}
                          onChange={(e) => setChaletData({...chaletData, welcomeMessage: e.target.value})}
                          placeholder="اتركه فارغاً لاستخدام الرسالة الافتراضية..."
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[160px] resize-y text-white placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="pt-8 mt-auto border-t border-slate-800/60 flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      {saveSuccess && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-emerald-400 flex items-center gap-2 text-lg font-medium"
                        >
                          <Check className="w-6 h-6" />
                          تم الحفظ بنجاح
                        </motion.span>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-10 py-5 text-lg font-semibold transition-all flex items-center gap-3 shadow-lg shadow-blue-500/25 active:scale-[0.98] w-full sm:w-auto justify-center"
                      >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        حفظ التغييرات
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <div className="flex-1 min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-3xl bg-slate-900/20 p-8 text-center">
                <div className="w-24 h-24 bg-slate-800/40 rounded-full flex items-center justify-center mb-6 text-slate-500 shadow-inner">
                  <Home className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 mb-3">لم يتم اختيار شاليه</h3>
                <p className="text-slate-500 text-lg max-w-md">الرجاء اختيار شاليه من القائمة لعرض وتعديل بيانات الضيوف وكلمات المرور.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
