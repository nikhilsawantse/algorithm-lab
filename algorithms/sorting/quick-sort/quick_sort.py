def partition(array, start, end):
    pivot = array[end]
    boundary = start

    for scan in range(start, end):
        if array[scan] <= pivot:
            array[boundary], array[scan] = array[scan], array[boundary]
            boundary += 1

    array[boundary], array[end] = array[end], array[boundary]
    return boundary


def sort_range(array, start, end):
    if start >= end:
        return
    pivot_index = partition(array, start, end)
    sort_range(array, start, pivot_index - 1)
    sort_range(array, pivot_index + 1, end)


def quick_sort(numbers):
    """Return a sorted copy of numbers using Quick Sort."""
    array = numbers.copy()
    sort_range(array, 0, len(array) - 1)
    return array
