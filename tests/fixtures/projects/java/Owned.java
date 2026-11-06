public final class Owned implements AutoCloseable {
    private static int active;
    public Owned() { active++; }
    public void close() { active--; }
    public static int active() { return active; }
    public static void run() {
        try (Owned resource = new Owned()) {
            if (resource != null) throw new IllegalStateException("expected");
        }
    }
}
