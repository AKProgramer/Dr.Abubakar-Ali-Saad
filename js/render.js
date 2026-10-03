// Pure-ish rendering functions: read from Store, write into the DOM.
// App.js (controller) calls these and wires up events separately.

const Render = (function () {

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function isToday(iso) {
    if (!iso) return false;
    const today = new Date().toISOString().slice(0, 10);
    return iso === today;
  }

  function lastVisit(patientId) {
    const consults = Store.getConsultationsForPatient(patientId);
    return consults.length ? consults[0].date : null;
  }

  function medicineSummary(consult) {
    if (!consult.medicines || !consult.medicines.length) return "—";
    return consult.medicines.map((m) => m.name + (m.strength ? " " + m.strength : "")).join(", ");
  }

  // ---------------- Dashboard ----------------
  function dashboard() {
    const patients = Store.getPatients();
    const consults = Store.getConsultations();

    document.getElementById("statTotalPatients").textContent = patients.length;
    document.getElementById("statTodayConsults").textContent = consults.filter((c) => isToday(c.date)).length;
    document.getElementById("statTotalConsults").textContent = consults.length;

    const recentPatients = [...patients]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 5);
    const tbody = document.querySelector("#recentPatientsTable tbody");
    tbody.innerHTML = "";
    recentPatients.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(p.name)}</td>
        <td>${p.age || "—"} / ${esc(p.gender || "—")}</td>
        <td>${fmtDate(lastVisit(p.id))}</td>
        <td>${esc(p.condition || "—")}</td>
        <td><button class="link-btn" data-action="view-patient" data-id="${p.id}">View</button></td>
      `;
      tbody.appendChild(tr);
    });

    const recentConsults = [...consults]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
    const list = document.getElementById("recentPrescriptionsList");
    list.innerHTML = "";
    if (!recentConsults.length) {
      list.innerHTML = '<li class="empty-state">No prescriptions yet.</li>';
    }
    recentConsults.forEach((c) => {
      const patient = Store.getPatient(c.patientId);
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="sl-main">
          <strong>${patient ? esc(patient.name) : "Unknown patient"}</strong>
          <span class="sl-sub">${fmtDate(c.date)} &middot; ${esc(c.diagnosis || medicineSummary(c))}</span>
        </div>
        <button class="btn btn-ghost btn-sm" data-action="view-prescription" data-id="${c.id}">View</button>
      `;
      list.appendChild(li);
    });
  }

  // ---------------- Patients list ----------------
  function patientsList(filterText) {
    const patients = Store.getPatients();
    const q = (filterText || "").trim().toLowerCase();
    const filtered = q
      ? patients.filter((p) =>
          [p.name, p.id, p.phone, p.cnic].some((v) => (v || "").toLowerCase().includes(q))
        )
      : patients;

    const tbody = document.querySelector("#patientsTable tbody");
    tbody.innerHTML = "";
    document.getElementById("patientsEmptyState").hidden = filtered.length !== 0;

    filtered
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${esc(p.name)}</td>
          <td>${p.age || "—"}</td>
          <td>${esc(p.phone || "—")}</td>
          <td>${fmtDate(lastVisit(p.id))}</td>
          <td>${esc(p.condition || "—")}</td>
          <td><button class="link-btn" data-action="view-patient" data-id="${p.id}">View Profile</button></td>
        `;
        tbody.appendChild(tr);
      });
  }

  // ---------------- Patient form ----------------
  function patientForm(patient) {
    document.getElementById("patientFormTitle").textContent = patient ? "Edit Patient" : "Add Patient";
    document.getElementById("pfId").value = patient ? patient.id : "";
    document.getElementById("pfName").value = patient ? patient.name : "";
    document.getElementById("pfAge").value = patient ? (patient.age || "") : "";
    document.getElementById("pfDob").value = patient ? (patient.dob || "") : "";
    document.getElementById("pfGender").value = patient ? (patient.gender || "Male") : "Male";
    document.getElementById("pfPhone").value = patient ? (patient.phone || "") : "";
    document.getElementById("pfCnic").value = patient ? (patient.cnic || "") : "";
    document.getElementById("pfAddress").value = patient ? (patient.address || "") : "";
    document.getElementById("pfCondition").value = patient ? (patient.condition || "") : "";
    document.getElementById("pfNotes").value = patient ? (patient.notes || "") : "";
  }

  // ---------------- Patient profile ----------------
  function patientProfile(patient) {
    document.getElementById("ppName").textContent = patient.name;
    const metaBits = [];
    if (patient.age) metaBits.push(patient.age + " yrs");
    if (patient.gender) metaBits.push(patient.gender);
    if (patient.phone) metaBits.push(patient.phone);
    if (patient.cnic) metaBits.push("CNIC: " + patient.cnic);
    document.getElementById("ppMeta").textContent = metaBits.join("  •  ");

    const tags = document.getElementById("ppTags");
    tags.innerHTML = "";
    if (patient.condition) {
      patient.condition.split(",").forEach((c) => {
        if (!c.trim()) return;
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = c.trim();
        tags.appendChild(span);
      });
    }

    const consults = Store.getConsultationsForPatient(patient.id);

    // History tab
    const historyBody = document.querySelector("#historyTable tbody");
    historyBody.innerHTML = "";
    document.getElementById("historyEmptyState").hidden = consults.length !== 0;
    consults.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fmtDate(c.date)}</td>
        <td>${c.bpSys || "—"}/${c.bpDia || "—"}</td>
        <td>${c.pulse || "—"}</td>
        <td>${c.weight ? c.weight + " kg" : "—"}</td>
        <td>${esc(c.diagnosis || "—")}</td>
        <td>${esc(medicineSummary(c))}</td>
        <td>
          <button class="link-btn" data-action="view-prescription" data-id="${c.id}">Rx</button>
          <button class="link-btn" data-action="edit-consultation" data-id="${c.id}">Edit</button>
        </td>
      `;
      historyBody.appendChild(tr);
    });

    // Prescriptions tab
    const presList = document.getElementById("prescriptionsList");
    presList.innerHTML = "";
    document.getElementById("prescriptionsEmptyState").hidden = consults.length !== 0;
    consults.forEach((c) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="sl-main">
          <strong>${fmtDate(c.date)}</strong>
          <span class="sl-sub">${esc(medicineSummary(c))}</span>
        </div>
        <button class="btn btn-ghost btn-sm" data-action="view-prescription" data-id="${c.id}">View &amp; Print</button>
      `;
      presList.appendChild(li);
    });

    // Reports tab
    const reportsList = document.getElementById("reportsList");
    reportsList.innerHTML = "";
    const allReports = [];
    consults.forEach((c) => (c.reports || []).forEach((r) => allReports.push(Object.assign({ consultDate: c.date }, r))));
    document.getElementById("reportsEmptyState").hidden = allReports.length !== 0;
    allReports.forEach((r) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="sl-main">
          <strong>${esc(r.name)}</strong>
          <span class="sl-sub">${esc(r.type)} &middot; uploaded ${fmtDate(r.date)}</span>
        </div>
      `;
      reportsList.appendChild(li);
    });

    // Info tab
    const infoGrid = document.getElementById("infoGrid");
    const rows = [
      ["Full Name", patient.name],
      ["Age", patient.age || "—"],
      ["Gender", patient.gender || "—"],
      ["Phone", patient.phone || "—"],
      ["CNIC", patient.cnic || "—"],
      ["Address", patient.address || "—"],
      ["Condition", patient.condition || "—"],
      ["Notes", patient.notes || "—"]
    ];
    infoGrid.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(String(v))}</dd>`).join("");
  }

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  return { dashboard, patientsList, patientForm, patientProfile, fmtDate };
})();
