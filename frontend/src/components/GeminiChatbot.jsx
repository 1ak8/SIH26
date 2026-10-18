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

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

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
      {/* Floating Chat Trigger Button with Medical Pulse Aura */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer group active:scale-95 ${
          isOpen
            ? 'bg-slate-900 hover:bg-slate-800 rotate-90 text-white'
            : 'bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 hover:scale-105 text-white shadow-teal-700/30 ring-4 ring-teal-500/20'
        }`}
        title={isOpen ? 'Band karein' : 'SehatSaarthi AI Assistant'}
      >
        <span className="material-symbols-outlined text-[28px]">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        )}
      </button>

      {/* High-Tech Clinical AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[199] w-[390px] max-w-[calc(100vw-2.5rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fadeIn">

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-5 py-4 flex items-center gap-3 shrink-0 border-b border-teal-500/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20 text-white">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white font-heading tracking-tight">SehatSaarthi AI</h4>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">v2.5</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-teal-200/90 font-bold">Bilingual Voice • Medical LLM</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Language Toggle */}
              <button
                onClick={toggleSpeechLang}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title={speechLang === 'hi-IN' ? 'Hindi mein bolein' : 'Speak in English'}
              >
                <span className="text-[11px] font-black">{speechLang === 'hi-IN' ? 'HI' : 'EN'}</span>
              </button>
              {/* Speaker Toggle */}
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  speakerOn ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40' : 'bg-white/10 text-white/50'
                }`}
                title={speakerOn ? 'Aawaz band karein' : 'Aawaz chalu karein'}
              >
                <span className="material-symbols-outlined text-[18px]">{speakerOn ? 'volume_up' : 'volume_off'}</span>
              </button>
              {/* Close */}
              <button
                onClick={() => { setIsOpen(false); stopSpeaking(); }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-50/60">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-br-xs font-semibold shadow-md shadow-teal-700/20'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-teal-600 text-[15px]">smart_toy</span>
                        <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Assistant</span>
                      </div>
                      {speakerOn && i === messages.length - 1 && (
                        <button
                          onClick={() => speakText(msg.content)}
                          className="text-teal-600 hover:text-teal-800 cursor-pointer flex items-center gap-0.5"
                          title="Phir se sunein"
                        >
                          <span className="material-symbols-outlined text-[13px]">replay</span>
                          <span className="text-[9px] font-bold">Replay</span>
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
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600 text-[18px] animate-spin">progress_activity</span>
                    <span className="text-xs text-slate-600 font-bold">Analyzing clinical request...</span>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-1">Frequent Inquiries</p>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-xs text-slate-700 font-bold transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs group"
                  >
                    <span className="material-symbols-outlined text-teal-600 text-[17px] group-hover:scale-110 transition-transform">{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Overlay */}
          {isListening && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center animate-ping"></div>
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/40">
                  <span className="material-symbols-outlined text-white text-[40px]">mic</span>
                </div>
              </div>
              <p className="text-white text-base font-black font-heading">Listening carefully...</p>
              <p className="text-slate-300 text-xs font-medium">Boliye, sun raha hoon</p>
              {input && (
                <div className="bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl max-w-[280px]">
                  <p className="text-white text-xs font-bold italic text-center">"{input}"</p>
                </div>
              )}
              <button
                onClick={toggleListening}
                className="mt-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-rose-600/30"
              >
                Stop Recording
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-end gap-2">
              {voiceSupported && (
                <button
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                      : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700'
                  }`}
                  title={isListening ? 'Sunna band karein' : 'Voice Input'}
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
                  placeholder={speechLang === 'hi-IN' ? 'Yahan likhein ya mic dabayein...' : 'Ask question or tap mic...'}
                  rows={1}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold resize-none focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400"
                  style={{ minHeight: '40px', maxHeight: '80px' }}
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md shadow-teal-700/25 active:scale-95'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
              Ayushman Bharat Verified AI Companion • Medical emergency mein 108 dial karein
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;
