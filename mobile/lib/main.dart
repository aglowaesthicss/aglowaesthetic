import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth.dart';
import 'screens/guest/home.dart';
import 'screens/auth/login.dart';
import 'screens/dashboard/dashboard.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const AglowApp(),
    ),
  );
}

class AglowApp extends StatefulWidget {
  const AglowApp({Key? key}) : super(key: key);

  @override
  _AglowAppState createState() => _AglowAppState();
}

class _AglowAppState extends State<AglowApp> {
  bool _checkingAuth = true;

  @override
  void initState() {
    super.initState();
    _checkInitialAuth();
  }

  Future<void> _checkInitialAuth() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    try {
      await authProvider.tryAutoLogin();
    } catch (e) {
      print('Initial auth check error: $e');
    } finally {
      setState(() {
        _checkingAuth = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_checkingAuth) {
      return const MaterialApp(
        backgroundColor: Color(0xFF151412),
        home: Scaffold(
          body: Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
            ),
          ),
        ),
      );
    }

    final authProvider = Provider.of<AuthProvider>(context);

    return MaterialApp(
      title: 'Aglow Aesthetics Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFFD4AF37),
        scaffoldBackgroundColor: const Color(0xFF151412),
        fontFamily: 'sans-serif',
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFD4AF37),
          secondary: Color(0xFFAA7C11),
          background: Color(0xFF151412),
          surface: Color(0xFF23211E),
        ),
      ),
      initialRoute: authProvider.isAuthenticated ? '/dashboard' : '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
      },
    );
  }
}
