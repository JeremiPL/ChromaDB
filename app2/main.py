from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from langchain_text_splitters import RecursiveCharacterTextSplitter

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent

class ChunkRequest(BaseModel):
    text: str
    chunk_size: int = 200
    chunk_overlap: int = 20

@app.post("/chunk")
def read_chunk(request: ChunkRequest):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = request.chunk_size,
        chunk_overlap = request.chunk_overlap
    )
    result = splitter.split_text(request.text)
    chunk_list = []
    for chunk in result:
        dictionary = {
            "chunk": chunk,
            "length": len(chunk)
        }
        chunk_list.append(dictionary)
    return chunk_list

app.mount("/", StaticFiles(directory=BASE_DIR / "static", html=True), name="static")