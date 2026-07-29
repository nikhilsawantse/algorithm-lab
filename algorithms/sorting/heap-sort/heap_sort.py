def heap_sort(numbers):
    array = numbers.copy()

    for root in range(len(array) // 2 - 1, -1, -1):
        sift_down(array, root, len(array))

    for end in range(len(array) - 1, 0, -1):
        array[0], array[end] = array[end], array[0]
        sift_down(array, 0, end)

    return array


def sift_down(array, root, size):
    while 2 * root + 1 < size:
        left = 2 * root + 1
        right = left + 1
        largest = left

        if right < size and array[right] > array[left]:
            largest = right
        if array[root] >= array[largest]:
            return

        array[root], array[largest] = array[largest], array[root]
        root = largest
