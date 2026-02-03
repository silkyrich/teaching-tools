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

## Architecture Overview

MathSteps is a two-tier system:

```
┌─────────────────────┐       JSON        ┌─────────────────────┐
│   Flutter App        │  ◄──────────────► │   Go API Server     │
│   (thin client)      │   POST /solve     │   (engines + logic) │
│                      │                   │                     │
│   • Input UI         │                   │   • Step generation  │
│   • Grid rendering   │                   │   • Grid cells       │
│   • Animations       │                   │   • Explanations     │
│   • Theming          │                   │   • Problem gen      │
│   NO MATHS HERE      │                   │   ALL MATHS HERE     │
└─────────────────────┘                   └─────────────────────┘
```

**The Flutter app does zero maths.** It sends operands to the API and renders
the response. The Go backend is the single source of truth for computation.

This means:
- Engines can be tested, audited, and iterated without touching the app
- The same API serves web, iOS, Android, and any future client
- An agent working on engines doesn't need Flutter installed
- An agent working on UI doesn't need to understand arithmetic algorithms

---

## Tech Stack

### Backend (Go)
- **Language:** Go 1.24+
- **Module:** `github.com/silkyrich/mathsteps`
- **HTTP:** net/http (stdlib — no framework)
- **Testing:** go test (stdlib)
- **No external dependencies** (Phase 1)

### Frontend (Flutter)
- **Framework:** Flutter (Dart)
- **State management:** Riverpod
- **Routing:** GoRouter
- **Fonts:** Google Fonts (Nunito)
- **Testing:** flutter_test, mocktail

---

## Project Structure

```
mathsteps/
├── backend/                                # Go API server
│   ├── cmd/
│   │   └── api/
│   │       └── main.go                    # Entry point — registers engines, starts server
│   ├── internal/
│   │   ├── models/
│   │   │   └── models.go                  # ALL data types: Problem, StepInput, GridCell, etc.
│   │   ├── engine/
│   │   │   ├── engine.go                  # Method interface + registry
│   │   │   ├── addition/
│   │   │   │   ├── addition.go            # Column addition engine
│   │   │   │   └── addition_test.go       # Tests (13 cases, all passing)
│   │   │   ├── subtraction/               # TODO: decomposition subtraction
│   │   │   ├── multiplication/            # TODO: grid/box method
│   │   │   └── division/                  # TODO: bus stop short division
│   │   └── handler/
│   │       └── solve.go                   # HTTP handlers: POST /solve, GET /health
│   └── go.mod
├── lib/                                   # Flutter app (thin client)
│   ├── main.dart
│   ├── core/
│   │   ├── models/                        # Dart mirrors of Go models (for JSON deserialisation)
│   │   ├── services/                      # API client
│   │   └── utils/
│   │       └── input_parser.dart          # "347 + 285" → operation + operands
│   ├── features/
│   │   ├── calculator/
│   │   │   ├── providers/                 # Riverpod providers (call API, manage step state)
│   │   │   ├── screens/
│   │   │   └── widgets/                   # Grid renderer, step display, input
│   │   └── home/
│   ├── routing/
│   └── theme/
├── test/                                  # Flutter tests
├── docs/
│   ├── LINEAR_BOOTSTRAP.md
│   └── LESSONS_LEARNED.md
├── pubspec.yaml
├── analysis_options.yaml
└── CLAUDE.md                              # This file
```

---

## Build & Test Commands

### Backend (Go)

```bash
# Run all engine tests
cd mathsteps/backend && go test ./...

# Run a specific engine's tests
cd mathsteps/backend && go test ./internal/engine/addition/ -v

# Start the API server (default port 8080)
cd mathsteps/backend && go run ./cmd/api

# Start on a custom port
PORT=3000 go run ./cmd/api

# Test the API manually
curl -X POST http://localhost:8080/solve \
  -H "Content-Type: application/json" \
  -d '{"operation":"addition","operands":[347,285]}'
```

