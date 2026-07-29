def radix_sort(numbers):
    if any(not isinstance(value, int) for value in numbers):
        raise TypeError("Radix Sort requires integer values")
    if not numbers:
        return []

    minimum = min(numbers)
    offset = -minimum if minimum < 0 else 0
    array = [value + offset for value in numbers]
    maximum = max(array)
    place = 1

    while maximum // place > 0:
        counts = [0] * 10
        for value in array:
            counts[(value // place) % 10] += 1
        for digit in range(1, 10):
            counts[digit] += counts[digit - 1]

        output = [0] * len(array)
        for value in reversed(array):
            digit = (value // place) % 10
            counts[digit] -= 1
            output[counts[digit]] = value
        array = output
        place *= 10

    return [value - offset for value in array]
