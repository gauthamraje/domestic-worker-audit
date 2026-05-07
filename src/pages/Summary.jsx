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
      <div className="page p-6 bg-orange-600 min-h-screen flex flex-col items-center justify-center text-white text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-xl">
            <Heart size={48} className="fill-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">You are a Changemaker.</h2>
          <p className="text-orange-100 font-medium mb-12 text-lg px-4">
            Your observations have been logged. You've taken the first step toward a more dignified workplace.
          </p>

          <div className="bg-white text-orange-600 p-8 rounded-[2.5rem] shadow-2xl text-left mb-10 max-w-sm mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 -mr-16 -mt-16 rounded-full opacity-50"></div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2">My Pledge</span>
            <p className="text-xl font-bold italic leading-tight">
              "{reflections.r3 || "I commit to observing and acting for workplace dignity."}"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black">
                {state.userProfile?.name?.charAt(0) || "N"}
              </div>
              <div className="text-xs font-black uppercase tracking-tighter">
                {state.userProfile?.name || "Anonymous Ninja"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full px-8">
            <button 
              onClick={() => { resetAudit(); navigate('/'); }}
              className="bg-white/10 border-2 border-white/20 p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
            >
              <HomeIcon size={20} /> Back to Start
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[step];

  return (
    <div className="page p-6 bg-white min-h-screen">
      <header className="mb-12 pt-4">
        <div className="flex gap-1 mb-4">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-orange-600' : 'bg-gray-100'}`} />
          ))}
        </div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">The Reflection</h2>
      </header>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ x: 20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          exit={{ x: -20, opacity: 0 }}
          className="flex flex-col h-[65vh] justify-between"
        >
          <div>
            <div className="text-5xl mb-6">{currentQ.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-8">
              {currentQ.text}
            </h3>
            <textarea 
              value={reflections[currentQ.id]}
              onChange={(e) => setReflections({...reflections, [currentQ.id]: e.target.value})}
              placeholder="Type your thoughts here..."
              className="w-full h-48 p-6 bg-gray-50 border-2 border-transparent focus:border-orange-200 rounded-3xl text-lg font-medium focus:outline-none transition-all resize-none shadow-inner"
            />
          </div>

          <button 
            onClick={handleNext}
            disabled={!reflections[currentQ.id] || isSubmitting}
            className="bg-orange-600 text-white p-6 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-30 transition-all transform active:scale-95"
          >
            {isSubmitting ? 'Submitting...' : step === questions.length - 1 ? 'Finish & Pledge' : 'Next Question'} 
            {step === questions.length - 1 ? <CheckCircle /> : <Send size={20} />}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Summary;
