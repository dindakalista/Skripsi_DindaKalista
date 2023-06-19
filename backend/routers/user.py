from fastapi import APIRouter, Body, Request, Response, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError
from typing import List, Optional, Union
from bson import ObjectId
from utils.hash import Hash
from models.user import UserCreateModel, UserUpdateModel, UserGetAllModel, UserGetModel, UserFilterModel, UserPaginationModel
from json import loads as loads_json

router = APIRouter(prefix="/user")

########################### Create user
@router.post("/", response_description="Create new user")
def create_user(request: Request, user: UserCreateModel = Body(...)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "token not provided" }))

    # cuma admin yang bisa create user
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))

    try:
        user = user.dict()
        request.app.database["users"].insert_one(user)

        return JSONResponse(status_code=201, content=jsonable_encoder({ "detail": "creating issues successful" }))

    except DuplicateKeyError as error:
        raise HTTPException(status_code=409, detail="user already exist")

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

########################### Update user
@router.put("/{id}", response_description="Update user")
def update_user(id: str, request: Request, user: Optional[UserUpdateModel] = Body(None)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "token not provided" }))

    # kalo bukan admin, user cuma bisa update punya dia sendiri
    if request.app.permission["role"] != "ADMIN" and request.app.permission["user_id"] != id:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))
    
    try:
        update_result = request.app.database["users"].update_one(
            {"_id": ObjectId(id)},
            {"$set": user.dict(exclude_none=True)}
        )

        if update_result.modified_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({ "detail": "updating user failed" }))

        return JSONResponse(status_code=200, content=jsonable_encoder({ "detail": "updating user successful" }))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


########################### Get all users
@router.get("/", response_description="Get all users", response_model=UserGetAllModel)
def get_all_user(request: Request, pagination: Union[str, None] = "{}", filters: Union[str, None] = "{}"):
    try:
        pagination = UserPaginationModel(**loads_json(pagination)).dict()
        filters    = UserFilterModel(**loads_json(filters)).dict(exclude_none=True)

        page_index = pagination["index"]
        page_limit = pagination["limit"]
        skip_count = page_index * page_limit

        users = list(request.app.database["users"].find(
            filters, { "password": 0 }
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

########################### Get one user
@router.get("/{id}", response_description="Get one user", response_model=UserGetModel)
def get_one_user(id: str, request: Request):
    try:
        user = request.app.database["users"].find_one({"_id": ObjectId(id)})

        if user is None:
            return JSONResponse(status_code=404, content=jsonable_encoder({ "detail": "user not found" }))

        return user
    
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

########################### Delete user
@router.delete("/{id}", response_description="Delete user")
def delete_user(id: str, request: Request, response: Response):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "token not provided" }))

    # cuma admin yang bisa delete user
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))

    try:
        delete_result = request.app.database["users"].delete_one(
            {"_id": ObjectId(id)}
        )

        if delete_result.deleted_count != 1:
            return JSONResponse(status_code=404, content=jsonable_encoder({ "detail": "deleting user failed" }))

        return JSONResponse(status_code=204, content=jsonable_encoder({ "detail": "deleting user successful" }))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
