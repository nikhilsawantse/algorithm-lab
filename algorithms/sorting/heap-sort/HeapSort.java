import java.util.Arrays;

public final class HeapSort {
    private HeapSort() {
    }

    public static int[] heapSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int root = array.length / 2 - 1; root >= 0; root--) {
            siftDown(array, root, array.length);
        }

        for (int end = array.length - 1; end > 0; end--) {
            int temporary = array[0];
            array[0] = array[end];
            array[end] = temporary;
            siftDown(array, 0, end);
        }

        return array;
    }

    private static void siftDown(int[] array, int root, int size) {
        while (2 * root + 1 < size) {
            int left = 2 * root + 1;
            int right = left + 1;
            int largest = left;

            if (right < size && array[right] > array[left]) largest = right;
            if (array[root] >= array[largest]) return;

            int temporary = array[root];
            array[root] = array[largest];
            array[largest] = temporary;
            root = largest;
        }
    }
}
