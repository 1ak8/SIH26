import { useState } from 'react';
import PatientNavbar from '../../components/PatientNavbar';
import api from '../../services/api';

const SEVERITY_CONFIG = {
  low: { color: 'bg-emerald-50 text-emerald-900 border-emerald-300', icon: 'check_circle', label: 'Low Risk — Primary Self Care', bg: 'from-emerald-50/70 via-white to-teal-50/30', border: 'border-emerald-300' },
  moderate: { color: 'bg-amber-50 text-amber-900 border-amber-300', icon: 'warning', label: 'Moderate — Tele-Monitoring Advised', bg: 'from-amber-50/70 via-white to-amber-50/30', border: 'border-amber-300' },
  high: { color: 'bg-orange-50 text-orange-900 border-orange-300', icon: 'error', label: 'High Risk — Doctor Review Needed', bg: 'from-orange-50/70 via-white to-rose-50/30', border: 'border-orange-300' },
  emergency: { color: 'bg-rose-50 text-rose-900 border-rose-300', icon: 'emergency', label: 'EMERGENCY — Dial 108 Immediately', bg: 'from-rose-50/80 via-white to-rose-100/40', border: 'border-rose-400' },
};

const SAMPLE_SYMPTOMS = [
  'Fever with chills & bodyache',
  'Dry cough & throat irritation',
  'Stomach ache with nausea',
  'High BP reading & dizziness',
];

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
    <div className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
      <PatientNavbar />
      
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-[96px] pb-16 max-w-7xl mx-auto">
        {/* Header HUD */}
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white border border-teal-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-black mb-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Clinical Decision Support Engine • Ayushman Bharat</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading flex items-center gap-2.5 text-white">
                AI Treatment &amp; Triage Advisor
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl">
                Enter your physiological telemetry &amp; chief complaints. Our AI evaluates risk severity, provides verified home therapies, and flags critical clinical escalations.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300">LLM Triage Model</span>
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-xl border border-white/20 mt-1">
                Gemini 3.6 Flash Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form Column */}
          <div className="lg:col-span-5">
            <form onSubmit={handleAnalyze} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-teal-600">monitor_heart</span>
                  <span>Vitals &amp; Patient Profile</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 1 of 2</span>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Blood Pressure</label>
                  <input 
                    type="text" 
                    value={vitals.bp} 
                    onChange={e => setVitals({...vitals, bp: e.target.value})} 
                    placeholder="120/80"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Sugar (mg/dL)</label>
                  <input 
                    type="text" 
                    value={vitals.sugar} 
                    onChange={e => setVitals({...vitals, sugar: e.target.value})} 
                    placeholder="105"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Temp (°F)</label>
                  <input 
                    type="text" 
                    value={vitals.temp} 
                    onChange={e => setVitals({...vitals, temp: e.target.value})} 
                    placeholder="98.6"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pulse (bpm)</label>
                  <input 
                    type="text" 
                    value={vitals.pulse} 
                    onChange={e => setVitals({...vitals, pulse: e.target.value})} 
                    placeholder="74"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">SpO2 (%)</label>
                  <input 
                    type="text" 
                    value={vitals.spo2} 
                    onChange={e => setVitals({...vitals, spo2: e.target.value})} 
                    placeholder="98"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input 
                    type="text" 
                    value={vitals.weight} 
                    onChange={e => setVitals({...vitals, weight: e.target.value})} 
                    placeholder="65"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Age</label>
                  <input 
                    type="text" 
                    value={age} 
                    onChange={e => setAge(e.target.value)} 
                    placeholder="35"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Gender</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pregnancy</label>
                  <select 
                    value={pregnancyStatus} 
                    onChange={e => setPregnancyStatus(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="N/A">N/A</option>
                    <option value="1st Trimester">1st Trim</option>
                    <option value="2nd Trimester">2nd Trim</option>
                    <option value="3rd Trimester">3rd Trim</option>
                    <option value="Not Pregnant">No</option>
                  </select>
                </div>
              </div>

              {/* Symptoms Input & Quick Chips */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Chief Complaint / Symptoms <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-bold">Hindi / Hinglish / English</span>
                </div>
                <textarea 
                  value={symptoms} 
                  onChange={e => setSymptoms(e.target.value)} 
                  rows={3} 
                  required
                  placeholder="Apne lakshan yahan likhein... jaise bukhar hai 2 din se, sar dard, khansi aur kamzori..."
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 resize-none leading-relaxed" 
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SAMPLE_SYMPTOMS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSymptoms(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-[10px] font-bold text-slate-600 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mb-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Pre-Existing Conditions / Allergies</label>
                <input 
                  type="text" 
                  value={additionalNotes} 
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Diabectic, penicillin allergy, taking BP meds..."
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600" 
                />
              </div>

              {error && (
                <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-rose-600">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !symptoms.trim()}
                className={`w-full h-11 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
                  loading || !symptoms.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 text-white shadow-md shadow-teal-700/25'
                }`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Synthesizing Medical Advice...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span>Generate Clinical Analysis</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7">
            {!result && !loading && (
              <div className="text-center py-20 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3 shadow-2xs">
                  <span className="material-symbols-outlined text-[36px]">psychology</span>
                </div>
                <h4 className="text-base font-black text-slate-900 font-heading">AI Clinical Diagnostic Chamber</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 max-w-md">
                  Provide vitals and patient symptoms in the left panel to trigger comprehensive machine-learned risk evaluation, dietary guidance, and doctor escalation timelines.
                </p>
                <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Protocols</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Jan Aushadhi Linked</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-20 px-6 bg-white rounded-3xl border border-teal-200 shadow-sm flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-teal-500/10 animate-ping"></div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-700/30">
                    <span className="material-symbols-outlined text-[36px] animate-pulse">psychology</span>
                  </div>
                </div>
                <h4 className="text-base font-black text-slate-900 font-heading">Correlating Telemetry with Clinical Knowledge Base</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Analyzing vitals velocity &amp; generating triage recommendations...</p>
              </div>
            )}

            {result && (
              <div className={`bg-gradient-to-br ${sev.bg} rounded-3xl border ${sev.border} shadow-lg overflow-hidden animate-fadeIn`}>
                {/* Severity Banner */}
                <div className={`p-5 ${sev.color} border-b flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[26px]">{sev.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black leading-tight">{sev.label}</h3>
                      <p className="text-xs font-bold opacity-80 mt-0.5">Clinical Classification: {result.severity?.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-white/70 border border-current shadow-2xs">
                    ABDM Triage
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Analysis summary */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-teal-600">analytics</span>
                      <span>Physiological Analysis</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">{result.analysis}</p>
                  </div>

                  {/* Warning / Emergency Callout */}
                  {result.warning && (
                    <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 shadow-2xs">
                      <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0 mt-0.5">emergency</span>
                      <div>
                        <span className="text-xs font-black text-rose-950 uppercase tracking-wider block">Critical Clinical Flag</span>
                        <p className="text-xs text-rose-900 font-bold mt-0.5 leading-relaxed">{result.warning}</p>
                      </div>
                    </div>
                  )}

                  {/* Home Remedies */}
                  {result.homeRemedies?.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
                        <span>Evidence-Based Home Care (Gharelu Upay)</span>
                      </h4>
                      <div className="space-y-2">
                        {result.homeRemedies.map((r, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                              {i+1}
                            </span>
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Generic Medicines */}
                  {result.suggestedMedicines?.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-teal-600">medication</span>
                        <span>Suggested Over-the-Counter / Generic Refills</span>
                      </h4>
                      <div className="space-y-2">
                        {result.suggestedMedicines.map((m, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                            <span className="material-symbols-outlined text-teal-700 text-[18px] shrink-0 mt-0.5">vaccines</span>
                            <p className="text-xs text-slate-800 font-semibold leading-relaxed">{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diet & When to see doctor grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {result.dietAdvice && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">restaurant</span>
                          <span>Dietary Guidance</span>
                        </h4>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{result.dietAdvice}</p>
                      </div>
                    )}

                    {result.whenToSeeDoctor && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-rose-600">stethoscope</span>
                          <span>Doctor Escalation Trigger</span>
                        </h4>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{result.whenToSeeDoctor}</p>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer Note */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] text-slate-500 font-medium flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0 mt-0.5">info</span>
                    <span>{result.disclaimer || 'This algorithmic triage is advisory. In case of sudden chest pain, breathing difficulty, or loss of consciousness, contact 108 or your nearest CHC.'}</span>
                  </div>

                  {/* Re-Analyze CTA */}
                  <button 
                    onClick={() => setResult(null)}
                    className="w-full h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[16px] text-teal-600">refresh</span>
                    <span>Analyze Another Patient Profile</span>
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
