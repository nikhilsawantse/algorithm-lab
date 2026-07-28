import java.util.Arrays;

public final class InsertionSort {
    private InsertionSort() {
    }

    public static int[] insertionSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int index = 1; index < array.length; index++) {
            int key = array[index];
            int position = index;

            while (position > 0 && array[position - 1] > key) {
                array[position] = array[position - 1];
                position--;
            }

            array[position] = key;
        }

        return array;
    }
}
