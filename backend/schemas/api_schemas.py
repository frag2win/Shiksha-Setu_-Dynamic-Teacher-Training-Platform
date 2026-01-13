from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClusterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    region_type: str = Field(..., min_length=1, max_length=50)
    language: str = Field(..., min_length=1, max_length=50)
    infrastructure_constraints: Optional[str] = None
    key_issues: Optional[str] = None
    grade_range: Optional[str] = None

class ClusterCreate(ClusterBase):
    pass

class ClusterUpdate(BaseModel):
    name: Optional[str] = None
    region_type: Optional[str] = None
    language: Optional[str] = None
    infrastructure_constraints: Optional[str] = None
    key_issues: Optional[str] = None
    grade_range: Optional[str] = None

class ClusterResponse(ClusterBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ManualBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

class ManualCreate(ManualBase):
    filename: str
    file_path: str
    total_pages: Optional[int] = None

class ManualResponse(ManualBase):
    id: int
    filename: str
    total_pages: Optional[int]
    upload_date: datetime
    indexed: bool
    
    class Config:
        from_attributes = True

class ModuleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    manual_id: int
    cluster_id: int
    original_content: str
    adapted_content: str
    language: Optional[str] = None

class ModuleCreate(ModuleBase):
    pass

class ModuleResponse(ModuleBase):
    id: int
    approved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    module_id: int
    is_helpful: bool
    comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: int
    submitted_at: datetime
    
    class Config:
        from_attributes = True

class GenerateModuleRequest(BaseModel):
    manual_id: int
    cluster_id: int
    topic: str = Field(..., min_length=1)
    page_range: Optional[str] = None
