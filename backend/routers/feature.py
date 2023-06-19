from fastapi import APIRouter, Body, Request, Response, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import Optional, Union
from bson import ObjectId
from json import loads as loads_json
from models.feature import FeatureCreateModel, FeatureUpdateModel, FeatureGetAllModel, FeatureGetModel, FeatureFilterModel, FeaturePaginationModel

router = APIRouter(prefix="/feature")

########################### Create feature
@router.post("/", response_description="Create new feature")
def create_feature(request: Request, feature: FeatureCreateModel = Body(...)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "token not provided" }))

    # cuma admin yang bisa create feature
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))

    try:
        request.app.database["features"].insert_one(feature.dict())
        return JSONResponse(status_code=201, content={ "detail": "creating feature successful!" })

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

########################### Update feature
@router.put("/{id}", response_description="Update feature")
def update_feature(id: str, request: Request, feature: Optional[FeatureUpdateModel] = Body(None)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "token not provided" }))

    # cuma admin yang bisa update feature
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))

    try:
        update_result = request.app.database["features"].update_one(
            {"_id": ObjectId(id)},
            {"$set": feature.dict(exclude_none=True)}
        )

        if update_result.modified_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "updating feature failed!"}))

        return JSONResponse(status_code=200, content={ "detail": "updating feature successful!" })

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


########################### Get all features
@router.get("/", response_description="Get all features", response_model=FeatureGetAllModel)
def get_all_feature(request: Request, pagination: Union[str, None] = "{}", filters: Union[str, None] = "{}"):
    try:
        pagination = FeaturePaginationModel(**loads_json(pagination)).dict()
        filters    = FeatureFilterModel(**loads_json(filters)).dict(exclude_none=True)

        page_index = pagination["index"]
        page_limit = pagination["limit"]
        skip_count = page_index * page_limit

        features = list(request.app.database["features"].find(filters).skip(skip_count).limit(page_limit))
        total_documents = 0

        if filters:
            total_documents = len(features)
        
        if not filters:
            total_documents = request.app.database["features"].count_documents({})

        return {
            "total_documents": total_documents,
            "features": features
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

########################### Get one feature
@router.get("/{id}", response_description="Get one feature", response_model=FeatureGetModel)
def get_one_feature(id: str, request: Request):
    try:
        feature = request.app.database["features"].find_one(
            {"_id": ObjectId(id)}
        )

        if feature is None:
            return JSONResponse(status_code=404, content=jsonable_encoder({"detail": "feature not found"}))

        return feature

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

########################### Delete feature
@router.delete("/{id}", response_description="Delete feature")
def delete_feature(id: str, request: Request, response: Response):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "token not provided" }))

    # cuma admin yang bisa delete feature
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))

    try:
        delete_result = request.app.database["features"].delete_one(
            {"_id": ObjectId(id)}
        )

        if delete_result.deleted_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "deleting feature failed"}))

        # remove feature id from user's permission
        request.app.database["users"].update_many({}, {"$pull": {"permission": id}})

        return JSONResponse(status_code=204, content=jsonable_encoder({"detail": "deleting feature successful"}))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
