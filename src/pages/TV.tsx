import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Wifi, Phone, Clock } from 'lucide-react';
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
            <div className="w-12 h-12 lg:w-16 lg:h-16 border-2 border-white/80 rounded-full flex items-center justify-center backdrop-blur-md bg-white/10">
              <span className="font-serif text-2xl lg:text-3xl text-white">م</span>
            </div>
            <div>
              <h1 className="text-xl lg:text-3xl font-bold font-serif tracking-widest text-white/90">مكتنف</h1>
              <p className="text-[10px] lg:text-sm tracking-[0.3em] text-white/60 uppercase font-sans">Muktanaf Chalets</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-end backdrop-blur-md bg-white/5 border border-white/10 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="text-2xl lg:text-4xl font-light tabular-nums tracking-wider dir-ltr">
                {format(currentTime, 'hh:mm', { locale: arSA })}
              </span>
              <span className="text-lg lg:text-xl font-medium text-white/70">
                {format(currentTime, 'a', { locale: arSA })}
              </span>
            </div>
            <span className="text-sm lg:text-lg text-white/60 mt-1 font-serif hidden sm:block">
              {format(currentTime, 'EEEE، d MMMM yyyy', { locale: arSA })}
            </span>
          </motion.div>
        </header>

        {/* Center Welcome Message */}
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full mx-auto min-h-0 py-8">
          <AnimatePresence mode="wait">
            {chaletData?.guestName ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full flex flex-col items-center justify-center gap-[3vh] lg:gap-[5vh]"
              >
                <h2 className="text-[clamp(3rem,8vmin,12rem)] font-serif text-white/95 font-bold drop-shadow-2xl leading-tight text-center w-full">
                  مرحباً بكم
                </h2>
                <h3 className="text-[clamp(2.5rem,7vmin,10rem)] font-serif text-pink-200 drop-shadow-xl font-bold leading-tight text-center w-full">
                  {chaletData.guestName}
                </h3>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="text-[clamp(1.2rem,4vmin,5rem)] leading-[1.6] lg:leading-[1.8] text-white/90 font-serif font-medium w-full max-w-[90vw] mx-auto shadow-black drop-shadow-2xl px-4 text-center mt-[2vh]"
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
                      بين هدوء المكان وجمال اللحظات... يسعدنا أن نرحب بكم في شاليهات مكتنف.<br/>
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
                className="w-full flex flex-col items-center justify-center gap-[4vh] lg:gap-[6vh]"
              >
                <h2 className="text-[clamp(2.5rem,8vmin,12rem)] font-serif text-white/90 font-bold drop-shadow-2xl leading-tight text-center w-full">
                  مرحباً بكم في شاليهات مكتنف
                </h2>
                <p className="text-[clamp(1.5rem,5vmin,6rem)] leading-[1.6] lg:leading-[1.8] text-white/80 font-serif font-light text-center w-full">
                  في انتظار ضيوفنا الكرام...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Cards Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="grid grid-cols-3 gap-3 lg:gap-6 shrink-0"
        >
          {/* Door Password Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl lg:rounded-3xl p-3 lg:p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-8 h-8 lg:w-14 lg:h-14 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-4 text-amber-200">
              <Key className="w-4 h-4 lg:w-7 lg:h-7" />
            </div>
            <h4 className="text-[10px] lg:text-xl text-white/70 mb-1 lg:mb-2 whitespace-nowrap">كلمة مرور الباب</h4>
            <p className="text-sm lg:text-3xl font-medium tracking-widest text-white dir-ltr">
              {chaletData?.doorPassword || "----"}
            </p>
          </div>

          {/* Wi-Fi Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl lg:rounded-3xl p-3 lg:p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-8 h-8 lg:w-14 lg:h-14 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-4 text-blue-300">
              <Wifi className="w-4 h-4 lg:w-7 lg:h-7" />
            </div>
            <h4 className="text-[10px] lg:text-xl text-white/70 mb-1 lg:mb-2 whitespace-nowrap">شبكة Wi-Fi</h4>
            <p className="text-sm lg:text-3xl font-medium tracking-wider text-white dir-ltr">
              {chaletData?.wifiPassword || "----"}
            </p>
          </div>

          {/* Admin Phone Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl lg:rounded-3xl p-3 lg:p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-8 h-8 lg:w-14 lg:h-14 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-4 text-emerald-300">
              <Phone className="w-4 h-4 lg:w-7 lg:h-7" />
            </div>
            <h4 className="text-[10px] lg:text-xl text-white/70 mb-1 lg:mb-2 whitespace-nowrap">التواصل للإدارة</h4>
            <p className="text-sm lg:text-3xl font-medium tracking-widest text-white dir-ltr">
              {chaletData?.adminPhone || "----"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
