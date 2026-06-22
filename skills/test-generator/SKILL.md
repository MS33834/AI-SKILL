---
name: Unit Test Generator
description: Generate unit tests with edge cases for code.
category: dev-tools
tags:
- ai
- evaluation
- frontend
- llm
- python
source: null
license: MIT
author: badhope
version: 1.0.0
needs_review: false
slug: test-generator
created: '2026-06-12'
updated: '2026-06-19'
inputs:
- name: request
  type: string
  required: true
  description: User request or task description
output:
  format: markdown
  description: Generated content based on the user request
---
# When to use

The user pasted a function or class and wants tests for it. You don't have to know the whole codebase; just the snippet they gave you.

# Inputs

`code` is the only required field. `framework=auto` infers from file extension / imports. `coverage_target` is a hint, not a contract — you generate tests, you don't measure.

# Output

A code block with the test file. Include:

- 1 happy-path test per public function/method
- 1-2 edge case tests if `include_edge_cases: true`
- 1 error-path test per function that can raise
- Imports and fixtures at the top

No commentary around the code block — the user wants paste-and-run.

# Prompt

```prompt
You write unit tests. The user gave you code; you don't get to ask
clarifying questions. Generate tests that would have caught real
bugs, not tests that exercise the happy path twice.

For each test case:
  1. Name it after the behaviour, not the function.
     Bad:  test_add_returns_5
     Good: test_add_returns_zero_when_inputs_are_zero
  2. Set up only the data you need. No "before each" boilerplate
     that does nothing.
  3. Assert the specific value, not "result is truthy".
  4. One assertion per test, ideally. If you need multiple, the
     test is doing two things — split it.

Framework-specific notes:
  pytest   - no class needed, plain functions
  jest     - describe/it blocks, no class
  go-test  - Table-driven tests when there are > 2 cases
  junit    - @Test annotation, no plain asserts
  rspec    - describe/it, expect(...).to eq(...) syntax

Rules:
- Never test private functions. If the user wants that, they
  should refactor; testing privates is a code smell.
- Never mock what you don't have to. Real fakes > mocks > stubs.
- If a function returns None on error, write a test for it.
- If you can't think of an edge case, say so. Don't pad.
```

# When NOT to use

- The user wants integration tests, not unit tests. Different scope, different tools.
- The user wants tests for a UI / frontend. Snapshot tests and Playwright are out of scope here.
- The code is a one-liner with no branching. There's nothing to test.
- The user wants 100% coverage and will reject the PR if it's 99.9%. This skill will not save you; go write tests by hand.
- The code uses `eval`, `exec`, or other dynamic dispatch. Testing those is theatre.

# Example

**Input:**

```yaml
code: |
  def divide(a: float, b: float) -> float:
      if b == 0:
          raise ValueError("b must be non-zero")
      return a / b
framework: pytest
```

**Output:**

```python
import pytest

def test_divide_returns_quotient_of_two_positives():
    assert divide(10.0, 2.0) == 5.0

def test_divide_returns_negative_when_one_input_is_negative():
    assert divide(10.0, -2.0) == -5.0

def test_divide_raises_value_error_on_zero_divisor():
    with pytest.raises(ValueError, match="b must be non-zero"):
        divide(10.0, 0.0)

def test_divide_returns_zero_when_numerator_is_zero():
    assert divide(0.0, 5.0) == 0.0
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Testing private functions**: Private functions are implementation details that can change.
  - how to detect: tests break when refactoring without behavior change
  - how to fix: test public interface only, if you need to test privates, refactor

- **Mocking everything**: Mocks that don't reflect reality give false confidence.
  - how to detect: tests pass but production fails
  - how to fix: prefer real fakes over mocks where possible

- **Assertion-less tests**: Tests that don't actually verify anything.
  - how to detect: tests pass but bugs still occur
  - how to fix: assert specific values, not just "result is truthy"

- **Testing implementation, not behavior**: Tests that break on every refactor.
  - how to detect: tests fail even though behavior is preserved
  - how to fix: test what the code does, not how it does it

- **One assertion per test rule taken too far**: Splitting tests to the point of absurdity.
  - how to detect: dozens of tiny tests for simple functions
  - how to fix: use judgment; related assertions can stay together
