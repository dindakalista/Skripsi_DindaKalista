from pydantic import BaseModel, Field, validator
from typing import Optional, Union, List
from enum import Enum
from datetime import datetime, date
from bson import ObjectId
from models.user import UserGetModel
from models.feature import FeatureGetModel


class IssueSeverityEnum(str, Enum):
    MAJOR        = "MAJOR"
    MINOR        = "MINOR"
    BLOCKING     = "BLOCKING"
    MODERATE     = "MODERATE"
    LOCALIZATION = "LOCALIZATION"


class IssueDevTypeEnum(str, Enum):
    FE = "FE"
    BE = "BE"


class IssueStatusEnum(str, Enum):
    OPEN        = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    DEV_DONE    = "DEV_DONE"
    FAIL        = "FAIL"
    PASS        = "PASS"
    NAB         = "NAB"


class IssueCreateModel(BaseModel):
    ref           : str
    feature_id    : ObjectId
    description   : str
    severity      : IssueSeverityEnum
    reported_date : datetime
    due_date      : Optional[datetime] = None
    reporter_id   : ObjectId
    status        : Union[IssueStatusEnum,  None] = None
    dev_type      : Union[IssueDevTypeEnum, None] = None
    dev_id        : Optional[ObjectId] = None
    dev_eta       : Optional[int] = None
    dev_actual    : Optional[int] = None
    qa_id         : Optional[ObjectId] = None
    qa_eta        : Optional[int] = None
    qa_actual     : Optional[int] = None

    @validator("feature_id", pre=True)
    def convert_id(cls, value):
        return ObjectId(value)
    
    @validator("reporter_id", pre=True)
    def convert_reporter_id(cls, value):
        return ObjectId(value)

    @validator("dev_id", pre=True)
    def convert_dev_id(cls, value):
        if not value: return None
        return ObjectId(value)

    @validator('qa_id', pre=True)
    def convert_qa_id(cls, value):
        if not value: return None
        return ObjectId(value)
    
    class Config:
        arbitrary_types_allowed = True


class IssueUpdateModel(BaseModel):
    ref           : Optional[str] = None
    feature_id    : Optional[ObjectId] = None
    description   : Optional[str] = None
    severity      : Union[IssueSeverityEnum, None] = None
    reported_date : Optional[datetime] = None
    due_date      : Optional[datetime] = None
    reporter_id   : Optional[ObjectId]  = None
    status        : Union[IssueStatusEnum,  None] = None
    dev_type      : Union[IssueDevTypeEnum, None] = None
    dev_id        : Optional[ObjectId] = None
    dev_eta       : Optional[int] = None
    dev_actual    : Optional[int] = None
    qa_id         : Optional[ObjectId] = None
    qa_eta        : Optional[int] = None
    qa_actual     : Optional[int] = None

    @validator("reported_date", pre=True)
    def format_reported_date(cls, value):
        if not value: return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

    @validator("due_date", pre=True)
    def format_due_date(cls, value):
        if not value: return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

    @validator("feature_id", pre=True)
    def convert_id(cls, value):
        if not value: return None
        return ObjectId(value)
    
    @validator("reporter_id", pre=True)
    def convert_reporter_id(cls, value):
        if not value: return None
        return ObjectId(value)

    @validator("dev_id", pre=True)
    def convert_dev_id(cls, value):
        if not value: return None
        return ObjectId(value)

    @validator('qa_id', pre=True)
    def convert_qa_id(cls, value):
        if not value: return None
        return ObjectId(value)
    
    class Config:
        arbitrary_types_allowed = True


class IssueGetModel(BaseModel):
    id            : str = Field(alias="_id")
    ref           : str
    feature       : FeatureGetModel
    feature_id    : str
    description   : str
    severity      : IssueSeverityEnum
    reported_date : date
    due_date      : Optional[date] = None
    reporter      : UserGetModel
    reporter_id   : str
    status        : Union[IssueStatusEnum,  None] = None
    dev_type      : Union[IssueDevTypeEnum, None] = None
    dev           : Optional[UserGetModel] = None
    dev_id        : Optional[str] = None
    dev_eta       : Optional[int] = None
    dev_actual    : Optional[int] = None
    qa            : Optional[UserGetModel] = None
    qa_id         : Optional[str] = None
    qa_eta        : Optional[int] = None
    qa_actual     : Optional[int] = None

    @validator("id", pre=True)
    def convert_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)

        return value

    @validator("feature_id", pre=True)
    def convert_feature_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)

        return value

    @validator("reporter_id", pre=True)
    def convert_reporter_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)

        return value

    @validator("dev_id", pre=True)
    def convert_dev_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)

        return value

    @validator("qa_id", pre=True)
    def convert_qa_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)

        return value

class IssueGetAllModel(BaseModel):
    total_documents: int
    issues: List[IssueGetModel]

class IssueFilterModel(BaseModel):
    feature_id: Optional[ObjectId] = None

    @validator("feature_id", pre=True)
    def convert_feature_id(cls, value):
        if isinstance(value, str):
            return ObjectId(value)

        return value

    class Config:
        arbitrary_types_allowed = True

class IssueFilterModel(BaseModel):
    ref           : Optional[str]                  = None
    feature_id    : Optional[ObjectId]             = None
    description   : Optional[str]                  = None
    severity      : Union[IssueSeverityEnum, None] = None
    reported_date : Optional[datetime]             = None
    due_date      : Optional[datetime]             = None
    reporter_id   : Optional[ObjectId]             = None
    status        : Union[IssueStatusEnum,  None]  = None
    dev_type      : Union[IssueDevTypeEnum, None]  = None
    dev_id        : Optional[ObjectId]             = None
    qa_id         : Optional[ObjectId]             = None

    @validator("reported_date", pre=True)
    def format_reported_date(cls, value):
        if not value: return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

    @validator("due_date", pre=True)
    def format_due_date(cls, value):
        if not value: return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

    @validator("feature_id", pre=True)
    def convert_id(cls, value):
        if not value: return None
        return ObjectId(value)
    
    @validator("reporter_id", pre=True)
    def convert_reporter_id(cls, value):
        if not value: return None
        return ObjectId(value)

    @validator("dev_id", pre=True)
    def convert_dev_id(cls, value):
        if not value: return None
        return ObjectId(value)

    @validator('qa_id', pre=True)
    def convert_qa_id(cls, value):
        if not value: return None
        return ObjectId(value)

    class Config:
        arbitrary_types_allowed = True

class IssuePaginationModel(BaseModel):
    index : Optional[int] = 0
    limit : Optional[int] = 20
