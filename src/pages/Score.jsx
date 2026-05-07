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

  const handleFinish = async () => {
    if (selected && !isSaving) {
      setIsSaving(true);
      try {
        const finalSpot = { ...state.currentSpot, heatScore: selected };
        await submitToSheet(finalSpot, 'SPOT');
        completeSpot(); 
        // Small delay to ensure state persists before navigation
        setTimeout(() => navigate('/'), 100);
      } catch (e) {
        console.error("Save failed", e);
        navigate('/'); // Navigate anyway so user isn't stuck
      }
    }
  };

  const scores = [
    { val: 1, label: t.score1, desc: "Full shade · cool surfaces", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { val: 2, label: t.score2, desc: "Partial shade · warm surfaces", color: "bg-green-50 text-green-600 border-green-100" },
    { val: 3, label: t.score3, desc: "Direct sun · hot surfaces", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { val: 4, label: t.score4, desc: "No shade · all surfaces hot", color: "bg-red-50 text-red-600 border-red-100" }
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
        disabled={!selected || isSaving}
        onClick={handleFinish}
        className="bg-orange-600 text-white p-6 rounded-3xl font-black text-xl w-full mt-12 shadow-xl disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-3"
      >
        {isSaving ? 'Saving...' : 'Save Observation'} <CheckCircle className={isSaving ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default Score;
