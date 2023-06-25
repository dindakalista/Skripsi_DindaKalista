from fastapi import APIRouter, Body, Request, Response, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError
from typing import Optional, Union
from bson import ObjectId
from models.user import UserCreateModel, UserUpdateModel, UserGetAllModel, UserGetModel, UserFilterModel, UserPaginationModel
from json import loads as loads_json
from os import getenv
import requests

router = APIRouter(prefix="/user")

IMAGEKIT_TOKEN = getenv('IMAGEKIT_TOKEN')
IMAGEKIT_UPLOAD_URL = getenv("IMAGEKIT_UPLOAD_URL")
IMAGEKIT_API_URL = getenv('IMAGEKIT_API_URL')


# Create user
@router.post("/", response_description="Create new user")
def create_user(request: Request, user: UserCreateModel = Body(...)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # cuma admin yang bisa add user
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "You do not have access to add user"}))

    try:
        user = user.dict()
        request.app.database["users"].insert_one(user)

        return JSONResponse(status_code=201, content=jsonable_encoder({"detail": "User created successfully"}))

    except DuplicateKeyError as error:
        raise HTTPException(status_code=409, detail="User already exist")

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Update user
@router.put("/{id}", response_description="Update user")
def update_user(id: str, request: Request, user: Optional[UserUpdateModel] = Body(None)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # kalo bukan admin, user cuma bisa update punya dia sendiri
    if request.app.permission["role"] != "ADMIN" and request.app.permission["user_id"] != id:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "You do not have access to update this user"}))

    try:
        update_result = request.app.database["users"].update_one(
            {"_id": ObjectId(id)},
            {"$set": user.dict(exclude_none=True)}
        )

        if update_result.modified_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "Failed to update user"}))

        return JSONResponse(status_code=200, content=jsonable_encoder({"detail": "User updated successfully"}))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Get all users
@router.get("/", response_description="Get all users", response_model=UserGetAllModel)
def get_all_user(request: Request, pagination: Union[str, None] = "{}", filters: Union[str, None] = "{}"):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    try:
        pagination = UserPaginationModel(**loads_json(pagination)).dict()
        filters = UserFilterModel(**loads_json(filters)).dict(exclude_none=True)

        page_index = pagination["index"]
        page_limit = pagination["limit"]
        skip_count = page_index * page_limit

        users = list(request.app.database["users"].find(
            filters, {"password": 0}
        ).skip(skip_count).limit(page_limit))

        total_documents = 0

        if filters:
            total_documents = len(users)

        if not filters:
            total_documents = request.app.database["users"].count_documents({})

        return {
            "total_documents": total_documents,
            "users": users
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Get one user
@router.get("/{id}", response_description="Get one user", response_model=UserGetModel)
def get_one_user(id: str, request: Request):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    try:
        user = request.app.database["users"].find_one({"_id": ObjectId(id)})

        if user is None:
            return JSONResponse(status_code=404, content=jsonable_encoder({"detail": "User not found"}))

        return user

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Delete user
@router.delete("/{id}", response_description="Delete user")
def delete_user(id: str, request: Request, response: Response):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # cuma admin yang bisa delete user
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "You do not have access to delete this user"}))

    try:
        user = request.app.database["users"].find_one({"_id": ObjectId(id)})
        delete_result = request.app.database["users"].delete_one({"_id": ObjectId(id)})

        if delete_result.deleted_count != 1:
            return JSONResponse(status_code=404, content=jsonable_encoder({"detail": "Failed to delete user"}))

        # hapus profile picture dari imagekit, biar ngga penuh :(
        if user['picture_id']:
            requests.delete(f"{IMAGEKIT_API_URL}/{user['picture_id']}", headers={"Authorization": f"Basic {IMAGEKIT_TOKEN}"})

        # hapus semua issue yang di-report oleh user ini
        request.app.database["issues"].delete_many({"reporter_id":  user["id"]})

        return JSONResponse(status_code=204, content=jsonable_encoder({"detail": "User deleted successfully"}))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
