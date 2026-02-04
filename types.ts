
export interface Article {
  title: string;
  content: string;
  category: string;
  problemSolved: string;
}

export interface ExerciseStep {
  id: 'read' | 'logic' | 'retell' | 'questioning' | 'feedback';
  label: string;
}

export interface UserAnswers {
  logicStructures: string[];
  problemSolved: string;
  retellSummary: string;
  questions: string[];
}

export interface FeedbackResponse {
  score: number;
  logicFeedback: string;
  summaryFeedback: string;
  questioningFeedback: string;
  improvementTip: string;
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  article: Article;
  answers: UserAnswers;
  feedback: FeedbackResponse;
}
