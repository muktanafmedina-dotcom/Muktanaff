import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Wifi, Phone, Clock, Maximize, Minimize, X, Menu, Info } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface ChaletData {
  guestName: string;
  doorPassword: string;
  wifiPassword: string;
  adminPhone: string;
  welcomeMessage?: string;
}

export default function TV({ id }: { id: string }) {
  const [chaletData, setChaletData] = useState<ChaletData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Valid IDs: 1, 2, 3, 4, 5
  if (!id || !['1', '2', '3', '4', '5'].includes(id)) {
    return <Navigate to="/admin" replace />;
  }

  const chaletId = `chalet${id}`;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chalets", chaletId), (doc) => {
      if (doc.exists()) {
        setChaletData(doc.data() as ChaletData);
      }
    });
    return () => unsub();
  }, [chaletId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    let wakeLock: any = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.error("Wake Lock error:", err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
      }
    };
  }, []);

  // Background Image for luxury resort vibe (Roses)
  const backgroundUrl = "https://images.unsplash.com/photo-1496857239036-1fb137683000?q=80&w=3540&auto=format&fit=crop";

  return (
    <div dir="rtl" className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 font-sans select-none flex flex-col">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 animate-slow-pan"
        style={{ 
          backgroundImage: `url(${backgroundUrl})`
        }}
      />
      <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />

      {/* Main Content */}
      <div className="relative z-20 h-full w-full flex flex-col p-6 lg:p-12 text-white justify-between">
        
        {/* Header - Logo and Time */}
        <header className="flex justify-between items-start w-full shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex items-center gap-3 lg:gap-4"
          >
            <div className="w-10 h-10 lg:w-14 lg:h-14 border-2 border-white/80 rounded-full flex items-center justify-center backdrop-blur-md bg-white/10">
              <span className="font-serif text-xl lg:text-2xl text-amber-300">م</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold font-serif tracking-widest text-amber-300">مكتنف</h1>
              <p className="text-[9px] lg:text-xs tracking-[0.3em] text-white/60 uppercase font-sans">Muktanaf Chalets</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-3 lg:gap-4"
          >
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 lg:p-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 text-white hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 lg:gap-3 shadow-xl"
              title="بيانات الخدمات"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline font-medium text-sm lg:text-base">الخدمات</span>
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2.5 lg:p-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
              title="ملء الشاشة"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <div className="flex flex-col items-end backdrop-blur-md bg-white/5 border border-white/10 px-3 py-2 lg:px-5 lg:py-3 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-xl lg:text-3xl font-light tabular-nums tracking-wider dir-ltr">
                  {format(currentTime, 'hh:mm', { locale: arSA })}
                </span>
                <span className="text-base lg:text-lg font-medium text-white/70">
                  {format(currentTime, 'a', { locale: arSA })}
                </span>
              </div>
              <span className="text-xs lg:text-base text-white/60 mt-1 font-serif hidden sm:block">
                {format(currentTime, 'EEEE، d MMMM yyyy', { locale: arSA })}
              </span>
            </div>
          </motion.div>
        </header>

        {/* Center Welcome Message */}
        <div className="flex-1 flex flex-col items-center w-full mx-auto min-h-0 py-2 lg:py-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {chaletData?.guestName ? (
               <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full flex flex-col items-center gap-2 lg:gap-4 my-auto py-2"
              >
                <h2 className="text-[clamp(1.5rem,6vmin,5rem)] font-serif text-white/95 font-bold drop-shadow-2xl leading-tight text-center w-full shrink-0">
                  مرحباً بكم
                </h2>
                <h3 className="text-[clamp(1.2rem,5vmin,4.5rem)] font-serif text-amber-300 drop-shadow-xl font-bold leading-tight text-center w-full shrink-0">
                  {chaletData.guestName}
                </h3>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="text-[clamp(0.9rem,2.8vmin,2rem)] leading-[1.6] lg:leading-[1.8] text-white/90 font-serif font-medium w-full max-w-[95vw] lg:max-w-[80vw] mx-auto shadow-black drop-shadow-2xl px-2 lg:px-4 text-center mt-2 lg:mt-4 shrink-0"
                >
                  {chaletData.welcomeMessage?.trim() ? (
                    chaletData.welcomeMessage.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))
                  ) : (
                    <>
                      بين هدوء المكان وجمال اللحظات... يسعدنا أن نرحب بكم في <span className="text-amber-300">شاليهات مكتنف</span>.<br/>
                      نتمنى لكم إقامة مليئة بالراحة، والسكينة، والذكريات الجميلة التي تبقى في القلب.<br/>
                      أهلاً وسهلاً بكم... ونتمنى أن تكون هذه الليلة بداية لحكاية لا تُنسى.
                    </>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col items-center gap-2 lg:gap-4 my-auto py-2"
              >
                <h2 className="text-[clamp(1.5rem,6vmin,5rem)] font-serif text-white/90 font-bold drop-shadow-2xl leading-tight text-center w-full">
                  مرحباً بكم في <span className="text-amber-300">شاليهات مكتنف</span>
                </h2>
                <p className="text-[clamp(1.1rem,3.5vmin,2.5rem)] leading-[1.6] lg:leading-[1.8] text-white/80 font-serif font-light text-center w-full mt-2">
                  في انتظار ضيوفنا الكرام...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Services Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[80vw] sm:w-[320px] lg:w-[380px] bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col p-5 lg:p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 shrink-0">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
                <h3 className="text-lg lg:text-xl font-serif font-bold text-white flex items-center gap-2">
                  بيانات الخدمات
                  <Info className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                </h3>
              </div>

              <div className="flex flex-col gap-3 lg:gap-4 flex-1">
                {/* Door Password Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 flex flex-col items-center text-center shadow-lg">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3 text-amber-200">
                    <Key className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <h4 className="text-base lg:text-lg text-white/70 mb-1">كلمة مرور الباب</h4>
                  <p className="text-2xl lg:text-4xl font-bold tracking-widest text-white dir-ltr leading-none mt-1">
                    {chaletData?.doorPassword || "----"}
                  </p>
                </div>

                {/* Wi-Fi Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 flex flex-col items-center text-center shadow-lg">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3 text-blue-300">
                    <Wifi className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <h4 className="text-base lg:text-lg text-white/70 mb-1">شبكة Wi-Fi</h4>
                  <p className="text-2xl lg:text-4xl font-bold tracking-wider text-white dir-ltr leading-none mt-1">
                    {chaletData?.wifiPassword || "----"}
                  </p>
                </div>

                {/* Admin Phone Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 flex flex-col items-center text-center shadow-lg">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3 text-emerald-300">
                    <Phone className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <h4 className="text-base lg:text-lg text-white/70 mb-1">التواصل للإدارة</h4>
                  <p className="text-2xl lg:text-4xl font-bold tracking-widest text-white dir-ltr leading-none mt-1">
                    {chaletData?.adminPhone || "----"}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
