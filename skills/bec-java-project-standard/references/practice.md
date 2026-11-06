# Java project engineering

## Specialist checks

1. Read the declared JDK, build descriptor, wrapper and existing package layering. Preserve the current language level and dependency platform.

2. Keep HTTP validation/DTO mapping at adapters, use cases at application boundaries and persistence mapping in the existing data layer.

3. Place transaction scope around the actual consistency unit, not arbitrary controller methods. Specify rollback behavior and avoid unmanaged external effects inside a local transaction.

4. Preserve exception causes and repository conventions. Convert domain failures to transport errors at the boundary rather than returning success after catch-all handling.

5. Test use-case invariants, absent records, repeated operations and repository failures. Only a real database test supports claims about isolation/rollback.

6. Use available repository checks and offline prepared build tooling; wrapper distribution and dependency preparation are separate actions. Report checks that could not run.

<a id="scope"></a>
## Scope and examples

Use for:
- Separate HTTP DTO and persistence entity in Java
- Review application transaction boundaries in a Java module
- Respect an existing Maven or Gradle wrapper
- Add behavior tests to a Java service

JVM profiling and pool/GC incidents belong to the runtime specialty; do not impose a particular web framework.

## Evidence to deliver

- Repository/contract evidence and the exact affected scope.
- Chosen approach, invariants, resource/error or failure boundaries.
- Commands actually run and results, unrun checks and unproven claims.
- Compatibility, recovery/rollback or follow-up limits; review findings need verified locations.

## Primary reference

[Relevant official/project documentation](https://docs.oracle.com/en/java/javase/21/troubleshoot/) (checked 2026-11-06). Match the actual project version before applying version-sensitive details; the page version does not authorize an upgrade.
