from pydantic import BaseModel, Field, validator
from typing import Optional, Union, List
from enum import Enum
from datetime import datetime, date
from models.user import UserGetModel
from models.feature import FeatureGetModel
from models.shared import StrFromId, IdFromStr, RegexFromStr


class IssueSeverityEnum(str, Enum):
    MAJOR = "MAJOR"
    MINOR = "MINOR"
    BLOCKING = "BLOCKING"
    MODERATE = "MODERATE"
    LOCALIZATION = "LOCALIZATION"


class IssueDevTypeEnum(str, Enum):
    FE = "FE"
    BE = "BE"


class IssueStatusEnum(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    DEV_DONE = "DEV_DONE"
    FAIL = "FAIL"
    PASS = "PASS"
    NAB = "NAB"


class IssueCreateModel(BaseModel):
    ref: str
    feature_id: IdFromStr
    description: str
    severity: IssueSeverityEnum
    reported_date: datetime
    due_date: Optional[datetime] = None
    reporter_id: IdFromStr
    status: Union[IssueStatusEnum,  None] = None
    dev_type: Union[IssueDevTypeEnum, None] = None
    dev_id: Optional[IdFromStr] = None
    dev_eta: Optional[int] = None
    dev_actual: Optional[int] = None
    qa_id: Optional[IdFromStr] = None
    qa_eta: Optional[int] = None
    qa_actual: Optional[int] = None


class IssueUpdateModel(BaseModel):
    ref: Optional[str] = None
    feature_id: Optional[IdFromStr] = None
    description: Optional[str] = None
    severity: Union[IssueSeverityEnum, None] = None
    reported_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    reporter_id: Optional[IdFromStr] = None
    status: Union[IssueStatusEnum,  None] = None
    dev_type: Union[IssueDevTypeEnum, None] = None
    dev_id: Optional[IdFromStr] = None
    dev_eta: Optional[int] = None
    dev_actual: Optional[int] = None
    qa_id: Optional[IdFromStr] = None
    qa_eta: Optional[int] = None
    qa_actual: Optional[int] = None

    @validator("reported_date", pre=True)
    def format_reported_date(cls, value):
        if not value:
            return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

    @validator("due_date", pre=True)
    def format_due_date(cls, value):
        if not value:
            return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")


class IssueGetModel(BaseModel):
    id: StrFromId = Field(alias="_id")
    ref: str
    feature: FeatureGetModel
    feature_id: StrFromId
    description: str
    severity: IssueSeverityEnum
    reported_date: date
    due_date: Optional[date] = None
    reporter: UserGetModel
    reporter_id: StrFromId
    status: Union[IssueStatusEnum,  None] = None
    dev_type: Union[IssueDevTypeEnum, None] = None
    dev: Optional[UserGetModel] = None
    dev_id: Optional[StrFromId] = None
    dev_eta: Optional[int] = None
    dev_actual: Optional[int] = None
    qa: Optional[UserGetModel] = None
    qa_id: Optional[StrFromId] = None
    qa_eta: Optional[int] = None
    qa_actual: Optional[int] = None


class IssueGetAllModel(BaseModel):
    total_documents: int
    issues: List[IssueGetModel]


class IssueFilterModel(BaseModel):
    ref: Optional[RegexFromStr] = None
    description: Optional[RegexFromStr] = None
    severity: Union[IssueSeverityEnum, None] = None
    reported_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    reporter_id: Optional[IdFromStr] = None
    status: Union[IssueStatusEnum,  None] = None
    dev_type: Union[IssueDevTypeEnum, None] = None
    dev_id: Optional[IdFromStr] = None
    qa_id: Optional[IdFromStr] = None

    @validator("reported_date", pre=True)
    def format_reported_date(cls, value):
        if not value:
            return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")

    @validator("due_date", pre=True)
    def format_due_date(cls, value):
        if not value:
            return None
        return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")
