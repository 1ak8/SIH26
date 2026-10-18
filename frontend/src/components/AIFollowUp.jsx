import { useState, useEffect } from 'react';

const PREDICTED_FOLLOWUPS = [
  {
    _id: 'fu-1',
    patient: { name: 'Kamla Devi', age: 52, phone: '9876543251', abhaId: '91-4820-1940-2810' },
    condition: 'Type 2 Diabetes — Uncontrolled',
    lastVisit: '2026-09-10',
    lastVitals: 'BP 142/88 • Sugar Fasting 186 mg/dL • Weight 72kg',
    aiPrediction: {
      riskLevel: 'high',
      nextVisitRecommended: '2026-09-20',
      daysUntilFollowup: 1,
      reason: 'Fasting sugar consistently >160 mg/dL for 3 consecutive visits. Current medication may need dosage adjustment. Risk of neuropathy if uncontrolled.',
      urgency: 'Within 24-48 hours',
      suggestedTests: ['HbA1c', 'Fasting Lipid Profile', 'Urine Albumin'],
      predictedComplications: ['Diabetic Neuropathy', 'Retinopathy Risk'],
      confidence: 92,
    },
  },
  {
    _id: 'fu-2',
    patient: { name: 'Savitri Devi', age: 45, phone: '9876543252', abhaId: '91-4820-1940-2811' },
    condition: 'Hypertension — Stage 2',
    lastVisit: '2026-09-05',
    lastVitals: 'BP 158/96 • Pulse 82 • Temp 98.4°F',
    aiPrediction: {
      riskLevel: 'high',
      nextVisitRecommended: '2026-09-19',
      daysUntilFollowup: 0,
      reason: 'BP consistently >150/90 despite medication. Non-compliance suspected. Needs evaluation for secondary hypertension and medication review.',
      urgency: 'Today or tomorrow',
      suggestedTests: ['ECG', 'Serum Creatinine', 'Urine Routine'],
      predictedComplications: ['Cardiovascular Risk', 'Kidney Damage'],
      confidence: 88,
    },
  },
  {
    _id: 'fu-3',
    patient: { name: 'Ramesh Kumar', age: 28, phone: '9876543253', abhaId: '91-4820-1940-2812' },
    condition: 'Post-Typhoid Recovery',
    lastVisit: '2026-09-12',
    lastVitals: 'BP 118/76 • Temp 99.2°F • Pulse 88',
    aiPrediction: {
      riskLevel: 'moderate',
      nextVisitRecommended: '2026-09-26',
      daysUntilFollowup: 7,
      reason: 'Recovering from typhoid fever. Appetite still low, mild fatigue persists. Liver function may need recheck. Weight loss of 4kg noted.',
      urgency: 'Within 7 days',
      suggestedTests: ['Widal Test Repeat', 'Liver Function Test', 'CBC'],
      predictedComplications: ['Relapse Risk', 'Nutritional Deficiency'],
      confidence: 78,
    },
  },
  {
    _id: 'fu-4',
    patient: { name: 'Priya Singh', age: 26, phone: '9876543254', abhaId: '91-4820-1940-2813' },
    condition: 'Antenatal — 28 Weeks (G2P1)',
    lastVisit: '2026-09-08',
    lastVitals: 'BP 122/78 • Weight 62kg • HB 10.2 g/dL',
    aiPrediction: {
      riskLevel: 'moderate',
      nextVisitRecommended: '2026-09-22',
      daysUntilFollowup: 3,
      reason: 'Hemoglobin 10.2 g/dL — borderline anemia in 3rd trimester. Previous LSCS scar needs monitoring. Growth scan due.',
      urgency: 'Within 3-5 days',
      suggestedTests: ['Growth Ultrasound', 'HB Recheck', 'Glucose Tolerance Test'],
      predictedComplications: ['Anemia Worsening', 'Pre-term Labor Risk'],
      confidence: 85,
    },
  },
  {
    _id: 'fu-5',
    patient: { name: 'Ajay Verma', age: 65, phone: '9876543255', abhaId: '91-4820-1940-2814' },
    condition: 'COPD — Stage 2',
    lastVisit: '2026-09-01',
    lastVitals: 'BP 136/82 • SpO2 93% • Pulse 90',
    aiPrediction: {
      riskLevel: 'moderate',
      nextVisitRecommended: '2026-09-24',
      daysUntilFollowup: 5,
      reason: 'SpO2 borderline at 93%. Winter season approaching — high risk of exacerbation. Inhaler technique needs review. Smoking cessation follow-up pending.',
      urgency: 'Within 5-7 days',
      suggestedTests: ['Pulmonary Function Test', 'Chest X-Ray', 'ABG Analysis'],
      predictedComplications: ['Acute Exacerbation', 'Respiratory Failure'],
      confidence: 82,
    },
  },
];

