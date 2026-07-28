import java.util.Arrays;

public final class MergeSort {
    private MergeSort() {
    }

    public static int[] mergeSort(int[] numbers) {
        if (numbers.length <= 1) return Arrays.copyOf(numbers, numbers.length);
        int middle = numbers.length / 2;
        int[] left = mergeSort(Arrays.copyOfRange(numbers, 0, middle));
        int[] right = mergeSort(Arrays.copyOfRange(numbers, middle, numbers.length));
        return merge(left, right);
    }

    private static int[] merge(int[] left, int[] right) {
        int[] output = new int[left.length + right.length];
        int leftIndex = 0;
        int rightIndex = 0;
        int outputIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] <= right[rightIndex]) {
                output[outputIndex++] = left[leftIndex++];
            } else {
                output[outputIndex++] = right[rightIndex++];
            }
        }

        while (leftIndex < left.length) output[outputIndex++] = left[leftIndex++];
        while (rightIndex < right.length) output[outputIndex++] = right[rightIndex++];
        return output;
    }
}
