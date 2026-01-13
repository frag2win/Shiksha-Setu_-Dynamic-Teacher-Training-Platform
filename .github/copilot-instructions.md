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
- **If new features are added outside of the main PRD, the main PRD must be updated with information about what the feature is**
  - Include a brief description of the feature
  - Reference the location of detailed specifications
  - Explain how the feature integrates with existing functionality
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

### 7. Code File Length Management
- **When a code file exceeds 400-500 lines, split it into multiple files**
- Use continuation naming pattern: `filename_part1.py`, `filename_part2.py`, etc.
- OR use feature-based naming: `filename_core.py`, `filename_utils.py`, `filename_helpers.py`
- Add clear comments at the top of each file explaining the split and referencing related files
- Maintain logical separation: group related functionality together
- Update imports in dependent files accordingly

---

**Last Updated:** January 13, 2026
