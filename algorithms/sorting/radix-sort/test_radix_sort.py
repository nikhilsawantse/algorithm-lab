import random
import unittest

from radix_sort import radix_sort


class RadixSortTests(unittest.TestCase):
    def test_curated_cases(self):
        cases = [
            ([], []),
            ([7], [7]),
            ([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),
            ([500, 40, 3, 2, 1], [1, 2, 3, 40, 500]),
            ([21, 11, 21, 12], [11, 12, 21, 21]),
            ([-12, 5, -8, 0], [-12, -8, 0, 5]),
        ]

        for values, expected in cases:
            with self.subTest(values=values):
                original = values.copy()
                self.assertEqual(radix_sort(values), expected)
                self.assertEqual(values, original)

    def test_deterministic_random_inputs(self):
        generator = random.Random(109)
        for _ in range(30):
            values = [generator.randint(-500, 500) for _ in range(12)]
            self.assertEqual(radix_sort(values), sorted(values))


if __name__ == "__main__":
    unittest.main()
