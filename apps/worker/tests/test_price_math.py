import unittest

from apps.worker.pricepulse_worker.price_math import simulate_next_price


class PriceMathTest(unittest.TestCase):
    def test_simulates_lower_bound_variation(self) -> None:
        self.assertEqual(simulate_next_price(100, lambda: 0), 94)

    def test_simulates_upper_bound_variation(self) -> None:
        self.assertEqual(simulate_next_price(100, lambda: 1), 106)

    def test_never_returns_zero_or_negative_price(self) -> None:
        self.assertEqual(simulate_next_price(0.01, lambda: 0), 0.01)


if __name__ == "__main__":
    unittest.main()
