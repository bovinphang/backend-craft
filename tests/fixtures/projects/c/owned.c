#include <assert.h>
#include <stdio.h>

static int active = 0;
static int read_owned(int fail) {
    FILE *file = tmpfile();
    if (file == NULL) return -2;
    active++;
    int result = 0;
    if (fail) { result = -1; goto cleanup; }
    result = fputs("owned", file) < 0 ? -2 : 0;
    goto cleanup;
cleanup:
    fclose(file);
    active--;
    return result;
}
int main(void) {
    assert(read_owned(1) == -1);
    assert(active == 0);
    assert(read_owned(0) == 0);
    assert(active == 0);
    puts("backend-craft:tests=4");
    return 0;
}
