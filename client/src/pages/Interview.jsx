import { useState, useEffect } from 'react';
import { startInterview, submitInterviewAnswer } from '../services/api';
import { UserRoundCheck, Send, MessageCircleQuestion, Trophy, ShieldAlert } from 'lucide-react';

export default function Interview() {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await startInterview();
        setSession(data.session_id);
        setCurrentQuestion(data.first_question);
      } catch (err) {
        console.error('Failed to start interview', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !session) return;
    
    setIsLoading(true);
    try {
      const data = await submitInterviewAnswer(session, answer);
      setFeedback({
        score: data.score,
        text: data.feedback
      });
      setCurrentQuestion(data.next_question);
      setAnswer('');
    } catch (err) {
      console.error('Failed to submit answer', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
          <UserRoundCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mock Interview</h1>
          <p className="mt-1 text-sm text-slate-500">Practice your interviewing skills with our AI.</p>
        </div>
      </div>
      
      {feedback && (
        <div className={`rounded-xl p-5 border ${
          feedback.score >= 80 ? 'bg-green-50 border-green-100' : 
          feedback.score >= 60 ? 'bg-amber-50 border-amber-100' : 
          'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg shrink-0 ${
              feedback.score >= 80 ? 'bg-green-100 text-green-600' : 
              feedback.score >= 60 ? 'bg-amber-100 text-amber-600' : 
              'bg-red-100 text-red-600'
            }`}>
              {feedback.score >= 80 ? <Trophy className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`font-semibold mb-1 ${
                feedback.score >= 80 ? 'text-green-800' : 
                feedback.score >= 60 ? 'text-amber-800' : 
                'text-red-800'
              }`}>
                Score: {feedback.score}/100
              </h3>
              <p className={`text-sm ${
                feedback.score >= 80 ? 'text-green-700' : 
                feedback.score >= 60 ? 'text-amber-700' : 
                'text-red-700'
              }`}>
                {feedback.text}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card-base p-6 sm:p-8">
        <div className="flex gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <MessageCircleQuestion className="w-5 h-5 text-slate-600" />
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-5 flex-1">
            <h3 className="text-lg font-medium text-slate-900 leading-relaxed">
              {currentQuestion}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <textarea
            className="input-field min-h-[160px] resize-y p-4 bg-white"
            placeholder="Type your detailed answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600" 
              disabled={isLoading || !answer.trim()}
            >
              Submit Answer <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
