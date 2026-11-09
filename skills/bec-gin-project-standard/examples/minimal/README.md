# Gin minimal boundary example

The defective handler calls AbortWithStatusJSON and continues into business work. The fixed handler returns immediately and invalid input has zero effects.

Real Gin router + httptest binding and effect counts, without a listening server or database.

Use the [verification instructions](../../references/verification.md). Prepare framework dependencies/tooling through the owning project workflow. All source resources are inside this package, with no neighboring skill dependency. Fault injection selects the same test case; normal application startup uses the protected implementation.
