import 'package:mathsteps/core/models/problem.dart';

/// Abstract interface that all arithmetic methods implement.
///
/// A method:
/// 1. Takes a problem (operation + operands)
/// 2. Validates applicability
/// 3. Returns structured step data for UI rendering
///
/// This is the core protocol — every operation (addition, subtraction,
/// grid multiplication, short division) implements this interface.
abstract class MathMethod {
  /// Human-readable name of this method (e.g. "Column Addition").
  String get name;

  /// The operation this method handles.
  Operation get operation;

  /// Whether this method can solve the given problem.
  bool canSolve(List<int> operands);

  /// Generate the step-by-step solution.
  ///
  /// Returns a list of [StepInput] representing each step the student
  /// must complete, in order. Steps are pure data — no UI knowledge.
  List<StepInput> generateSteps(List<int> operands);

  /// Get the grid layout dimensions for rendering.
  OperationLayout getLayout(List<int> operands);

  /// Generate rendering cells from step data.
  ///
  /// Translates engine step data into visual grid cells that the UI
  /// can render directly. This is the bridge between computation and
  /// display.
  List<GridCell> getCells({
    required List<int> operands,
    required List<StepInput> steps,
    required bool showHints,
    int? pendingFirstDigit,
  });

  /// Get explanation text for the current step.
  ///
  /// Returns a human-readable title and detail explaining what the
  /// student should do at this step.
  StepExplanation getStepExplanation({
    required List<int> operands,
    required List<StepInput> steps,
    required int currentStepIndex,
  });
}
