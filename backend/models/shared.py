from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum
from bson import ObjectId
from re import compile, IGNORECASE

# Shared models

class PaginationModel(BaseModel):
    index: Optional[int] = 0
    limit: Optional[int] = 20


class SortModel(BaseModel):
    field: Optional[str] = None
    direction: Optional[int] = 1

    @validator("direction", pre=True)
    def convert_to_int(cls, value):
        if not isinstance(value, str): return 1
        if value == "asc": return 1
        elif value == "desc": return -1
        else: return 1


# Custom types

class RegexFromStr(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value):
        if isinstance(value, str):
            return compile('.*{}.*'.format(value), IGNORECASE)
        return value


class StrFromId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value):
        if isinstance(value, ObjectId):
            return str(value)
        return value


class IdFromStr(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value):
        if isinstance(value, str):
            return ObjectId(value)
        return value
