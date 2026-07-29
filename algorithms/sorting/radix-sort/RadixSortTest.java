import java.util.Arrays;
import java.util.Random;

public final class RadixSortTest {
    private RadixSortTest() {
    }

    private static void verify(String name, int[] input, int[] expected) {
        int[] original = Arrays.copyOf(input, input.length);
        int[] actual = RadixSort.radixSort(input);
        if (!Arrays.equals(actual, expected)) throw new AssertionError(name + " failed: " + Arrays.toString(actual));
        if (!Arrays.equals(input, original)) throw new AssertionError(name + " mutated its input");
    }

    public static void main(String[] arguments) {
        verify("empty input", new int[] {}, new int[] {});
        verify("single value", new int[] {7}, new int[] {7});
        verify("already sorted", new int[] {1, 2, 3, 4, 5}, new int[] {1, 2, 3, 4, 5});
        verify("reverse order", new int[] {500, 40, 3, 2, 1}, new int[] {1, 2, 3, 40, 500});
        verify("duplicates", new int[] {21, 11, 21, 12}, new int[] {11, 12, 21, 21});
        verify("negative values", new int[] {-12, 5, -8, 0}, new int[] {-12, -8, 0, 5});

        Random random = new Random(109);
        for (int round = 0; round < 30; round++) {
            int[] input = new int[12];
            for (int index = 0; index < input.length; index++) input[index] = random.nextInt(1001) - 500;
            int[] expected = Arrays.copyOf(input, input.length);
            Arrays.sort(expected);
            verify("random input " + round, input, expected);
        }

        System.out.println("Java Radix Sort tests passed");
    }
}
