---
name: React Router Search Param State
slug: react-router-search-params
description: Manage URL search parameters in React Router.
category: code-assistants
tags:
- ai
- api
- backend
- cli
- frontend
source: null
license: MIT
author: AI-SKILL
version: 1.0.0
created: '2026-06-12'
updated: '2026-06-19'
needs_review: false
inputs:
- name: change_type
  type: string
  required: true
  description: Change type - in-page-state/navigable-step/normalize-after-save
- name: router_api
  type: string
  required: true
  description: Router API - useSearchParamState/setSearchParams/navigate
- name: param_count
  type: string
  required: true
  description: Parameter count - single (hook) or multiple (setSearchParams)
- name: validation
  type: string
  required: false
  description: Validation type - zod/manual/none (default zod)
output:
  format: markdown
  description: Generated content based on the user request
---
# When to use

You're wiring up **URL state in a React app** — a filter, a
sort, a tab, a wizard step, a search query. The URL needs to
mirror the UI so users can share links, refresh, and use the
back button. You're using **React Router v6+** (or compatible
— TanStack Router, Remix).

The skill exists because **one mistake here is the #1 cause
of "back button is broken" bug reports**: pushing in-page
state changes (filter toggles, sort changes) into history.
Users click "back" expecting to leave the page; instead the
filter un-toggles, and the user is stuck in a UI they can't
get out of without using the browser history menu.

The fix is mechanical: every URL change has to be classified
as **in-page state** (use `replace`, don't pollute history) or
**navigable step** (use `push`, back button should return to
the previous step). There is no third option.

**Don't use this skill for** server-side URL handling (route
matching, SSR data loading — that's React Router loaders /
Remix loaders, not this). And don't use it for non-React
frontends.

# Inputs

| Field | Required | Notes |
|---|---|---|
| `change_type` | yes | `in-page-state`, `navigable-step`, or `normalize-after-save`. Drives the replace/push decision. |
| `router_api` | yes | `useSearchParamState` (preferred), `setSearchParams`, or `navigate`. |
| `param_count` | yes | `single` (use the hook) or `multiple` (use setSearchParams). |
| `validation` | no | `zod` (default for typed enums), `manual`, or `none`. |

# Output

Plain-text summary. Typical return:

```
Pattern: useSearchParamState
Code: see below
Replace vs push: replace
Gotchas:
  - pass null to clear, not ''
  - Zod schema decides the type at runtime, not the call site
```

# Prompt

```prompt
You are adding a URL state change to a React Router app.
Decide replace vs push FIRST, then pick the API.

1. Decide: replace or push?

   Change type                 | replace or push | Why
   --------------------------- | --------------- | ---
   filter / sort / tab         | replace         | in-page state; back
                               |                 | button should leave
                               |                 | the page
   search query                | replace         | same as filter
   pagination                  | replace         | same as filter
   wizard step                 | push            | user expects to step
                               |                 | through with back
   multi-step form             | push            | same as wizard
   post-save URL normalization | replace         | not a user action;
                               |                 | no history entry
                               |                 | needed

   If unsure, ASK. Do not default to push — pushing
   in-page state is the bug.

2. Pick the API.

   `useSearchParamState` (preferred for one validated param):

     import { useSearchParamState } from '@app/hooks/useSearchParamState';
     import { z } from 'zod';

     const TabSchema = z.enum(['overview', 'details', 'settings']);
     const [activeTab, setActiveTab] =
       useSearchParamState('tab', TabSchema, 'overview');

   The hook handles validation AND uses `replace: true`
   internally. You get both for free. Do NOT write
   `useSearchParamState` differently — the replace
   behaviour is the whole point.

   `setSearchParams` (for multiple params at once):

     const [searchParams, setSearchParams] = useSearchParams();

     // in-page state — replace
     setSearchParams(
       (params) => {
         params.set('status', 'active');
         params.set('sort', 'name');
         return params;
       },
       { replace: true },
     );

     // wizard step — push (default; do not pass replace)
     setSearchParams((params) => {
       params.set('step', 'review');
       return params;
     });

   `navigate` (for hash or full URL replacement):

     // wizard hash — push (default)
     navigate('#review');

     // tab switch on a detail page — replace
     navigate(`#${section}`, { replace: true });

     // post-save URL normalization
     navigate(`/items/${newItemId}`, { replace: true });

3. Validation rules.

   - Always use a Zod schema for enums. The hook throws
     an invariant error if the URL value is not in the
     schema. That's a feature — it means the URL state
     can never be inconsistent with the schema.

   - Use `null` to clear a param, not `''`:

     setTab(null);              // RIGHT — removes the param
     setTab('');                // WRONG — hook throws
                                 //         invariant error

   - For free-form strings (search query, etc.), use
     `z.string().min(1).max(200)` or accept the raw
     string and validate downstream.