const RISK_CONFIG = {
  high: { color: 'bg-rose-50 text-rose-900 border-rose-200', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800 border-rose-300', label: 'High Risk' },
  moderate: { color: 'bg-amber-50 text-amber-900 border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Moderate Risk' },
  low: { color: 'bg-emerald-50 text-emerald-900 border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Low Risk' },
};

export default function AIFollowUp() {
  const [followups, setFollowups] = useState(PREDICTED_FOLLOWUPS);
  const [filter, setFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = followups.filter(f => {
    if (filter === 'all') return true;
    return f.aiPrediction.riskLevel === filter;
  });

  const sorted = [...filtered].sort((a, b) => a.aiPrediction.daysUntilFollowup - b.aiPrediction.daysUntilFollowup);
  const todayCount = followups.filter(f => f.aiPrediction.daysUntilFollowup <= 1).length;

  return (
    <div className="animate-fadeIn">
      {/* AI Header HUD */}
      <div className="mb-5 bg-gradient-to-r from-teal-500/10 via-sky-50 to-transparent p-5 rounded-3xl border border-teal-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-heading">AI-Predicted Patient Follow-ups</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-black uppercase">
                  Active Clinical ML
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Predictive triage analyzing vitals velocity, chronic factors, and non-compliance risk</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="bg-white/90 px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-black text-rose-700">{todayCount} Due Now</span>
            </div>
            <div className="bg-white/90 px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[17px]">hub</span>
              <span className="text-xs font-black text-slate-800">{followups.length} Monitored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: 'all', label: 'All Predictions', count: followups.length },
          { key: 'high', label: 'High Priority', count: followups.filter(f => f.aiPrediction.riskLevel === 'high').length },
          { key: 'moderate', label: 'Moderate Priority', count: followups.filter(f => f.aiPrediction.riskLevel === 'moderate').length },
        ].map(f => (
          <button 
            key={f.key} 
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              filter === f.key 
                ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/25' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <span className="material-symbols-outlined text-teal-600 text-[36px] animate-spin">progress_activity</span>
          <p className="text-xs text-slate-500 font-bold mt-2">Correlating clinical telemetry...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(fu => {
            const risk = RISK_CONFIG[fu.aiPrediction.riskLevel];
            const isUrgent = fu.aiPrediction.daysUntilFollowup <= 1;
            const isExpanded = selectedPatient === fu._id;

            return (
              <div 
                key={fu._id} 
                className={`bg-white p-5 rounded-3xl border transition-all duration-200 hover:shadow-md ${
                  isUrgent ? 'border-rose-300 hover:border-rose-400' : 'border-slate-200/90 hover:border-teal-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${risk.color}`}>
                      <span className="material-symbols-outlined text-[24px]">{isUrgent ? 'emergency' : 'medical_information'}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-slate-900">{fu.patient.name}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${risk.badge}`}>{risk.label}</span>
                        {isUrgent && (
                          <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
                            URGENT FOLLOWUP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-bold">{fu.condition}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Age: {fu.patient.age} • Last visit: {new Date(fu.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {fu.lastVitals}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Window</p>
                      <p className={`text-xs font-black ${isUrgent ? 'text-rose-600' : 'text-teal-800'}`}>
                        {fu.aiPrediction.urgency}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(isExpanded ? null : fu._id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                        isExpanded ? 'bg-teal-50 border-teal-300 text-teal-800' : 'border-slate-200 bg-white hover:bg-teal-50 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px] text-teal-600">psychology</span>
                      <span>{isExpanded ? 'Hide' : 'ML Insights'}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn space-y-3">
                    {/* Confidence score */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="material-symbols-outlined text-teal-600 text-[20px]">insights</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-slate-600">Prediction Model Confidence</span>
                          <span className="text-slate-900 font-mono font-black">{fu.aiPrediction.confidence}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full" style={{ width: `${fu.aiPrediction.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Reason */}
                    <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200">
                      <span className="text-[10px] font-black text-teal-900 uppercase tracking-wider block mb-1">Clinical AI Rationale</span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{fu.aiPrediction.reason}</p>
                    </div>

                    {/* Suggested Tests & Complications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Recommended Diagnostic Tests</span>
                        <div className="flex flex-wrap gap-1.5">
                          {fu.aiPrediction.suggestedTests.map((test, i) => (
                            <span key={i} className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                        <span className="text-[10px] font-black text-rose-500 uppercase block mb-1.5">Predicted Complications If Delayed</span>
                        <div className="flex flex-wrap gap-1.5">
                          {fu.aiPrediction.predictedComplications.map((comp, i) => (
                            <span key={i} className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">warning</span>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <button className="flex-1 h-9 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-98">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        <span>Schedule Priority Follow-up</span>
                      </button>
                      <a 
                        href={`tel:${fu.patient.phone}`} 
                        className="flex-1 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px] text-teal-600">call</span>
                        <span>Call Citizen ({fu.patient.phone})</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
