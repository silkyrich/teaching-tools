import 'package:mathsteps/core/models/problem.dart';

/// Parses natural text input like "347 + 285" into structured data.
///
/// Accepts common symbols:
/// - Addition: +
/// - Subtraction: -, −
/// - Multiplication: ×, *, x
/// - Division: ÷, /

class ParseResult {
  const ParseResult({
    required this.operation,
    required this.operands,
  });

  final Operation operation;
  final List<int> operands;
}

class ParseError {
  const ParseError(this.message);
  final String message;
}

/// Returns either a [ParseResult] or a [ParseError].
///
/// Usage:
/// ```dart
/// final result = parseInput('347 + 285');
/// switch (result) {
///   case ParseResult r: // use r.operation, r.operands
///   case ParseError e:  // show e.message
/// }
/// ```
Object parseInput(String input) {
  final trimmed = input.trim();
  if (trimmed.isEmpty) {
    return const ParseError('Enter a maths problem like 347 + 285');
  }

  // Normalise symbols
  final normalised = trimmed
      .replaceAll('\u00d7', '*') // ×
      .replaceAll('x', '*')
      .replaceAll('X', '*')
      .replaceAll('\u00f7', '/') // ÷
      .replaceAll('\u2212', '-') // −
      .replaceAll('\u2013', '-') // en-dash
      .replaceAll('\u2014', '-'); // em-dash

  // Find the operator
  Operation? operation;
  String? operatorChar;

  // Check for operators (order matters — check multi-char patterns first)
  for (final op in ['+', '-', '*', '/']) {
    // Find operator that isn't at position 0 (negative numbers)
    final idx = normalised.indexOf(op, 1);
    if (idx > 0) {
      operatorChar = op;
      operation = switch (op) {
        '+' => Operation.addition,
        '-' => Operation.subtraction,
        '*' => Operation.multiplication,
        '/' => Operation.shortDivision,
        _ => null,
      };
      break;
    }
  }

  if (operation == null || operatorChar == null) {
    return const ParseError(
      'Could not find an operation. Use +, -, × or ÷',
    );
  }

  // Split on operator and parse operands
  final parts = normalised.split(operatorChar);
  final operands = <int>[];

  for (final part in parts) {
    final cleaned = part.trim();
    if (cleaned.isEmpty) continue;
    final value = int.tryParse(cleaned);
    if (value == null) {
      return ParseError('"$cleaned" is not a whole number');
    }
    if (value < 0) {
      return const ParseError('Only positive numbers for now');
    }
    operands.add(value);
  }

  if (operands.length < 2) {
    return const ParseError('Need at least two numbers');
  }

  // Validate operation-specific constraints
  if (operation == Operation.subtraction && operands[0] < operands[1]) {
    return const ParseError(
      'The first number must be larger for subtraction',
    );
  }

  if (operation == Operation.shortDivision && operands[0] == 0) {
    return const ParseError('Cannot divide by zero');
  }

  return ParseResult(operation: operation, operands: operands);
}
