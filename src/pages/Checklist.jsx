import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Camera, MapPin, SkipForward, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Checklist = () => {
  const { state, updateCurrentSpot, completeSpot } = useAudit();
  const t = useTranslation('checklist');
  const navigate = useNavigate();
  const [qIndex, setQIndex] = useState(-1); // -1 for Photo/Location step
  const [answers, setAnswers] = useState({});

  const refreshLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        updateCurrentSpot({ location: loc });
      });
    }
  };

  const phase = state.currentSpot?.phase || 'observation';
  const stopType = state.currentSpot?.stopType;

  // Question Set Builder
  const getQuestions = () => {
    if (phase === 'observation') {
      return [
        { id: 'o1', text: t.o1, options: t.o1Opts },
        { id: 'o2', text: t.o2, options: t.o2Opts },
        { id: 'o3', text: t.o3, options: t.o3Opts },
        { id: 'o4', text: t.o4, options: t.o4Opts },
        { id: 'o5', text: t.o5, options: t.o5Opts },
        { id: 'o6', text: t.o6, options: t.o6Opts },
        { id: 'w1', text: t.w1, options: t.w1Opts },
        { id: 'w2', text: t.w2, options: t.w2Opts }
      ];
    }

    // Phase: Audit
    const base = [
      { id: 'q1', text: stopType === 'work' ? t.q1Work : t.o1, options: stopType === 'work' ? t.q1WorkOpts : t.o1Opts },
      { id: 'q2', text: t.o2, options: t.o2Opts },
      { id: 'q3', text: t.o3, options: t.o3Opts }
    ];

    if (stopType === 'gate') {
      base.push({ id: 'q4', text: t.o4, options: t.o4Opts });
    }

    base.push({ id: 'q5', text: t.o5, options: stopType === 'work' ? t.q5WorkOpts : t.o5Opts });

    // Entry Block (Q6, Q7, Q8)
    base.push({ id: 'q6', text: t.q6Comfort, options: t.q6ComfortOpts });
    base.push({ id: 'q7', text: t.q7Waiting, options: t.q7WaitingOpts });
    
    // Conditional Q8 (only if Q7 is Yes)
    if (answers['q7']?.includes('Yes')) {
      base.push({ id: 'q8', text: t.q8CanSit, options: t.q8CanSitOpts });
    }

    // Worker Block
    base.push({ id: 'w1', text: t.w1, options: t.w1Opts });
    base.push({ id: 'w2', text: t.w2, options: t.w2Opts });

    return base;
  };

  const questions = getQuestions();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCurrentSpot({ photo: reader.result });
        setQIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnswer = (val) => {
    const qId = questions[qIndex].id;
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);
    
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      updateCurrentSpot({ answers: newAnswers });
      navigate('/score');
    }
  };

  if (qIndex === -1) {
    return (
      <div className="page p-6 bg-white min-h-screen">
        <header className="mb-10 pt-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">{t.evidenceTitle}</span>
          <h2 className="text-3xl font-black text-gray-800 leading-tight mt-2">{t.photoSnap}</h2>
          <p className="text-gray-500 font-medium mt-2">{t.photoDesc}</p>
        </header>

        <div className="flex flex-col gap-6">
          <div className="aspect-square bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
            {state.currentSpot?.photo ? (
              <img src={state.currentSpot.photo} className="w-full h-full object-cover" alt="Captured" />
            ) : (
              <>
                <Camera size={48} className="text-gray-200 mb-4" />
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="absolute inset-0 opacity-0 cursor-pointer" />
                <span className="text-gray-400 font-bold">{t.tapSnap}</span>
              </>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl flex items-center justify-between gap-4 border border-blue-100">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${state.currentSpot?.location ? 'bg-green-500 text-white' : 'bg-blue-200 text-blue-600 animate-pulse'}`}>
                <MapPin size={20} />
              </div>
              <div>
                <div className="font-bold text-blue-800">{state.currentSpot?.location ? t.locLocked : t.locating}</div>
                <div className="text-xs text-blue-600 font-medium">{state.currentSpot?.location ? `${state.currentSpot.location.lat.toFixed(4)}, ${state.currentSpot.location.lng.toFixed(4)}` : t.gpsWait}</div>
              </div>
            </div>
            <button onClick={refreshLocation} className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm active:scale-90 transition-all">
              <RefreshCw size={20} />
            </button>
          </div>

          <button onClick={() => setQIndex(0)} className="bg-orange-600 text-white p-6 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 mt-4">
            {state.currentSpot?.photo ? t.next : t.skipContinue} <SkipForward />
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[qIndex];

  return (
    <div className="page p-6 bg-white min-h-screen">
      <header className="mb-10 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
            {phase} Phase
          </span>
          <span className="text-xs font-bold text-gray-300">
            {qIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${phase === 'observation' ? 'bg-orange-500' : 'bg-blue-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <motion.div 
        key={qIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-4">{currentQ.text}</h2>
      </motion.div>

      <div className="flex flex-col gap-4">
        {currentQ.options.map((opt, i) => (
          <motion.button 
            key={opt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleAnswer(opt)}
            className="group p-6 rounded-3xl border-2 border-gray-50 bg-gray-50 text-left hover:border-orange-500 hover:bg-white hover:shadow-xl transition-all flex justify-between items-center"
          >
            <span className="font-bold text-gray-700 group-hover:text-orange-600">{opt}</span>
            <ArrowRight className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={20} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Checklist;
