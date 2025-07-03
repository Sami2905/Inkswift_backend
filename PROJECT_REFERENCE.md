# DocuSign Clone – Project Reference

## 1. Product Requirements Document (PRD)

[Paste your full PRD here, as provided above.]

---

## 2. UI/UX + Interaction Design Guide

[Paste your full UI/UX + Interaction Design Guide here, as provided above.]

---

## 3. ChatGPT Prompt (Development Brief)

You are my senior full-stack coding assistant using the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

Build a full production-grade **Document Signature Web App** (a lightweight DocuSign clone) with the following criteria:

---

### 📘 Functional Scope (from PRD)
1. User authentication using JWT (register, login, reset password)
2. PDF upload with file validation (up to 10MB)
3. Dashboard to view documents (paginated, searchable)
4. React PDF Viewer to preview uploaded documents
5. Drag-and-drop interface to place signature fields on PDFs
6. Support for typed, drawn, and uploaded signatures
7. Signature invitation flow with secure tokenized URLs (no login required for signers)
8. Signature status tracking (Pending, Signed, Rejected, Expired)
9. Final document generation with embedded signature using PDF-Lib
10. Audit trail logging (IP, timestamp, method)
11. Email notifications using Nodemailer
12. Public signer interface to sign shared documents
13. Mobile-responsive and accessibility-compliant design

---

### 🖼️ Design System
- Use **Tailwind CSS + Headless UI** (for components like modals)
- Animations via **Framer Motion**
- Font: `Inter`, base 16px
- Color palette: Indigo 600 (primary), Sky 500 (accent), Emerald 500 (success), Rose 500 (error)
- Layouts:
  - Login/Register: Centered form with validation
  - Dashboard: Side nav + grid of document cards
  - Viewer: React PDF with drag-and-drop overlay
  - Modal: Invite signer with animated open/close
  - Audit Trail: Timeline UI with expandable entries

---

### 🧩 Tech Stack
- **Frontend:** React 18+ + Tailwind CSS + React Router
- **PDF Rendering:** `react-pdf`
- **Drag-and-Drop:** native HTML5 or dnd-kit
- **State Management:** Context API or Redux Toolkit
- **Animations:** Framer Motion
- **Backend:** Node.js + Express
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **DB:** MongoDB + Mongoose (User, Document, Signature, AuditLog schemas)
- **File Upload:** Multer (for PDFs)
- **PDF Editing:** PDF-Lib (for embedding signatures)
- **Email:** Nodemailer with SMTP
- **Storage:** Local for dev, S3-ready setup for prod

---

### 🧱 Component & Route Breakdown

#### React Pages
- `/login` – Auth form (email, password)
- `/register` – Create account form
- `/dashboard` – Lists user's uploaded documents
- `/upload` – PDF upload page with drag-drop
- `/document/:id` – PDF Viewer with signature canvas
- `/sign/:token` – Public signature UI for invited signer
- `/audit/:docId` – Audit trail viewer

#### APIs (Express Routes)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/docs/upload`
- `GET /api/docs`
- `POST /api/signatures`
- `GET /api/signatures/:id`
- `POST /api/signatures/finalize/:docId`
- `GET /api/audit/:docId`

---

### 🔐 Security Requirements
- JWT access tokens expire in 15 min, refresh every 7 days
- Brute-force protection on login (5 attempts lockout)
- Token-based public signing links with expiration
- File validation: only PDFs allowed, virus scan ready

---

### 🎨 UI/UX + Animation Guidelines
- Minimal motion design: fade, slide, scale, spring transitions
- Animations:
  - Page transitions (login ↔ dashboard): `Framer Motion`
  - Modal entrance: fade + scale
  - Button hover: scale 105%, press: scale 95%
  - Upload progress: animated bar
  - Signature confirmation: bounce + glow
  - Empty states: use Lottie / placeholder SVGs

---

### 🧪 Dev Best Practices
- Organize code into `/client` and `/server`
- Use `.env` files for config
- Lint with ESLint + Prettier
- Include Postman collection for API testing
- Ensure accessibility: keyboard nav, `aria` tags, contrast

---

**Use this file as a persistent reference for requirements, design, and development throughout the project.** 