#include <utility>
#include <vector>

std::size_t partition(std::vector<int>& array, std::size_t start, std::size_t end) {
    const int pivot = array[end];
    std::size_t boundary = start;

    for (std::size_t scan = start; scan < end; ++scan) {
        if (array[scan] <= pivot) {
            std::swap(array[boundary], array[scan]);
            ++boundary;
        }
    }

    std::swap(array[boundary], array[end]);
    return boundary;
}

void sortRange(std::vector<int>& array, std::size_t start, std::size_t end) {
    if (start >= end) return;
    const std::size_t pivotIndex = partition(array, start, end);
    if (pivotIndex > 0) sortRange(array, start, pivotIndex - 1);
    sortRange(array, pivotIndex + 1, end);
}

std::vector<int> quickSort(const std::vector<int>& numbers) {
    std::vector<int> array = numbers;
    if (!array.empty()) sortRange(array, 0, array.size() - 1);
    return array;
}
