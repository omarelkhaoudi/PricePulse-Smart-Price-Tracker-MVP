from __future__ import annotations

from random import random
from typing import Callable


RandomFn = Callable[[], float]


def simulate_next_price(current_price: float, random_fn: RandomFn = random) -> float:
    variation_rate = random_fn() * 0.12 - 0.06
    next_price = current_price * (1 + variation_rate)
    return max(0.01, round(next_price, 2))
