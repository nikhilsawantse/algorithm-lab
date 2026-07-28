import java.util.Arrays;

/** Reference Bubble Sort implementation used by Algorithm Lab. */
public final class BubbleSort {
    private BubbleSort() {
    }

    /** Return a sorted copy of the input without mutating it. */
    public static int[] bubbleSort(int[] numbers) {
        int[] array = Arrays.copyOf(numbers, numbers.length);

        for (int pass = 0; pass < array.length - 1; pass++) {
            boolean swapped = false;

            for (int index = 0; index < array.length - pass - 1; index++) {
                if (array[index] > array[index + 1]) {
                    int temporary = array[index];
                    array[index] = array[index + 1];
                    array[index + 1] = temporary;
                    swapped = true;
                }
            }

            if (!swapped) {
                break;
            }
        }

        return array;
    }
}
