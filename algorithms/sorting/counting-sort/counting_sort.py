def counting_sort(numbers):
    if any(not isinstance(value, int) for value in numbers):
        raise TypeError("Counting Sort requires integer values")
    if not numbers:
        return []

    minimum = min(numbers)
    maximum = max(numbers)
    counts = [0] * (maximum - minimum + 1)

    for value in numbers:
        counts[value - minimum] += 1
    for index in range(1, len(counts)):
        counts[index] += counts[index - 1]

    output = [0] * len(numbers)
    for value in reversed(numbers):
        counts[value - minimum] -= 1
        output[counts[value - minimum]] = value
    return output
