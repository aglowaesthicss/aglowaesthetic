import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth.dart';
import '../auth/reset_password.dart';
import 'admin_panel.dart';
import 'staff_panel.dart';
import 'client_panel.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final profile = authProvider.profile;
    final darkInk = const Color(0xFF151412);
    final goldColor = const Color(0xFFD4AF37);

    if (!authProvider.isAuthenticated) {
      // Safety fallback
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/');
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    Widget panelView = const Center(child: Text('Invalid Role Panel'));
    String roleTitle = 'Client';

    if (profile != null) {
      if (profile.role == 'master_admin') {
        panelView = const AdminPanel();
        roleTitle = 'Master Admin';
      } else if (profile.role == 'staff') {
        panelView = const StaffPanel();
        roleTitle = 'Clinic Staff';
      } else {
        panelView = const ClientPanel();
        roleTitle = 'Client Portal';
      }
    }

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              profile?.name ?? 'Aglow Portal',
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            Text(
              roleTitle.toUpperCase(),
              style: TextStyle(color: goldColor, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        backgroundColor: darkInk,
        elevation: 0,
        iconTheme: IconThemeData(color: goldColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white70),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ResetPasswordScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: () async {
              await authProvider.logout();
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
        ],
      ),
      body: panelView,
    );
  }
}
