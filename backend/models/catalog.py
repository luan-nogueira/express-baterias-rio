import uuid
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

Technology = Literal["Convencional", "EFB", "AGM"]
Polarity = Literal["D", "E"]


class BatteryIn(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    brand: str = Field(default="A confirmar", max_length=60)
    line: str = Field(default="", max_length=80)
    ah: int = Field(ge=1, le=300)
    cca: Optional[int] = Field(default=None, ge=0, le=2000)
    technology: Technology = "Convencional"
    polarity: Polarity = "D"
    length_mm: Optional[int] = Field(default=None, ge=0, le=1000)
    width_mm: Optional[int] = Field(default=None, ge=0, le=1000)
    height_mm: Optional[int] = Field(default=None, ge=0, le=1000)
    image_url: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    in_stock: Optional[bool] = None
    notes: str = Field(default="", max_length=500)


class Battery(BatteryIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class VehicleIn(BaseModel):
    make: str = Field(min_length=1, max_length=40)
    model: str = Field(min_length=1, max_length=60)
    engine: str = Field(min_length=1, max_length=60)
    version: str = Field(default="", max_length=80)
    year_from: int = Field(ge=1950, le=2100)
    year_to: int = Field(ge=1950, le=2100)
    start_stop: bool = False
    battery_ids: list[str] = Field(default_factory=list)
    validated: bool = False
    popular: bool = False
    notes: str = Field(default="", max_length=500)

    @model_validator(mode="after")
    def check_years(self):
        if self.year_to < self.year_from:
            raise ValueError("year_to deve ser maior ou igual a year_from")
        return self


class Vehicle(VehicleIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class FinderResult(BaseModel):
    vehicle: Vehicle
    batteries: list[Battery]


def vehicle_search_text(v: VehicleIn) -> str:
    return " ".join([v.make, v.model, v.engine, v.version]).lower()
