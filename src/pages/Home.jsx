import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle, Info, User, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { state, setLanguage, setPhase, updateProfile, resetAudit, startNewSpot } = useAudit();
  const t = useTranslation('home');
  const navigate = useNavigate();
  
  // Smartly determine the initial step
  const getInitialStep = () => {
    if (state.observationCount > 0 || state.auditCount > 0) return 'dashboard';
    if (state.userProfile.name) return 'dashboard';
    return 'onboarding';
  };
  
  const [subStep, setSubStep] = useState(getInitialStep());

  const handleProfileSave = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;
    updateProfile({ name, phone });
    setSubStep('dashboard');
  };

  if (subStep === 'stopSelection') {
    return (
      <div className="page p-6 bg-white min-h-screen">
        <header className="mb-10 pt-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Phase 2: Audit</span>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight mt-2">What are you observing?</h2>
          <p className="text-gray-500 font-medium">Select the type of spot you are auditing.</p>
        </header>

        <div className="flex flex-col gap-4">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              startNewSpot('audit', 'gate');
              navigate('/checklist');
            }}
            className="p-6 rounded-[2.5rem] bg-gray-50 border-2 border-transparent hover:border-orange-200 text-left transition-all flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm">🚪</div>
            <div>
              <div className="font-black text-xl text-gray-800">{t.stopGate}</div>
              <div className="text-sm text-gray-400 font-medium">{t.stopGateDesc}</div>
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              startNewSpot('audit', 'work');
              navigate('/checklist');
            }}
            className="p-6 rounded-[2.5rem] bg-gray-50 border-2 border-transparent hover:border-orange-200 text-left transition-all flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm">🔧</div>
            <div>
              <div className="font-black text-xl text-gray-800">{t.stopWork}</div>
              <div className="text-sm text-gray-400 font-medium">{t.stopWorkDesc}</div>
            </div>
          </motion.button>
        </div>

        <button 
          onClick={() => setSubStep('dashboard')}
          className="text-gray-400 font-bold w-full mt-8"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="page p-6 bg-gradient-to-b from-orange-50 to-white min-h-screen">
      <header className="mb-8 text-center pt-4">
        <h1 className="text-3xl font-black text-orange-600 tracking-tight">{t.title}</h1>
        <p className="text-gray-600 font-medium">{t.subtitle}</p>
        
        {/* Language Picker */}
        <div className="flex justify-center gap-2 mt-6">
          {['EN', 'HI', 'KN'].map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${state.language === lang ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-orange-600 border border-orange-100'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {subStep === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <div className="card bg-white p-8 rounded-3xl shadow-xl border border-orange-100 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Info className="text-orange-500" /> {t.howItWorks}
              </h2>
              
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-xl shrink-0">
                      {t[`step${i}`].split(' ')[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{t[`step${i}`].split(' ').slice(1).join(' ')}</div>
                      <div className="text-sm text-gray-500">{t[`step${i}Desc`]}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSubStep('profile')} 
                className="w-full mt-10 bg-orange-600 text-white p-5 rounded-2xl font-black text-lg shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                {t.startAudit} <PlayCircle />
              </button>
            </div>
          </motion.div>
        )}

        {subStep === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-800">
                <User className="text-orange-500" /> {t.profileTitle}
              </h2>
              <p className="text-gray-500 mb-8 text-sm">{t.profileDesc}</p>
              
              <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="name" placeholder="Full Name" className="w-full p-4 pl-12 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">WA</div>
                    <input name="phone" placeholder="WhatsApp Number" className="w-full p-4 pl-12 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-4">
                  <button type="submit" className="bg-orange-600 text-white p-5 rounded-2xl font-black text-lg shadow-lg">
                    {t.saveAndStart}
                  </button>
                  <button type="button" onClick={() => setSubStep('dashboard')} className="text-gray-400 font-bold py-2 text-sm uppercase tracking-wider">
                    {t.skipForNow}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {subStep === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="font-bold text-gray-800">{t.observationProgress}</h2>
              <div className="text-xs text-orange-600 font-black uppercase tracking-tighter">Ninja Status: Active</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-sm">
                <div className="text-3xl font-black text-orange-600">{state.observationCount}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-tight">{t.observationCount}</div>
              </div>
              <div className="card bg-white p-5 rounded-3xl border-2 border-blue-100 shadow-sm">
                <div className="text-3xl font-black text-blue-600">{state.auditCount}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-tight">{t.auditCount}</div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <button onClick={() => { startNewSpot('observation'); navigate('/checklist'); }} className="bg-orange-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-between shadow-xl transform active:scale-95 transition-all">
                <div className="flex items-center gap-3"><MapPin /> {t.step1}</div>
                <span className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center">+</span>
              </button>

              <button 
                onClick={() => setSubStep('stopSelection')} 
                className={`p-6 rounded-3xl font-black text-xl flex items-center justify-between shadow-xl transform active:scale-95 transition-all bg-blue-600 text-white`}
              >
                <div className="flex items-center gap-3"><Briefcase /> {t.step2}</div>
                <span className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">+</span>
              </button>

              {state.observationCount >= 1 && state.auditCount >= 1 && (
                <button onClick={() => navigate('/summary')} className="bg-green-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-xl mt-4 animate-pulse">
                  <CheckCircle /> {t.finishReflection}
                </button>
              )}

              <button 
                onClick={() => { resetAudit(); setSubStep('onboarding'); }} 
                className="mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] text-center hover:text-orange-400 transition-colors"
              >
                {t.clearProgress}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
