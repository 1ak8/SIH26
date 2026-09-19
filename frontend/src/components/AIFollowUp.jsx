import { useState, useEffect } from 'react';
import api from '../services/api';

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
  high: { color: 'bg-red-100 text-red-900 border-red-300', dot: 'bg-red-500', label: 'High Risk' },
  moderate: { color: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500', label: 'Moderate Risk' },
  low: { color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500', label: 'Low Risk' },
};

export default function AIFollowUp() {
  const [followups, setFollowups] = useState(PREDICTED_FOLLOWUPS);
  const [filter, setFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const filtered = followups.filter(f => {
    if (filter === 'all') return true;
    return f.aiPrediction.riskLevel === filter;
  });

  const sorted = [...filtered].sort((a, b) => a.aiPrediction.daysUntilFollowup - b.aiPrediction.daysUntilFollowup);

  const todayCount = followups.filter(f => f.aiPrediction.daysUntilFollowup <= 1).length;

  return (
    <div className="animate-fadeIn">
      {/* AI Prediction Header */}
      <div className="mb-5 bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-transparent p-4 rounded-2xl border-2 border-amber-300">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">AI-Predicted Follow-ups</h3>
            <p className="text-[11px] text-slate-600 font-medium">Based on patient history, vitals trends, and condition analysis</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="bg-white px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[16px]">error</span>
            <span className="text-xs font-black text-slate-900">{todayCount} Due Today/Tomorrow</span>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[16px]">people</span>
            <span className="text-xs font-black text-slate-900">{followups.length} Total Predictions</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[{ key: 'all', label: 'All', count: followups.length },
          { key: 'high', label: 'High Risk', count: followups.filter(f => f.aiPrediction.riskLevel === 'high').length },
          { key: 'moderate', label: 'Moderate', count: followups.filter(f => f.aiPrediction.riskLevel === 'moderate').length },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black whitespace-nowrap transition-all cursor-pointer ${
              filter === f.key ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'
            }`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-amber-500 text-[40px] animate-spin">progress_activity</span>
          <p className="text-xs text-slate-500 font-bold mt-2">AI analyzing patient records...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(fu => {
            const risk = RISK_CONFIG[fu.aiPrediction.riskLevel];
            const isUrgent = fu.aiPrediction.daysUntilFollowup <= 1;
            const isExpanded = selectedPatient === fu._id;

            return (
              <div key={fu._id} className={`bg-white p-4 rounded-2xl border-2 transition-all ${
                isUrgent ? 'border-red-300 hover:border-red-400' : 'border-slate-200 hover:border-amber-400'
              } hover:shadow-md`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${risk.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{isUrgent ? 'emergency' : 'person'}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-black text-slate-900">{fu.patient.name}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${risk.color}`}>{risk.label}</span>
                        {isUrgent && <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">DUE NOW</span>}
                      </div>
                      <p className="text-xs text-slate-600 font-bold">{fu.condition}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Age: {fu.patient.age} • Last visit: {new Date(fu.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {fu.lastVitals}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold">AI Recommends</p>
                      <p className={`text-xs font-black ${isUrgent ? 'text-red-700' : 'text-amber-800'}`}>
                        {fu.aiPrediction.urgency}
                      </p>
                    </div>
                    <button onClick={() => setSelectedPatient(isExpanded ? null : fu._id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-1 transition-all ${
                        isExpanded ? 'bg-amber-100 border-amber-400 text-amber-800' : 'border-slate-200 bg-white hover:bg-amber-50 text-slate-700'
                      }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {isExpanded ? 'keyboard_arrow_up' : 'psychology'}
                      </span>
                      {isExpanded ? '' : 'AI Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded AI Prediction Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn space-y-3">
                    {/* Confidence Score */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">speed</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-600">AI Confidence Score</span>
                          <span className="text-slate-900">{fu.aiPrediction.confidence}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fu.aiPrediction.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-black text-amber-800 uppercase block mb-1">AI Analysis</span>
                      <p className="text-xs text-slate-800 font-medium">{fu.aiPrediction.reason}</p>
                    </div>

                    {/* Suggested Tests */}
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Suggested Tests</span>
                      <div className="flex flex-wrap gap-1.5">
                        {fu.aiPrediction.suggestedTests.map((test, i) => (
                          <span key={i} className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Predicted Complications */}
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Predicted Complications if Delayed</span>
                      <div className="flex flex-wrap gap-1.5">
                        {fu.aiPrediction.predictedComplications.map((comp, i) => (
                          <span key={i} className="bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">warning</span>
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex-1 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Schedule Follow-up
                      </button>
                      <button className="flex-1 h-8 rounded-lg bg-white border-2 border-slate-200 hover:border-amber-400 text-slate-700 text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        Call Patient
                      </button>
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
