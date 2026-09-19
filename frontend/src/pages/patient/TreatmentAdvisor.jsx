import { useState } from 'react';
import PatientNavbar from '../../components/PatientNavbar';
import api from '../../services/api';

const SEVERITY_CONFIG = {
  low: { color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: 'check_circle', label: 'Low Risk — Self Care Possible', bg: 'from-emerald-50 to-white' },
  moderate: { color: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'warning', label: 'Moderate — Monitor Closely', bg: 'from-amber-50 to-white' },
  high: { color: 'bg-orange-100 text-orange-900 border-orange-300', icon: 'error', label: 'High Risk — See Doctor Soon', bg: 'from-orange-50 to-white' },
  emergency: { color: 'bg-red-100 text-red-900 border-red-300', icon: 'emergency', label: 'EMERGENCY — Get Help Now', bg: 'from-red-50 to-white' },
};

export default function TreatmentAdvisor() {
  const [vitals, setVitals] = useState({ bp: '', sugar: '', temp: '', pulse: '', spo2: '', weight: '' });
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/treatment/analyze', { vitals, symptoms, age, gender, pregnancyStatus, additionalNotes });
      setResult(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sev = SEVERITY_CONFIG[result?.severity] || SEVERITY_CONFIG.moderate;

  return (
    <div className="min-h-screen bg-slate-100">
      <PatientNavbar />
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-[92px] pb-16">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-amber-600 text-[28px]">psychology</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">AI Treatment Advisor</h1>
          </div>
          <p className="text-sm text-slate-600 font-medium">Enter your vitals and symptoms — our AI will suggest the best home treatment and when to see a doctor.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleAnalyze} className="bg-white p-5 rounded-2xl border-2 border-slate-200 sticky top-24">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600">edit_note</span>
                Enter Your Details
              </h3>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">BP (mmHg)</label>
                  <input type="text" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} placeholder="120/80"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Sugar (mg/dL)</label>
                  <input type="text" value={vitals.sugar} onChange={e => setVitals({...vitals, sugar: e.target.value})} placeholder="100"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Temp (°F)</label>
                  <input type="text" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="98.6"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pulse (bpm)</label>
                  <input type="text" value={vitals.pulse} onChange={e => setVitals({...vitals, pulse: e.target.value})} placeholder="72"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">SpO2 (%)</label>
                  <input type="text" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} placeholder="98"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input type="text" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} placeholder="65"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Age</label>
                  <input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder="35"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500">
                    <option value="">--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pregnancy</label>
                  <select value={pregnancyStatus} onChange={e => setPregnancyStatus(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500">
                    <option value="N/A">N/A</option>
                    <option value="1st Trimester">1st Trimester</option>
                    <option value="2nd Trimester">2nd Trimester</option>
                    <option value="3rd Trimester">3rd Trimester</option>
                    <option value="Not Pregnant">Not Pregnant</option>
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Symptoms <span className="text-red-500">*</span></label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} required
                  placeholder="Apne lakshan yahan likhein... jaise bukhar hai, sar dard hai, khansi hai..."
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500 resize-none" />
              </div>

              {/* Additional Notes */}
              <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Additional Notes</label>
                <input type="text" value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="Koi aur jaankari... (dawai kha rahi hai, allergy hai...)"
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500" />
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-300 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !symptoms.trim()}
                className={`w-full h-11 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  loading || !symptoms.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                }`}>
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>AI Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span>Get AI Treatment Advice</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <span className="material-symbols-outlined text-slate-300 text-[56px]">psychology</span>
                <p className="text-sm text-slate-500 font-bold mt-3">Enter your vitals and symptoms</p>
                <p className="text-xs text-slate-400 mt-1">AI will analyze and provide personalized treatment advice</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-amber-200">
                <span className="material-symbols-outlined text-amber-500 text-[56px] animate-pulse">psychology</span>
                <p className="text-sm text-amber-800 font-bold mt-3">AI is analyzing your vitals and symptoms...</p>
                <p className="text-xs text-amber-600 mt-1">Please wait a moment</p>
              </div>
            )}

            {result && (
              <div className={`bg-gradient-to-br ${sev.bg} rounded-2xl border-2 border-slate-200 overflow-hidden animate-fadeIn`}>
                {/* Severity Banner */}
                <div className={`p-4 ${sev.color} border-b-2 flex items-center gap-3`}>
                  <span className="material-symbols-outlined text-[28px]">{sev.icon}</span>
                  <div>
                    <h3 className="text-base font-black">{sev.label}</h3>
                    <p className="text-xs font-bold opacity-80">Severity: {result.severity?.toUpperCase()}</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Analysis */}
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">analytics</span>
                      Analysis
                    </h4>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200">{result.analysis}</p>
                  </div>

                  {/* Emergency Warning */}
                  {result.warning && (
                    <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-2">
                      <span className="material-symbols-outlined text-red-600 text-[20px] shrink-0 mt-0.5">emergency</span>
                      <p className="text-sm text-red-900 font-black">{result.warning}</p>
                    </div>
                  )}

                  {/* Home Remedies */}
                  {result.homeRemedies?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">eco</span>
                        Home Remedies (Gharelu Upay)
                      </h4>
                      <div className="space-y-2">
                        {result.homeRemedies.map((r, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black shrink-0">{i+1}</span>
                            <p className="text-sm text-slate-800 font-medium">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Medicines */}
                  {result.suggestedMedicines?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">medication</span>
                        Suggested Medicines (Doctor se puch ke lein)
                      </h4>
                      <div className="space-y-2">
                        {result.suggestedMedicines.map((m, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-amber-50 p-3 rounded-xl border border-amber-200">
                            <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0 mt-0.5">vaccines</span>
                            <p className="text-sm text-slate-800 font-medium">{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diet Advice */}
                  {result.dietAdvice && (
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">restaurant</span>
                        Diet Advice (Aahar Salah)
                      </h4>
                      <p className="text-sm text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200">{result.dietAdvice}</p>
                    </div>
                  )}

                  {/* When to See Doctor */}
                  {result.whenToSeeDoctor && (
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">stethoscope</span>
                        When to See Doctor (Kab Doctor se milein)
                      </h4>
                      <p className="text-sm text-slate-800 font-medium bg-sky-50 p-3 rounded-xl border border-sky-200">{result.whenToSeeDoctor}</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-medium flex items-start gap-2">
                    <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                    <span>{result.disclaimer || 'Ye sirf ek salah hai. Koi bhi dawai lene se pehle apne doctor se zaroor baat karein. Ye emergency care ka substitute nahi hai.'}</span>
                  </div>

                  {/* Analyze Again */}
                  <button onClick={() => setResult(null)}
                    className="w-full h-9 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-black hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Analyze Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
