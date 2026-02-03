import 'package:flutter/material.dart';

class CalculatorScreen extends StatelessWidget {
  const CalculatorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MathSteps'),
      ),
      body: const SafeArea(
        child: Center(
          child: Text('Calculator — implementation pending'),
        ),
      ),
    );
  }
}
