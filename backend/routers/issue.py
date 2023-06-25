from fastapi import APIRouter, Body, Request, Response, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import Optional, Union
from bson import ObjectId
from json import loads as loads_json
from models.issue import IssueCreateModel, IssueUpdateModel, IssueGetAllModel, IssueGetModel, IssueFilterModel, IssuePaginationModel
from naive_bayes.main import get_prediction

router = APIRouter(prefix="/issue")


# Create issue
@router.post("/", response_description="Create new issue")
def create_issue(request: Request, issue: IssueCreateModel = Body(...)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # cuma admin dan qa yang bisa create issue
    if request.app.permission["role"] != "ADMIN" and request.app.permission["role"] != "QA":
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "You do not have access to add issues"}))

    try:
        issue = issue.dict()
        issue['dev_type'] = get_prediction(issue['description'])

        request.app.database["issues"].insert_one(issue)
        return JSONResponse(status_code=201, content={"detail": "Issue created successfully"})

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Update issue
@router.put("/{id}", response_description="Update issue")
def update_issue(id: str, request: Request, issue: Optional[IssueUpdateModel] = Body(None)):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # cuma admin yang bisa update issue
    # if request.app.permission["role"] != "ADMIN":
    #     return JSONResponse(status_code=401, content=jsonable_encoder({ "detail": "access denied" }))

    try:
        update_result = request.app.database["issues"].update_one(
            {"_id": ObjectId(id)},
            {"$set": issue.dict(exclude_none=True)}
        )

        if update_result.modified_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "Failed to update issue"}))

        return JSONResponse(status_code=200, content={"detail": "Issue updated successfully"})

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Get all issues
@router.get("/", response_description="Get all issues", response_model=IssueGetAllModel)
def get_all_issue(request: Request, feature_id: str, pagination: Union[str, None] = "{}", filters: Union[str, None] = "{}"):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # cegah user selain admin yang tidak memiliki akses ke fitur
    if (request.app.permission["role"] != "ADMIN" and feature_id not in request.app.permission["feature_ids"]):
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "You do not have access to this feature"}))

    try:
        pagination = IssuePaginationModel(**loads_json(pagination)).dict()
        filters = IssueFilterModel(**loads_json(filters)).dict(exclude_none=True)

        page_index = pagination["index"]
        page_limit = pagination["limit"]
        skip_count = page_index * page_limit

        issues = list(request.app.database["issues"].aggregate([
            {
                "$match": {"feature_id": ObjectId(feature_id), **filters}
            },
            {
                "$lookup": {
                    "from": "features",
                    "localField": "feature_id",
                    "foreignField": "_id",
                    "as": "feature"
                }
            },
            {
                "$addFields": {
                    "feature": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$feature", 0]}, None
                        ]
                    }
                }
            },
            # {
            #     "$project": { "feature": 0 }
            # },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "reporter_id",
                    "foreignField": "_id",
                    "as": "reporter"
                }
            },
            {
                "$addFields": {
                    "reporter": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$reporter", 0]}, None
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "dev_id",
                    "foreignField": "_id",
                    "as": "dev"
                }
            },
            {
                "$addFields": {
                    "dev": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$dev", 0]}, None
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "qa_id",
                    "foreignField": "_id",
                    "as": "qa"
                }
            },
            {
                "$addFields": {
                    "qa": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$qa", 0]}, None
                        ]
                    }
                }
            },
            {
                "$skip": skip_count
            },
            {
                "$limit": page_limit
            },
        ]))

        total_documents = 0

        if filters:
            total_documents = len(issues)

        if not filters:
            total_documents = request.app.database["issues"].count_documents({})

        return {
            "total_documents": total_documents,
            "issues": issues
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Get one issue
@router.get("/{id}", response_description="Get one issue", response_model=IssueGetModel)
def get_one_issue(id: str, request: Request):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    try:
        issues = list(request.app.database["issues"].aggregate([
            {
                "$match": {
                    "_id": ObjectId(id)
                }
            },
            {
                "$lookup": {
                    "from": "features",
                    "localField": "feature_id",
                    "foreignField": "_id",
                    "as": "feature"
                }
            },
            {
                "$addFields": {
                    "feature": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$feature", 0]}, None
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "reporter_id",
                    "foreignField": "_id",
                    "as": "reporter"
                }
            },
            {
                "$addFields": {
                    "reporter": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$reporter", 0]}, None
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "dev_id",
                    "foreignField": "_id",
                    "as": "dev"
                }
            },
            {
                "$addFields": {
                    "dev": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$dev", 0]}, None
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "qa_id",
                    "foreignField": "_id",
                    "as": "qa"
                }
            },
            {
                "$addFields": {
                    "qa": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$qa", 0]}, None
                        ]
                    }
                }
            }
        ]))

        if not len(issues):
            return JSONResponse(status_code=404, content=jsonable_encoder({"detail": "Issue not found"}))

        return issues[0]

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Delete issue
@router.delete("/{id}", response_description="Delete issue")
def delete_issue(id: str, request: Request, response: Response):
    if not request.app.permission["authenticated"]:
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "Authentication failed! Token not provided"}))

    # cuma admin yang bisa delete issue
    if request.app.permission["role"] != "ADMIN":
        return JSONResponse(status_code=401, content=jsonable_encoder({"detail": "You do not have access to delete this issue"}))

    try:
        delete_result = request.app.database["issues"].delete_one({"_id": ObjectId(id)})

        if delete_result.deleted_count != 1:
            return JSONResponse(status_code=422, content=jsonable_encoder({"detail": "Failed to delete issue"}))

        return JSONResponse(status_code=204, content=jsonable_encoder({"detail": "Issue deleted successfully"}))

    except:
        raise HTTPException(status_code=500, detail=str(error))
