import 'dart:math';

import 'package:mathsteps/core/models/problem.dart';

/// Generates random maths problems within constraints.
///
/// CRITICAL RULE: All answers are computed algorithmically.
/// Never hardcoded. Never from a lookup table.
class ProblemGenerator {
  ProblemGenerator({Random? random}) : _random = random ?? Random();

  final Random _random;
  int _nextId = 0;

  String _generateId() => 'problem-${++_nextId}-${DateTime.now().millisecondsSinceEpoch}';

  int _randomInt(int min, int max) =>
      min + _random.nextInt(max - min + 1);

  int _digitCount(NumberSize size) {
    switch (size) {
      case NumberSize.small:
        return 2;
      case NumberSize.medium:
        return 3;
      case NumberSize.large:
        return 4;
    }
  }

  Problem generate({
    required Operation operation,
    NumberSize size = NumberSize.medium,
    int operandCount = 2,
  }) {
    final digits = _digitCount(size);

    switch (operation) {
      case Operation.addition:
        return _generateAddition(digits, operandCount);
      case Operation.subtraction:
        return _generateSubtraction(digits);
      case Operation.multiplication:
        return _generateMultiplication(digits, size);
      case Operation.shortDivision:
        return _generateShortDivision(digits, size);
    }
  }

  Problem fromOperands({
    required Operation operation,
    required List<int> operands,
  }) {
    int answer;
    int? remainder;

    switch (operation) {
      case Operation.addition:
        answer = operands.reduce((a, b) => a + b);
      case Operation.subtraction:
        answer = operands[0] - operands[1];
      case Operation.multiplication:
        answer = operands[0] * operands[1];
      case Operation.shortDivision:
        answer = operands[1] ~/ operands[0];
        remainder = operands[1] % operands[0];
    }

    return Problem(
      id: _generateId(),
      operation: operation,
      operands: operands,
      answer: answer,
      remainder: remainder,
    );
  }

  Problem _generateAddition(int digitCount, int operandCount) {
    final min = pow(10, digitCount - 1).toInt();
    final max = pow(10, digitCount).toInt() - 1;
    final operands = List.generate(
      operandCount,
      (_) => _randomInt(min, max),
    );

    return Problem(
      id: _generateId(),
      operation: Operation.addition,
      operands: operands,
      answer: operands.reduce((a, b) => a + b),
    );
  }

  Problem _generateSubtraction(int digitCount) {
    final min = pow(10, digitCount - 1).toInt();
    final max = pow(10, digitCount).toInt() - 1;
    var a = _randomInt(min, max);
    var b = _randomInt(min, max);
    if (b > a) {
      final temp = a;
      a = b;
      b = temp;
    }

    return Problem(
      id: _generateId(),
      operation: Operation.subtraction,
      operands: [a, b],
      answer: a - b,
    );
  }

  Problem _generateMultiplication(int digitCount, NumberSize size) {
    final min = pow(10, max(1, digitCount - 1)).toInt();
    final maxVal = pow(10, digitCount).toInt() - 1;
    final a = _randomInt(min, maxVal);

    final maxMultiplier = switch (size) {
      NumberSize.small => 5,
      NumberSize.medium => 12,
      NumberSize.large => 20,
    };
    final minMultiplier = switch (size) {
      NumberSize.small => 2,
      NumberSize.medium => 2,
      NumberSize.large => 5,
    };
    final b = _randomInt(minMultiplier, maxMultiplier);

    return Problem(
      id: _generateId(),
      operation: Operation.multiplication,
      operands: [a, b],
      answer: a * b,
    );
  }

  Problem _generateShortDivision(int digitCount, NumberSize size) {
    final maxDivisor = switch (size) {
      NumberSize.small => 4,
      NumberSize.medium => 9,
      NumberSize.large => 12,
    };
    final divisor = _randomInt(2, maxDivisor);
    final min = pow(10, digitCount - 1).toInt();
    final maxVal = pow(10, digitCount).toInt() - 1;
    final dividend = _randomInt(min, maxVal);

    return Problem(
      id: _generateId(),
      operation: Operation.shortDivision,
      operands: [divisor, dividend],
      answer: dividend ~/ divisor,
      remainder: dividend % divisor,
    );
  }
}
