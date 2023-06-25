from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from enum import Enum
from utils.hash import Hash
from models.utils import StrFromId, IdFromStr, RegexFromStr


class UserRoleEnum(str, Enum):
    ADM = "ADMIN"
    QA = "QA"
    FE = "FE"
    BE = "BE"


class UserCreateModel(BaseModel):
    picture_id: Optional[str] = None
    picture_url: Optional[str] = None
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    active: Optional[bool] = True
    feature_ids: Optional[List[IdFromStr]] = []
    role: UserRoleEnum

    @validator('password', pre=True)
    def hash_password(cls, value):
        return Hash.bcrypt(value)


class UserUpdateModel(BaseModel):
    picture_id: Optional[str] = None
    picture_url: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    active: Optional[bool] = None
    feature_ids: Optional[List[IdFromStr]] = None
    role: Optional[UserRoleEnum] = None

    @validator('password', pre=True)
    def hash_password(cls, value):
        if not value:
            return None
        return Hash.bcrypt(value)


class UserGetModel(BaseModel):
    id: StrFromId = Field(alias="_id")
    picture_id: Optional[str] = None
    picture_url: Optional[str] = None
    email: EmailStr
    first_name: str
    last_name: str
    active: Optional[bool] = None
    feature_ids: List[StrFromId] = []
    role: UserRoleEnum


class UserGetAllModel(BaseModel):
    total_documents: int
    users: List[UserGetModel]


class UserFilterModel(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[RegexFromStr] = None
    last_name: Optional[RegexFromStr] = None
    active: Optional[bool] = None
    feature_ids: Optional[List[IdFromStr]] = None
    role: Optional[UserRoleEnum] = None


class UserPaginationModel(BaseModel):
    index: Optional[int] = 0
    limit: Optional[int] = 20
