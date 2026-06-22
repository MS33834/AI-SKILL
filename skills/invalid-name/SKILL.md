---
name: Invalid Name Handler
description: Validates and repairs identifier naming conventions in codebases.
category: dev-tools
tags:
- linting
- code-quality
- naming
source: null
needs_review: false
slug: invalid-name
version: 1.0.0
created: '2026-06-12'
updated: '2026-06-22'
inputs:
- name: request
  type: string
  required: true
  description: User request or task description
output:
  format: markdown
  description: Generated content based on the user request
author: AI-SKILL
license: MIT
---
# When to use

Use this skill when you need to detect and fix invalid or inconsistent
naming conventions in a codebase — double dashes, camelCase/snake_case
mixing, reserved keyword collisions, or non-ASCII identifiers.

# Inputs

User request or task description specifying the naming rules to enforce
and the scope of files to check.

# Output

Markdown report listing each violation with file path, line number,
the offending identifier, and the suggested replacement.

# Prompt

```prompt
You are a code quality auditor focused on naming conventions.

Process:
1. Scan the requested scope for identifier definitions
2. Check each against the stated naming rules (snake_case, camelCase,
   kebab-case, PascalCase — whichever applies)
3. Flag double dashes, reserved keywords, non-ASCII chars, and
   inconsistent casing
4. Suggest a fix for each violation

Output format:

## Violations
1. `path/to/file.ts:42` — `Invalid--Name` → `InvalidName` (double dash)
2. …

## Summary
N violations found across M files.
```

# Linter Rule Mapping

## ESLint — `@typescript-eslint/naming-convention`

| Rule | What it enforces | Example |
|------|------------------|---------|
| `camelCase` | Variables, functions, methods | `getUserById` ✓ |
| `PascalCase` | Classes, interfaces, types, enums, components | `UserProfile` ✓ |
| `snake_case` | Variables (opt-in), file names (opt-in) | `max_retry_count` ✓ |
| `kebab-case` | File names for React components (opt-in) | `user-profile.tsx` ✓ |
| Leading underscore | Private class members | `_privateMethod` ✓ |
| UPPER_SNAKE_CASE | Constants | `MAX_RETRY_COUNT` ✓ |

**ESLint config example:**
```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    { "selector": "variable", "format": ["camelCase", "UPPER_SNAKE_CASE"] },
    { "selector": "function", "format": ["camelCase"] },
    { "selector": "class", "format": ["PascalCase"] },
    { "selector": "interface", "format": ["PascalCase"] },
    { "selector": "typeAlias", "format": ["PascalCase"] },
    { "selector": "enum", "format": ["PascalCase"] },
    { "selector": "property", "format": ["camelCase", "snake_case"], "filter": { "regex": "^__.*__$", "match": false } }
  ]
}
```

## ruff — Python Naming Rules

| Rule code | Rule name | Enforces |
|-----------|-----------|----------|
| `N802` | `invalid-function-name` | Function names must follow `snake_case` |
| `N803` | `invalid-argument-name` | Argument names must follow `snake_case` |
| `N804` | `invalid-first-argument-name-for-method` | `self`/`cls` as first arg for methods |
| `N805` | `invalid-first-argument-name-for-function` | `self`/`cls` only for methods, not functions |
| `N806` | `non-low-function-argument-name` | Local function args should be `snake_case` |
| `N807` | `invalid-module-name` | Module names must not start with underscore |
| `N808` | `invalid-constant-name` | Constants must be `UPPER_SNAKE_CASE` |
| `N809` | `invalid-class-name` | Classes must be `PascalCase` |
| `N811` | `invalid-variable-name-for-type-annotation` | Single-char names for type vars (`T`, `K`, `V`) |
| `N813` | `invalid-argument-name-in-class` | Instance/classmethod first arg naming |
| `N814` | `invalid-argument-name-in-global` | Global arg names |
| `N815` | `mixed-var-in-class` | Class-level mixed `camelCase`/`snake_case` |

**ruff config example:**
```toml
[tool.ruff.lint.naming]
# Custom naming convention extensions (ruff extends from pyflakes)
# Note: ruff's N-series rules are from pyflakes; additional custom
# checks can be added via plugin or per-file ignore
```

# Detection Code Snippets

## Detect snake_case vs camelCase violations

**TypeScript/JavaScript:**
```typescript
// Regex for valid identifiers
const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;
const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;
const KEBAB_CASE = /^[a-z][a-z0-9-]*$/;

// Check identifier
function classifyName(name: string): 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case' | 'unknown' {
  if (SNAKE_CASE.test(name)) return 'snake_case';
  if (CAMEL_CASE.test(name)) return 'camelCase';
  if (PASCAL_CASE.test(name)) return 'PascalCase';
  if (KEBAB_CASE.test(name)) return 'kebab-case';
  return 'unknown';
}
```

**Python:**
```python
import re

SNAKE_CASE = re.compile(r'^[a-z][a-z0-9_]*$')
CAMEL_CASE = re.compile(r'^[a-z][a-zA-Z0-9]*$')
PASCAL_CASE = re.compile(r'^[A-Z][a-zA-Z0-9]*$')
KEBAB_CASE = re.compile(r'^[a-z][a-z0-9-]*$')

def classify_name(name: str) -> str:
    if SNAKE_CASE.match(name):
        return 'snake_case'
    elif CAMEL_CASE.match(name):
        return 'camelCase'
    elif PASCEL_CASE.match(name):
        return 'PascalCase'
    elif KEBAB_CASE.match(name):
        return 'kebab-case'
    return 'unknown'
```

