import java.util.Arrays;

public final class SelectionSort {
    private SelectionSort() {
    }

    public static int[] selectionSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int boundary = 0; boundary < array.length - 1; boundary++) {
            int minIndex = boundary;

            for (int index = boundary + 1; index < array.length; index++) {
                if (array[index] < array[minIndex]) {
                    minIndex = index;
                }
            }

            if (minIndex != boundary) {
                int temporary = array[boundary];
                array[boundary] = array[minIndex];
                array[minIndex] = temporary;
            }
        }

        return array;
    }
}
