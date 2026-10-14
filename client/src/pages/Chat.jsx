import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  Lightbulb,
  Briefcase,
  TrendingUp,
  FileText,
  Trash2
} from 'lucide-react';

export default function Chat() {
  const initialMessages = [
    { 
      role: 'ai', 
      text: "Hello! I'm your dedicated CareerCraft AI Career Coach. I can help critique your resume bullet points, prepare you for behavioral and technical interviews, guide your salary negotiations, or plan your next promotion. What would you like to focus on today?",
      time: 'Just now'
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const promptSuggestions = [
    { icon: <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />, text: "How can I rewrite my resume bullets using the STAR method?" },
    { icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />, text: "What are effective salary negotiation strategies for senior engineering roles?" },
    { icon: <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />, text: "How do I transition from Software Engineer to AI/ML Engineer?" },
    { icon: <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />, text: "What high-impact questions should I ask my interviewer at the end?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: textToSend, time: currentTime }]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend);
      const reply = response.reply || response.response || response.message || "Focus on quantifiable accomplishments, scalable architecture decisions, and demonstrable business impact.";
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch {
      // Intelligent fallback guidance
      const fallbackResponses = [
        "When tailoring your profile, highlight high-leverage metrics (e.g., 'Reduced p99 API latency by 42%', 'Led distributed system migration to Kubernetes'). In interviews, structure every story using the STAR framework: Situation, Task, Action, and measurable Result.",
        "For salary negotiations: Never state your current compensation first. Research the market median using our Salary Estimator, highlight your specific architecture strengths, and ask for the upper quartile with confidence and enthusiasm.",
        "To break into high-paying AI engineering roles: Build 2-3 production-grade end-to-end applications demonstrating LLM tool calling, vector databases, and resilient asynchronous backend microservices."
      ];
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: randomFallback, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Coach response copied to clipboard!', 'Copied');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleConfirmReset = () => {
    setMessages(initialMessages);
    setIsResetModalOpen(false);
    toast.info('Chat session history has been cleared.', 'Chat Reset');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto animate-fade-in">
      {/* Header bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              AI Career Coach
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Personalized 24/7 strategic advisor for interviews, negotiations, and career transitions.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsResetModalOpen(true)}
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          className="self-start sm:self-auto"
        >
          Reset Session
        </Button>
      </div>

      {/* Main Chat Box Container */}
      <div className="flex-1 rounded-3xl flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex gap-3 sm:gap-4 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div className="max-w-[85%] sm:max-w-[75%] space-y-1.5">
                <div 
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-xs' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  {msg.role === 'ai' && (
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/80 dark:bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className={`text-[10px] text-slate-400 px-1 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-xs flex items-center gap-2 shadow-xs">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Coach is thinking</span>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {messages.length <= 4 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Suggested:
            </span>
            {promptSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.text)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs"
              >
                {item.icon}
                <span className="truncate max-w-xs">{item.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <input 
              type="text" 
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 rounded-2xl py-3.5 pl-5 pr-14 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-hidden"
              placeholder="Ask your coach about interview tactics, salary counter-offers, or career pivots..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Coaching Chat"
        description="Are you sure you want to clear your current conversation history?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset} icon={Trash2}>
              Clear Chat
            </Button>
          </>
        }
      >
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Clearing the chat resets the prompt context so you can start a fresh topic with your AI Coach.
        </p>
      </Modal>
    </div>
  );
}
