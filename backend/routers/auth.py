import os

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from lib.auth import COOKIE_NAME, TOKEN_TTL_HOURS, create_token, require_admin, verify_password
from lib.db import db

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    email: str
    password: str


class AdminUser(BaseModel):
    id: str
    email: str
    name: str


@router.post("/login", response_model=AdminUser)
async def login(body: LoginIn, response: Response):
    user = await db.admins.find_one({"email": body.email.lower().strip()})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    response.set_cookie(
        COOKIE_NAME,
        create_token(user["id"]),
        httponly=True,
        secure=os.environ.get("COOKIE_SECURE", "true").lower() == "true",
        samesite="lax",
        max_age=TOKEN_TTL_HOURS * 3600,
        path="/",
    )
    return AdminUser(**user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=AdminUser)
async def me(user: dict = Depends(require_admin)):
    return AdminUser(**user)
