#include <algorithm>
#include <vector>

std::vector<int> radixSort(const std::vector<int>& numbers) {
    if (numbers.empty()) return {};

    const int minimum = *std::min_element(numbers.begin(), numbers.end());
    const long long offset = minimum < 0 ? -static_cast<long long>(minimum) : 0;
    std::vector<long long> array(numbers.begin(), numbers.end());
    for (long long& value : array) value += offset;
    const long long maximum = *std::max_element(array.begin(), array.end());

    for (long long place = 1; maximum / place > 0; place *= 10) {
        std::vector<std::size_t> counts(10, 0);
        for (const long long value : array) ++counts[static_cast<std::size_t>((value / place) % 10)];
        for (std::size_t digit = 1; digit < counts.size(); ++digit) counts[digit] += counts[digit - 1];

        std::vector<long long> output(array.size());
        for (auto iterator = array.rbegin(); iterator != array.rend(); ++iterator) {
            const std::size_t digit = static_cast<std::size_t>((*iterator / place) % 10);
            --counts[digit];
            output[counts[digit]] = *iterator;
        }
        array = std::move(output);
        if (place > maximum / 10) break;
    }

    std::vector<int> result(array.size());
    std::transform(array.begin(), array.end(), result.begin(), [offset](long long value) {
        return static_cast<int>(value - offset);
    });
    return result;
}
