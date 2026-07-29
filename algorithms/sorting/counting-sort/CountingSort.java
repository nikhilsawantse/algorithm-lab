import java.util.Arrays;

public final class CountingSort {
    private CountingSort() {
    }

    public static int[] countingSort(int[] numbers) {
        if (numbers.length == 0) return new int[] {};

        int minimum = numbers[0];
        int maximum = numbers[0];
        for (int value : numbers) {
            minimum = Math.min(minimum, value);
            maximum = Math.max(maximum, value);
        }

        int[] counts = new int[maximum - minimum + 1];
        for (int value : numbers) counts[value - minimum]++;
        for (int index = 1; index < counts.length; index++) {
            counts[index] += counts[index - 1];
        }

        int[] output = new int[numbers.length];
        for (int index = numbers.length - 1; index >= 0; index--) {
            int value = numbers[index];
            counts[value - minimum]--;
            output[counts[value - minimum]] = value;
        }
        return output;
    }
}
