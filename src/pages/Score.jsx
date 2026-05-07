import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Score = () => {
  const { state, completeSpot, submitToSheet } = useAudit();
  const t = useTranslation('checklist');
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFinish = async () => {
    if (selected && !isSaving) {
      setIsSaving(true);
      try {
        const finalSpot = { ...state.currentSpot, heatScore: selected };
        await submitToSheet(finalSpot, 'SPOT');
        completeSpot(); 
        setIsDone(true);
        setTimeout(() => navigate('/'), 800);
      } catch (e) {
        console.error("Save failed", e);
        navigate('/');
      }
    }
  };

  const scores = [
    { val: 1, label: t.score1, desc: t.score1Desc },
    { val: 2, label: t.score2, desc: t.score2Desc },
    { val: 3, label: t.score3, desc: t.score3Desc },
    { val: 4, label: t.score4, desc: t.score4Desc },
    { val: 0, label: t.score0, desc: t.score0Desc }
  ];

  return (
    <div className="page p-6 bg-white min-h-screen">
      <header className="mb-10 pt-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2">{t.scoreTitle}</h2>
        <p className="text-gray-500 font-medium">Pick the level that matches the clues you saw.</p>
      </header>

      <div className="flex flex-col gap-4">
        {scores.map(s => (
          <motion.button 
            key={s.val}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(s.val)}
            className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-1 ${selected === s.val ? 'border-orange-500 shadow-lg scale-[1.02]' : 'border-gray-50 bg-gray-50 opacity-70'}`}
          >
            <div className={`text-lg font-black ${selected === s.val ? 'text-orange-600' : 'text-gray-700'}`}>{s.label}</div>
            <div className="text-sm font-medium text-gray-400">{s.desc}</div>
          </motion.button>
        ))}
      </div>

      <button 
        disabled={!selected || isSaving || isDone}
        onClick={handleFinish}
        className={`p-6 rounded-3xl font-black text-xl w-full mt-12 shadow-xl transition-all flex items-center justify-center gap-3 ${isDone ? 'bg-green-600 text-white' : 'bg-orange-600 text-white disabled:opacity-30 disabled:shadow-none'}`}
      >
        {isDone ? 'Saved! ✨' : isSaving ? 'Saving...' : 'Save Observation'} 
        <CheckCircle className={(isSaving && !isDone) ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default Score;
