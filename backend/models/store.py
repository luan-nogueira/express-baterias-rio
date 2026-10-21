from typing import Literal

from pydantic import BaseModel, Field

DayCode = Literal["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]


class HoursRule(BaseModel):
    days: list[DayCode] = Field(min_length=1)
    opens: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    closes: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$|^24:00$")


class StoreInfo(BaseModel):
    street_address: str = Field(default="", max_length=160)
    neighborhood: str = Field(default="", max_length=80)
    city: str = Field(default="Rio de Janeiro", max_length=80)
    state: str = Field(default="RJ", max_length=2)
    postal_code: str = Field(default="", max_length=12)
    hours: list[HoursRule] = Field(default_factory=list)
    hours_note: str = Field(default="", max_length=160)


class ImportRowError(BaseModel):
    row: int
    message: str


class ImportReport(BaseModel):
    rows_read: int
    batteries_created: int
    batteries_updated: int
    vehicles_created: int
    vehicles_updated: int
    errors: list[ImportRowError]


class ReferenceCleanup(BaseModel):
    batteries_deleted: int
    vehicles_without_battery: int
