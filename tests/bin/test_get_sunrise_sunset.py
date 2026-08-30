import pytest
from src.bin.get_sunrise_sunset import (
    main as get_sunrise_sunset,
    save,
    get_static_location,
)


def test_save():
    save([42, -32.23], False)


def test_save_override():
    save([42, -32.23], True)


def test_get_sunrise_sunset():
    get_sunrise_sunset
    pass


def test_get_static_location():
    pass
