/// Dart mirror of Go models (internal/models/models.go).
///
/// These types exist ONLY for JSON deserialisation of API responses.
/// The Go backend is the source of truth. If models.go changes, update these.
/// Do NOT add computation logic here — the Flutter app does no maths.

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
  partial,
  rowTotal,
  finalTotal,
  quotientDigit,
  divCarry,
  remainder,
}

enum StepStatus {
  pending,
  active,
  completed,
}

enum CellLayer {
  main,
  carry,
}

enum CellStatus {
  fixed,
  pending,
  active,
  completed,
  tentative,
}

class GridPosition {
  const GridPosition({
    required this.row,
    required this.col,
    this.layer = CellLayer.main,
  });

  factory GridPosition.fromJson(Map<String, dynamic> json) {
    return GridPosition(
      row: json['row'] as int,
      col: json['col'] as int,
      layer: CellLayer.values.firstWhere(
        (e) => e.name == json['layer'],
        orElse: () => CellLayer.main,
      ),
    );
  }

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
    this.linkedStepId,
    this.compoundValue,
  });

  factory StepInput.fromJson(Map<String, dynamic> json) {
    return StepInput(
      id: json['id'] as String,
      type: StepType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => StepType.answerDigit,
      ),
      position: GridPosition.fromJson(json['position'] as Map<String, dynamic>),
      correctValue: json['correctValue'] as int,
      enteredValue: json['enteredValue'] as int?,
      status: StepStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => StepStatus.pending,
      ),
      linkedStepId: json['linkedStepId'] as String?,
      compoundValue: json['compoundValue'] as int?,
    );
  }

  final String id;
  final StepType type;
  final GridPosition position;
  final int correctValue;
  final int? enteredValue;
  final StepStatus status;
  final String? linkedStepId;
  final int? compoundValue;

  StepInput copyWith({StepStatus? status, int? enteredValue}) {
    return StepInput(
      id: id,
      type: type,
      position: position,
      correctValue: correctValue,
      enteredValue: enteredValue ?? this.enteredValue,
      status: status ?? this.status,
      linkedStepId: linkedStepId,
      compoundValue: compoundValue,
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

  factory GridCell.fromJson(Map<String, dynamic> json) {
    return GridCell(
      row: json['row'] as int,
      col: json['col'] as int,
      layer: CellLayer.values.firstWhere(
        (e) => e.name == json['layer'],
        orElse: () => CellLayer.main,
      ),
      content: json['content'] as String? ?? '',
      editable: json['editable'] as bool? ?? false,
      status: CellStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => CellStatus.fixed,
      ),
      type: json['type'] != null
          ? StepType.values.firstWhere(
              (e) => e.name == json['type'],
              orElse: () => StepType.answerDigit,
            )
          : null,
      stepId: json['stepId'] as String?,
    );
  }

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

  factory StepExplanation.fromJson(Map<String, dynamic> json) {
    return StepExplanation(
      title: json['title'] as String,
      detail: json['detail'] as String,
    );
  }

  final String title;
  final String detail;
}

class OperationLayout {
  const OperationLayout({
    required this.rows,
    required this.cols,
    this.lineAfterRow,
  });

  factory OperationLayout.fromJson(Map<String, dynamic> json) {
    return OperationLayout(
      rows: json['rows'] as int,
      cols: json['cols'] as int,
      lineAfterRow: json['lineAfterRow'] as int?,
    );
  }

  final int rows;
  final int cols;
  final int? lineAfterRow;
}

class Problem {
  const Problem({
    required this.id,
    required this.operation,
    required this.operands,
    required this.answer,
    this.remainder,
  });

  factory Problem.fromJson(Map<String, dynamic> json) {
    return Problem(
      id: json['id'] as String,
      operation: Operation.values.firstWhere(
        (e) => e.name == json['operation'],
      ),
      operands: (json['operands'] as List).cast<int>(),
      answer: json['answer'] as int,
      remainder: json['remainder'] as int?,
    );
  }

  final String id;
  final Operation operation;
  final List<int> operands;
  final int answer;
  final int? remainder;
}

/// Full API response from POST /solve.
class SolveResponse {
  const SolveResponse({
    required this.problem,
    required this.steps,
    required this.layout,
    required this.cells,
    required this.explanations,
  });

  factory SolveResponse.fromJson(Map<String, dynamic> json) {
    return SolveResponse(
      problem: Problem.fromJson(json['problem'] as Map<String, dynamic>),
      steps: (json['steps'] as List)
          .map((e) => StepInput.fromJson(e as Map<String, dynamic>))
          .toList(),
      layout: OperationLayout.fromJson(json['layout'] as Map<String, dynamic>),
      cells: (json['cells'] as List)
          .map((e) => GridCell.fromJson(e as Map<String, dynamic>))
          .toList(),
      explanations: (json['explanations'] as List)
          .map((e) => StepExplanation.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  final Problem problem;
  final List<StepInput> steps;
  final OperationLayout layout;
  final List<GridCell> cells;
  final List<StepExplanation> explanations;
}