4. Anti-patterns.

   - Pushing in-page state (breaks back button):

       setSearchParams((p) => {
         p.set('filter', value);
         return p;
       });                          // WRONG — no { replace: true }

       navigate(`?tab=${newTab}`);  // WRONG — push is default

   - Using raw `useSearchParams` for a single param:

       const [searchParams, setSearchParams] = useSearchParams();
       const tab = searchParams.get('tab');
       const setTab = (v) => {
         setSearchParams((p) => { p.set('tab', v); return p; });
       };                           // WRONG — no validation,
                                    //         easy to forget
                                    //         { replace: true }

       // RIGHT — use the hook
       const [tab, setTab] = useSearchParamState('tab', TabSchema, 'overview');

   - Setting the param to `''` to "clear" it:

       setTab('');                  // WRONG — throws invariant
       setTab(null);                // RIGHT — clears cleanly

5. Hash-based navigation: still classify the change.

   For wizard / multi-step flows where the back button
   should traverse steps, use push (the default):

     // wizard step navigation — push, intentional
     const updateHash = (newStep) => {
       navigate(`#${newStep}`);
     };

   For hash changes that represent in-page state (a tab
   switch on a detail page), use replace:

     // tab switch on detail page — replace, no history clutter
     navigate(`#${section}`, { replace: true });

6. Post-save URL normalization.

   When the URL needs to include a new ID after a create
   or save operation (and it's not a user action), use
   replace. Adding a history entry here would mean the
   user clicks back, lands on the unsaved "new" page, and
   either sees a 404 or accidentally re-creates the
   resource.

     navigate(`/items/${newId}`, { replace: true });
```

# When NOT to use

- **You're in a non-React framework.** This skill targets
  React Router v6+ patterns. Vue Router, SvelteKit, Solid
  Router have their own equivalents but the
  decision-table rules still apply.
- **You're matching on server-rendered routes, not
  search params.** That's route matching, not state
  management. Use loaders / SSR data flow, not
  `useSearchParams`.
- **You push in-page state into history.** "It works
  locally" — wait until a user clicks back nine times to
  undo your nine filter toggles. The fix is `replace: true`.
- **You set a param to `''` to "clear" it.** The hook
  (and most typed URL-state libraries) throw on empty
  string. Use `null`.
- **You hand-roll `useSearchParams` + manual validation
  for a single param.** Use `useSearchParamState`. The
  hook's replace behaviour is the whole reason to use it.
- **You use `push` for post-save URL normalization.** A
  history entry for a non-user action breaks back
  navigation. Use `replace`.
- **You confuse hash state with search-param state.**
  Hash (`#section`) is for in-page anchors and is not
  sent to the server. Search params (`?tab=x`) are sent
  to the server and survive a hard refresh. Pick the
  right one for the semantics — don't use `#` to mimic
  search params, you'll lose server-side rendering.
- **You classify the change as "navigable step" when
  the user is on a filterable list.** That's still
  in-page state. Wizard steps are sequential paths the
  user has to traverse; filter changes are mutable
  view-state on a single page.

# Example

**Input:**

```yaml
change_type: in-page-state
router_api: useSearchParamState
param_count: single
validation: zod
```

**Output:**

```
Pattern: useSearchParamState
Replace vs push: replace (built-in)

Code:

  import { z } from 'zod';
  import { useSearchParamState } from '@app/hooks/useSearchParamState';

  const TabSchema = z.enum(['overview', 'details', 'settings']);
  const [activeTab, setActiveTab] =
    useSearchParamState('tab', TabSchema, 'overview');

  // later
  setActiveTab('details');   // pushes to ?tab=details
                             //   using replace, NOT push
  setActiveTab(null);        // clears the ?tab= param

Gotchas:
  - 'overview' | 'details' | 'settings' is the only valid value
  - null clears, '' throws
  - the hook uses replace internally — do not wrap it
    in setSearchParams
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Pushing in-page state**: Filter changes adding to browser history.
  - how to detect: back button undoes filter changes user made
  - how to fix: use `replace: true` for in-page state

- **Using '' to clear params**: Empty string throws invariant error.
  - how to detect: app crashes when trying to clear a param
  - how to fix: use `null` to clear params, not empty string

- **Confusing hash vs search params**: Hash changes not sent to server.
  - how to detect: server-side rendering doesn't reflect hash state
  - how to fix: use search params for server-visible state, hash for in-page anchors

- **Wizard step uses replace**: Back button doesn't work for wizard navigation.
  - how to detect: users can't go back to previous wizard steps
  - how to fix: don't pass `replace: true` for wizard steps

- **No validation on params**: Invalid URL values cause runtime errors.
  - how to detect: app crashes on direct URL manipulation
  - how to fix: always use Zod schema for URL param validation
