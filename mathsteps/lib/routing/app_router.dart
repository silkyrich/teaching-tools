import 'package:go_router/go_router.dart';
import 'package:mathsteps/features/home/screens/home_screen.dart';
import 'package:mathsteps/features/calculator/screens/calculator_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/calculate',
      builder: (context, state) => const CalculatorScreen(),
    ),
  ],
);
