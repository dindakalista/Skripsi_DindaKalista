from fastapi import APIRouter, Body, Request, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError
from bson import ObjectId
from os import getenv
from utils.hash import Hash
from models.auth import AuthLoginModel, AuthLoginReponseModel, AuthChangePasswordModel

router = APIRouter(prefix="/auth")

SECRET = getenv("JWT_SECRET")
ALGORITHM = getenv("JWT_ALGORITHM")
EXPIRED = getenv("JWT_EXPIRED")


# Login
@router.post("/login", response_description="Login", response_model=AuthLoginReponseModel)
def login(request: Request, body: AuthLoginModel = Body(...)):
    try:
        user = request.app.database["users"].find_one({"email": body.email})

        if not user:
            return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Invalid email or password"}))

        verified = Hash.verify(body.password, user["password"])

        if not verified:
            return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Invalid email or password"}))

        payload = {
            "exp": EXPIRED,
            "_id": str(user["_id"])
        }

        token = encode(payload, SECRET, ALGORITHM)
        return {"user": user, "token": token}

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Verify
@router.post("/verify", response_description="Verify", response_model=AuthLoginReponseModel)
def verify(request: Request):
    try:
        token = request.headers.get("Authorization")

        if not token:
            return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

        decoded = decode(token, SECRET, ALGORITHM)
        user_id = ObjectId(decoded["_id"])
        user = request.app.database["users"].find_one({"_id": user_id})

        return {"user": user, "token": token}

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Authentication failed! Token expired")

    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Authentication failed! Invalid token")

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Change password
@router.post("/change-password", response_description="Change password")
def change_password(request: Request, body: AuthChangePasswordModel = Body(...)):
    try:
        id = body.id
        old_password = body.old_password
        new_password = body.new_password

        user = request.app.database["users"].find_one({"_id": id})
        verified = Hash.verify(old_password, user["password"])

        if not verified:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "Old password is incorrect"}))

        update_result = request.app.database["users"].update_one(
            {"_id": id},
            {"$set": {"password": Hash.bcrypt(new_password)}}
        )

        if update_result.modified_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "Failed to update password"}))

        return JSONResponse(status_code=200, content=jsonable_encoder({"detail": "Password updated successfully"}))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
