import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Lock, Save, Wifi, Key, Phone, User, Home, Loader2, Check, Monitor } from 'lucide-react';

const ADMIN_PASSWORD = "جميلة";

interface ChaletData {
  guestName: string;
  doorPassword: string;
  wifiPassword: string;
  adminPhone: string;
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold font-serif mb-2 text-center">إدارة شاليهات مكتنف</h1>
            <p className="text-slate-400 text-sm text-center">الرجاء إدخال كلمة المرور للوصول إلى لوحة التحكم</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr"
                dir="ltr"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-3 font-medium transition-colors"
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
    adminPhone: ""
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
          adminPhone: ""
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white">إدارة شاليهات مكتنف</h1>
            <p className="text-slate-400 mt-2">لوحة التحكم السريعة لتحديث بيانات الضيوف والشاشات</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar - Chalet Selection */}
          <div className="md:col-span-4 lg:col-span-3 space-y-3">
            <h2 className="text-lg font-semibold mb-4 text-slate-300">اختر الشاليه</h2>
            {CHALETS.map((chalet, index) => (
              <button
                key={chalet}
                onClick={() => setSelectedChalet(chalet)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-right transition-all ${
                  selectedChalet === chalet
                    ? "bg-blue-600/10 border-blue-500/50 text-blue-400"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedChalet === chalet ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg">شاليه {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Main Panel - Edit Form */}
          <div className="md:col-span-8 lg:col-span-9">
            {selectedChalet ? (
              <motion.div 
                key={selectedChalet}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 lg:p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="bg-blue-600 w-3 h-8 rounded-full inline-block"></span>
                    إعدادات {selectedChalet.replace('chalet', 'شاليه ')}
                  </h2>
                  <a
                    href={`/tv${selectedChalet.replace('chalet', '')}`}
                    target="_blank"
                    className="text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Monitor className="w-4 h-4" />
                    فتح الشاشة
                  </a>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-slate-300 font-medium">
                          <User className="w-4 h-4 text-slate-500" />
                          اسم العميل
                        </label>
                        <input
                          type="text"
                          value={chaletData.guestName}
                          onChange={(e) => setChaletData({...chaletData, guestName: e.target.value})}
                          placeholder="مثال: محمد عبدالله"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-slate-300 font-medium">
                          <Key className="w-4 h-4 text-slate-500" />
                          كلمة مرور الباب
                        </label>
                        <input
                          type="text"
                          value={chaletData.doorPassword}
                          onChange={(e) => setChaletData({...chaletData, doorPassword: e.target.value})}
                          placeholder="مثال: 1234"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-slate-300 font-medium">
                          <Wifi className="w-4 h-4 text-slate-500" />
                          كلمة مرور Wi-Fi
                        </label>
                        <input
                          type="text"
                          value={chaletData.wifiPassword}
                          onChange={(e) => setChaletData({...chaletData, wifiPassword: e.target.value})}
                          placeholder="مثال: Guest2024"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-slate-300 font-medium">
                          <Phone className="w-4 h-4 text-slate-500" />
                          رقم التواصل مع الإدارة
                        </label>
                        <input
                          type="text"
                          value={chaletData.adminPhone}
                          onChange={(e) => setChaletData({...chaletData, adminPhone: e.target.value})}
                          placeholder="مثال: 0500000000"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
                      {saveSuccess && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-emerald-400 flex items-center gap-2 text-sm"
                        >
                          <Check className="w-4 h-4" />
                          تم الحفظ بنجاح
                        </motion.span>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-8 py-3 font-medium transition-colors flex items-center gap-2"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        حفظ التغييرات
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-500">
                  <Home className="w-8 h-8" />
                </div>
                <p className="text-slate-400 text-lg">الرجاء اختيار شاليه من القائمة لعرض وتعديل بياناته</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
