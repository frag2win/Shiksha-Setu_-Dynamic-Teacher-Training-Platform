# GitHub Copilot Usage Guidelines

## Project Rules for AI Assistance

### 1. Communication Style
- **No emojis** in any code, comments, documentation, or responses
- Maintain professional, clear, and direct communication
- Use plain text formatting for emphasis when needed

### 2. Documentation Organization
- **All Product Requirements Documents (PRDs) must be stored in the `/PRD` folder**
- This includes:
  - Product requirements documents
  - Technical specifications
  - Developer checklists
  - AI prompt templates
  - Demo scripts
  - Architecture documents

### 3. Living PRD Maintenance
- **The PRD is a living document and must be kept up-to-date**
- Any architectural decisions, feature additions, or scope changes must be reflected in the PRD
- Update the version number and changelog when making significant changes
- **Always update the "Last Updated" date and time when any changes are made to documents**
- When implementing features, update the corresponding sections in the PRD with:
  - Implementation status
  - Technical decisions made
  - Deviations from original plan
  - Lessons learned

### 4. File Structure Standards
```
/PRD                           # All product and planning documentation
  ├── Product requirements
  ├── Technical specifications
  └── Planning documents

/backend                       # Backend application code
/frontend                      # Frontend application code
/docs                          # General project documentation (non-PRD)
```

### 5. When Creating New Documentation
- Before creating any PRD-related document, always place it in `/PRD`
- Use descriptive file names with underscores (e.g., `Feature_Specification.md`)
- Follow markdown formatting standards
- Avoid decorative elements like emojis or excessive formatting

### 6. Code Generation Guidelines
- Write clean, professional code without emoji comments
- Follow project-specific coding standards
- Maintain consistency with existing codebase patterns
- Document technical decisions in appropriate PRD files

---

**Last Updated:** January 12, 2026
