"""Reference Bubble Sort implementation used by Algorithm Lab."""


def bubble_sort(numbers):
    """Return a sorted copy of numbers without mutating the input."""
    array = numbers.copy()

    for last in range(len(array) - 1, 0, -1):
        swapped = False

        for index in range(last):
            if array[index] > array[index + 1]:
                array[index], array[index + 1] = array[index + 1], array[index]
                swapped = True

        if not swapped:
            break

    return array
