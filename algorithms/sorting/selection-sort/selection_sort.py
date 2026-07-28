def selection_sort(numbers):
    """Return a sorted copy of numbers using Selection Sort."""
    array = numbers.copy()

    for boundary in range(len(array) - 1):
        min_index = boundary

        for index in range(boundary + 1, len(array)):
            if array[index] < array[min_index]:
                min_index = index

        if min_index != boundary:
            array[boundary], array[min_index] = array[min_index], array[boundary]

    return array
