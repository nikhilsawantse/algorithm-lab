import java.util.Arrays;
import java.util.Random;

public final class HeapSortTest {
    private HeapSortTest() {
    }

    private static void verify(String name, int[] input, int[] expected) {
        int[] original = Arrays.copyOf(input, input.length);
        int[] actual = HeapSort.heapSort(input);
        if (!Arrays.equals(actual, expected)) throw new AssertionError(name + " failed: " + Arrays.toString(actual));
        if (!Arrays.equals(input, original)) throw new AssertionError(name + " mutated its input");
    }

    public static void main(String[] arguments) {
        verify("empty input", new int[] {}, new int[] {});
        verify("single value", new int[] {7}, new int[] {7});
        verify("already sorted", new int[] {1, 2, 3, 4, 5}, new int[] {1, 2, 3, 4, 5});
        verify("reverse order", new int[] {5, 4, 3, 2, 1}, new int[] {1, 2, 3, 4, 5});
        verify("duplicates", new int[] {4, 2, 4, 1}, new int[] {1, 2, 4, 4});
        verify("negative values", new int[] {-2, 5, -8, 0}, new int[] {-8, -2, 0, 5});

        Random random = new Random(83);
        for (int round = 0; round < 30; round++) {
            int[] input = new int[12];
            for (int index = 0; index < input.length; index++) input[index] = random.nextInt(101) - 50;
            int[] expected = Arrays.copyOf(input, input.length);
            Arrays.sort(expected);
            verify("random input " + round, input, expected);
        }

        System.out.println("Java Heap Sort tests passed");
    }
}
