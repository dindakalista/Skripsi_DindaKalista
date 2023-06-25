from fastapi import APIRouter, Body, UploadFile, File, Form, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing_extensions import Annotated
from os import getenv
from json import loads as loads_json
import requests

router = APIRouter(prefix="/imagekit")

IMAGEKIT_TOKEN = getenv('IMAGEKIT_TOKEN')
IMAGEKIT_UPLOAD_URL = getenv("IMAGEKIT_UPLOAD_URL")
IMAGEKIT_API_URL = getenv('IMAGEKIT_API_URL')


# Upload
@router.post("/", response_description="Upload image")
def upload(file: Annotated[UploadFile, File()], fileName: Annotated[str, Form()]):
    try:
        headers = {"Authorization": f"Basic {IMAGEKIT_TOKEN}"}

        files = {
            "file": (fileName, file.file),
            "fileName": (None, fileName)
        }

        response = requests.post(
            IMAGEKIT_UPLOAD_URL, headers=headers, files=files)

        if response.ok:
            if response.text:
                response_data = loads_json(response.text)
                return response_data
            else:
                return {"detail": "Image uploaded successfully"}
        else:
            return JSONResponse(status_code=response.status_code, content=jsonable_encoder({"detail": response.text}))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Delete
@router.delete("/{id}", response_description="Delete image")
def delete(id: str):
    try:
        headers = {"Authorization": f"Basic {IMAGEKIT_TOKEN}"}
        response = requests.delete(f"{IMAGEKIT_API_URL}/{id}", headers=headers)

        if response.ok:
            if response.text:
                response_data = loads_json(response.text)
                return response_data
            else:
                return {"detail": "Image deleted successfully"}
        else:
            return JSONResponse(status_code=response.status_code, content=jsonable_encoder({"detail": response.text}))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
