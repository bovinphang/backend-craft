#!/bin/sh
set -eu
mkdir -p /work
cp -R /src/. /work/
cd /work
case "$FRAMEWORK" in
  gin)
    go version > /out/versions.txt
    if [ "$PREPARE" = 1 ]; then go mod tidy; fi
    go list -m github.com/gin-gonic/gin >> /out/versions.txt
    cp go.sum /out/go.sum
    cp go.mod /out/go.mod
    set +e
    CRAFT_EXAMPLE_DEFECTIVE=1 GOPROXY=off GOTOOLCHAIN=local go test -mod=readonly -count=1 -v ./... > /out/red.log 2>&1
    task_red=$?
    CRAFT_EXAMPLE_DEFECTIVE=0 GOPROXY=off GOTOOLCHAIN=local go test -mod=readonly -count=1 -v ./... > /out/green.log 2>&1
    task_green=$?
    ;;
  axum)
    rustc --version > /out/versions.txt
    cargo --version >> /out/versions.txt
    if [ "$PREPARE" = 1 ]; then cargo fetch; fi
    cargo tree --offline --locked -i axum >> /out/versions.txt
    cp Cargo.lock /out/Cargo.lock
    set +e
    cargo test --offline --locked --features defective > /out/red.log 2>&1
    task_red=$?
    cargo test --offline --locked > /out/green.log 2>&1
    task_green=$?
    ;;
  spring-boot)
    mvn --version > /out/versions.txt
    task_offline=-o
    if [ "$PREPARE" = 1 ]; then task_offline=; fi
    set +e
    mvn $task_offline -B -q -Dcraft.example.defective=true test > /out/red.log 2>&1
    task_red=$?
    mvn -o -B -q -Dcraft.example.defective=false test > /out/green.log 2>&1
    task_green=$?
    ;;
  drogon)
    cmake --version > /out/versions.txt
    drogon_ctl --version >> /out/versions.txt
    cmake -S . -B build
    cmake --build build -j 2
    set +e
    CRAFT_EXAMPLE_DEFECTIVE=1 ctest --test-dir build --output-on-failure > /out/red.log 2>&1
    task_red=$?
    CRAFT_EXAMPLE_DEFECTIVE=0 ctest --test-dir build --output-on-failure > /out/green.log 2>&1
    task_green=$?
    ;;
  *) printf 'Unknown framework\n' >&2; exit 2 ;;
esac
printf '%s\n' "$task_red" > /out/red-exit.txt
printf '%s\n' "$task_green" > /out/green-exit.txt
cat /out/versions.txt
printf 'RED_EXIT=%s GREEN_EXIT=%s\n' "$task_red" "$task_green"
