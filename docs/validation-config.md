# Validation configuration

[简体中文](validation-config.zh-CN.md) · [Documentation](README.md)

## Preview and execute

```sh
bec project inspect . --json
bec validate . --dry-run --json
bec validate . --json
```

inspect reads project evidence. validate --dry-run generates a plan without starting quality commands. Check selected project roots, tools and stages before execution. Validation executes project code, so prepare its execution environment according to repository requirements.

## Configuration selection

Validation prefers explicit .backend-craft.json, then existing project tasks, then language candidates. For a subdirectory or file target, configuration in the nearest identified project takes priority and relative paths resolve from that configuration directory. Without a subproject configuration, discovery falls back to the workspace configuration. Without a target path, workspace configuration can select several projects.

Existing Makefile format-check, lint, typecheck, test and build targets can be task entry points. Select checking commands for format stages. Prepare Java wrapper distributions and dependencies in advance.

## Explicit configuration example

Create .backend-craft.json in the target project to run unit tests through an existing Go toolchain.

```json
{
  "schemaVersion": 1,
  "enableIntegration": false,
  "projects": [
    {
      "root": ".",
      "languages": ["go"],
      "stages": [
        {
          "id": "unit",
          "phase": "test",
          "executable": "go",
          "args": ["test", "-json", "-count=1", "-mod=readonly", "./..."],
          "cwd": ".",
          "timeoutMs": 120000,
          "required": true,
          "env": {
            "GOPROXY": "off",
            "GOTOOLCHAIN": "local",
            "GOSUMDB": "off"
          }
        }
      ]
    }
  ]
}
```

## Fields and constraints

| Field | Contract |
| --- | --- |
| schemaVersion | Must be 1 |
| enableIntegration | Defaults false; set true to execute integration stages |
| projects | Nonempty array of existing, distinct project roots |
| root / cwd | Relative to the configuration directory, within the workspace; internal links are rejected |
| languages | Optional; rust, go, java, python, c or cpp |
| stages | Nonempty array with IDs unique across the configuration |
| phase | format, lint, typecheck, test or build |
| executable | PATH tool name, explicit system absolute path or workspace-relative tool path |
| args | Array of strings |
| timeoutMs | 1000–600000 milliseconds; defaults to 120000 |
| required | Defaults true |
| integration | Defaults false; marks an integration stage |
| env | Incremental string environment map passed to the subprocess |

Unknown fields, invalid paths and duplicate stage IDs cause configuration errors. JSON previews hide argument and environment values. Review the local configuration before execution.

## Interpreting results

| Exit code | Meaning |
| --- | --- |
| 0 | Required validation passed |
| 1 | Execution failed |
| 2 | Validation incomplete or input invalid |

Stage statuses include passed, failed, missing, timeout, skipped and cancelled. Missing tools, skipped required stages and zero tests prevent a passing result. Default candidates use offline and read-only lock options. Prepare missing tools or dependencies through repository workflows.

## Native hooks

Native Claude SessionStart reads project evidence. Native OpenClaw configuration supports autoValidate, autoFormat and formatStage, with both switches defaulting false. autoFormat requires an explicit StageSpec with phase format, including tool, arguments, working directory, timeout and required. Set these values through the host's plugin configuration. See the [runtime guide](runtimes/README.md) for CLI adapter hook delivery.
