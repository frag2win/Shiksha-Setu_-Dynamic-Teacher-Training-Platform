# API Routes
from api.clusters import router as clusters_router
from api.manuals import router as manuals_router
from api.modules import router as modules_router
from api.translation import router as translation_router

__all__ = ["clusters_router", "manuals_router", "modules_router", "translation_router"]

