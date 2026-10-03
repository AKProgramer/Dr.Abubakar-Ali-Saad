// Application controller: routing, event wiring, form state.

(function () {
  const state = {
    medRows: [],
    reportStaging: [],
    medRowCounter: 0
  };

  // ---------------- Router ----------------
  function go(screen, params) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    location.hash = screen + qs;
  }

  function parseHash() {
    const raw = location.hash.replace(/^#/, "");
    const [screen, qs] = raw.split("?");
    const params = Object.fromEntries(new URLSearchParams(qs || ""));
    return { screen: screen || "dashboard", params };
  }

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
    document.querySelectorAll(".nav-link").forEach((b) => b.classList.toggle("active", b.dataset.nav === name));
  }

  function handleRoute() {
    const { screen, params } = parseHash();
    showScreen(screen);
    switch (screen) {
      case "dashboard":
        Render.dashboard();
        document.getElementById("dashSearch").value = "";
        break;
      case "patients":
        document.getElementById("patientSearch").value = params.q || "";
        Render.patientsList(params.q || "");
        break;
      case "patient-form": {
        const patient = params.id ? Store.getPatient(params.id) : null;
        Render.patientForm(patient);
        break;
      }
      case "patient-profile": {
        const patient = Store.getPatient(params.id);
        if (!patient) { go("patients"); return; }
        Render.patientProfile(patient);
        document.getElementById("ppNewConsultBtn").dataset.patientId = patient.id;
        document.getElementById("ppEditBtn").dataset.patientId = patient.id;
        setActiveProfileTab("history");
        break;
      }
      case "consultation-form": {
        const patient = Store.getPatient(params.patientId);
        if (!patient) { go("patients"); return; }
        const consult = params.id ? Store.getConsultation(params.id) : null;
        enterConsultationForm(patient, consult);
        break;
      }
      case "prescription": {
        const consult = Store.getConsultation(params.id);
        if (!consult) { go("patients"); return; }
        const patient = Store.getPatient(consult.patientId);
        Prescription.render(patient, consult);
        document.getElementById("rxBackLink").dataset.patientId = patient.id;
        document.getElementById("rxEditBtn").dataset.patientId = patient.id;
        document.getElementById("rxEditBtn").dataset.consultId = consult.id;
        break;
      }
      default:
        Render.dashboard();
    }
  }

  // ---------------- Tabs (generic) ----------------
  function setupTabs(scopeEl, btnAttr, panelAttr) {
    scopeEl.querySelectorAll(`[${btnAttr}]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute(btnAttr);
        scopeEl.querySelectorAll(`[${btnAttr}]`).forEach((b) => b.classList.toggle("active", b === btn));
        scopeEl.querySelectorAll(`[${panelAttr}]`).forEach((p) => p.classList.toggle("active", p.getAttribute(panelAttr) === key));
      });
    });
  }

  function setActiveProfileTab(key) {
    const scope = document.querySelector('[data-screen="patient-profile"]');
    scope.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === key));
    scope.querySelectorAll("[data-tab-panel]").forEach((p) => p.classList.toggle("active", p.dataset.tabPanel === key));
  }

  // ---------------- Patient form ----------------
  function wirePatientForm() {
    document.getElementById("patientForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("pfId").value;
      const patient = {
        id: id || undefined,
        name: document.getElementById("pfName").value.trim(),
        age: document.getElementById("pfAge").value,
        dob: document.getElementById("pfDob").value,
        gender: document.getElementById("pfGender").value,
        phone: document.getElementById("pfPhone").value.trim(),
        cnic: document.getElementById("pfCnic").value.trim(),
        address: document.getElementById("pfAddress").value.trim(),
        condition: document.getElementById("pfCondition").value.trim(),
        notes: document.getElementById("pfNotes").value.trim()
      };
      const saved = Store.savePatient(patient);
      go("patient-profile", { id: saved.id });
    });
  }

  // ---------------- Consultation form ----------------
  function enterConsultationForm(patient, consult) {
    document.getElementById("cfPatientName").textContent = patient.name;
    document.getElementById("cfPatientId").value = patient.id;
    document.getElementById("cfId").value = consult ? consult.id : "";
    document.getElementById("cfBackLink").dataset.patientId = patient.id;

    document.getElementById("cfDate").value = consult ? consult.date : new Date().toISOString().slice(0, 10);
    document.getElementById("cfBpSys").value = consult ? consult.bpSys || "" : "";
    document.getElementById("cfBpDia").value = consult ? consult.bpDia || "" : "";
    document.getElementById("cfPulse").value = consult ? consult.pulse || "" : "";
    document.getElementById("cfRbs").value = consult ? consult.rbs || "" : "";
    document.getElementById("cfHeight").value = consult ? consult.height || "" : "";
    document.getElementById("cfWeight").value = consult ? consult.weight || "" : "";
    document.getElementById("cfVb").value = consult ? consult.vb || "+" : "+";
    document.getElementById("cfS1s2").value = consult ? consult.s1s2 || "+" : "+";
    computeBmi();

    const risk = (consult && consult.risk) || {};
    document.getElementById("cfDm").checked = !!risk.dm;
    document.getElementById("cfHtn").checked = !!risk.htn;
    document.getElementById("cfSmoking").checked = !!risk.smoking;
    document.getElementById("cfDyslipidemia").checked = !!risk.dyslipidemia;
    document.getElementById("cfFh").checked = !!risk.fh;

    document.getElementById("cfSymptoms").value = consult ? consult.symptoms || "" : "";
    document.getElementById("cfDiagnosis").value = consult ? consult.diagnosis || "" : patient.condition || "";
    document.getElementById("cfNotes").value = consult ? consult.notes || "" : "";
    document.getElementById("cfRemarks").value = consult ? consult.remarks || "" : "";

    document.getElementById("cfFollowDate").value = consult ? consult.followDate || "" : "";
    document.getElementById("cfFollowDays").value = consult ? consult.followDays || "" : "";

    state.medRows = consult && consult.medicines ? consult.medicines.map(toMedRow) : [];
    if (!state.medRows.length) state.medRows.push(toMedRow({}));
    renderMedRows();

    state.reportStaging = consult && consult.reports ? consult.reports.slice() : [];
    renderReportStaging();

    // Reset to first tab
    const scope = document.querySelector('[data-screen="consultation-form"]');
    scope.querySelectorAll("[data-ctab]").forEach((b, i) => b.classList.toggle("active", i === 0));
    scope.querySelectorAll("[data-ctab-panel]").forEach((p, i) => p.classList.toggle("active", i === 0));
  }

  function toMedRow(med) {
    state.medRowCounter += 1;
    return {
      rowId: "mr" + state.medRowCounter,
      name: med.name || "",
      strength: med.strength || "",
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      duration: med.duration || "",
      instructionsEn: med.instructionsEn || "",
      instructionsUr: med.instructionsUr || ""
    };
  }

  function computeBmi() {
    const h = parseFloat(document.getElementById("cfHeight").value);
    const w = parseFloat(document.getElementById("cfWeight").value);
    const out = document.getElementById("cfBmi");
    if (h > 0 && w > 0) {
      const bmi = w / Math.pow(h / 100, 2);
      out.value = bmi.toFixed(1);
    } else {
      out.value = "";
    }
  }

  function renderMedRows() {
    const wrap = document.getElementById("medRows");
    wrap.innerHTML = "";
    state.medRows.forEach((row, i) => wrap.appendChild(buildMedRowEl(row, i)));
  }

  function buildMedRowEl(row, index) {
    const el = document.createElement("div");
    el.className = "med-row";
    el.dataset.rowId = row.rowId;
    el.innerHTML = `
      <span class="med-row-index">${index + 1}</span>
      <button type="button" class="med-remove" title="Remove medicine">&times;</button>
      <div class="med-row-grid">
        <label class="med-name-wrap">Medicine Name
          <input type="text" class="med-name" autocomplete="off" placeholder="Start typing to search&hellip;">
          <div class="autocomplete-list" hidden></div>
        </label>
        <label>Strength
          <input type="text" class="med-strength" list="strengths-${row.rowId}" placeholder="e.g. 5mg">
          <datalist id="strengths-${row.rowId}"></datalist>
        </label>
        <label>Dosage
          <input type="text" class="med-dosage" placeholder="1 tablet">
        </label>
        <label>Frequency
          <input type="text" class="med-frequency" list="freqSuggestions" placeholder="Once daily">
        </label>
        <label>Duration
          <input type="text" class="med-duration" list="durationSuggestions" placeholder="30 days">
        </label>
      </div>
      <div class="med-instructions-row">
        <label>Instructions (English)
          <input type="text" class="med-instr-en" placeholder="e.g. 1 tablet in the morning">
        </label>
        <label>Quick Phrase
          <select class="med-instr-phrase">
            <option value="">Choose&hellip;</option>
            ${INSTRUCTION_PHRASES.map((p, i) => `<option value="${i}">${p.en}</option>`).join("")}
          </select>
        </label>
        <label>&#1729;&#1583;&#1575;&#1740;&#1575;&#1578; (Urdu)
          <input type="text" class="med-instr-ur med-urdu-input" dir="rtl" placeholder="&#1575;&#1585;&#1583;&#1608; &#1729;&#1583;&#1575;&#1740;&#1575;&#1578;">
        </label>
      </div>
    `;

    el.querySelector(".med-name").value = row.name;
    el.querySelector(".med-strength").value = row.strength;
    el.querySelector(".med-dosage").value = row.dosage;
    el.querySelector(".med-frequency").value = row.frequency;
    el.querySelector(".med-duration").value = row.duration;
    el.querySelector(".med-instr-en").value = row.instructionsEn;
    el.querySelector(".med-instr-ur").value = row.instructionsUr;

    const bindField = (sel, key) => {
      el.querySelector(sel).addEventListener("input", (e) => { row[key] = e.target.value; });
    };
    bindField(".med-strength", "strength");
    bindField(".med-dosage", "dosage");
    bindField(".med-frequency", "frequency");
    bindField(".med-duration", "duration");
    bindField(".med-instr-en", "instructionsEn");
    bindField(".med-instr-ur", "instructionsUr");

    // Name + autocomplete
    const nameInput = el.querySelector(".med-name");
    const acList = el.querySelector(".autocomplete-list");
    nameInput.addEventListener("input", () => {
      row.name = nameInput.value;
      const q = nameInput.value.trim().toLowerCase();
      if (!q) { acList.hidden = true; acList.innerHTML = ""; return; }
      const matches = MEDICINE_CATALOG.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
      if (!matches.length) { acList.hidden = true; acList.innerHTML = ""; return; }
      acList.innerHTML = matches.map((m, i) => `<div data-idx="${i}">${m.name}</div>`).join("");
      acList.hidden = false;
      acList.querySelectorAll("div").forEach((div, i) => {
        div.addEventListener("click", () => {
          const med = matches[i];
          nameInput.value = med.name;
          row.name = med.name;
          const strengthInput = el.querySelector(".med-strength");
          const datalist = el.querySelector(`#strengths-${row.rowId}`);
          datalist.innerHTML = med.strengths.map((s) => `<option value="${s}">`).join("");
          if (!strengthInput.value && med.strengths.length) {
            strengthInput.value = med.strengths[0];
            row.strength = med.strengths[0];
          }
          acList.hidden = true;
          acList.innerHTML = "";
        });
      });
    });
    nameInput.addEventListener("blur", () => setTimeout(() => { acList.hidden = true; }, 150));

    // Quick instruction phrase
    el.querySelector(".med-instr-phrase").addEventListener("change", (e) => {
      const idx = e.target.value;
      if (idx === "") return;
      const phrase = INSTRUCTION_PHRASES[parseInt(idx, 10)];
      row.instructionsEn = phrase.en;
      row.instructionsUr = phrase.ur;
      el.querySelector(".med-instr-en").value = phrase.en;
      el.querySelector(".med-instr-ur").value = phrase.ur;
      e.target.value = "";
    });

    // Remove
    el.querySelector(".med-remove").addEventListener("click", () => {
      state.medRows = state.medRows.filter((r) => r.rowId !== row.rowId);
      if (!state.medRows.length) state.medRows.push(toMedRow({}));
      renderMedRows();
    });

    return el;
  }

  function renderReportStaging() {
    const list = document.getElementById("reportStagingList");
    list.innerHTML = "";
    if (!state.reportStaging.length) {
      list.innerHTML = '<li class="empty-state">No reports attached yet.</li>';
      return;
    }
    state.reportStaging.forEach((r, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="sl-main report-chip">
          <svg viewBox="0 0 24 24"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z"/></svg>
          <span><strong>${r.name}</strong><br><span class="sl-sub">${r.type} &middot; ${r.date}</span></span>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" data-remove-report="${i}">Remove</button>
      `;
      list.appendChild(li);
    });
    list.querySelectorAll("[data-remove-report]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.reportStaging.splice(parseInt(btn.dataset.removeReport, 10), 1);
        renderReportStaging();
      });
    });
  }

  function wireConsultationForm() {
    document.getElementById("cfHeight").addEventListener("input", computeBmi);
    document.getElementById("cfWeight").addEventListener("input", computeBmi);

    document.getElementById("addMedRowBtn").addEventListener("click", () => {
      state.medRows.push(toMedRow({}));
      renderMedRows();
    });

    document.getElementById("reportUploadBtn").addEventListener("click", () => {
      document.getElementById("reportFileInput").click();
    });
    document.getElementById("reportFileInput").addEventListener("change", (e) => {
      const type = document.getElementById("reportTypeSelect").value;
      const today = new Date().toISOString().slice(0, 10);
      Array.from(e.target.files).forEach((f) => {
        state.reportStaging.push({ name: f.name, type, date: today });
      });
      e.target.value = "";
      renderReportStaging();
    });

    document.getElementById("cfCancelBtn").addEventListener("click", () => {
      go("patient-profile", { id: document.getElementById("cfPatientId").value });
    });
    document.getElementById("cfBackLink").addEventListener("click", (e) => {
      go("patient-profile", { id: e.currentTarget.dataset.patientId });
    });

    document.getElementById("consultForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const risk = {
        dm: document.getElementById("cfDm").checked,
        htn: document.getElementById("cfHtn").checked,
        smoking: document.getElementById("cfSmoking").checked,
        dyslipidemia: document.getElementById("cfDyslipidemia").checked,
        fh: document.getElementById("cfFh").checked
      };
      const medicines = state.medRows
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name.trim(),
          strength: r.strength.trim(),
          dosage: r.dosage.trim(),
          frequency: r.frequency.trim(),
          duration: r.duration.trim(),
          instructionsEn: r.instructionsEn.trim(),
          instructionsUr: r.instructionsUr.trim()
        }));

      const consult = {
        id: document.getElementById("cfId").value || undefined,
        patientId: document.getElementById("cfPatientId").value,
        date: document.getElementById("cfDate").value,
        bpSys: document.getElementById("cfBpSys").value,
        bpDia: document.getElementById("cfBpDia").value,
        pulse: document.getElementById("cfPulse").value,
        rbs: document.getElementById("cfRbs").value,
        height: document.getElementById("cfHeight").value,
        weight: document.getElementById("cfWeight").value,
        vb: document.getElementById("cfVb").value,
        s1s2: document.getElementById("cfS1s2").value,
        risk,
        symptoms: document.getElementById("cfSymptoms").value.trim(),
        diagnosis: document.getElementById("cfDiagnosis").value.trim(),
        notes: document.getElementById("cfNotes").value.trim(),
        remarks: document.getElementById("cfRemarks").value.trim(),
        medicines,
        reports: state.reportStaging.slice(),
        followDate: document.getElementById("cfFollowDate").value,
        followDays: document.getElementById("cfFollowDays").value
      };

      const saved = Store.saveConsultation(consult);
      go("prescription", { id: saved.id });
    });
  }

  // ---------------- Global delegated actions ----------------
  function wireGlobalActions() {
    document.body.addEventListener("click", (e) => {
      const navBtn = e.target.closest("[data-nav]");
      if (navBtn) {
        go(navBtn.dataset.nav);
        return;
      }
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;
        if (action === "view-patient") go("patient-profile", { id });
        if (action === "view-prescription") go("prescription", { id });
        if (action === "edit-consultation") {
          const consult = Store.getConsultation(id);
          go("consultation-form", { patientId: consult.patientId, id: consult.id });
        }
      }
    });

    document.getElementById("ppNewConsultBtn").addEventListener("click", (e) => {
      go("consultation-form", { patientId: e.currentTarget.dataset.patientId });
    });
    document.getElementById("ppEditBtn").addEventListener("click", (e) => {
      go("patient-form", { id: e.currentTarget.dataset.patientId });
    });

    document.getElementById("rxBackLink").addEventListener("click", (e) => {
      go("patient-profile", { id: e.currentTarget.dataset.patientId });
    });
    document.getElementById("rxEditBtn").addEventListener("click", (e) => {
      go("consultation-form", { patientId: e.currentTarget.dataset.patientId, id: e.currentTarget.dataset.consultId });
    });
    document.getElementById("rxPrintBtn").addEventListener("click", () => Prescription.print());
  }

  function wireSearch() {
    document.getElementById("patientSearch").addEventListener("input", (e) => {
      Render.patientsList(e.target.value);
    });
    document.getElementById("dashSearch").addEventListener("input", (e) => {
      const q = e.target.value.trim();
      if (!q) { Render.dashboard(); return; }
      const patients = Store.getPatients().filter((p) =>
        [p.name, p.id, p.phone, p.cnic].some((v) => (v || "").toLowerCase().includes(q.toLowerCase()))
      );
      const tbody = document.querySelector("#recentPatientsTable tbody");
      tbody.innerHTML = patients.length
        ? patients.map((p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.age || "—"} / ${p.gender || "—"}</td>
              <td>${Render.fmtDate((Store.getConsultationsForPatient(p.id)[0] || {}).date)}</td>
              <td>${p.condition || "—"}</td>
              <td><button class="link-btn" data-action="view-patient" data-id="${p.id}">View</button></td>
            </tr>`).join("")
        : '<tr><td colspan="5" class="empty-state">No matching patients.</td></tr>';
    });
  }

  function addSharedDatalists() {
    const div = document.createElement("div");
    div.hidden = true;
    div.innerHTML = `
      <datalist id="freqSuggestions">
        <option value="Once daily"><option value="Twice daily"><option value="Three times daily">
        <option value="Every morning"><option value="Every night"><option value="As needed">
      </datalist>
      <datalist id="durationSuggestions">
        <option value="7 days"><option value="14 days"><option value="15 days">
        <option value="30 days"><option value="45 days"><option value="60 days"><option value="Ongoing">
      </datalist>
    `;
    document.body.appendChild(div);
  }

  function init() {
    Store.init();
    addSharedDatalists();
    setupTabs(document.querySelector('[data-screen="patient-profile"]'), "data-tab", "data-tab-panel");
    setupTabs(document.querySelector('[data-screen="consultation-form"]'), "data-ctab", "data-ctab-panel");
    wirePatientForm();
    wireConsultationForm();
    wireGlobalActions();
    wireSearch();
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
