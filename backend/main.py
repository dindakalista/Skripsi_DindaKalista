from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo.mongo_client import MongoClient
from pymongo import TEXT as pymongo_text
from dotenv import load_dotenv
from os import getenv

from routers.user import router as user_router
from routers.auth import router as auth_router
from routers.feature import router as feature_router
from routers.issue import router as issue_router
from routers.imagekit import router as imagekit_router

from middlewares.auth import AuthMiddleware

# populate env variables
load_dotenv()

# create fastapi instance
app = FastAPI()

app.add_middleware(AuthMiddleware)

# to enable cors (dev purpose)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# include routers
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(feature_router)
app.include_router(issue_router)
app.include_router(imagekit_router)

@app.on_event("startup")
def startup_db_client():
    # connecting to database
    uri = getenv("DB_URI")
    uri = uri.replace("<user>", getenv("DB_USER"))
    uri = uri.replace("<pass>", getenv("DB_PASS"))

    app.mongodb_client = MongoClient(uri)
    app.database = app.mongodb_client[getenv("DB_NAME")]

    try:
        # test the database connection
        app.mongodb_client.admin.command("ping")

        # create indexes
        app.database["users"].create_index("email", unique=True)
        app.database["features"].create_index("name", unique=True)
        app.database["issues"].create_index([("ref", 1), ("feature_id", 1)], unique=True)

        print("connected to database.")

    except Exception as error:
        print(error)

@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()

#####################################################################################################################################################################

import uvicorn

if __name__ == "__main__":
    # start the server
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
