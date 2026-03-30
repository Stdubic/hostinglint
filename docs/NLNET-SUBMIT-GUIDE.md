# NLnet submission — step-by-step

**Call:** NGI Zero Commons Fund  
**Deadline:** 1 April 2026, 12:00 CEST (noon)  
**Form:** https://nlnet.nl/propose  

Aim to submit **1–2 weeks before** the deadline.

---

## 1. Metadata (form fields)

| Field | Value |
|-------|--------|
| Thematic call | NGI Zero Commons Fund |
| Proposal name | HostingLint - Static Analysis Toolkit for Hosting Control Panel Modules |
| Website | https://github.com/Stdubic/hostinglint |
| Requested amount | **35000** (EUR) |
| Repository status | Public; CI, tests, SECURITY.md |

Complete your **name, email, organisation (if any), and country** as required by the form.

---

## 2. Long-form text fields

Copy from **`docs/NLNET-APPLICATION-FORM-FIELDS.md`** after you have edited it into your own words. Map sections to the form:

1. **Abstract** → Field 1  
2. **Previous involvement** → Field 2  
3. **Requested support / budget** → Field 3  
4. **Comparison** → Field 4  
5. **Technical challenges** → Field 5  
6. **Ecosystem and engagement** → Field 6  

The reference draft with tables and metrics is **`docs/NLNET-PROPOSAL.md`**.

---

## 3. Attachments (PDF)

The form accepts PDF (and other formats); total size limit **50 MB**.

**Option A — Headless Chrome (macOS/Linux):**

```bash
npm run build
node scripts/build-nlnet-print-html.mjs
node scripts/nlnet-html-to-pdf.mjs
```

PDFs are written to **`docs/nlnet-pdf/`**.

**Option B — Manual:** open files under **`docs/nlnet-print/`** in a browser → **Print → Save as PDF**.

**Attach these PDFs (or equivalents):**

- `MILESTONE-ROADMAP.pdf`
- `ARCHITECTURE.pdf`
- `SECURITY-MODEL.pdf`
- `BENCHMARKS.pdf`
- `RULES-ROADMAP.pdf`

---

## 4. npm (optional but strengthens the application)

Packages are published at:

- https://www.npmjs.com/package/@hostinglint/core  
- https://www.npmjs.com/package/hostinglint  

Verify locally: `npm view @hostinglint/core version` and `npm view hostinglint version`.

For future releases, see **`docs/NPM-PUBLISH.md`**.

---

## 5. GenAI section

Answer honestly. If final proposal text is **entirely your own**, you may indicate **no** generative AI for the **writing** of the submission. If assisted text remains, disclose per NLnet: https://nlnet.nl/foundation/policies/generativeAI/

---

## 6. Before you click Submit

- [ ] Guide for applicants read: https://nlnet.nl/commonsfund/guideforapplicants/  
- [ ] Abstract under ~300 words if the form limits size  
- [ ] Budget table matches EUR 35k / 700 h  
- [ ] PDFs attached and open correctly  
- [ ] “Send me a copy” checked (recommended)  
- [ ] **Submit** before **1 Apr 2026, 12:00 CEST**

---

## 7. After submission

Keep the confirmation email. Link reviewers to GitHub, npm, and `SECURITY.md` for security contacts.
