/// Core data models for MathSteps.
///
/// These types are ported from the proven v1 TypeScript implementation.
/// They define the contract between engines (pure computation),
/// rendering (grid cells), and explanation (step text).

enum Operation {
  addition,
  subtraction,
  multiplication,
  shortDivision,
}

enum StepType {
  answerDigit,
  carry,
  borrow,
  remainder,
  partialProduct,
  gridCell,
  rowSum,
}

enum StepStatus {
  pending,
  active,
  completed,
}

enum CellStatus {
  fixed,
  pending,
  active,
  completed,
  hidden,
  tentative,
}

enum CellLayer {
  main,
  carry,
  borrow,
  working,
}

enum Support {
  full,
  some,
  none,
}

enum NumberSize {
  small,
  medium,
  large,
}

class GridPosition {
  const GridPosition({
    required this.row,
    required this.col,
    this.layer = CellLayer.main,
  });

  final int row;
  final int col;
  final CellLayer layer;
}

class StepInput {
  const StepInput({
    required this.id,
    required this.type,
    required this.position,
    required this.correctValue,
    this.enteredValue,
    this.status = StepStatus.pending,
    this.label,
    this.linkedStepId,
    this.compoundValue,
  });

  final String id;
  final StepType type;
  final GridPosition position;
  final int correctValue;
  final int? enteredValue;
  final StepStatus status;
  final String? label;
  final String? linkedStepId;
  final int? compoundValue;

  StepInput copyWith({
    String? id,
    StepType? type,
    GridPosition? position,
    int? correctValue,
    int? enteredValue,
    StepStatus? status,
    String? label,
    String? linkedStepId,
    int? compoundValue,
  }) {
    return StepInput(
      id: id ?? this.id,
      type: type ?? this.type,
      position: position ?? this.position,
      correctValue: correctValue ?? this.correctValue,
      enteredValue: enteredValue ?? this.enteredValue,
      status: status ?? this.status,
      label: label ?? this.label,
      linkedStepId: linkedStepId ?? this.linkedStepId,
      compoundValue: compoundValue ?? this.compoundValue,
    );
  }
}

class GridCell {
  const GridCell({
    required this.row,
    required this.col,
    this.layer = CellLayer.main,
    required this.content,
    this.editable = false,
    this.status = CellStatus.fixed,
    this.type,
    this.stepId,
  });

  final int row;
  final int col;
  final CellLayer layer;
  final String content;
  final bool editable;
  final CellStatus status;
  final StepType? type;
  final String? stepId;
}

class StepExplanation {
  const StepExplanation({
    required this.title,
    required this.detail,
  });

  final String title;
  final String detail;
}

class Problem {
  const Problem({
    required this.id,
    required this.operation,
    required this.operands,
    required this.answer,
    this.remainder,
  });

  final String id;
  final Operation operation;
  final List<int> operands;
  final int answer;
  final int? remainder;
}

class OperationLayout {
  const OperationLayout({
    required this.rows,
    required this.cols,
    this.lineAfterRow,
  });

  final int rows;
  final int cols;
  final int? lineAfterRow;
}
