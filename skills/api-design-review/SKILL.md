---
slug: api-design-review
name: API Design Review
version: 0.2.0
description: Review an API design against consistency, versioning, auth, and error-handling best practices.
category: dev-tools
tags: ['api', 'design', 'review', 'rest', 'graphql']
inputs:
  - name: api_spec
    type: string
    required: true
    description: OpenAPI spec, schema, or endpoint description
  - name: context
    type: string
    required: false
    description: Team conventions or existing API examples
output:
  format: markdown
  description: Review with severity-ranked findings and concrete recommendations.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-22
---

# When to use

Before publishing a new API, adding a breaking endpoint, or standardizing an existing surface.

# Inputs

Provide the API spec or endpoint list plus any team conventions the API should align with. Include the protocol (REST/GraphQL/gRPC) if known.

# Output

A markdown report: summary score, findings grouped by severity, and actionable recommendations with example rewrites.

# Prompt

```prompt
You are a senior API architect reviewing the provided API design.

Evaluate across these dimensions:
1. Consistency: naming, paths, HTTP methods, status codes, error shapes
2. Versioning: strategy (URL / header / deprecation), breaking-change handling
3. Authentication & authorization: scheme choice, scope granularity
4. Error handling: structured errors, status-code correctness, retry signals
5. Pagination & filtering: cursor vs offset, query param design
6. Documentation: example requests/responses, required vs optional fields

Output format:

## Score: X/10

## Findings
- **[Severity] Title**: explanation and recommended fix

## Recommendations
1. ...

Keep findings specific; avoid generic advice like "use REST".

```

# When NOT to use

- Internal-only prototypes that will be thrown away next week
- APIs where the team has already frozen the contract and cannot change
- GraphQL-specific schema stitching questions — use a dedicated GraphQL skill

---

# REST vs GraphQL vs gRPC Decision Tree

Choose the right protocol based on your use case.

```
                    ┌─────────────────────┐
                    │ What's your main    │
                    │ client type?         │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
      ┌──────────────┐  ┌────────────┐  ┌──────────────┐
      │ Web/Mobile    │  │  Service   │  │   IoT /      │
      │ (BFF pattern) │  │  to Service│  │   Embedded   │
      └───────┬───────┘  └─────┬──────┘  └──────┬───────┘
              │                │                 │
              ▼                ▼                 ▼
     ┌────────────────┐  ┌───────────┐  ┌─────────────┐
     │ REST or GraphQL│  │ gRPC or  │  │    gRPC     │
     │ (flexibility) │  │ REST     │  │ (binary,    │
     └────────────────┘  └───────────┘  │  low bandwidth)
                                         └─────────────┘

   GraphQL advantages:
   - Multiple clients with different data needs from same endpoint
   - Mobile clients needing to minimize payload
   - Rapid iteration on mobile (no backend changes for field selection)
   - Complex domain where client-driven queries reduce over-fetching

   gRPC advantages:
   - High-frequency service-to-service calls
   - Binary protocol (smaller payloads, faster parsing)
   - Strong typing + code generation for 10+ languages
   - Streaming support (bidirectional)
   - Well-suited for microservices interop

   REST advantages:
   - Simple public APIs
   - HTTP infrastructure (caching, proxies, auth)
   - Human-readable payloads
   - Best for CRUD on resources
   - Mature tooling and documentation
```

---

# GraphQL API Review

Specific things to check for GraphQL schemas.

## Schema Design Issues

### Over-fetching / Under-fetching
```graphql
# Bad: Fetching entire User object for just name
query { user { name email createdAt updatedAt role permissions } }

# Good: Use fragments to select only needed fields
query { user { ...UserName } }
fragment UserName on User { name }
```

### N+1 Query Problem
```graphql
# Bad: Causes N+1 queries (1 for users, N for each post)
query {
  users {
    name
    posts { title }  # Triggers separate query per user
  }
}

# Solution: Use DataLoader batching
```

### Missing Pagination
```graphql
# Bad: No pagination on large collections
type Query {
  articles: [Article!]!
}

# Good: Connection pattern with cursor pagination
type Query {
  articles(first: Int, after: String): ArticleConnection!
}

type ArticleConnection {
  edges: [ArticleEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ArticleEdge {
  cursor: String!
  node: Article!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}
```

