#include <vector>

std::vector<int> selectionSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t boundary = 0; boundary + 1 < array.size(); ++boundary) {
        std::size_t minIndex = boundary;

        for (std::size_t index = boundary + 1; index < array.size(); ++index) {
            if (array[index] < array[minIndex]) {
                minIndex = index;
            }
        }

        if (minIndex != boundary) {
            const int temporary = array[boundary];
            array[boundary] = array[minIndex];
            array[minIndex] = temporary;
        }
    }

    return array;
}
