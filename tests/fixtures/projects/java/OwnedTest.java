public final class OwnedTest {
    public static void main(String[] args) {
        boolean failed = false;
        try { Owned.run(); } catch (IllegalStateException expected) { failed = true; }
        if (!failed) throw new AssertionError("error was swallowed");
        if (Owned.active() != 0) throw new AssertionError("resource leaked on error");
        System.out.println("backend-craft:tests=2");
    }
}
