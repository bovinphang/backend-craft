# Verification contract

The defective Filter invokes the rejection callback and then calls the Controller continuation. The fixed branch returns, producing one rejection and zero Controller writes.

Run inside the local [example directory](../examples/minimal/README.md):

```sh
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

Set CRAFT_EXAMPLE_DEFECTIVE=1 using the host shell to select the explicit faulty test variant; reset to 0 and require the same assertions to pass. Do not use the faulty variant for normal application startup.

Real linked Drogon Filter/Controller callback behavior in-process; no network routing, database or load claim.

Record RED→GREEN only after actual business assertions fail and the normal version passes. Missing tools/dependencies and build failures are MISSING/FAIL, not behavior evidence. This example does not prove database isolation/rollback, a network server, load behavior or a deployed container. The product repository can explicitly prepare Docker environments; this standalone skill does not depend on that helper.

## Recorded execution

On 2026-11-08 the same business assertions produced RED→GREEN.

```text
cmake version 3.22.1

CMake suite maintained and supported by Kitware (kitware.com/cmake).
     _
  __| |_ __ ___   __ _  ___  _ __
 / _` | '__/ _ \ / _` |/ _ \| '_ \
| (_| | | | (_) | (_| | (_) | | | |
 \__,_|_|  \___/ \__, |\___/|_| |_|
                 |___/

A utility for drogon
Version: 1.9.14
Git commit: 3aae769cc405cf5abb9d477675c6430924f02c7c
Compilation:
  Compiler: g++-11
  Compiler ID: GNU
  Compilation flags: -O3 -DNDEBUG -std=c++17 -I/usr/local/include
Libraries:
  postgresql: yes  (pipeline mode: yes)
  mariadb: yes
  sqlite3: yes
  ssl/tls backend: OpenSSL
  brotli: no
  hiredis: yes
  c-ares: yes
  yaml-cpp: no
```

This covers the in-process boundary above, not databases, load or deployment.