## Double-dash detection (all languages)
```regex
/[a-zA-Z]--[a-zA-Z]/
```
Matches identifiers like `Invalid--Name` which should be `InvalidName`.

## Reserved keyword collision detection

**JavaScript reserved:** `arguments`, `await`, `break`, `case`, `catch`, `class`, `const`, `continue`, `debugger`, `default`, `delete`, `do`, `else`, `enum`, `eval`, `export`, `extends`, `false`, `finally`, `for`, `function`, `if`, `import`, `in`, `instanceof`, `let`, `new`, `null`, `return`, `static`, `super`, `switch`, `this`, `throw`, `true`, `try`, `typeof`, `undefined`, `var`, `void`, `while`, `with`, `yield`

**Python reserved:** `False`, `None`, `True`, `and`, `as`, `assert`, `async`, `await`, `break`, `class`, `continue`, `def`, `del`, `elif`, `else`, `except`, `finally`, `for`, `from`, `global`, `if`, `import`, `in`, `is`, `lambda`, `nonlocal`, `not`, `or`, `pass`, `raise`, `return`, `try`, `while`, `with`, `yield`

# Footguns — Common Naming Pitfalls

## 1. Hungarian Notation in TypeScript
```typescript
// Bad — redundant type encoding
let strName: string = "Alice";
let iAge: number = 30;
let bIsValid: boolean = true;

// Good — name conveys intent
let name = "Alice";
let age = 30;
let isValid = true;
```

## 2. Abbreviations that obscure meaning
```typescript
// Bad
function calcRnd(val: number): number // calc what? rnd of what?
function getUsr(id: string): User    // usr → user

// Good
function calculateRoundedValue(val: number): number
function getUserById(id: string): User
```

## 3. Inconsistent pluralization
```typescript
// Bad — is `items` an array or singular?
interface UserData {
  item: Item;        // singular
  items: Item[];     // plural
}

// Good — clear contract
interface UserData {
  singleItem: Item;
  allItems: Item[];
}
```

## 4. Database columns named differently from code properties
```sql
-- Bad: snake_case in DB, camelCase in code
user_id    →  userId (in TypeScript)
created_at →  createdAt (in TypeScript)

// Good: align conventions or use ORM mapping
```

## 5. React component name mismatches
```tsx
// Bad: file name and component name mismatch
// file: user-profile.tsx
export default class UserProfiles extends React.Component { } // class name is plural, file is singular

// Good
// file: UserProfile.tsx
export default function UserProfile() { }
```

## 6. Magic numbers in names
```python
# Bad — what do 3 and 7 mean?
MAX_RETRIES_3 = 3
PRIORITY_7 = 7

# Good
MAX_LOGIN_ATTEMPTS = 3
URGENT_PRIORITY = 7
```

# When NOT to use

- The project already enforces naming via a linter (ESLint, ruff, etc.)
- The codebase is auto-generated and identifiers are not human-authored
- You only need to rename a single known symbol — do it manually
- The user wants to write release notes — different format, different audience

# Example

**Input:**

```yaml
request: |
  Check all TypeScript files in src/ and all Python files in app/
  for naming convention violations. Enforce camelCase for variables
  and functions, PascalCase for classes and components, snake_case
  for Python functions and constants.
```

**Output:**

```markdown
## Violations

### TypeScript

1. `src/utils/helpers.ts:15` — `Invalid--Name` → `InvalidName` (double dash)
2. `src/utils/helpers.ts:42` — `get_user_data` → `getUserData` (should be camelCase)
3. `src/components/user-profile.tsx:8` — `class` → `klass` (reserved keyword collision)
4. `src/types/api.ts:23` — `user_id` → `userId` (should be camelCase)

### Python

5. `app/models/user.py:11` — `MAX_RETRY_COUNT` → `max_retry_count` (not a constant, should be camelCase)
6. `app/utils/validator.py:34` — `GetUserById` → `get_user_by_id` (should be snake_case for function)
7. `app/services/cache.py:18` — `_internalVal` → `_internal_val` (should be snake_case for protected member)

## Summary
7 violations found across 6 files.

## Recommended Fixes

Run these automated renames where safe:
```bash
# TypeScript (requires eslint --fix and manual review)
eslint src/ --rule '@typescript-eslint/naming-convention: error' --fix

# Python
ruff check app/ --select N --fix
```
```

---

**Complex Example: React + Database naming**

**Input:**

```yaml
request: |
  Audit src/components/ for React naming violations and
  app/models/ for Python model naming. Flag any misalignment
  between Python model fields and TypeScript interface properties.
```

**Output:**

```markdown
## Violations

### React Components

1. `src/components/user_list.tsx` → `UserList` (component should be PascalCase, file should be PascalCase too)
2. `src/components/UserProfile.tsx:5` — `useGetUserData` → `useGetUser` (hook name redundant "Data")
3. `src/components/Button_normal.tsx` → `ButtonNormal` (kebab-case file + non-Pascal component)

### Python Models vs TypeScript Interfaces

4. `app/models/user.py:12` — `created_at` (Python snake_case) ↔ `createdAt` (TS camelCase) — **alignment gap**
5. `app/models/user.py:15` — `is_active` → `isActive` if using camelCase on TS side

## Summary
5 violations found across 4 files.

## Recommended Actions
- Rename React files to PascalCase to match component names
- Add `alias` in ORM model or use `@Attribute` decorator to bridge naming gaps
- Consider a shared type definition (e.g., generated from Python schema)
```
