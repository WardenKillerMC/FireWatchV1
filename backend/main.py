from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.wildfire_data import get_current_wildfires

app = FastAPI(title="FireWatch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "FireWatch backend is running!"
    }


@app.get("/wildfires")
def wildfires():
    return get_current_wildfires()