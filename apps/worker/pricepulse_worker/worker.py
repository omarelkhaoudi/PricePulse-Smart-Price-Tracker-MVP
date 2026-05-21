from __future__ import annotations

import os
import time

from .http_client import PricePulseClient
from .price_math import simulate_next_price


def run_once(client: PricePulseClient) -> int:
    updated_count = 0

    for product in client.list_products():
        next_price = simulate_next_price(float(product["currentPrice"]))
        client.update_price(product["id"], next_price)
        updated_count += 1

    return updated_count


def main() -> None:
    api_url = os.getenv("API_URL", "http://api:4000")
    interval_seconds = float(os.getenv("PRICE_WORKER_INTERVAL_SECONDS", "30"))
    client = PricePulseClient(api_url=api_url)

    print(f"PricePulse Python worker connected to {api_url}")

    while True:
        try:
            updated_count = run_once(client)
            print(f"Python worker updated {updated_count} product(s)")
        except Exception as error:
            print(f"Python worker error: {error}")

        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()
