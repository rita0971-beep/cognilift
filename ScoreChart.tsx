
import React from 'react';
import { SessionRecord } from '../types.ts';

interface ScoreChartProps {
  records: SessionRecord[];
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ records }) => {
  if (records.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
        累積更多訓練記錄以顯示進度趨勢圖
      </div>
    );
  }

  const scores = records.map(r => r.feedback.score);
  const maxScore = 100;
  const width = 600;
  const height = 160;
  const padding = 20;

  const points = scores.map((score, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - 2 * padding);
    const y = height - (padding + (score / maxScore) * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-x-auto bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = height - (padding + (val / maxScore) * (height - 2 * padding));
          return (
            <g key={val}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x="0" y={y + 4} className="text-[10px] fill-slate-300 font-medium">{val}</text>
            </g>
          );
        })}
        {/* Line */}
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-sm"
        />
        {/* Points */}
        {scores.map((score, i) => {
          const x = padding + (i / (scores.length - 1)) * (width - 2 * padding);
          const y = height - (padding + (score / maxScore) * (height - 2 * padding));
          return (
            <circle key={i} cx={x} cy={y} r="4" fill="#4f46e5" className="hover:r-6 transition-all cursor-pointer" />
          );
        })}
      </svg>
      <div className="flex justify-between mt-2 px-[20px]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">最早</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">最近</span>
      </div>
    </div>
  );
};
