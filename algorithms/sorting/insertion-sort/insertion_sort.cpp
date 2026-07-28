#include <vector>

std::vector<int> insertionSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t index = 1; index < array.size(); ++index) {
        const int key = array[index];
        std::size_t position = index;

        while (position > 0 && array[position - 1] > key) {
            array[position] = array[position - 1];
            --position;
        }

        array[position] = key;
    }

    return array;
}
