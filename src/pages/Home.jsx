import React, { useMemo, useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle, Info, User, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { state, setLanguage, setPhase, updateProfile, resetAudit, startNewSpot } = useAudit();
  const t = useTranslation('home');
  const tc = useTranslation('capture');
  const navigate = useNavigate();

  const hasDeepLinkUser = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return Boolean(params.get('user')?.trim());
    } catch {
      return false;
    }
  }, []);

  const isProfileComplete = useMemo(() => {
    const nameOk = Boolean(state.userProfile?.name?.trim());
    const phoneOk = Boolean(state.userProfile?.phone?.trim());
    return nameOk && phoneOk;
  }, [state.userProfile]);
  
  // Smartly determine the initial step
  const getInitialStep = () => {
    if (state.observationCount > 0 || state.auditCount > 0) return 'dashboard';
    if (isProfileComplete) return 'dashboard';
    return 'onboarding';
  };
  
  const [subStep, setSubStep] = useState(getInitialStep());
  const [profileError, setProfileError] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    const name = e.target.name.value?.trim();
    const phone = e.target.phone.value?.trim();
    if (!name || !phone) {
      setProfileError('Please enter your name and WhatsApp number.');
      return;
    }
    setProfileError('');
    updateProfile({ name, phone });
    setSubStep('dashboard');
  };

  if (subStep === 'stopSelection') {
    return (
      <div className="page bg-white">
        <header className="p-6 pb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">{tc.auditPhase}</span>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight mt-1">{tc.spotTitle}</h2>
          <p className="text-gray-500 text-sm font-medium">{tc.spotSubtitle}</p>
        </header>

        <div className="content-area py-4">
          <div className="flex flex-col gap-4">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!isProfileComplete) {
                  setSubStep('profile');
                  return;
                }
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
                if (!isProfileComplete) {
                  setSubStep('profile');
                  return;
                }
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
        </div>

        <div className="fixed-footer">
          <button 
            onClick={() => setSubStep('dashboard')}
            className="text-gray-400 font-bold w-full py-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page bg-gradient-to-b from-orange-50 to-white">
      <header className="p-6 pb-2 text-center">
        <h1 className="text-2xl font-black text-orange-600 tracking-tight">{t.title}</h1>
        <p className="text-gray-600 text-xs font-medium">{t.subtitle}</p>
        
        {/* Language Picker */}
        <div className="flex justify-center gap-2 mt-4">
          {['EN', 'HI', 'KN'].map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${state.language === lang ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-orange-600 border border-orange-100'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </header>

      <div className="content-area py-4">
        <AnimatePresence mode="wait">
          {subStep === 'onboarding' && (
            <motion.div key="onboarding" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <div className="card bg-white p-6 rounded-3xl shadow-xl border border-orange-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Info size={20} className="text-orange-500" /> {t.howItWorks}
                </h2>
                
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">
                        {t[`step${i}`].split(' ')[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{t[`step${i}`].split(' ').slice(1).join(' ')}</div>
                        <div className="text-xs text-gray-500">{t[`step${i}Desc`]}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    // Deep link via WA bot already pre-fills and persists profile.
                    // So we can skip profile collection and go straight to the main dashboard.
                    if (hasDeepLinkUser && isProfileComplete) {
                      setSubStep('dashboard');
                      return;
                    }
                    setSubStep('profile');
                  }}
                  className="w-full mt-8 bg-orange-600 text-white p-5 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  {t.startAudit} <PlayCircle size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {subStep === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="card bg-white p-6 rounded-3xl shadow-xl border border-orange-100">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-800">
                  <User size={20} className="text-orange-500" /> {t.profileTitle}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {t.portfolioLinkPrefix}<a href="https://solveninja.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold underline">{t.portfolioLinkLabel}</a>{t.portfolioLinkSuffix}
                </p>
                
                <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        name="name"
                        required
                        defaultValue={state.userProfile?.name || ''}
                        placeholder="Full Name"
                        className="w-full p-4 pl-12 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">WA</div>
                      <input
                        name="phone"
                        required
                        inputMode="tel"
                        defaultValue={state.userProfile?.phone || ''}
                        placeholder="WhatsApp Number"
                        className="w-full p-4 pl-12 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {profileError && (
                    <div className="text-xs font-bold text-red-500">{profileError}</div>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <button type="submit" className="bg-orange-600 text-white p-5 rounded-2xl font-black text-lg shadow-lg">
                      {t.saveAndStart}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {subStep === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-bold text-gray-800 text-sm">{t.observationProgress}</h2>
                <div className="text-[10px] text-orange-600 font-black uppercase tracking-tighter">{t.ninjaStatus}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="card bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm">
                  <div className="text-2xl font-black text-orange-600">{state.observationCount}</div>
                  <div className="text-[8px] uppercase font-bold text-gray-400 tracking-wider leading-tight">{t.observationCount}</div>
                </div>
                <div className="card bg-white p-4 rounded-3xl border-2 border-blue-100 shadow-sm">
                  <div className="text-2xl font-black text-blue-600">{state.auditCount}</div>
                  <div className="text-[8px] uppercase font-bold text-gray-400 tracking-wider leading-tight">{t.auditCount}</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    if (!isProfileComplete) {
                      setSubStep('profile');
                      return;
                    }
                    startNewSpot('observation');
                    navigate('/checklist');
                  }}
                  className="bg-orange-600 text-white p-5 rounded-3xl font-black text-lg flex items-center justify-between shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3"><MapPin size={24} /> {t.step1}</div>
                  <span className="bg-orange-500 rounded-full w-7 h-7 flex items-center justify-center">+</span>
                </button>

                <button 
                  onClick={() => setSubStep('stopSelection')} 
                  className="p-5 rounded-3xl font-black text-lg flex items-center justify-between shadow-xl transition-all bg-blue-600 text-white"
                >
                  <div className="flex items-center gap-3"><Briefcase size={24} /> {t.step2}</div>
                  <span className="bg-blue-500 rounded-full w-7 h-7 flex items-center justify-center">+</span>
                </button>

                {state.observationCount >= 1 && state.auditCount >= 1 && (
                  <button onClick={() => navigate('/summary')} className="bg-green-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-xl mt-4">
                    <CheckCircle size={24} /> {t.finishReflection}
                  </button>
                )}

                <button 
                  onClick={() => { resetAudit(); setSubStep('onboarding'); }} 
                  className="mt-8 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] text-center"
                >
                  {t.clearProgress}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
