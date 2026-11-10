# Extending languages

[简体中文](extending-languages.zh-CN.md) · [Documentation](README.md)

Define observable behavior, discovery evidence and executable verification before extending content and distribution.

## Implementation sequence

1. Add general manifest and source evidence in craft-common's project evidence modules. Model language, framework and project role separately, reusing discovery and recommendation logic.
2. For backend validation, extend LanguageId in src/project/types.ts, configuration language validation and the compatibility projection.
3. Add a LanguageModule under src/project/languages and register its id, skillIds and suggest function. Select explicitly available local entry points for candidate commands.
4. Provide bilingual cross-domain cc-*-project-standard content in common. Service-framework specialties belong in this product as bec-*-project-standard with domain references.
5. Synchronize metadata, relations, trigger queries, bilingual rules and content. Generate copies and digests through the [common synchronization workflow](project-structure.md#generated-content-boundaries).
6. Update language CI, fixtures, user guides and any changed distribution count contracts.

## Testing and acceptance

- Establish failing regressions for nearest-project selection, mixed repositories, ambiguous evidence, missing tools, cancellation and zero tests before implementation.
- Add a small real project and validate faulty and fixed versions through the same inspect / validate entry points.
- Distinguish missing tools from business failures and preserve the existing six-language compatibility view and calling contracts.
- Run lint, type checks, content and provenance checks, build, tests and packaging.
- Verify version-sensitive tool behavior against official documentation and record environments and coverage limits.

Language candidates should follow existing offline and read-only lock conventions. Tool preparation belongs to project workflows. [Validation configuration](validation-config.md) defines stage structure and execution boundaries.
