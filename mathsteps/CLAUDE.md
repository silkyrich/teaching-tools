# CLAUDE.md — MathSteps

Read this before every session. It defines what MathSteps is, how it works,
and the rules every agent must follow.

---

## What Is MathSteps?

A maths education app for UK primary school children (Key Stage 1-2, ages 5-11).
The child enters an arithmetic problem and sees the correct UK-taught method
walked through step by step — exactly as their teacher shows it in class.

**Operator:** One founder. Does not write code. Orchestrates AI agents via
Linear. Reviews and approves work.

**Current phase:** Phase 1 — free step-by-step calculator. No login, no
subscription, no personal data collection. Ship to App Store and Play Store.

---

## Phase Awareness

| Phase | Status | Scope |
|-------|--------|-------|
| 1 | NOW | Free calculator. Four methods. No accounts. Anonymous analytics only. |
| 2 | LATER | Subscription. Parent accounts, child profiles, practice questions, proficiency tracking. |
| 3 | FUTURE | School integration, AI tutoring, multi-subject. Full IXL competitor. |

**Rule:** Build for Phase 1. Don't build Phase 2 features. But don't make
architectural decisions that prevent Phase 2. When in doubt, ask.

---

## Tech Stack

- **Framework:** Flutter (Dart)
- **State management:** Riverpod (flutter_riverpod + riverpod_annotation)
- **Routing:** GoRouter
- **Fonts:** Google Fonts (Nunito)
- **Code generation:** freezed, json_serializable, riverpod_generator
- **Testing:** flutter_test, mocktail
- **Analysis:** Strict — all lints enabled (see analysis_options.yaml)

---

## Project Structure

```
mathsteps/
├── lib/
│   ├── main.dart                          # App entry point
│   ├── core/
│   │   ├── models/
│   │   │   ├── problem.dart               # Core data types (Problem, StepInput, GridCell, etc.)
│   │   │   └── method.dart                # MathMethod abstract interface
│   │   ├── services/
│   │   │   └── problem_generator.dart     # Random problem generation
│   │   └── utils/
│   │       └── input_parser.dart          # "347 + 285" → Operation + operands
│   ├── features/
│   │   ├── calculator/
│   │   │   ├── engines/                   # Pure computation — one file per method
│   │   │   │   ├── addition_engine.dart
│   │   │   │   ├── subtraction_engine.dart
│   │   │   │   ├── grid_multiplication_engine.dart
│   │   │   │   └── short_division_engine.dart
│   │   │   ├── models/                    # Calculator-specific state models
│   │   │   ├── providers/                 # Riverpod providers
│   │   │   ├── screens/                   # Full-screen pages
│   │   │   └── widgets/                   # Reusable UI components
│   │   └── home/
│   │       ├── screens/
│   │       └── widgets/
│   ├── routing/
│   │   └── app_router.dart
│   └── theme/
│       └── app_theme.dart
├── test/
│   ├── engines/                           # Engine unit tests (critical)
│   └── providers/                         # Provider tests
├── assets/
│   ├── icons/
│   └── fonts/
├── docs/
│   ├── LINEAR_BOOTSTRAP.md               # Linear workspace setup spec
│   └── LESSONS_LEARNED.md                # Analysis of v1 codebase
├── pubspec.yaml
├── analysis_options.yaml
└── CLAUDE.md                             # This file
```

Feature-first organisation. Each feature owns its screens, widgets,
providers, and models. Shared code lives in `core/`.

---

## Build & Test Commands

```bash
# Run the app
flutter run

# Run all tests
flutter test

# Run a specific test file
flutter test test/engines/addition_test.dart

# Analyse code (must pass with zero issues)
flutter analyze

# Generate freezed/json_serializable code
dart run build_runner build --delete-conflicting-outputs

# Build for release
flutter build ios
flutter build appbundle
```

---

## Architecture: Engine Protocol

The core abstraction is `MathMethod` (defined in `core/models/method.dart`).
Every arithmetic method implements this interface:

```
MathMethod
├── name → "Column Addition"
├── operation → Operation.addition
├── canSolve(operands) → bool
├── generateSteps(operands) → List<StepInput>      # PURE COMPUTATION
├── getLayout(operands) → OperationLayout           # Grid dimensions
├── getCells(operands, steps, ...) → List<GridCell>  # Rendering data
└── getStepExplanation(operands, steps, index) → StepExplanation
```

**Layers (never mix these):**
1. **Engine** — pure functions. Operands in, steps out. No UI, no state, no Flutter imports.
2. **Step data** — `StepInput` list. Abstract representation of the solution.
3. **Grid cells** — `GridCell` list. Rendering instructions for the UI.
4. **Widgets** — Flutter widgets that render grid cells on screen.

