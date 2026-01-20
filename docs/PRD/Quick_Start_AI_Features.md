# Quick Start: AI Decision Intelligence Features

## Setup (5 minutes)

### 1. Run Database Migration
```bash
cd backend
python migrate_decision_intelligence.py
```

Expected output:
```
✅ MIGRATION COMPLETE
Migrations applied:
  • Added tags column to feedback
  • Created training_recommendations table
```

### 2. Restart Backend
```bash
python main.py
```

Verify new endpoints at: http://localhost:8000/docs
Look for `/api/intelligence/*` endpoints

### 3. Test API (Optional)
```bash
# Get macro insights
curl http://localhost:8000/api/intelligence/insights/macro -H "Authorization: Bearer YOUR_TOKEN"
```

## Usage

### For Admins/Principals:

**1. Run AI Analysis**
- Login to dashboard
- Navigate to "AI Insights" section
- Click "Run Analysis" button
- System analyzes all clusters (~10-30 seconds)

**2. View Insights**
- See high-priority clusters
- Identify systemic issues
- Review recommended interventions

**3. Manage Training Backlog**
- Go to "Training Backlog" tab
- Filter by priority/status
- Approve/reject recommendations
- Mark implemented after completing training

**4. Track Impact**
- Re-run analysis periodically
- Monitor priority score trends
- Measure feedback improvements

### For Teachers:

**Enhanced Feedback**
When submitting module feedback, now include tags:
- ☐ Not Practical
- ☐ Too Complex
- ☐ Needs Resources
- ☐ Language Barrier
- ☐ Time Constraint

Tags help AI detect systemic issues!

## API Reference

**Analyze Single Cluster:**
```
GET /api/intelligence/analyze/cluster/{cluster_id}
```

**Analyze All Clusters:**
```
GET /api/intelligence/analyze/all
```

**Get Macro Insights:**
```
GET /api/intelligence/insights/macro
```

**Get Recommendations:**
```
GET /api/intelligence/recommendations?status=pending&priority=high
```

**Update Status:**
```
PATCH /api/intelligence/recommendations/{id}/status?status=approved
```

## What's New

### AI Decision Intelligence
- Automatically detects training needs from feedback and usage
- Generates specific, actionable recommendations
- Prioritizes interventions by urgency and impact
- Tracks implementation status

### Enhanced Module Structure
All new modules follow 7-component format:
1. Classroom Challenge
2. Why This Matters
3. Suggested Teaching Approach
4. Low-Resource Activity
5. Expected Student Response
6. Classroom Signals
7. Teacher Feedback Prompt

### Feedback Tags
Teachers can now tag issues:
- Helps AI identify common problems
- Enables trend detection
- Drives recommendation engine

### Training Backlog
- Queue of AI-generated recommendations
- Approve/reject workflow
- Implementation tracking
- Priority-based organization

## Troubleshooting

**Migration fails:**
- Ensure database file exists: `shiksha_setu.db`
- Run `python init_database.py` first

**No recommendations appearing:**
- Run cluster analysis first
- Ensure feedback data exists
- Check user permissions (admin/principal only)

**API endpoints not found:**
- Restart backend after code changes
- Check `/docs` for available endpoints
- Verify `intelligence_router` is registered in `main.py`

## Next Steps

1. ✅ Run migration
2. ✅ Test analysis on existing data
3. ✅ Review generated recommendations
4. ✅ Approve high-priority items
5. ✅ Implement approved training
6. ✅ Collect new feedback
7. ✅ Re-run analysis to measure improvement

## Support

For issues or questions:
- Check [Phase_2_Implementation_AI_Decision_Intelligence.md](Phase_2_Implementation_AI_Decision_Intelligence.md)
- Review API docs: http://localhost:8000/docs
- Inspect logs for detailed error messages

---

**Quick Reference Card:**

| Feature | Endpoint | Who Can Use |
|---------|----------|-------------|
| Run Analysis | GET /intelligence/analyze/all | Admin, Principal |
| View Insights | GET /intelligence/insights/macro | Admin, Principal |
| Get Recommendations | GET /intelligence/recommendations | Admin, Principal, Teacher |
| Approve Recommendation | PATCH /intelligence/recommendations/{id}/status | Admin, Principal |
| Submit Tagged Feedback | POST /modules/{id}/feedback | Teacher |

---

**Version:** 2.1  
**Last Updated:** January 20, 2026
