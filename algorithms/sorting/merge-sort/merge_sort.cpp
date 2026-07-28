#include <vector>

std::vector<int> merge(const std::vector<int>& left, const std::vector<int>& right) {
    std::vector<int> output;
    output.reserve(left.size() + right.size());
    std::size_t leftIndex = 0;
    std::size_t rightIndex = 0;

    while (leftIndex < left.size() && rightIndex < right.size()) {
        if (left[leftIndex] <= right[rightIndex]) output.push_back(left[leftIndex++]);
        else output.push_back(right[rightIndex++]);
    }

    output.insert(output.end(), left.begin() + leftIndex, left.end());
    output.insert(output.end(), right.begin() + rightIndex, right.end());
    return output;
}

std::vector<int> mergeSort(const std::vector<int>& numbers) {
    if (numbers.size() <= 1) return numbers;
    const std::size_t middle = numbers.size() / 2;
    const std::vector<int> leftInput(numbers.begin(), numbers.begin() + middle);
    const std::vector<int> rightInput(numbers.begin() + middle, numbers.end());
    const std::vector<int> left = mergeSort(leftInput);
    const std::vector<int> right = mergeSort(rightInput);
    return merge(left, right);
}