### Frontend (Flutter)

```bash
# Run the app
flutter run

# Run all tests
flutter test

# Analyse code (must pass with zero issues)
flutter analyze

# Build for release
flutter build ios
flutter build appbundle
```

---

## API Contract

### POST /solve

Request:
```json
{
  "operation": "addition",
  "operands": [347, 285]
}
```

Response:
```json
{
  "problem": {
    "id": "problem-1",
    "operation": "addition",
    "operands": [347, 285],
    "answer": 632
  },
  "steps": [...],
  "layout": {"rows": 4, "cols": 5, "lineAfterRow": 2},
  "cells": [...],
  "explanations": [...]
}
```

The response contains everything the client needs to render the complete
step-by-step working. The client does not compute anything.

### GET /health

Returns `{"status": "ok"}`.

---

## Engine Protocol (Go)

Every arithmetic method implements the `Method` interface
(`internal/engine/engine.go`):

```go
type Method interface {
    Name() string
    Operation() models.Operation
    CanSolve(operands []int) bool
    GenerateSteps(operands []int) []models.StepInput
    Layout(operands []int) models.OperationLayout
    Cells(operands []int, steps []models.StepInput) []models.GridCell
    Explain(operands []int, steps []models.StepInput, stepIndex int) models.StepExplanation
}
```

Engines self-register via `init()`. Adding a new method:
1. Create `internal/engine/newmethod/newmethod.go`
2. Implement the `Method` interface
3. Call `engine.Register(&Engine{})` in `init()`
4. Add blank import in `cmd/api/main.go`
5. Write comprehensive tests

---

## Data Types (Go structs in `internal/models/models.go`)

Read this file. It IS the API contract. Key types:

- **`Problem`** — operation, operands, computed answer, optional remainder
- **`StepInput`** — one step in the working (id, type, position, correctValue, status, linkedStepId)
- **`GridCell`** — one rendering instruction (row, col, layer, content, editable, status)
- **`OperationLayout`** — grid dimensions and line position
- **`StepExplanation`** — title + detail text for each step

---

## The Four Methods (Phase 1)

### Column Addition (DONE — tested, passing)
Right-to-left. Add each column. Write digit, carry if ≥10.
Supports 2-5 addends with any digit count.

### Column Subtraction (Decomposition) — TODO
Right-to-left. If top < bottom, borrow (decompose) from next column.
**MUST use decomposition.** UK schools do NOT teach equal addition.
Chain borrows through zeros (e.g. 1000 - 1 requires borrowing through two zeros).

### Grid Multiplication (Box Method) — TODO
**REDESIGN from v1.** V1 uses long multiplication. Phase 1 needs the grid method:
- Partition both numbers by place value (34 → 30 + 4)
- Create a grid with headers
- Fill each cell with the product of row header × column header
- Sum rows, then sum totals
This is what UK primary schools teach. NOT partial products.

### Short Division (Bus Stop Method) — TODO
Left-to-right. Divide each digit (with carry). Quotient above the line.
Divisor ≤ 12 for Phase 1.

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
Go engine → StepInput → GridCell (JSON) → Flutter widget.
Never skip a layer. Engines must not import net/http.
Flutter must not do maths. The API is the boundary.

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

### Go (backend)
- `gofmt` enforced — no style debates
- Package comments on every package
- Doc comments on every exported type and function
- Error handling: return errors, don't panic
- No external dependencies without justification
- UK English in user-facing strings (explanations)

### Dart (Flutter)
- UK English in all user-facing strings ("colour", "maths")
- US English in Dart code (Flutter convention: `color`, `center`)
- Prefer `const` constructors, trailing commas
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
and short division. The data models and test cases are battle-tested.

Column addition has already been ported to Go and all tests pass.
Remaining engines should be ported following the same pattern.

Grid multiplication must be REDESIGNED (v1 uses partial products, not grid method).

See `docs/LESSONS_LEARNED.md` for the full v1 analysis.

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
