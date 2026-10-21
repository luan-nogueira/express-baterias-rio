from fastapi import APIRouter

from lib.db import db
from models.quote import Quote, QuoteIn

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("", response_model=Quote, status_code=201)
async def create_quote(body: QuoteIn):
    quote = Quote(**body.model_dump())
    await db.quotes.insert_one(quote.model_dump())
    return quote
