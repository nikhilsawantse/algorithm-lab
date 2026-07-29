import random
import unittest

from heap_sort import heap_sort


class HeapSortTests(unittest.TestCase):
    def test_curated_cases(self):
        cases = [
            ([], []),
            ([7], [7]),
            ([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]),
            ([5, 4, 3, 2, 1], [1, 2, 3, 4, 5]),
            ([4, 2, 4, 1], [1, 2, 4, 4]),
            ([-2, 5, -8, 0], [-8, -2, 0, 5]),
        ]

        for values, expected in cases:
            with self.subTest(values=values):
                original = values.copy()
                self.assertEqual(heap_sort(values), expected)
                self.assertEqual(values, original)

    def test_deterministic_random_inputs(self):
        generator = random.Random(83)
        for _ in range(30):
            values = [generator.randint(-50, 50) for _ in range(12)]
            self.assertEqual(heap_sort(values), sorted(values))


if __name__ == "__main__":
    unittest.main()
