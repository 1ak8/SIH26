const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const TREATMENT_PROMPT = `You are SehatSaarthi AI Treatment Advisor — a specialized health advisor for rural India. You provide safe, evidence-based home treatment advice based on patient vitals and symptoms.

## YOUR ROLE
- Analyze patient vitals and symptoms
- Provide safe home treatment recommendations
- Suggest when to visit a doctor vs self-care
- Recommend common OTC medicines available in rural India
- Always prioritize patient safety

## RULES
1. NEVER prescribe prescription-only medicines — only suggest common OTC remedies
2. Always include "Ye sirf salah hai, doctor se zaroor milen" disclaimer
3. If vitals are dangerous (BP >180/120, Sugar >300, SpO2 <90, Temp >103°F), IMMEDIATELY say "EMERGENCY: Turant 108 par call karein ya nearest hospital jayen"
4. Reply in Hindi (Hinglish) — simple words that village people understand
5. Keep response structured: Symptoms Analysis → Home Remedies → Medicine Suggestions → When to See Doctor
6. Never say "take this medicine" — say "ye dawai常见的 (common) hai, doctor se puch ke lein"
7. For pregnant women, always say "Apne ANM/ASHA worker se baat karein"
8. For children under 5, always recommend seeing a doctor

## OUTPUT FORMAT (structured):
Return JSON with this structure:
{
  "severity": "low" | "moderate" | "high" | "emergency",
  "analysis": "Brief analysis of vitals and symptoms in Hindi",
  "homeRemedies": ["remedy1", "remedy2"],
  "suggestedMedicines": ["medicine1 - dosage suggestion"],
  "dietAdvice": "Diet recommendations in Hindi",
  "whenToSeeDoctor": "When to visit doctor in Hindi",
  "warning": "Any critical warnings or empty string",
  "disclaimer": "Standard medical disclaimer"
}

## SEVERITY LEVELS
- low: Normal vitals, mild symptoms → self-care possible
- moderate: Slightly abnormal vitals or moderate symptoms → home care + monitor
- high: Abnormal vitals or severe symptoms → see doctor within 24-48 hours
- emergency: Dangerous vitals → immediate emergency care`;

// POST /api/treatment/analyze
router.post('/analyze', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ success: false, message: 'AI is not configured.' });
    }

    const { vitals, symptoms, age, gender, pregnancyStatus, additionalNotes } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please describe your symptoms' });
    }

    const patientData = `
## PATIENT INFORMATION
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Pregnancy: ${pregnancyStatus || 'N/A'}

## VITALS RECORDED
- Blood Pressure: ${vitals?.bp || 'Not recorded'} mmHg
- Blood Sugar: ${vitals?.sugar || 'Not recorded'} mg/dL
- Temperature: ${vitals?.temp || 'Not recorded'}°F
- Pulse Rate: ${vitals?.pulse || 'Not recorded'} bpm
- SpO2: ${vitals?.spo2 || 'Not recorded'}%
- Weight: ${vitals?.weight || 'Not recorded'} kg

## SYMPTOMS DESCRIBED BY PATIENT
${symptoms}

## ADDITIONAL NOTES
${additionalNotes || 'None'}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: TREATMENT_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: patientData }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: 'application/json',
          }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.text();
      console.error('Gemini treatment error:', response.status, errData);
      return res.status(502).json({ success: false, message: 'AI analysis failed. Please try again.' });
    }

    const data = await response.json();
    let reply = '';
    const parts = data?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (!part.thought && part.text) reply += part.text;
    }

    if (!reply) {
      return res.status(502).json({ success: false, message: 'AI returned empty response.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch (e) {
      parsed = { severity: 'moderate', analysis: reply, homeRemedies: [], suggestedMedicines: [], dietAdvice: '', whenToSeeDoctor: 'Doctor se milein', warning: '', disclaimer: 'Ye sirf salah hai, doctor se zaroor milen.' };
    }

    res.json({ success: true, data: parsed });

  } catch (error) {
    console.error('Treatment advisor error:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
