from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from services.pdf_export_service import PDFExportService
from models.database_models import Module
from core.database import get_db

router = APIRouter(prefix="/api/exports", tags=["Exports"])

pdf_service = PDFExportService()


@router.api_route("/module-pdf", methods=["GET", "POST"])
def export_module_to_pdf(
    module_id: int,
    db: Session = Depends(get_db),
):
    # 1️⃣ Fetch module
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # 2️⃣ USE MODULE CONTENT AS-IS (NO TRANSLATION)
    result = pdf_service.generate_module_pdf(
        module_title=module.title,
        module_content=module.adapted_content,  # ✅ preserve language
        language=module.language or "unknown",
    )

    return {
        "status": "success",
        "message": "PDF generated successfully",
        "pdf_url": result["download_url"],
    }
