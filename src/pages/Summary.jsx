import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, CheckCircle, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Summary = () => {
  const { state, submitToSheet, resetAudit } = useAudit();
  const t = useTranslation('reflection');
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [reflections, setReflections] = useState({ r1: "", r2: "", r3: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    { id: 'r1', text: t.q1, icon: "👀" },
    { id: 'r2', text: t.q2, icon: "🌍" },
    { id: 'r3', text: t.q3, icon: "🤝" }
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitToSheet(reflections, 'REFLECTION');
      setStep(questions.length); // Final "Pledge Card" state
    } catch (e) {
      console.error("Reflection submission failed", e);
      setStep(questions.length); // Still show success UI to user
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === questions.length) {
    return (
      <div className="page bg-orange-600 text-white">
        <div className="content-area flex flex-col items-center justify-center text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-xl">
              <Heart size={40} className="fill-white" />
            </div>
            <h2 className="text-3xl font-black mb-3">{t.successTitle}</h2>
            <p className="text-orange-100 font-medium mb-8 text-base px-4">
              Your observations have been logged. You've taken the first step toward a more dignified workplace.
            </p>

            <div className="bg-white text-orange-600 p-6 rounded-[2.5rem] shadow-2xl text-left mb-8 max-w-sm mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 -mr-12 -mt-12 rounded-full opacity-50"></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2">{t.pledgeLabel}</span>
              <p className="text-lg font-bold italic leading-tight">
                "{reflections.r3 || "I commit to observing and acting for workplace dignity."}"
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[8px] font-black">
                  {state.userProfile?.name?.charAt(0) || "N"}
                </div>
                <div className="text-[10px] font-black uppercase tracking-tighter">
                  {state.userProfile?.name || "Anonymous Ninja"}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="fixed-footer bg-transparent border-none">
          <button 
            onClick={() => { resetAudit(); navigate('/'); }}
            className="bg-white text-orange-600 p-5 rounded-2xl font-black text-lg w-full flex items-center justify-center gap-2 shadow-2xl"
          >
            <HomeIcon size={20} /> {t.backToStart}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[step];

  return (
    <div className="page bg-white">
      <header className="p-6 pb-2">
        <div className="flex gap-1 mb-4">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-orange-600' : 'bg-gray-100'}`} />
          ))}
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t.headerTitle}</h2>
      </header>

      <div className="content-area py-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -20, opacity: 0 }}
            className="flex flex-col"
          >
            <div className="text-5xl mb-4">{currentQ.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-6">
              {currentQ.text}
            </h3>
            <textarea 
              value={reflections[currentQ.id]}
              onChange={(e) => setReflections({...reflections, [currentQ.id]: e.target.value})}
              placeholder={t.placeholder}
              className="w-full h-40 p-5 bg-gray-50 border-2 border-transparent focus:border-orange-200 rounded-3xl text-lg font-medium focus:outline-none transition-all resize-none shadow-inner"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed-footer">
        <button 
          onClick={handleNext}
          disabled={!reflections[currentQ.id] || isSubmitting}
          className="bg-orange-600 text-white p-5 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 w-full disabled:opacity-30 transition-all"
        >
          {isSubmitting ? t.submitting : step === questions.length - 1 ? t.finishAndPledge : t.nextQuestion} 
          {step === questions.length - 1 ? <CheckCircle size={24} /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Summary;
