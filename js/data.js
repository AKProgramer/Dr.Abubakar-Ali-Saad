// Seed / mock data used to pre-populate the demo on first run.

function seedPatients() {
  return [
    {
      id: "P-0001",
      name: "Muhammad Rafiq",
      age: 58,
      dob: "",
      gender: "Male",
      phone: "0300-1234567",
      cnic: "36302-1234567-1",
      address: "Gulgasht Colony, Multan",
      condition: "Hypertension, Post-MI",
      notes: "Underwent angioplasty in 2022. On regular follow-up.",
      createdAt: "2026-07-02T09:00:00.000Z"
    },
    {
      id: "P-0002",
      name: "Rukhsana Bibi",
      age: 49,
      dob: "",
      gender: "Female",
      phone: "0333-9876543",
      cnic: "36302-7654321-2",
      address: "Shah Rukn-e-Alam Colony, Multan",
      condition: "Dyslipidemia, Diabetic",
      notes: "Family history of ischemic heart disease.",
      createdAt: "2026-08-14T09:00:00.000Z"
    },
    {
      id: "P-0003",
      name: "Imran Chaudhry",
      age: 63,
      dob: "",
      gender: "Male",
      phone: "0345-5558899",
      cnic: "36302-1112223-3",
      address: "Cantt, Multan",
      condition: "Ischemic Heart Disease",
      notes: "Smoker, advised cessation.",
      createdAt: "2026-09-01T09:00:00.000Z"
    }
  ];
}

function seedConsultations() {
  return [
    {
      id: "C-0001",
      patientId: "P-0001",
      date: "2026-09-20",
      bpSys: "140", bpDia: "90",
      pulse: "78",
      rbs: "118",
      height: "170", weight: "82",
      vb: "+", s1s2: "+",
      risk: { dm: false, htn: true, smoking: false, dyslipidemia: true, fh: false },
      symptoms: "Mild exertional breathlessness",
      diagnosis: "Hypertensive heart disease, stable post-PCI",
      notes: "Continue current regimen, salt restriction advised.",
      remarks: "",
      medicines: [
        { name: "Tab. Bisoprolol", strength: "5mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", instructionsEn: "1 tablet in the morning", instructionsUr: "صبح ایک گولی" },
        { name: "Tab. Atorvastatin", strength: "20mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", instructionsEn: "1 tablet at night", instructionsUr: "رات ایک گولی" },
        { name: "Tab. Aspirin", strength: "75mg", dosage: "1 tablet", frequency: "Once daily", duration: "30 days", instructionsEn: "After breakfast", instructionsUr: "ناشتے کے بعد" }
      ],
      reports: [
        { name: "ECG_20260920.pdf", type: "ECG", date: "2026-09-20" }
      ],
      followDate: "2026-10-20", followDays: "30"
    },
    {
      id: "C-0002",
      patientId: "P-0002",
      date: "2026-09-28",
      bpSys: "130", bpDia: "85",
      pulse: "82",
      rbs: "156",
      height: "160", weight: "70",
      vb: "+", s1s2: "+",
      risk: { dm: true, htn: false, smoking: false, dyslipidemia: true, fh: true },
      symptoms: "Occasional palpitations",
      diagnosis: "Dyslipidemia with diabetes, cardiac risk assessment",
      notes: "Advised lipid profile recheck in 6 weeks.",
      remarks: "",
      medicines: [
        { name: "Tab. Rosuvastatin", strength: "10mg", dosage: "1 tablet", frequency: "Once daily", duration: "45 days", instructionsEn: "1 tablet at night", instructionsUr: "رات ایک گولی" },
        { name: "Tab. Metformin", strength: "500mg", dosage: "1 tablet", frequency: "Twice daily", duration: "45 days", instructionsEn: "1 tablet morning & night", instructionsUr: "صبح و شام ایک ایک گولی" }
      ],
      reports: [],
      followDate: "2026-11-10", followDays: "45"
    }
  ];
}
