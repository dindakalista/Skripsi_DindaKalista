from pydantic import BaseModel, EmailStr
from typing import Optional
from models.user import UserGetModel
from models.utils import StrFromId


class AuthLoginModel(BaseModel):
    email: EmailStr
    password: str


class AuthLoginReponseModel(BaseModel):
    token: Optional[str] = None
    user: Optional[UserGetModel] = None


class AuthChangePasswordModel(BaseModel):
    id: StrFromId
    old_password: str
    new_password: str
