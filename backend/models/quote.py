import re
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

QuoteStatus = Literal["novo", "em_atendimento", "concluido"]


class QuoteIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=8, max_length=25)
    vehicle: str = Field(min_length=2, max_length=120)
    neighborhood: str = Field(min_length=2, max_length=80)
    need: str = Field(min_length=2, max_length=80)
    message: str = Field(default="", max_length=600)
    vehicle_id: Optional[str] = None
    battery_code: Optional[str] = Field(default=None, max_length=40)
    source: str = Field(default="site", max_length=40)

    @field_validator("phone")
    @classmethod
    def phone_digits(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10 or len(digits) > 13:
            raise ValueError("Telefone inválido: informe DDD + número")
        return v.strip()

    @field_validator("name", "vehicle", "neighborhood", "need")
    @classmethod
    def strip(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Campo obrigatório")
        return v


class Quote(QuoteIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: QuoteStatus = "novo"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QuoteStatusUpdate(BaseModel):
    status: QuoteStatus
