import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mathsteps/routing/app_router.dart';
import 'package:mathsteps/theme/app_theme.dart';

void main() {
  runApp(
    const ProviderScope(
      child: MathStepsApp(),
    ),
  );
}

class MathStepsApp extends StatelessWidget {
  const MathStepsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'MathSteps',
      theme: AppTheme.light,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
