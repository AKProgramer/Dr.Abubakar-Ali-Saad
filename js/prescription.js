// Fills the fixed prescription template (#rxPaper in index.html) with
// dynamic patient / consultation data. The template markup/layout itself
// mirrors the doctor's physical prescription pad and must not be restructured
// here -- only text content and visibility toggles should change.

const Prescription = (function () {

  function formatAge(patient) {
    if (patient.age) return patient.age + "y";
    return "";
  }

  function renderRisk(consult) {
    const risk = consult.risk || {};
    document.querySelectorAll("#rxRiskList li").forEach((li) => {
      const key = li.getAttribute("data-key");
      li.classList.toggle("rx-risk-active", !!risk[key]);
    });
  }

  function renderMedicines(consult) {
    const wrap = document.getElementById("rxMedicines");
    wrap.innerHTML = "";
    (consult.medicines || []).forEach((med, i) => {
      const item = document.createElement("div");
      item.className = "rx-med-item";

      const name = document.createElement("div");
      name.className = "rx-med-name";
      name.textContent = (i + 1) + ".  " + med.name + (med.strength ? " " + med.strength : "");
      item.appendChild(name);

      const sub = document.createElement("div");
      sub.className = "rx-med-sub";
      sub.textContent = [med.dosage, med.frequency, med.duration].filter(Boolean).join("  •  ");
      item.appendChild(sub);

      if (med.instructionsEn || med.instructionsUr) {
        const instr = document.createElement("div");
        instr.className = "rx-med-instructions";
        if (med.instructionsEn) {
          const en = document.createElement("span");
          en.textContent = med.instructionsEn;
          instr.appendChild(en);
        }
        if (med.instructionsUr) {
          const ur = document.createElement("span");
          ur.className = "rx-ur";
          ur.textContent = med.instructionsUr;
          instr.appendChild(ur);
        }
        item.appendChild(instr);
      }
      wrap.appendChild(item);
    });
  }

  function render(patient, consult) {
    document.getElementById("rxPatientName").textContent = patient.name;
    const metaBits = [];
    if (patient.age) metaBits.push(patient.age + " yrs");
    if (patient.gender) metaBits.push(patient.gender);
    if (patient.address) metaBits.push(patient.address);
    document.getElementById("rxPatientMeta").textContent = metaBits.join("  |  ");

    const diagWrap = document.getElementById("rxDiagnosis");
    diagWrap.innerHTML = "";
    if (consult.diagnosis) {
      const d = document.createElement("div");
      d.innerHTML = "<b>Diagnosis: </b>" + escapeHtml(consult.diagnosis);
      diagWrap.appendChild(d);
    }
    if (consult.symptoms) {
      const s = document.createElement("div");
      s.innerHTML = "<b>Symptoms: </b>" + escapeHtml(consult.symptoms);
      diagWrap.appendChild(s);
    }

    renderMedicines(consult);

    const notesWrap = document.getElementById("rxNotes");
    const noteBits = [];
    if (consult.notes) noteBits.push(consult.notes);
    if (consult.remarks) noteBits.push(consult.remarks);
    notesWrap.textContent = noteBits.join("\n");

    document.getElementById("rxDate").textContent = formatDate(consult.date);
    renderRisk(consult);

    const bp = (consult.bpSys || "—") + " / " + (consult.bpDia || "—");
    document.getElementById("rxBp").textContent = bp;
    document.getElementById("rxVb").textContent = consult.vb || "+";
    document.getElementById("rxS1s2").textContent = consult.s1s2 === "murmur" ? "Murmur" : (consult.s1s2 === "muffled" ? "Muffled" : "+");
    document.getElementById("rxRbs").textContent = consult.rbs || "";

    document.getElementById("rxFollowDays").textContent = consult.followDays ? (consult.followDays + " ") : "    ";
    document.getElementById("rxFollowDate").textContent = consult.followDate ? formatDate(consult.followDate) : "    ";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function print() {
    window.print();
  }

  return { render, print };
})();
