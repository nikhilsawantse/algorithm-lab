#include <algorithm>
#include <vector>

std::vector<int> countingSort(const std::vector<int>& numbers) {
    if (numbers.empty()) return {};

    const auto [minimumIterator, maximumIterator] = std::minmax_element(numbers.begin(), numbers.end());
    const int minimum = *minimumIterator;
    const int maximum = *maximumIterator;
    std::vector<std::size_t> counts(static_cast<std::size_t>(maximum - minimum + 1), 0);

    for (const int value : numbers) ++counts[static_cast<std::size_t>(value - minimum)];
    for (std::size_t index = 1; index < counts.size(); ++index) {
        counts[index] += counts[index - 1];
    }

    std::vector<int> output(numbers.size());
    for (auto iterator = numbers.rbegin(); iterator != numbers.rend(); ++iterator) {
        const std::size_t bucket = static_cast<std::size_t>(*iterator - minimum);
        --counts[bucket];
        output[counts[bucket]] = *iterator;
    }
    return output;
}
