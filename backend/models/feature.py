from pydantic import BaseModel, Field
from typing import List, Optional
from models.shared import StrFromId, RegexFromStr


class FeatureCreateModel(BaseModel):
    name: str


class FeatureUpdateModel(BaseModel):
    name: Optional[str] = None


class FeatureGetModel(BaseModel):
    id: StrFromId = Field(alias="_id")
    name: Optional[str] = None


class FeatureGetAllModel(BaseModel):
    total_documents: int
    features: List[FeatureGetModel]


class FeatureFilterModel(BaseModel):
    name: Optional[RegexFromStr] = None