### Improper Error Handling
```graphql
# Bad: Using errors array for application errors
{
  "errors": [
    { "message": "User not found", "extensions": { "code": "NOT_FOUND" } }
  ],
  "data": null
}

# Good: Use union or interface for expected errors
type Query {
  user(id: ID!): UserResult!
}

union UserResult = User | UserNotFoundError

type UserNotFoundError {
  message: String!
  userId: ID!
}

# Client code:
# result.user.on(User, u => render(u))
# result.user.on(UserNotFoundError, e => render404(e.userId))
```

### Schema Design Anti-patterns

| Anti-pattern | Problem | Solution |
|-------------|---------|----------|
| `input FooInput { id: ID! }` | Input types with ID fields promote leaky references | Use `createFoo` vs `updateFoo` separate inputs |
| Nullable fields without meaning | Can't tell if `null` means "unknown" or "not set" | Use explicit sentinel values or separate fields |
| `String` for everything | Loses type safety | Use custom scalars (DateTime, URL, JSON) |
| `Boolean` field `isActive` | Fragile naming | Consider enum status for more states |
| No versioning strategy | Breaking changes affect all clients | Use `@deprecated(reason: "Use fieldV2")` |

---

# Error Shape Examples by Language

## Go
```go
type APIError struct {
    Code      string            `json:"code"`
    Message   string            `json:"message"`
    Details   map[string]any    `json:"details,omitempty"`
    RequestID string            `json:"request_id"`
    Stack     string            `json:"-"` // Only in dev
}

func (e *APIError) Error() string {
    return fmt.Sprintf("%s: %s (request_id=%s)", e.Code, e.Message, e.RequestID)
}

// HTTP status: 400 for validation, 401 for auth, 403 for forbidden, 404 for not found
```

## Python (FastAPI)
```python
from fastapi import HTTPException

raise HTTPException(
    status_code=400,
    detail={
        "code": "VALIDATION_ERROR",
        "message": "Invalid request parameters",
        "details": [
            {"field": "email", "issue": "invalid format"},
            {"field": "age", "issue": "must be positive"}
        ],
        "request_id": "req_abc123"
    }
)
```

## TypeScript / Node.js
```typescript
interface ApiError {
  code: string;        // Machine-readable: VALIDATION_ERROR, NOT_FOUND
  message: string;      // Human-readable
  details?: Record<string, unknown>;  // Structured extra info
  request_id: string;   // For log correlation
  errors?: Array<{ field: string; message: string }>;  // Field-level
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public requestId: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      request_id: this.requestId,
      ...(this.details && { details: this.details })
    };
  }
}
```

## Java (Spring)
```java
public class ApiError {
    private String code;
    private String message;
    private String requestId;
    private Map<String, Object> details;

    // Builder pattern
    public static ApiError of(String code, String message, String requestId) {
        return new ApiError(code, message, requestId, Collections.emptyMap());
    }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handle(ApiException ex) {
        return ResponseEntity
            .status(ex.getStatusCode())
            .body(ApiError.of(ex.getCode(), ex.getMessage(), ex.getRequestId()));
    }
}
```

---

# REST API Design Anti-Patterns

## URL Design

| Anti-pattern | Example | Fix |
|-------------|---------|-----|
| Verbs in URL | `POST /users/create` | `POST /users` |
| Nested resources too deep | `GET /orgs/{id}/teams/{id}/members/{id}/roles/{id}` | Flatten or use query: `GET /team-members/{id}/roles` |
| Inconsistent naming | `/user-profiles` vs `/users_info` | Pick one: `/users` |
| Missing pluralization | `GET /user/{id}` | `GET /users/{id}` |
| Content type in URL | `GET /users.json` | Use `Accept: application/json` header |

## Versioning Mistakes

```bash
# Bad: Version in URL but no deprecation path
GET /v1/users/123

# Good: Version in URL WITH deprecation headers
GET /v1/users/123
Deprecated: true
Sunset: Sat, 31 Dec 2025 23:59:59 GMT
Deprecation: true
Link: <https://api.example.com/v2/users/123>; rel="successor-version"

# Alternative: Header-based versioning
GET /users/123
API-Version: 2024-01-01
```

