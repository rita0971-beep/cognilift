
import React, { useState, useEffect } from 'react';
import { generateDailyArticle, evaluateComprehension } from './services/geminiService.ts';
import { Article, ExerciseStep, UserAnswers, FeedbackResponse, SessionRecord } from './types.ts';
import { ProgressBar } from './components/ProgressBar.tsx';
import { ScoreChart } from './components/ScoreChart.tsx';

const STEPS: ExerciseStep[] = [
  { id: 'read', label: '深度閱讀' },
  { id: 'logic', label: '拆解結構' },
  { id: 'retell', label: '費曼複述' },
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
      } catch (e) {
        console.error("Failed to load history", e);
      }
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
      alert("AI 引擎啟動失敗。請確認網路連線或 API Key。");
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
        alert("分析失敗: " + e.message); 
      } finally { 
        setLoading(false); 
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6">
        <div className="max-w-4xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('exercise'); setArticle(null); }}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">C</div>
            <span className="font-bold text-lg text-slate-800">CogniLift</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setView('exercise')} className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${view === 'exercise' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>訓練</button>
            <button onClick={() => setView('history')} className={`px-4 py-1 rounded-md text-sm font-bold transition-all ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>成長</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {view === 'exercise' ? (
          <>
            {!article ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-4">為什麼理解力差？</h1>
                <p className="text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">
                  「理解力」的本質不在於記憶力，而在於<b>認知結構</b>。
                  <br/>多數人習慣「執行聽」：聽完表面意思就去做。
                  <br/>深層理解者「邏輯聽」：聽完後會自動拆解底層運行邏輯。
                </p>
                <button 
                  onClick={startNewSession}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'AI 正在構思深度文章...' : '開始底層邏輯訓練'}
                </button>
              </div>
            ) : (
              <div className="animate-in">
                <ProgressBar steps={STEPS} currentStepIndex={currentStep} />
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-sm">
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded uppercase">{article.category}</span>
                        <span className="text-xs text-slate-400 font-medium">建議閱讀時間：3分鐘</span>
                      </div>
                      <h1 className="text-3xl font-black text-slate-900 leading-tight">{article.title}</h1>
                      <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">{article.content}</p>
                    </div>
                  )}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-slate-800">1. 拆解底層邏輯</h2>
                      <p className="text-slate-500">不要看文字表面。作者的核心動機是什麼？這套系統是如何運行的？</p>
                      <textarea 
                        className="w-full p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                        value={answers.problemSolved}
                        onChange={e => setAnswers({...answers, problemSolved: e.target.value})}
                        placeholder="這篇文章真正想解決的底層問題是..."
                      />
                      <div className="space-y-3">
                        <span className="text-sm font-bold text-slate-600">識別關鍵支柱（三個）：</span>
                        {answers.logicStructures.map((ls, i) => (
                          <input 
                            key={i}
                            type="text"
                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={ls}
                            onChange={e => {
                              const newLs = [...answers.logicStructures];
                              newLs[i] = e.target.value;
                              setAnswers({...answers, logicStructures: newLs});
                            }}
                            placeholder={`關鍵點 ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-slate-800">2. 費曼複述</h2>
                      <p className="text-slate-500">假設你要講給一個 10 歲小孩聽，你會如何用最白話的方式重新解釋這套邏輯？</p>
                      <textarea 
                        className="w-full p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-60"
                        value={answers.retellSummary}
                        onChange={e => setAnswers({...answers, retellSummary: e.target.value})}
                        placeholder="用你自己的話說..."
                      />
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-slate-800">3. 批判性提問</h2>
                      <p className="text-slate-500">拒絕被動接收。針對文章內容提出兩個具備深度的、可以進一步挖掘的疑問。</p>
                      {answers.questions.map((q, i) => (
                        <input 
                          key={i}
                          type="text"
                          className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  )}
                  {currentStep === 4 && feedback && (
                    <div className="space-y-8 text-center">
                      <div className="inline-block px-12 py-8 bg-indigo-600 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
                        <div className="text-sm opacity-70 font-bold tracking-widest uppercase mb-2">認知理解分</div>
                        <div className="text-8xl font-black">{feedback.score}</div>
                      </div>
                      <div className="text-left grid gap-4">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-slate-800 mb-2">💡 給你的改進建議</h4>
                          <p className="text-slate-600 leading-relaxed">{feedback.improvementTip}</p>
                        </div>
                      </div>
                      <button onClick={() => { setArticle(null); setCurrentStep(0); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-lg">完成今日訓練</button>
                    </div>
                  )}

                  {currentStep < STEPS.length - 1 && (
                    <div className="mt-12 flex justify-end">
                      <button 
                        onClick={handleNext}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                        {loading ? 'AI 教練分析中...' : '下一步'}
                        {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16"/></svg>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">成長軌跡</h2>
            <ScoreChart records={history} />
            <div className="grid gap-3">
              {history.map(record => (
                <div key={record.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="text-xs text-slate-400 font-bold mb-1">{new Date(record.timestamp).toLocaleDateString()}</div>
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