---

## The Four Methods (Phase 1)

### Column Addition
Right-to-left. Add each column. Write digit, carry if ≥10.
Supports 2-5 addends with any digit count.
Port directly from v1 (`src/engines/addition.ts`).

### Column Subtraction (Decomposition)
Right-to-left. If top < bottom, borrow (decompose) from next column.
**MUST use decomposition.** UK schools do NOT teach equal addition.
Chain borrows through zeros (e.g. 1000 - 1 requires borrowing through two zeros).
Port directly from v1 (`src/engines/subtraction.ts`).

### Grid Multiplication (Box Method)
**REDESIGN from v1.** V1 uses long multiplication. Phase 1 needs the grid method:
- Partition both numbers by place value (34 → 30 + 4)
- Create a grid
- Fill each cell with the product of row header × column header
- Sum rows, then sum totals
This is what UK primary schools teach. NOT partial products.

### Short Division (Bus Stop Method)
Left-to-right. Divide each digit (with carry). Quotient above the line.
Divisor ≤ 12 for Phase 1.
Port directly from v1 (`src/engines/shortDivision.ts`).

---

## Critical Rules

### 1. Engines Compute Algorithmically
**NEVER hardcode answers.** NEVER use lookup tables. The engine executes
the method step by step and computes the answer. If someone passes in
operands you've never seen before, the engine must produce the correct
answer and working. Wrong maths is a critical defect.

### 2. UK Methods Only
- Subtraction: decomposition (borrowing), NOT equal addition
- Multiplication: grid/box method, NOT long multiplication
- Division: bus stop method
- Terminology: "carrying" not "regrouping", "borrowing" not "exchanging"
  (these are the terms UK children hear)

### 3. Test Everything
Every engine needs unit tests covering:
- Simple case (no carry/borrow)
- Single carry/borrow
- Multiple carries/borrows
- Edge cases (999+1, 1000-1, borrow across zeros, exact division)
- Different digit counts

**A method without tests is not done.**

### 4. Separate Concerns
Engine → StepInput → GridCell → Widget. Never skip a layer.
Engines must not import Flutter. Widgets must not do maths.

### 5. No Personal Data (Phase 1)
No accounts. No names. No login. No tracking beyond anonymous analytics.
Firebase Analytics with child-directed treatment flag ONLY.

### 6. Accessibility
- Minimum 44pt touch targets
- Sufficient colour contrast (WCAG AA minimum)
- Screen reader labels on all interactive elements
- No reliance on colour alone to convey information
- This is a children's app — many users have additional needs

---

## Code Style

- UK English in all user-facing strings ("colour", "maths", "programme")
- US English in Dart code (Flutter convention: `color`, `center`)
- Prefer `const` constructors
- Require trailing commas
- No magic numbers — use named constants
- No `print()` — use proper logging
- All public APIs must have doc comments
- Files: snake_case. Classes: PascalCase. Variables: camelCase.

---

## Branching Strategy

```
main ← production releases
  └── develop ← integration branch
        └── feature/* ← individual features
        └── fix/* ← bug fixes
```

Commit messages: imperative mood, present tense.
- "Add column addition engine" not "Added column addition engine"
- "Fix borrow-across-zero edge case" not "Fixed borrowing bug"

---

## V1 Context

There is a working React/TypeScript prototype in the parent directory
(`../src/engines/`). It has proven, tested engines for addition, subtraction,
multiplication, and short division. The data models and test cases are
battle-tested. Port the logic, not the code.

Key v1 files for reference:
- `../src/engines/types.ts` — data model definitions
- `../src/engines/addition.ts` — column addition with carrying
- `../src/engines/subtraction.ts` — decomposition subtraction
- `../src/engines/shortDivision.ts` — bus stop division
- `../src/engines/__tests__/*.test.ts` — test cases to port

Grid multiplication must be REDESIGNED (v1 uses partial products, not grid method).

---

## Linear Integration

This project is managed via Linear. Every piece of work has a Linear issue.
See `docs/LINEAR_BOOTSTRAP.md` for the workspace structure.

Teams:
- **Platform Engineering** — builds the app
- **Content Factory** — curriculum and question engines (Phase 2+)
- **Operations** — App Store, analytics, marketing, support
- **Compliance** — privacy, DPIA, Children's Code

Labels: `phase-1`, `phase-2`, `phase-3`, `planning`, `blocker`, `needs-human`

When completing work, reference the Linear issue ID in commits.
