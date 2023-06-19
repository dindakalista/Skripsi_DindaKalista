from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from enum import Enum
from bson import ObjectId
from utils.hash import Hash

import re

class UserRoleEnum(str, Enum):
    ADM = "ADMIN"
    QA = "QA"
    FE = "FE"
    BE = "BE"


class UserCreateModel(BaseModel):
    picture_id  : Optional[str]  = None
    picture_url : Optional[str]  = None
    email       : EmailStr
    first_name  : str
    last_name   : str
    password    : str
    active      : Optional[bool]           = True
    feature_ids : Optional[List[ObjectId]] = []
    role        : UserRoleEnum

    @validator('password', pre=True)
    def hash_password(cls, value):
        return Hash.bcrypt(value)

    @validator('feature_ids', pre=True)
    def convert_feature_ids(cls, value):
        for i in range(len(value)):
            if isinstance(value[i], str):
                value[i] = ObjectId(value[i])

        return value
    
    class Config:
        arbitrary_types_allowed = True


class UserUpdateModel(BaseModel):
    picture_id  : Optional[str]            = None
    picture_url : Optional[str]            = None
    email       : Optional[EmailStr]       = None
    first_name  : Optional[str]            = None
    last_name   : Optional[str]            = None
    password    : Optional[str]            = None
    active      : Optional[bool]           = None
    feature_ids : Optional[List[ObjectId]] = None
    role        : Optional[UserRoleEnum]   = None

    @validator('password', pre=True)
    def hash_password(cls, value):
        if not value: return None
        return Hash.bcrypt(value)
    
    @validator('feature_ids', pre=True)
    def convert_feature_ids(cls, value):
        if not value: return None

        for i in range(len(value)):
            if isinstance(value[i], str):
                value[i] = ObjectId(value[i])

        return value
    
    class Config:
        arbitrary_types_allowed = True


class UserGetModel(BaseModel):
    id          : str = Field(alias="_id")
    picture_id  : Optional[str]  = None
    picture_url : Optional[str]  = None
    email       : EmailStr
    first_name  : str
    last_name   : str
    active      : Optional[bool] = None
    feature_ids : List[str]      = []
    role        : UserRoleEnum

    @validator('id', pre=True)
    def convert_id(cls, value):
        if isinstance(value, ObjectId):
            return str(value)
        
        return value
    
    @validator('feature_ids', pre=True)
    def convert_feature_ids(cls, value):
        for i in range(len(value)):
            if isinstance(value[i], ObjectId):
                value[i] = str(value[i])

        return value

class UserGetAllModel(BaseModel):
    total_documents: int
    users: List[UserGetModel]

class UserFilterModel(BaseModel):
    email       : Optional[EmailStr]       = None
    first_name  : Optional[str]            = None
    last_name   : Optional[str]            = None
    active      : Optional[bool]           = None
    feature_ids : Optional[List[ObjectId]] = None
    role        : Optional[UserRoleEnum]   = None

    @validator('first_name')
    def convert_first_name_to_regex(cls, value):
        if not value: return None
        return re.compile('.*{}.*'.format(value), re.IGNORECASE)

    @validator('last_name')
    def convert_last_name_to_regex(cls, value):
        if not value: return None
        return re.compile('.*{}.*'.format(value), re.IGNORECASE)

    class Config:
        arbitrary_types_allowed = True

class UserPaginationModel(BaseModel):
    index : Optional[int] = 0
    limit : Optional[int] = 20
