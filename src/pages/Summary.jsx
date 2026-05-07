import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Share2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Summary = () => {
  const { state, resetAudit, submitToSheet } = useAudit();
  const t = useTranslation('reflection');
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [reflections, setReflections] = useState({ r1: '', r2: '', r3: '' });

  const questions = [
    { id: 'r1', text: t.q1, type: 'buttons', options: ['Better Lighting', 'More Rest', 'Water Access', 'Other'] },
    { id: 'r2', text: t.q2, type: 'buttons', options: ['Eye-opening', 'Respect grew', 'Same as before'] },
    { id: 'r3', text: t.q3, type: 'text' }
  ];

  const handleNext = async (val) => {
    const qId = questions[step].id;
    const newRef = { ...reflections, [qId]: val };
    setReflections(newRef);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await submitToSheet(newRef, 'REFLECTION_ONLY');
      setStep(questions.length); // Final success
    }
  };

  const currentQ = questions[step];

  return (
    <div className="page p-6 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <AnimatePresence mode="wait">
        {step < questions.length ? (
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <header className="mb-10 pt-4">
              <h2 className="text-xl font-black text-green-700 flex items-center gap-2">
                <MessageSquare className="text-green-500" /> {t.title}
              </h2>
              <div className="text-[10px] font-bold text-green-300 uppercase tracking-widest mt-1">Step {step + 1} of {questions.length}</div>
            </header>

            <div className="card bg-white p-8 rounded-3xl shadow-xl border border-green-100 mb-8">
               <h3 className="text-2xl font-bold mb-8 text-gray-800 leading-tight">{currentQ.text}</h3>
               
               {currentQ.type === 'buttons' ? (
                 <div className="flex flex-col gap-3">
                   {currentQ.options.map(opt => (
                     <button 
                       key={opt}
                       onClick={() => handleNext(opt)} 
                       className="bg-green-50 text-green-700 p-5 rounded-2xl font-bold hover:bg-green-600 hover:text-white transition-all text-left"
                     >
                       {opt}
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col gap-4">
                   <textarea 
                     className="w-full p-5 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none h-32"
                     placeholder="Write your pledge here..."
                     id="pledge-text"
                   />
                   <button 
                     onClick={() => handleNext(document.getElementById('pledge-text').value)} 
                     className="bg-green-600 text-white p-5 rounded-2xl font-black text-lg shadow-lg"
                   >
                     {t.finish}
                   </button>
                 </div>
               )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="final" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
            <div className="inline-block p-8 bg-green-100 text-green-600 rounded-full mb-10 shadow-inner">
              <CheckCircle size={80} />
            </div>
            <h1 className="text-4xl font-black mb-4 text-gray-800 tracking-tight">Impact Made!</h1>
            <p className="text-gray-500 font-medium mb-12 max-w-[280px] mx-auto leading-relaxed">You've officially joined the ranks of changemakers improving workplace dignity.</p>
            
            <div className="flex flex-col gap-4">
               <button className="bg-orange-600 text-white p-6 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                 <Share2 /> Share My Pledge
               </button>
               <button onClick={() => { resetAudit(); navigate('/'); }} className="p-4 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-gray-600 transition-colors">Start New Journey</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Summary;
