from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class PricePulseClient:
    api_url: str
    timeout_seconds: float = 10

    def list_products(self) -> list[dict[str, Any]]:
        payload = self._request("GET", "/api/products")
        return payload.get("data", [])

    def update_price(self, product_id: str, current_price: float) -> dict[str, Any]:
        return self._request(
            "PATCH",
            f"/api/products/{product_id}/price",
            {"currentPrice": current_price},
        )

    def _request(self, method: str, path: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = Request(
            f"{self.api_url.rstrip('/')}{path}",
            data=data,
            method=method,
            headers={"Content-Type": "application/json"},
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except HTTPError as error:
            message = error.read().decode("utf-8")
            raise RuntimeError(f"PricePulse API error {error.code}: {message}") from error
