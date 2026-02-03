# Lessons Learned from v1 (React/TypeScript Web App)

Analysis of the teaching-tools codebase to inform the MathSteps Flutter rewrite.

---

## What Worked — Keep These

### 1. Engine Architecture (the best part of v1)

The separation of concerns in `src/engines/` is correct and proven:

- **Pure computation engines** — `generateAdditionSteps()`, `generateSubtractionSteps()`, etc.
  These are pure functions: operands in, step data out. No side effects.
  They are independently testable and the test suite proves they work.

- **Grid cell generation** — `getAdditionGridCells()` etc. translates step data into
  rendering instructions. This separation means engines don't know about UI.

- **Step explanations** — `getAdditionStepExplanation()` generates human-readable
  text for each step. Separate from computation and rendering.

- **Operation registry** — `operationRegistry` provides a uniform interface.
  Every operation exposes `getLayout`, `getCells`, `getStepExplanation`.

**Port this pattern directly to Dart.** The architecture is sound.

### 2. Type System / Data Model

These types are battle-tested:

```
StepInput { id, type, position, correctValue, enteredValue, status, linkedStepId, compoundValue }
GridCell { row, col, layer, content, editable, status, type, stepId }
StepExplanation { title, detail }
Problem { id, operation, operands, answer, remainder }
OperationConfig { getLayout, getCells, getStepExplanation }
```

Key design decisions that proved correct:
- `StepType` enum covers all step varieties across all operations
- `GridPosition` with row/col/layer handles overlapping elements (carries above, borrows below)
- `linkedStepId` connects carry steps to their answer digits (enables auto-complete)
- `compoundValue` stores the full column sum when a carry is needed (enables "write 3, carry 1")
- `status: pending | active | completed` is the right state machine for steps

### 3. Problem Generation

`problemGenerator.ts` correctly:
- Generates constrained random operands per operation and difficulty
- Computes answers algorithmically (never hardcoded)
- Handles edge cases (subtraction always has a > b, division has valid divisors)
- Supports three difficulty tiers via digit count

### 4. Three Support Levels

The `Support: 'full' | 'some' | 'none'` system works well:
- Full: show all steps pre-filled (demonstration mode)
- Some: auto-complete linked steps like carries (scaffolded practice)
- None: student fills everything (assessment mode)

### 5. User Input

Two input modes both have value:
- **Custom entry** — pick operation, enter specific numbers. Used more by children.
- **Natural text** — type "347 + 285". Used more by parents/teachers.

Parser correctly handles: +, -, × and *, ÷ and /

### 6. Test Suite

Every engine has comprehensive unit tests covering:
- Simple cases (no carry/borrow)
- Single carry/borrow
- Multiple carries/borrows
- Edge cases (999+1, borrow across zeros)
- Multiple operands
- Different digit counts

**Port these tests to Dart. They define correctness.**

---

## What Needs Improvement

### 1. Grid Multiplication Is Wrong Method

v1 implements long multiplication with partial products:
```
    34
  × 27
  ----
   238  (34 × 7)
   680  (34 × 20)
  ----
   918
```

UK primary schools teach the GRID METHOD:
```
       30    4
  20  600   80  = 680
   7  210   28  = 238
              Total: 918
```

These produce the same answer but the grid method is what children learn
in exercise books. The Flutter version must implement the grid method.

### 2. Web-Only Limitation

v1 is a Vite/React web app deployed to GitHub Pages. This means:
- No offline capability
- No App Store presence
- No push notifications
- Web audio is flaky on mobile browsers
- No home screen integration

Flutter solves all of these.

### 3. State Management Coupling

v1 uses Zustand stores (`uiStore.ts`, `problemStore.ts`) which work but:
- UI state and problem state are somewhat tangled
- Theme persistence is in localStorage (fine for web, wrong for mobile)
- URL state syncing adds complexity that native apps don't need

Riverpod with proper provider separation will be cleaner.

### 4. No Content Pipeline

v1 has hardcoded operations with no path to curriculum-mapped content.
The Flutter version needs the engine protocol designed for extensibility
from day one, even though Phase 1 only has four methods.

### 5. No Analytics

v1 has zero analytics. We're flying blind on:
- Which operations children use most
- Where they get stuck (which step types cause errors)
- Session duration and completion rates
- Device types and screen sizes

Phase 1 needs anonymous Firebase Analytics from day one.

### 6. Celebration and Engagement

v1 has basic canvas-confetti celebration and a learning buddy character.
These are good ideas but the implementation is basic. Flutter's animation
framework allows much richer feedback:
- Smooth step transitions
- Satisfying correct-answer feedback
- Progressive celebration (streak bonuses)
- Character reactions that feel alive

### 7. Theming System

v1 has 6 CSS theme files (forest, ocean, space, candy, volcano, arctic).
The concept is good — children enjoy personalisation. But CSS variables
don't translate to Flutter. Need a proper ThemeData-based system.

---

## Critical Rules (Non-Negotiable)

These rules were learned the hard way and must be enforced in CLAUDE.md:

1. **Engines compute algorithmically.** Never hardcode answers. Never use
   lookup tables. The engine generates the answer by executing the method.
   Wrong maths = critical defect.

2. **UK methods only.** Decomposition for subtraction (not equal addition).
   Grid method for multiplication (not long multiplication). Bus stop for
   short division. These are what UK schools teach.

3. **Test everything.** Every engine needs comprehensive unit tests.
   Edge cases are where bugs hide: 999+1, 1000-1, borrow across zeros,
   division with remainder.

4. **Separate concerns.** Engine (pure computation) → Step data → Grid cells
   (rendering instructions) → Widget (actual pixels). Never mix these layers.

5. **Accessibility.** Children with additional needs use this. Large touch
   targets, clear contrast, screen reader support, no reliance on colour alone.

---

## What to Carry Over vs Rewrite

### Carry Over (port to Dart)
- Engine algorithms (addition, subtraction, short division)
- Data models (StepInput, GridCell, StepExplanation, Problem)
- Operation registry pattern
- Problem generator constraints
- Test cases and edge cases
- Support level system
- Input parsing logic

### Rewrite (different approach needed)
- Grid multiplication (grid method, not partial products)
- All UI (Flutter widgets, not React components)
- State management (Riverpod, not Zustand)
- Theming (ThemeData, not CSS variables)
- Routing (GoRouter, not React state)
- Sound/haptics (Flutter native, not Web Audio API)
- Celebrations/animations (Flutter animation framework)

### Drop Entirely
- URL state syncing (native app doesn't need it)
- GitHub Pages deployment (App Store instead)
- CSS modules (Flutter doesn't use CSS)
- Web-specific hacks (fullscreen API, etc.)
- Long division engine (not in Phase 1 scope — reimplement later if needed)
