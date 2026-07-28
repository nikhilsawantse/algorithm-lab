#include <algorithm>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

std::vector<int> bubbleSort(const std::vector<int>& numbers);

void verify(const std::string& name, const std::vector<int>& input, const std::vector<int>& expected) {
    const std::vector<int> original = input;
    const std::vector<int> actual = bubbleSort(input);

    if (actual != expected) {
        throw std::runtime_error(name + " produced the wrong result");
    }
    if (input != original) {
        throw std::runtime_error(name + " mutated its input");
    }
}

int main() {
    verify("empty input", {}, {});
    verify("single value", {7}, {7});
    verify("already sorted", {1, 2, 3, 4, 5}, {1, 2, 3, 4, 5});
    verify("reverse order", {5, 4, 3, 2, 1}, {1, 2, 3, 4, 5});
    verify("duplicates", {4, 2, 4, 1}, {1, 2, 4, 4});
    verify("negative values", {-2, 5, -8, 0}, {-8, -2, 0, 5});

    std::mt19937 generator(19);
    std::uniform_int_distribution<int> distribution(-50, 50);
    for (int round = 0; round < 30; ++round) {
        std::vector<int> input(12);
        std::generate(input.begin(), input.end(), [&]() { return distribution(generator); });
        std::vector<int> expected = input;
        std::sort(expected.begin(), expected.end());
        verify("random input " + std::to_string(round), input, expected);
    }

    std::cout << "C++ Bubble Sort tests passed\n";
    return 0;
}
