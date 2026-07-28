def insertion_sort(numbers):
    """Return a sorted copy of numbers using Insertion Sort."""
    array = numbers.copy()

    for index in range(1, len(array)):
        key = array[index]
        position = index

        while position > 0 and array[position - 1] > key:
            array[position] = array[position - 1]
            position -= 1

        array[position] = key

    return array
