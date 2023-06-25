from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId
from jwt import decode, ExpiredSignatureError, InvalidTokenError
from os import getenv

SECRET = getenv("JWT_SECRET")
ALGORITHM = getenv("JWT_ALGORITHM")


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        request.app.permission = {
            "authenticated": False,
            "role": "",
            "user_id": "",
            "features_ids": []
        }

        token = request.headers.get("Authorization")

        if token:
            try:
                decoded = decode(token, SECRET, ALGORITHM)
                user_id = ObjectId(decoded["_id"])
                user = request.app.database["users"].find_one({"_id": user_id})

                if user:
                    request.app.permission["authenticated"] = True
                    request.app.permission["role"] = user["role"]
                    request.app.permission["user_id"] = str(user["_id"])
                    request.app.permission["feature_ids"] = list(map(lambda value: str(value), user["feature_ids"]))

            except Exception as error:
                pass

        response = await call_next(request)
        return response
