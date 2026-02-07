
import React, { useState, useEffect } from 'react';
import { generateDailyArticle, evaluateComprehension } from './services/geminiService.ts';
import { Article, ExerciseStep, UserAnswers, FeedbackResponse, SessionRecord } from './types.ts';
import { ProgressBar } from './components/ProgressBar.tsx';
import { ScoreChart } from './components/ScoreChart.tsx';

const STEPS: ExerciseStep[] = [
  { id: 'read', label: '深度閱讀' },
  { id: 'logic', label: '底層邏輯' },
  { id: 'retell', label: '直白複述' },
  { id: 'questioning', label: '批判提問' },
  { id: 'feedback', label: '訓練結算' }
];

const App: React.FC = () => {
  const [view, setView] = useState<'exercise' | 'history'>('exercise');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({
    logicStructures: ['', '', ''],
    problemSolved: '',
    retellSummary: '',
    questions: ['', '']
  });
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cognilift_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch (e) { console.error("Failed to load history", e); }
    }
  }, []);

  const startNewSession = async () => {
    setLoading(true);
    try {
      const newArt = await generateDailyArticle();
      setArticle(newArt);
      setCurrentStep(0);
      setFeedback(null);
      setAnswers({
        logicStructures: ['', '', ''],
        problemSolved: '',
        retellSummary: '',
        questions: ['', '']
      });
    } catch (e: any) {
      alert("載入失敗: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === STEPS.length - 2) {
      setLoading(true);
      try {
        if (article) {
          const res = await evaluateComprehension(article, answers);
          setFeedback(res);
          const newRecord: SessionRecord = { 
            id: Date.now().toString(), 
            timestamp: Date.now(), 
            article, 
            answers, 
            feedback: res 
          };
          const updated = [newRecord, ...history];
          setHistory(updated);
          localStorage.setItem('cognilift_history', JSON.stringify(updated));
          setCurrentStep(prev => prev + 1);
        }
      } catch (e: any) { 
        alert("評估失敗: " + e.message); 
      } finally { 
        setLoading(false); 
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const renderStep = () => {
    if (!article) return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">準備好提升認知能力了嗎？</h2>
        <p className="text-slate-500 mb-8 max-w-sm">我們將透過結構化訓練，幫助你從「聽表面」進化到「聽邏輯」。</p>
        <button 
          onClick={startNewSession}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? '思考中...' : '開始今日訓練'}
        </button>
      </div>
    );

    const step = STEPS[currentStep];

    switch (step.id) {
      case 'read':
        return (
          <div className="animate-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">{article.category}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{article.title}</h1>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{article.content}</p>
            </div>
          </div>
        );
      case 'logic':
        return (
          <div className="space-y-6 animate-in">
            <h2 className="text-2xl font-bold text-slate-800">識別底層邏輯</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-600 mb-2 block">這篇文章解決了什麼核心問題？</span>
                <textarea 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  value={answers.problemSolved}
                  onChange={e => setAnswers({...answers, problemSolved: e.target.value})}
                  placeholder="請描述你認知的核心議題..."
                />
              </label>
              <div>
                <span className="text-sm font-semibold text-slate-600 mb-2 block">關鍵論點 / 結構</span>
                {answers.logicStructures.map((ls, i) => (
                  <input 
                    key={i}
                    type="text"
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
                    value={ls}
                    onChange={e => {
                      const newLs = [...answers.logicStructures];
                      newLs[i] = e.target.value;
                      setAnswers({...answers, logicStructures: newLs});
                    }}
                    placeholder={`論點 ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'retell':
        return (
          <div className="space-y-6 animate-in">
            <h2 className="text-2xl font-bold text-slate-800">費曼技巧：直白複述</h2>
            <p className="text-slate-500">用最簡單的語言總結這篇文章，確保連五歲小孩都能聽懂。</p>
            <textarea 
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px]"
              value={answers.retellSummary}
              onChange={e => setAnswers({...answers, retellSummary: e.target.value})}
              placeholder="用你自己的話來說..."
            />
          </div>
        );
      case 'questioning':
        return (
          <div className="space-y-6 animate-in">
            <h2 className="text-2xl font-bold text-slate-800">批判性提問</h2>
            <p className="text-slate-500">不只是執行，更要思考。針對文章內容提出兩個具備質疑性的問題。</p>
            {answers.questions.map((q, i) => (
              <input 
                key={i}
                type="text"
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
                value={q}
                onChange={e => {
                  const newQ = [...answers.questions];
                  newQ[i] = e.target.value;
                  setAnswers({...answers, questions: newQ});
                }}
                placeholder={`提問 ${i + 1}`}
              />
            ))}
          </div>
        );
      case 'feedback':
        if (!feedback) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
        return (
          <div className="space-y-8 animate-in">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white text-center shadow-xl">
              <div className="text-sm font-medium opacity-80 mb-2 tracking-widest uppercase">訓練評分</div>
              <div className="text-7xl font-black mb-4">{feedback.score}</div>
              <div className="text-lg opacity-90">{feedback.improvementTip}</div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">邏輯分析</h4>
                <p className="text-sm text-slate-600">{feedback.logicFeedback}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">複述表達</h4>
                <p className="text-sm text-slate-600">{feedback.summaryFeedback}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">批判提問</h4>
                <p className="text-sm text-slate-600">{feedback.questioningFeedback}</p>
              </div>
            </div>
            
            <button 
              onClick={() => { setArticle(null); setCurrentStep(0); }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              完成今日訓練
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6">
        <div className="max-w-4xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('exercise'); setArticle(null); }}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <span className="font-bold text-lg text-slate-800">CogniLift</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button onClick={() => setView('exercise')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${view === 'exercise' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>訓練</button>
            <button onClick={() => setView('history')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>記錄</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {view === 'exercise' ? (
          <>
            {article && <ProgressBar steps={STEPS} currentStepIndex={currentStep} />}
            <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm min-h-[400px]">
              {renderStep()}
              {article && currentStep < STEPS.length - 1 && (
                <div className="mt-12 flex justify-end">
                  <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? '計算中...' : '下一步'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in">
            <div className="bg-white p-8 rounded-3xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">訓練趨勢</h2>
              <ScoreChart records={history} />
            </div>
            <div className="space-y-4">
              {history.map(record => (
                <div key={record.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">{new Date(record.timestamp).toLocaleDateString()}</div>
                    <div className="font-bold text-slate-800">{record.article.title}</div>
                  </div>
                  <div className="text-2xl font-black text-indigo-600">{record.feedback.score}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
