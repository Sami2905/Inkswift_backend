# DocuSign Clone – 1-Week Build Plan (MERN Stack)

## Reference: Use this plan if you get stuck or need guidance during development.

---

## 🗓️ 1-Week Build Plan (MERN DocuSign Clone MVP)

### **Day 1: Project Setup & Auth**
- Scaffold `/client` (React + Tailwind + Framer Motion) and `/server` (Node/Express)
- Set up ESLint, Prettier, and .env configs
- Initialize MongoDB with Mongoose schemas: User, Document, Signature, AuditLog
- Implement JWT auth (register, login, refresh, lockout)
- Build `/login` and `/register` React pages with validation

### **Day 2: PDF Upload & Dashboard**
- Backend: Multer setup for PDF upload, file validation (10MB, PDF only)
- Express routes: `/api/docs/upload`, `/api/docs`
- React: `/dashboard` page (side nav, document cards, pagination)
- `/upload` page with drag-and-drop PDF upload
- Connect frontend to backend with Axios

### **Day 3: PDF Viewer & Signature Placement**
- Integrate `react-pdf` for document preview
- Build `/document/:id` page: PDF viewer + drag-and-drop signature overlay (dnd-kit or native)
- Backend: Document fetch route, signature field model
- UI: Floating toolbar, zoom, and navigation

### **Day 4: Signature Workflow**
- Backend: Signature invitation route, tokenized URL generation, status tracking
- React: `/sign/:token` public signing page (no login), signature tools (draw, type, upload)
- Signature placement and confirmation UI
- Email notification (Nodemailer) for invitations

### **Day 5: Finalization & Audit Trail**
- Backend: PDF-Lib integration to embed signatures, finalize document
- Audit logging: IP, timestamp, method (middleware)
- React: `/audit/:docId` timeline UI, expandable entries
- Download final signed PDF and audit report

### **Day 6: Polish, Security, and Accessibility**
- Add brute-force protection, CORS, helmet, rate limiting
- Accessibility: ARIA tags, keyboard nav, color contrast
- Responsive/mobile layouts, empty states (Lottie/SVG)
- Animations: Framer Motion for page/modal transitions, button states

### **Day 7: Testing, Docs, and Deployment**
- Write Postman collection for API
- Add unit/integration tests (Jest, React Testing Library)
- Polish README, setup scripts, and .env.example
- Dockerize for local dev, prep for cloud deploy (Vercel/Netlify + Railway/Render)
- Final QA: cross-browser, mobile, accessibility, and performance checks

---

**Note:** Refer to the PRD, design language, and UI/UX instructions for detailed requirements and design decisions. 