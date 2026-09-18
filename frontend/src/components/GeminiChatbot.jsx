import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';

const WELCOME_MSG = {
  role: 'assistant',
  content: 'Namaste! Main SehatSaarthi AI hoon. Mujhe app ke har feature ka knowledge hai. Kuch bhi pucho — navigation, vitals, prescriptions, registrations, emergencies. Main short aur direct mein jawab doonga.\n\nAap mujhse Hindi ya English mein baat kar sakte ho. Mic button dabao aur bolo!'
};

const QUICK_PROMPTS = [
  { text: 'Naye citizen ko register kaise karein?', icon: 'person_add' },
  { text: 'Patient ko refer kaise karein?', icon: 'forward' },
  { text: 'Emergency helpline number kya hai?', icon: 'emergency' },
  { text: 'App mein vitals kaise dekhein?', icon: 'monitor_heart' },
];

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [speechLang, setSpeechLang] = useState('hi-IN');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const lastSpokenRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Check voice support on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Speak text using TTS
  const speakText = useCallback((text) => {
    if (!synthRef.current || !speakerOn) return;
    synthRef.current.cancel();

    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = /[а-яА-Яa-zA-Z]/.test(cleanText) && /[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' :
      /[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' : 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = synthRef.current.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
    const englishVoice = voices.find(v => v.lang === 'en-IN');
    if (hindiVoice) utterance.voice = hindiVoice;
    else if (englishVoice) utterance.voice = englishVoice;

    synthRef.current.speak(utterance);
  }, [speakerOn]);

  // Auto-speak new AI replies
  useEffect(() => {
    if (messages.length > 1 && speakerOn) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.content !== lastSpokenRef.current) {
        lastSpokenRef.current = lastMsg.content;
        const timer = setTimeout(() => speakText(lastMsg.content), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, speakerOn, speakText]);

  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setIsListening(false);
      return;
    }

    synthRef.current?.cancel();
    setInput('');

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = speechLang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Could not start recognition:', e);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const toggleSpeechLang = () => {
    setSpeechLang(prev => prev === 'hi-IN' ? 'en-IN' : 'hi-IN');
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    synthRef.current?.cancel();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await api.post('/chatbot', {
        message: msg,
        history
      });

      const reply = res.data?.reply || 'Maaf kijiye, main iska jawab nahi de pa raha.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI service abhi available nahi hai. Baad mein try karein.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer group ${
          isOpen
            ? 'bg-slate-900 hover:bg-slate-800 rotate-0'
            : 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:scale-110 animate-bounce'
        }`}
        title={isOpen ? 'Band karein' : 'SehatSaarthi AI kholein'}
      >
        <span className="material-symbols-outlined text-white text-[28px]">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[199] w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-slate-200 overflow-hidden flex flex-col animate-fadeIn">

          {/* Header */}
          <div className="bg-slate-900 px-5 py-3.5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[22px]">smart_toy</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-white font-heading tracking-tight">SehatSaarthi AI</h4>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-300 font-bold">Hindi & English • Voice Enabled</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Language Toggle */}
              <button
                onClick={toggleSpeechLang}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title={speechLang === 'hi-IN' ? 'Hindi mein bolein' : 'Speak in English'}
              >
                <span className="text-[11px] font-black">{speechLang === 'hi-IN' ? 'HI' : 'EN'}</span>
              </button>
              {/* Speaker Toggle */}
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  speakerOn ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white/50'
                }`}
                title={speakerOn ? 'Aawaz band karein' : 'Aawaz chalu karein'}
              >
                <span className="material-symbols-outlined text-[18px]">{speakerOn ? 'volume_up' : 'volume_off'}</span>
              </button>
              {/* Close */}
              <button
                onClick={() => { setIsOpen(false); stopSpeaking(); }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-white rounded-br-md font-bold'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-1 mb-1.5 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-600 text-[14px]">smart_toy</span>
                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">SehatSaarthi AI</span>
                      </div>
                      {speakerOn && i === messages.length - 1 && (
                        <button
                          onClick={() => speakText(msg.content)}
                          className="text-amber-500 hover:text-amber-700 cursor-pointer"
                          title="Phir se sunein"
                        >
                          <span className="material-symbols-outlined text-[12px]">replay</span>
                        </button>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[16px] animate-spin">progress_activity</span>
                    <span className="text-xs text-slate-500 font-bold">Soch raha hoon...</span>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">Sawaal puchein</p>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-xs text-slate-700 font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">{prompt.icon}</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Overlay */}
          {isListening && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-ping"></div>
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 text-[40px]">mic</span>
                </div>
              </div>
              <p className="text-white text-sm font-black">Bol rahi hoon...</p>
              <p className="text-white/60 text-xs font-bold">Rukne ke liye mic dabayein</p>
              {input && (
                <div className="bg-white/10 px-4 py-2 rounded-xl max-w-[280px]">
                  <p className="text-white text-xs font-bold italic">"{input}"</p>
                </div>
              )}
              <button
                onClick={toggleListening}
                className="mt-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Band karein
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-end gap-2">
              {/* Mic Button */}
              {voiceSupported && (
                <button
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title={isListening ? 'Sunna band karein' : 'Bol ke puchein'}
                >
                  <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span>
                </button>
              )}

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={speechLang === 'hi-IN' ? 'Yahan type karein ya mic dabayein...' : 'Type here or tap mic...'}
                  rows={1}
                  className="w-full bg-slate-100 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 font-bold resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                  style={{ minHeight: '40px', maxHeight: '80px' }}
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 text-center font-medium">
              {voiceSupported ? 'Mic se bolein ya type karein' : 'Type karke puchein'} • AI — medical advice ka substitute nahi hai
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;
