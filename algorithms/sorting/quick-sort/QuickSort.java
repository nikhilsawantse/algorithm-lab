import java.util.Arrays;

public final class QuickSort {
    private QuickSort() {
    }

    public static int[] quickSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);
        sortRange(array, 0, array.length - 1);
        return array;
    }

    private static void sortRange(int[] array, int start, int end) {
        if (start >= end) return;
        int pivotIndex = partition(array, start, end);
        sortRange(array, start, pivotIndex - 1);
        sortRange(array, pivotIndex + 1, end);
    }

    private static int partition(int[] array, int start, int end) {
        int pivot = array[end];
        int boundary = start;
        for (int scan = start; scan < end; scan++) {
            if (array[scan] <= pivot) {
                int temporary = array[boundary];
                array[boundary] = array[scan];
                array[scan] = temporary;
                boundary++;
            }
        }
        int temporary = array[boundary];
        array[boundary] = array[end];
        array[end] = temporary;
        return boundary;
    }
}
