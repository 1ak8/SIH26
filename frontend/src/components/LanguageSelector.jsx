import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'National / Official' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'North / Central India' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'West Bengal, Tripura, Assam' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra, Goa' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh, Telangana' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu, Puducherry' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat, Daman & Diu' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'Jammu & Kashmir, Telangana, UP' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala, Lakshadweep' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab, Delhi, Haryana' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', region: 'Bihar, Jharkhand' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand, Odisha, WB' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر / कश्मीरी', region: 'Jammu & Kashmir' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Sikkim, West Bengal' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', region: 'Goa, Karnataka, Maharashtra' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي / सिन्धी', region: 'Gujarat, Rajasthan, Maharashtra' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', region: 'Jammu & Kashmir, Himachal' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', region: 'Manipur' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो', region: 'Assam, Northeast' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', region: 'Ancient Classical Heritage' },
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
    const saved = localStorage.getItem('sehatsarthi_lang') || localStorage.getItem('aarogyanet_lang');
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
    localStorage.setItem('sehatsarthi_lang', code);
    localStorage.removeItem('aarogyanet_lang');
    
    const googleCode = GOOGLE_LANG_MAP[code] || code;
    const hostname = window.location.hostname;

    if (code === 'en') {
      // Clear cookies for English
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    } else {
      // Set cookies
      const cookieVal = `/en/${googleCode}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      document.cookie = `googtrans=/auto/${googleCode}; path=/;`;
      document.cookie = `googtrans=/auto/${googleCode}; path=/; domain=${hostname};`;
    }

    // Trigger Google Translate Select Combo
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
        className="h-10 px-3.5 flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-xl text-slate-800 text-xs font-extrabold hover:bg-slate-50 transition-all shadow-xs"
        title="Select Language / भाषा चुनें (22 Indian Languages)"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-amber-600 text-[18px]">translate</span>
        <span className="font-extrabold text-slate-900">{currentLang.native}</span>
        <span className="material-symbols-outlined text-slate-400 text-[16px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          arrow_drop_down
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-white border-2 border-amber-400 rounded-3xl shadow-2xl z-[9999] p-3 animate-fadeIn flex flex-col max-h-[460px] overflow-hidden drop-shadow-2xl">
          {/* Header */}
          <div className="pb-3 border-b border-slate-100 px-2 pt-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">language</span>
                <span className="text-xs uppercase font-black text-slate-900 tracking-wider">Select Language</span>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                22 Indian Languages
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-xs font-semibold outline-none transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Languages Scroll List */}
          <div className="overflow-y-auto divide-y divide-slate-100 py-1 flex-1">
            {filteredLanguages.map(l => {
              const isSelected = i18n.language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`w-full px-3 py-2.5 flex items-center justify-between text-left rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-amber-100/80 text-amber-950 font-black' 
                      : 'hover:bg-amber-50/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isSelected ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {l.code.toUpperCase().slice(0, 2)}
                    </span>
                    <div>
                      <span className="text-sm font-extrabold block leading-tight">{l.native}</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">{l.name} • {l.region}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-amber-700 text-[18px]">check_circle</span>
                  )}
                </button>
              );
            })}
            {filteredLanguages.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">
                No language found matching "{search}".
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 mt-1 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            Recognized under the 8th Schedule of the Constitution of India
          </div>
        </div>
      )}
    </div>
  );
}
