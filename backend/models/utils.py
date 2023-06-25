from bson import ObjectId
from re import compile, IGNORECASE


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
