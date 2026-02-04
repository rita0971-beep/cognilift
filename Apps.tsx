
import React, { useState, useEffect } from 'react';
import { generateDailyArticle, evaluateComprehension } from './services/geminiService.ts';
import { Article, ExerciseStep, UserAnswers, FeedbackResponse, SessionRecord } from './types.ts';
import { ProgressBar } from './components/ProgressBar.tsx';
import { ScoreChart } from './components/ScoreChart.tsx';

const STEPS: ExerciseStep[] = [
  { id: 'read', label: '深度閱讀' },
  { id: 'logic', label: '結構分析' },
  { id: 'retell', label: '口語複述' },
  { id: 'questioning', label: '批判提問' },
  { id: 'feedback', label: '成果印章' }
];

const App: React.FC = () => {
  const [view, setView] = useState<'exercise' | 'history' | 'settings'>('exercise');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState(localStorage.getItem('COGNILIFT_API_KEY') || '');
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
      } catch (e) { console.error(e); }
    }
    if (!localStorage.getItem('COGNILIFT_API_KEY')) {
      setView('settings');
    }
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('COGNILIFT_API_KEY', apiKey);
    setView('exercise');
  };

  const startNewSession = async () => {
    setLoading(true);
    try {
      const newArt = await generateDailyArticle();
      setArticle(newArt);
      setCurrentStep(0);
      setFeedback(null);
    } catch (e: any) {
      if (e.message === "MISSING_KEY") {
        setView('settings');
      } else {
        alert("載入失敗: " + e.message);
      }
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
          const newRecord = { id: Date.now().toString(), timestamp: Date.now(), article, answers, feedback: res };
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 safe-pt">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">C</div>
            <h1 className="font-black text-slate-800 tracking-tight">CogniLift</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setView('exercise')} className={`text-xl ${view === 'exercise' ? 'opacity-100' : 'opacity-30'}`}>✍️</button>
            <button onClick={() => setView('history')} className={`text-xl ${view === 'history' ? 'opacity-100' : 'opacity-30'}`}>📊</button>
            <button onClick={() => setView('settings')} className={`text-xl ${view === 'settings' ? 'opacity-100' : 'opacity-30'}`}>⚙️</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {view === 'settings' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm animate-in">
            <h2 className="text-xl font-black mb-4 text-slate-800">設定 API Key</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">請輸入您的 Gemini API Key。這將保存在您的設備本地，不會被發送到任何其他伺服器。</p>
            <input 
              type="password"
              className="w-full bg-slate-100 border-none rounded-2xl p-4 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="貼上你的 API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button 
              onClick={saveApiKey}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-indigo-100"
            >
              儲存並開始
            </button>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="block text-center mt-6 text-xs text-indigo-500 font-semibold">
              點此獲取免費 API Key →
            </a>
          </div>
        )}

        {view === 'exercise' && (
          <div className="pb-24">
            {!article ? (
              <div className="text-center py-16 animate-in">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🧠</span>
                </div>
                <h2 className="text-2xl font-black mb-3 text-slate-800">開始今日認知訓練</h2>
                <p className="text-slate-400 mb-8 max-w-[280px] mx-auto text-sm leading-relaxed">透過深度閱讀與邏輯複述，重塑大腦的理解路徑。</p>
                <button onClick={startNewSession} disabled={loading} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                  {loading ? '思考中...' : '生成今日文章'}
                </button>
              </div>
            ) : (
              <div className="animate-in">
                <ProgressBar steps={STEPS} currentStepIndex={currentStep} />
                
                {STEPS[currentStep].id === 'read' && (
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">{article.category}</span>
                    </div>
                    <h2 className="text-2xl font-black mb-6 text-slate-800 leading-tight">{article.title}</h2>
                    <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap select-text">{article.content}</div>
                  </div>
                )}

                {['logic', 'retell', 'questioning'].includes(STEPS[currentStep].id) && (
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-slate-800 font-black text-xl mb-2">{STEPS[currentStep].label}</h3>
                      <p className="text-slate-400 text-xs mb-6 font-medium">請在下方輸入您的分析或複述內容...</p>
                      <textarea 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 min-h-[300px] outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-lg leading-relaxed"
                        placeholder="動動腦，寫下你的思考..."
                        onChange={(e) => {
                          const v = e.target.value;
                          setAnswers(prev => ({
                            ...prev,
                            problemSolved: currentStep === 1 ? v : prev.problemSolved,
                            retellSummary: currentStep === 2 ? v : prev.retellSummary,
                            questions: currentStep === 3 ? [v] : prev.questions
                          }));
                        }}
                      />
                   </div>
                )}

                {STEPS[currentStep].id === 'feedback' && feedback && (
                   <div className="space-y-4 animate-in">
                      <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-slate-100">
                        <div className="text-5xl font-black text-indigo-600 mb-2">{feedback.score}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Mastery Level</div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border-l-4 border-indigo-500 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <span>🎯</span> 認知教練的反饋
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{feedback.improvementTip}</p>
                      </div>
                   </div>
                )}
                
                <div className="fixed bottom-8 left-4 right-4 max-w-2xl mx-auto z-40">
                  <button onClick={handleNext} disabled={loading} className="w-full bg-slate-900 text-white h-16 rounded-2xl font-bold shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {loading ? '正在分析思維模型...' : currentStep === STEPS.length - 1 ? '完成今日練習' : '下一步'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-6 animate-in pb-20">
            <h2 className="text-2xl font-black text-slate-800">成長曲線</h2>
            <ScoreChart records={history} />
            <div className="space-y-3">
              {history.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm active:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">{r.article.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black">
                    {r.feedback.score}
                  </div>
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
