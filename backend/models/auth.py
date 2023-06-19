from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from models.user import UserGetModel
from bson import ObjectId

class AuthLoginModel(BaseModel):
    email    : EmailStr
    password : str

class AuthLoginReponseModel(BaseModel):
    token : Optional[str]          = None
    user  : Optional[UserGetModel] = None

class AuthChangePasswordModel(BaseModel):
    id: ObjectId
    old_password: str
    new_password: str

    @validator('id', pre=True)
    def convert_id(cls, value):
        if isinstance(value, str):
            return ObjectId(value)

        return value

    class Config:
        arbitrary_types_allowed = True
