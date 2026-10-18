import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'National / Official' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'North & Central India' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'West Bengal, Tripura, Assam' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra, Goa' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh, Telangana' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu, Puducherry' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat, Daman & Diu' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'National / Telangana, UP' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala, Lakshadweep' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab, Delhi, Haryana' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', region: 'Bihar, Jharkhand' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand, Odisha, WB' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', region: 'Jammu & Kashmir' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Sikkim, West Bengal' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', region: 'Goa, Karnataka' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', region: 'Gujarat, Rajasthan' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', region: 'Jammu & Kashmir, HP' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', region: 'Manipur' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो', region: 'Assam, Northeast' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', region: 'Classical National' },
];

const GOOGLE_LANG_MAP = {
  en: 'en',
  hi: 'hi',
  bn: 'bn',
  mr: 'mr',
  te: 'te',
  ta: 'ta',
  gu: 'gu',
  ur: 'ur',
  kn: 'kn',
  ml: 'ml',
  pa: 'pa',
  or: 'or',
  as: 'as',
  mai: 'mai',
  sat: 'sat',
  ks: 'ks',
  ne: 'ne',
  kok: 'gom',
  sd: 'sd',
  doi: 'doi',
  mni: 'mni-Mtei',
  brx: 'brx',
  sa: 'sa',
};

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const currentLang = INDIAN_LANGUAGES.find(l => l.code === i18n.language) || INDIAN_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with Google Translate on mount if saved in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sehatsaarthi_lang') || localStorage.getItem('aarogyanet_lang');
    if (saved && saved !== 'en') {
      const gCode = GOOGLE_LANG_MAP[saved] || saved;
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          if (select.value !== gCode) {
            select.value = gCode;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
          clearInterval(interval);
        } else if (tries > 20) {
          clearInterval(interval);
        }
      }, 150);
    }
  }, []);

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('sehatsaarthi_lang', code);
    localStorage.removeItem('aarogyanet_lang');
    
    const googleCode = GOOGLE_LANG_MAP[code] || code;
    const hostname = window.location.hostname;

    if (code === 'en') {
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    } else {
      const cookieVal = `/en/${googleCode}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      document.cookie = `googtrans=/auto/${googleCode}; path=/;`;
      document.cookie = `googtrans=/auto/${googleCode}; path=/; domain=${hostname};`;
    }

    const applyToCombo = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = googleCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    };

    if (!applyToCombo()) {
      let attempts = 0;
      const tId = setInterval(() => {
        attempts++;
        if (applyToCombo() || attempts > 15) {
          clearInterval(tId);
          if (attempts > 15) {
            window.location.reload();
          }
        }
      }, 100);
    }

    setIsOpen(false);
    setSearch('');
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left z-50 notranslate" translate="no" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 sm:h-10 px-3 sm:px-3.5 flex items-center gap-2 bg-white border border-slate-200/90 hover:border-teal-500 rounded-xl text-slate-800 text-xs font-black hover:bg-slate-50 transition-all shadow-2xs shrink-0 cursor-pointer whitespace-nowrap active:scale-95"
        title="Select Language / भाषा चुनें (22 Indian Languages)"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-teal-600 text-[18px]">translate</span>
        <span className="font-black text-slate-900 tracking-tight">{currentLang.native}</span>
        <span className="material-symbols-outlined text-slate-400 text-[16px] transition-transform duration-200 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu - 100% Solid Opaque Background to prevent any bleeding */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-20 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-[0_20px_70px_-15px_rgba(15,23,42,0.3)] z-[9999] p-4 animate-fadeIn flex flex-col max-h-[85vh] sm:max-h-[500px]">
          {/* Header */}
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[17px]">language</span>
                </div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Select Language</span>
              </div>
              <span className="text-[10px] font-black bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                22 Indian Languages
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-xl text-xs font-semibold outline-none transition-all"
                autoFocus
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Languages Scroll List */}
          <div className="overflow-y-auto divide-y divide-slate-100 py-1.5 flex-1 my-1">
            {filteredLanguages.map(l => {
              const isSelected = i18n.language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`w-full px-3 py-2.5 flex items-center justify-between text-left rounded-xl transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-teal-50 text-teal-950 font-black ring-1 ring-teal-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isSelected ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {l.code.toUpperCase().slice(0, 2)}
                    </span>
                    <div>
                      <span className="text-sm font-black block leading-tight">{l.native}</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">{l.name} • {l.region}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-teal-700 text-[20px]">check_circle</span>
                  )}
                </button>
              );
            })}
            {filteredLanguages.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No language found matching "{search}".
              </div>
            )}
          </div>

          {/* Clean Opaque Footer Note */}
          <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium bg-white">
            Recognized under 8th Schedule of the Constitution of India
          </div>
        </div>
      )}
    </div>
  );
}
