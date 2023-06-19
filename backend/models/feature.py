from pydantic import BaseModel, Field, validator
from typing import List, Optional
from bson import ObjectId

import re

class FeatureCreateModel(BaseModel):
    name: str

class FeatureUpdateModel(BaseModel):
    name: Optional[str] = None

class FeatureGetModel(BaseModel):
    id: str = Field(alias="_id")
    name: Optional[str] = None

    @validator("id", pre=True)
    def convert_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)

        return value

class FeatureGetAllModel(BaseModel):
    total_documents: int
    features: List[FeatureGetModel]

class FeatureFilterModel(BaseModel):
    name: Optional[str] = None

    @validator('name')
    def convert_name_to_regex(cls, value):
        if not value: return None
        return re.compile('.*{}.*'.format(value), re.IGNORECASE)

class FeaturePaginationModel(BaseModel):
    index : Optional[int] = 0
    limit : Optional[int] = 20
