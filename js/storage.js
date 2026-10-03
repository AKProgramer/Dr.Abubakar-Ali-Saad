// Thin persistence layer over localStorage.
// Structured so a future backend/API can be swapped in behind the same
// Store.* method names without touching the rest of the app.

const Store = (function () {
  const KEY_PATIENTS = "mhc_patients";
  const KEY_CONSULTATIONS = "mhc_consultations";

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("Store: failed to parse", key, e);
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function init() {
    if (localStorage.getItem(KEY_PATIENTS) === null) {
      save(KEY_PATIENTS, seedPatients());
    }
    if (localStorage.getItem(KEY_CONSULTATIONS) === null) {
      save(KEY_CONSULTATIONS, seedConsultations());
    }
  }

  function nextId(prefix, list) {
    let max = 0;
    list.forEach((item) => {
      const n = parseInt(String(item.id).split("-")[1], 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return prefix + "-" + String(max + 1).padStart(4, "0");
  }

  // ---- Patients ----
  function getPatients() {
    return load(KEY_PATIENTS, []);
  }
  function getPatient(id) {
    return getPatients().find((p) => p.id === id) || null;
  }
  function savePatient(patient) {
    const patients = getPatients();
    if (patient.id) {
      const idx = patients.findIndex((p) => p.id === patient.id);
      if (idx > -1) {
        patients[idx] = Object.assign({}, patients[idx], patient);
        save(KEY_PATIENTS, patients);
        return patients[idx];
      }
    }
    patient.id = nextId("P", patients);
    patient.createdAt = new Date().toISOString();
    patients.push(patient);
    save(KEY_PATIENTS, patients);
    return patient;
  }

  // ---- Consultations ----
  function getConsultations() {
    return load(KEY_CONSULTATIONS, []);
  }
  function getConsultation(id) {
    return getConsultations().find((c) => c.id === id) || null;
  }
  function getConsultationsForPatient(patientId) {
    return getConsultations()
      .filter((c) => c.patientId === patientId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  function saveConsultation(consult) {
    const consults = getConsultations();
    if (consult.id) {
      const idx = consults.findIndex((c) => c.id === consult.id);
      if (idx > -1) {
        consults[idx] = Object.assign({}, consults[idx], consult);
        save(KEY_CONSULTATIONS, consults);
        return consults[idx];
      }
    }
    consult.id = nextId("C", consults);
    consults.push(consult);
    save(KEY_CONSULTATIONS, consults);
    return consult;
  }

  return {
    init,
    getPatients, getPatient, savePatient,
    getConsultations, getConsultation, getConsultationsForPatient, saveConsultation
  };
})();
