def merge(left, right):
    output = []
    left_index = 0
    right_index = 0

    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            output.append(left[left_index])
            left_index += 1
        else:
            output.append(right[right_index])
            right_index += 1

    return output + left[left_index:] + right[right_index:]


def merge_sort(numbers):
    """Return a stable sorted copy of numbers using Merge Sort."""
    if len(numbers) <= 1:
        return numbers.copy()

    middle = len(numbers) // 2
    left = merge_sort(numbers[:middle])
    right = merge_sort(numbers[middle:])
    return merge(left, right)
