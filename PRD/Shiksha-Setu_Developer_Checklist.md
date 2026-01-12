# **Shiksha-Setu — Developer Task Breakdown**

## **BUILD STRATEGY (Read This First)**

Golden rule: If time runs out, the demo must still work end-to-end.  
The absolute priority is: PDF → Cluster → AI Adaptation → Side-by-Side View. Everything else is secondary.

## **PHASE 0 — Project Setup (Day 0 / Hour 0–2)**

### **Core Setup**

* [ ] **Create Git repo** (frontend + backend folders)  
* [ ] **Decide stack**  
  * Backend: Python (FastAPI / Flask)  
  * Frontend: React / Next.js / simple HTML + JS  
* [ ] **Define .env** for API keys (Groq, Translation)

### **Architecture Decisions**

* [ ] **Decide RAG flow** (PDF → chunks → vector DB → retrieval)  
* [ ] **Decide prompt structure** (base + cluster constraints)

**Output:** Repo boots locally without errors.

## **PHASE 1 — Backend Core (MVP CRITICAL)**

### **1️⃣ PDF Ingestion & RAG Pipeline**

**Owner:** Backend Dev

* [ ] Create **Upload PDF** endpoint  
* [ ] Implement **Extract text** (PyPDF / LlamaParse)  
* [ ] Implement **Chunk text** (logical chunks, not random)  
* [ ] **Store embeddings** in ChromaDB  
* [ ] Test **retrieval** of correct sections by query

**Acceptance check:** You can query "photosynthesis" and get the right manual content.

### **2️⃣ Cluster Profile Builder**

**Owner:** Backend Dev / Full-Stack

* [ ] **Define Cluster schema:**  
  * Name  
  * Language  
  * Infrastructure constraints  
  * Key issues (absenteeism, mixed ability, etc.)  
* [ ] Create **CRUD APIs** for clusters  
* [ ] **Persist clusters** (SQLite / JSON)

**Acceptance check:** You can create at least 2 clusters with different constraints.

### **3️⃣ Pedagogical Adaptation Engine (AI Core)**

**Owner:** AI / Backend Dev

* [ ] **Design base prompt** (grounded, policy-safe)  
* [ ] **Inject Context:**  
  * Retrieved manual content  
  * Cluster constraints  
* [ ] Integrate **Groq (Llama 3)** call  
* [ ] **Generate adapted module text**  
* [ ] **Enforce Safety:**  
  * No unsafe activities  
  * No hallucinated content

**Acceptance check:** Same input → different outputs for different clusters.

## **PHASE 2 — Frontend MVP (MVP CRITICAL)**

### **4️⃣ Admin "Command Center" UI**

**Owner:** Frontend Dev

* [ ] **Build Layout:**  
  * Sidebar (Uploads, Clusters, Modules)  
  * Main split screen  
* [ ] **Left Panel:** PDF viewer / original text panel  
* [ ] **Right Panel:** Adapted content editor panel

**Acceptance check:** Admin can visually compare original vs adapted content.

### **5️⃣ Generate Flow (End-to-End)**

**Owner:** Full-Stack

* [ ] **Selection UI:**  
  * Manual  
  * Cluster  
  * Lesson / topic  
* [ ] **"Generate Adaptation"** Action  
  * Show loading state  
  * Show success state  
* [ ] **Display output** side-by-side

**Acceptance check:** This is your demo backbone — must be smooth.

## **PHASE 3 — Differentiators (ONLY If Time Allows)**

### **6️⃣ Multilingual Output**

* [ ] Integrate **translation API** (or mock)  
* [ ] Translate adapted module  
* [ ] Add **Language Toggle** in UI

**Note:** Optional but impressive.

### **7️⃣ WhatsApp / PDF Export**

* [ ] Generate clean **PDF** from adapted text  
* [ ] Mock **"Push to WhatsApp"** button  
* [ ] Show **confirmation message**

**Note:** Mocking is acceptable.

## **PHASE 4 — Bonus (ONLY If Everything Else Works)**

### **8️⃣ Feedback Loop Visualization (UNCHANGED Could-Have)**

**Owner:** Frontend

* [ ] **Define feedback schema:**  
  * Module ID  
  * Helpful / Not Helpful  
* [ ] **Mock feedback data**  
* [ ] Render **Chart.js** (Simple bar or pie chart)

**Important:** No teacher names. No ranking.

## **PHASE 5 — Safety, Polish & Demo Prep**

### **9️⃣ Guardrails & Ethics**

* [ ] Add **Human-in-the-loop** approval toggle  
* [ ] Block **unsafe keywords** (simple rule-based)  
* [ ] Add clear **disclaimer**: "AI-assisted draft"

### **🔟 Demo Scenario Preparation (CRITICAL)**

* [ ] Choose **1 chapter** (e.g., Photosynthesis)  
* [ ] Prepare **3 clusters**:  
  1. Tribal / Language barrier  
  2. No-lab rural school  
  3. Urban high-performing cluster  
* [ ] **Pre-generate outputs** (backup plan)

**Note:** This prevents live-demo failure.
