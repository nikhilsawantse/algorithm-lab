public final class RadixSort {
    private RadixSort() {
    }

    public static int[] radixSort(int[] numbers) {
        if (numbers.length == 0) return new int[] {};

        int minimum = numbers[0];
        for (int value : numbers) minimum = Math.min(minimum, value);
        long offset = minimum < 0 ? -(long) minimum : 0;
        long[] array = new long[numbers.length];
        long maximum = 0;
        for (int index = 0; index < numbers.length; index++) {
            array[index] = numbers[index] + offset;
            maximum = Math.max(maximum, array[index]);
        }

        for (long place = 1; maximum / place > 0; place *= 10) {
            int[] counts = new int[10];
            for (long value : array) counts[(int) ((value / place) % 10)]++;
            for (int digit = 1; digit < 10; digit++) counts[digit] += counts[digit - 1];

            long[] output = new long[array.length];
            for (int index = array.length - 1; index >= 0; index--) {
                int digit = (int) ((array[index] / place) % 10);
                counts[digit]--;
                output[counts[digit]] = array[index];
            }
            array = output;
            if (place > maximum / 10) break;
        }

        int[] result = new int[array.length];
        for (int index = 0; index < array.length; index++) result[index] = (int) (array[index] - offset);
        return result;
    }
}
