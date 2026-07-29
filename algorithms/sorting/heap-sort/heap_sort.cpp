#include <utility>
#include <vector>

void siftDown(std::vector<int>& array, std::size_t root, std::size_t size) {
    while (2 * root + 1 < size) {
        const std::size_t left = 2 * root + 1;
        const std::size_t right = left + 1;
        std::size_t largest = left;

        if (right < size && array[right] > array[left]) largest = right;
        if (array[root] >= array[largest]) return;

        std::swap(array[root], array[largest]);
        root = largest;
    }
}

std::vector<int> heapSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;

    for (std::size_t root = array.size() / 2; root > 0; --root) {
        siftDown(array, root - 1, array.size());
    }

    for (std::size_t end = array.size(); end > 1; --end) {
        std::swap(array[0], array[end - 1]);
        siftDown(array, 0, end - 1);
    }

    return array;
}
