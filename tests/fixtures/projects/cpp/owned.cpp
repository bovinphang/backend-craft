#include <cassert>
#include <iostream>
#include <memory>
#include <stdexcept>

struct Owned {
    static inline int active = 0;
    Owned() { ++active; }
    ~Owned() { --active; }
};
static void fail_with_resource() {
    auto resource = std::make_unique<Owned>();
    // KEEP_OWNER
    throw std::runtime_error("expected");
}
int main() {
    bool failed = false;
    try { fail_with_resource(); } catch (const std::runtime_error&) { failed = true; }
    assert(failed);
    assert(Owned::active == 0);
    std::cout << "backend-craft:tests=2\n";
}
