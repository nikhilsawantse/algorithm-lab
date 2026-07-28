#include <vector>

/** Return a sorted copy of the input without mutating it. */
std::vector<int> bubbleSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t pass = 0; pass + 1 < array.size(); ++pass) {
        bool swapped = false;

        for (std::size_t index = 0; index + pass + 1 < array.size(); ++index) {
            if (array[index] > array[index + 1]) {
                const int temporary = array[index];
                array[index] = array[index + 1];
                array[index + 1] = temporary;
                swapped = true;
            }
        }

        if (!swapped) {
            break;
        }
    }

    return array;
}
