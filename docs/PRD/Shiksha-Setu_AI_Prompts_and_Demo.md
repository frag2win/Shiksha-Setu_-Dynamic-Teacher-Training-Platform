# Shiksha-Setu — AI Prompts & Demo Script

This document contains **exact, production-ready AI prompt templates** and a **hackathon demo narration script** aligned with the final PRD (v1.2).
It is intended to be committed directly to the GitHub repository.

---

## PART 1: Exact AI Prompt Templates

These prompts are designed for:
- RAG-grounded generation
- Zero hallucination risk
- Policy-safe, low-resource pedagogy
- Cluster-based personalization

---

### 1. System Prompt (Global — Do Not Modify)

```text
You are an expert teacher educator working within the Indian public education system.

You must strictly follow these rules:
1. Use ONLY the provided source material as factual grounding.
2. Do NOT invent experiments, activities, or policies not present in the source.
3. Adapt pedagogy to the given classroom constraints.
4. Ensure all suggestions are safe, low-cost, and policy-aligned.
5. Write in simple, practical language suitable for government school teachers.
6. Do NOT evaluate or judge teachers.
7. If a resource is unavailable, redesign the activity instead of suggesting purchase.

Your task is to assist DIET and SCERT administrators in creating localized teacher training modules.
```

---

### 2. Source Context Injection (RAG Output)

```text
SOURCE MANUAL EXCERPT:
"""
{{retrieved_manual_text}}
"""
```

---

### 3. Cluster Profile Injection

```text
CLUSTER PROFILE:
- Region Type: {{region_type}}
- Medium of Instruction: {{language}}
- Infrastructure Constraints: {{infrastructure}}
- Key Classroom Issues: {{issues}}
- Grade Range: {{grades}}
```

---

### 4. Core Pedagogical Adaptation Prompt

```text
TASK:
Rewrite the above training content into a localized, practical micro-learning module for teachers in the given cluster.

INSTRUCTIONS:
- Keep the core learning objective unchanged.
- Replace or redesign any activity that requires unavailable infrastructure.
- Use culturally and linguistically familiar examples.
- Break content into short sections:
  1. Classroom Challenge
  2. Suggested Teaching Approach
  3. Low-Resource Activity
  4. Expected Student Response
- Keep total length suitable for a 10–15 minute teacher training slot.

OUTPUT FORMAT:
Title:
Cluster Context:
Micro-Learning Module:
```

---

### 5. Safety & Policy Validation Prompt (Optional Second Pass)

```text
Review the generated module and ensure:
- No unsafe or unapproved experiments are suggested
- No policy violations are present
- No assumptions of unavailable resources
- Tone is respectful and supportive toward teachers

If any issue is found, revise the content accordingly.
```

---

### 6. Competency Tagging Prompt (Bonus)

```text
Based on the module content, tag this module under up to two teacher competency areas:
- Classroom Management
- Language Pedagogy
- Conceptual Teaching
- Inclusive Education
- Assessment & Feedback

Return only the tags.
```

---

## PART 2: Hackathon Demo Narration Script (2–3 Minutes)

---

### Opening (≈20 seconds)

> In government teacher training today, one single manual is created at the state level and passed down to thousands of teachers.
> But classrooms are not uniform — language, infrastructure, and student needs vary drastically.
> This creates training fatigue and poor classroom impact.

---

### Problem Setup (≈20 seconds)

> DIET principals like Dr. Kumar are expected to personalize training — but manually rewriting 50-page manuals for thousands of teachers is impossible.
> So we asked: *What if training content could adapt as fast as classrooms do?*

---

### Introducing Shiksha-Setu (≈15 seconds)

> Shiksha-Setu is an AI-assisted platform that helps DIETs and SCERTs rapidly adapt existing training manuals into localized, need-based micro-modules — without changing policy or increasing workload.

---

### Demo Step 1: Source of Truth (≈30 seconds)

> Here, an administrator uploads a standard state training manual.
> This becomes the **source of truth** — the AI never goes beyond this content.

---

### Demo Step 2: Cluster Definition (≈30 seconds)

> Next, the DIET defines cluster profiles.
> For example, a tribal belt cluster with language barriers and no science lab, and an urban cluster with advanced resources.

---

### Demo Step 3: AI Adaptation (≈40 seconds)

> Now we generate adaptations for the same lesson — Photosynthesis — across different clusters.
> The learning objective remains the same, but the teaching approach changes.

---

### Value Explanation (≈30 seconds)

> Instead of one-size-fits-all workshops, DIETs now get short, practical, contextual modules that can be updated in minutes instead of months — with full human approval.

---

### Feedback Loop (Optional – ≈15 seconds)

> Teachers can give simple feedback on usefulness, allowing continuous improvement of training programs.

---

### Closing (≈15 seconds)

> Shiksha-Setu doesn't replace institutions.
> It gives them the agility they were always expected to have.

---

## Demo Readiness Checklist

- Pre-generated outputs available as backup
- Stable network or offline fallback
- One speaker, one operator
- Demo duration under 3 minutes