## Authentication Anti-Patterns

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| API keys in URL query params | Leaks in server logs, browser history | Use `Authorization: Bearer <token>` header |
| No scopes / overly broad tokens | Can't limit access granularly | Define scopes: `users:read`, `users:write` |
| Rolling your own auth | Crypto vulnerabilities | Use OAuth2/OIDC, mTLS for service auth |
| No rate limiting headers | Clients can't back off | Return `X-RateLimit-Remaining`, `Retry-After` |

## Pagination Mistakes

```bash
# Bad: Offset-based on large datasets
GET /events?page=1000000&limit=20
# Skipping millions of rows is slow in DB

# Good: Cursor-based
GET /events?after=cursor_abc&limit=20
Response: { "data": [...], "next_cursor": "cursor_xyz", "has_more": true }

# For stable sorting with cursor: include sort key with cursor
GET /events?after=2024-01-15T10:00:00Z_id_123&limit=20
```

---

# Common API Mistakes Catalog

1. **200 for empty results** — Return `[]` not `null` for collections
2. **404 for "no results"** — Only use 404 when resource doesn't exist, not when filter yields empty set
3. **No idempotency keys** — POST endpoints that create resources should accept `Idempotency-Key` header
4. **Inconsistent status codes** — Use 201 for creation, 204 for successful deletion with no body, 422 for validation errors
5. **Missing `Content-Type` on errors** — Even error responses should be JSON with proper Content-Type
6. **Exposing internal error details** — Don't leak stack traces, SQL, or internal paths to clients
7. **No request ID for correlation** — Every response should include a `X-Request-ID` or similar for tracing
8. **PUT as full replacement only** — Document whether PUT requires complete object or partial
9. **No sorting/filtering defaults** — Without defaults, pagination on large tables returns unpredictable results
10. **CORS misconfiguration** — Don't use `Access-Control-Allow-Origin: *` for authenticated APIs

---

# Example

**Input:**

```
api_spec: 'GET /users/{id}/orders?limit=20&page=1 returns 200 or 404'
context: 'We use URL versioning and OAuth2 scopes'
```

**Output:**

```markdown
## Score: 6/10

## Findings
- **[MED] Pagination uses page/limit**: Offset-based pagination on high-churn collections (orders) causes duplicate/missing items as data changes. Prefer cursor-based.
- **[MED] 404 for empty orders**: Returns 404 when user has no orders. This breaks client caching and forces error handling for a normal case. Return 200 with `{ "orders": [], "total": 0 }`.
- **[LOW] Missing RateLimit headers**: No `X-RateLimit-Remaining` or `Retry-After` on 429 responses.
- **[LOW] No idempotency key support**: POST to `/orders` (implied) should accept `Idempotency-Key` to prevent duplicate charges.

## Recommendations
1. Replace `page`/`limit` with `cursor` + `after`/`before` parameters. Return `next_cursor` in response envelope.
2. Return 200 with empty array instead of 404 for no orders.
3. Add rate limit headers and document retry strategy.
4. Add `Idempotency-Key` header support for payment-creating POSTs.

## Improved Response Shape
```json
{
  "orders": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTAwfQ==",
    "has_more": true,
    "total": null
  }
}
```
```

# See Also

- [RFC 7807 Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- [REST API Design Rulebook](https://restfulapi.net/)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [GraphQL Schema Design](https://graphql.org/learn/)
- [gRPC Documentation](https://grpc.io/docs/)

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **200 for empty results**: Returning 404 for "no results" breaks client caching. Return `[]` with 200 instead.
  - how to detect: clients report caching errors when no results
  - how to fix: return empty array with 200, use 404 only when resource doesn't exist

- **No idempotency keys on POST**: Creating resources without idempotency keys risks duplicate charges/operations on retry.
  - how to detect: look for duplicate resource creation in logs
  - how to fix: accept `Idempotency-Key` header and cache responses

- **Pagination uses offset**: Offset-based pagination on large datasets causes duplicates/missing items as data changes.
  - how to detect: clients report seeing same items twice or missing items during pagination
  - how to fix: use cursor-based pagination instead

- **API keys in URL query params**: Tokens leak in server logs, browser history, and proxies.
  - how to detect: search logs for tokens in query strings
  - how to fix: use `Authorization: Bearer <token>` header instead

- **Missing rate limit headers**: Clients can't back off properly without `X-RateLimit-Remaining` or `Retry-After`.
  - how to detect: clients report getting rate limited without warning
  - how to fix: return rate limit headers on all responses
