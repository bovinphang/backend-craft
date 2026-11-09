# Verification contract

Missing MVC validation accepts an empty name with 201 and calls the service. The fixed @Valid controller returns 400 with an unchanged write counter.

Run inside the local [example directory](../examples/minimal/README.md):

```sh
mvn -o -Dcraft.example.defective=true test
mvn -o -Dcraft.example.defective=false test
```



Real Spring context + MockMvc validation and service-call boundary; no database or socket server.

Record RED→GREEN only after actual business assertions fail and the normal version passes. Missing tools/dependencies and build failures are MISSING/FAIL, not behavior evidence. This example does not prove database isolation/rollback, a network server, load behavior or a deployed container. The product repository can explicitly prepare Docker environments; this standalone skill does not depend on that helper.

## Recorded execution

On 2026-11-08 the same business assertions produced RED→GREEN.

```text
Apache Maven 3.9.16 (2bdd9fddda4b155ebf8000e807eb73fd829a51d5)
Maven home: /usr/share/maven
Java version: 17.0.20.1, vendor: Eclipse Adoptium, runtime: /opt/java/openjdk
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "6.18.54.1-microsoft-standard-wsl2", arch: "amd64", family: "unix"
```

This covers the in-process boundary above, not databases, load or deployment.
