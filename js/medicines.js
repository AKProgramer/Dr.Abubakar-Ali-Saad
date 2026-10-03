// Sample medicine catalog for frontend autocomplete demo.
// In a later phase this can be replaced by an API-backed formulary.
const MEDICINE_CATALOG = [
  { name: "Tab. Aspirin", strengths: ["75mg", "150mg"] },
  { name: "Tab. Clopidogrel", strengths: ["75mg"] },
  { name: "Tab. Atorvastatin", strengths: ["10mg", "20mg", "40mg", "80mg"] },
  { name: "Tab. Rosuvastatin", strengths: ["10mg", "20mg"] },
  { name: "Tab. Bisoprolol", strengths: ["2.5mg", "5mg", "10mg"] },
  { name: "Tab. Metoprolol Succinate", strengths: ["25mg", "50mg", "100mg"] },
  { name: "Tab. Carvedilol", strengths: ["3.125mg", "6.25mg", "12.5mg"] },
  { name: "Tab. Losartan", strengths: ["25mg", "50mg", "100mg"] },
  { name: "Tab. Valsartan", strengths: ["80mg", "160mg"] },
  { name: "Tab. Telmisartan", strengths: ["40mg", "80mg"] },
  { name: "Tab. Amlodipine", strengths: ["5mg", "10mg"] },
  { name: "Tab. Ramipril", strengths: ["2.5mg", "5mg", "10mg"] },
  { name: "Tab. Lisinopril", strengths: ["5mg", "10mg"] },
  { name: "Tab. Furosemide (Lasix)", strengths: ["20mg", "40mg"] },
  { name: "Tab. Spironolactone", strengths: ["25mg", "50mg"] },
  { name: "Tab. Warfarin", strengths: ["1mg", "3mg", "5mg"] },
  { name: "Tab. Rivaroxaban (Xarelto)", strengths: ["10mg", "15mg", "20mg"] },
  { name: "Tab. Apixaban (Eliquis)", strengths: ["2.5mg", "5mg"] },
  { name: "Tab. Nitroglycerin (Sublingual)", strengths: ["0.5mg"] },
  { name: "Tab. Isosorbide Mononitrate", strengths: ["20mg", "60mg"] },
  { name: "Tab. Digoxin", strengths: ["0.25mg"] },
  { name: "Tab. Amiodarone", strengths: ["200mg"] },
  { name: "Cap. Omeprazole", strengths: ["20mg", "40mg"] },
  { name: "Tab. Pantoprazole", strengths: ["40mg"] },
  { name: "Tab. Metformin", strengths: ["500mg", "1000mg"] },
  { name: "Tab. Trimetazidine", strengths: ["20mg", "35mg"] },
  { name: "Tab. Ivabradine", strengths: ["5mg", "7.5mg"] },
  { name: "Tab. Sacubitril/Valsartan (Entresto)", strengths: ["50mg", "100mg", "200mg"] }
];

// Common bilingual instruction phrases the doctor can quick-pick.
const INSTRUCTION_PHRASES = [
  { en: "1 tablet in the morning", ur: "صبح ایک گولی" },
  { en: "1 tablet at night", ur: "رات ایک گولی" },
  { en: "1 tablet morning & night", ur: "صبح و شام ایک ایک گولی" },
  { en: "1 tablet three times a day", ur: "دن میں تین بار ایک گولی" },
  { en: "After meals", ur: "کھانے کے بعد" },
  { en: "Before meals", ur: "کھانے سے پہلے" },
  { en: "After breakfast", ur: "ناشتے کے بعد" },
  { en: "Empty stomach", ur: "خالی پیٹ" },
  { en: "As needed for chest pain", ur: "سینے میں درد ہونے پر" }
];
