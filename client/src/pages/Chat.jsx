import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
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
  FileText
} from 'lucide-react';

export default function Chat() {
  const initialMessages = [
    { 
      role: 'ai', 
      text: "Hello! I'm your dedicated CareerCraft AI Career Coach. I can help critique your resume, prepare you for tough interview questions, guide your salary negotiations, or plan your next promotion. What's on your mind today?",
      time: 'Just now'
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const promptSuggestions = [
    { icon: <FileText className="w-3.5 h-3.5 text-blue-600" />, text: "How can I improve my resume's impact?" },
    { icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />, text: "What are effective salary negotiation strategies?" },
    { icon: <Briefcase className="w-3.5 h-3.5 text-purple-600" />, text: "How do I transition from Software Engineer to AI Engineer?" },
    { icon: <Lightbulb className="w-3.5 h-3.5 text-amber-600" />, text: "What questions should I ask the interviewer at the end?" }
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
      const reply = response.reply || response.response || response.message || "Here are my thoughts on that: Focus on quantifiable accomplishments and demonstrable project experience.";
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      // Provide an intelligent fallback coach response so the user always has valuable guidance
      const fallbackResponses = [
        "When tailoring your profile, always highlight metrics (e.g. 'Reduced latency by 40%', 'Led team of 5'). In interviews, structure stories using the STAR method: Situation, Task, Action, and Result.",
        "For salary negotiations: Never state your current salary first. Research the market median using our Salary Estimator, highlight your unique leverage, and ask for the higher quartile with enthusiasm.",
        "To break into high-paying AI engineering roles: Build 2-3 production-grade end-to-end projects featuring LLM tool calling, vector databases, and scalable backend APIs."
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
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            AI Career Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your personalized 24/7 advisor for interviews, negotiations, and career transitions.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 card-base flex flex-col overflow-hidden bg-white border border-slate-200 shadow-sm">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                <div 
                  className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed shadow-xs relative group ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-xs' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  {msg.role === 'ai' && (
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-slate-700 bg-white/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <div className={`text-[11px] text-slate-400 px-1 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 rounded-tl-xs flex items-center gap-2 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 mr-1">Coach is typing</span>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        {messages.length <= 3 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 shrink-0">Try asking:</span>
            {promptSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.text)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-2xs"
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl py-3.5 pl-5 pr-14 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 transition-all shadow-inner"
              placeholder="Type your career question, resume critique request, etc..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
