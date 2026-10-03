# Dr. Abubakar Ali Saad — Cardiology Patient Manager

A frontend-only patient management and prescription workflow demo built for a single
cardiology consultant, using plain HTML, CSS, and vanilla JavaScript (no backend,
database, or build step required).

## Features

- Dashboard with patient/consultation stats and quick search
- Patient list, add/edit patient, and full patient profile
- New consultation workflow: vitals & risk factors, diagnosis & notes, medicines
  (with autocomplete), report attachments (frontend demo), and follow-up scheduling
- Bilingual (English/Urdu) medicine instructions
- Prescription preview that replicates the clinic's physical prescription pad,
  with dedicated print styles (`@page` / `@media print`)
- Data is persisted to the browser's `localStorage` so the demo works entirely offline

## Running locally

No build step is required. Open `index.html` directly in a browser, or serve the
folder with any static file server.

## Project structure

```
index.html
css/
  styles.css   — application UI styles
  print.css    — print-specific rules for the prescription page
js/
  data.js          — seed/mock data
  storage.js       — localStorage persistence layer
  medicines.js     — medicine catalog + instruction phrases for autocomplete
  render.js        — screen rendering
  prescription.js  — prescription template population
  app.js           — routing and event wiring
```

## Scope

This is a frontend demo phase: there is no backend, authentication, payment, or
database integration. Data structures are organized so a backend/API can be
connected later without rebuilding the UI.
