import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth.dart';
import '../../widgets/luxe_button.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({Key? key}) : super(key: key);

  @override
  _ResetPasswordScreenState createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();

  Future<void> _handleReset() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_newController.text != _confirmController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New passwords do not match')),
      );
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    try {
      await authProvider.changePassword(
        _currentController.text,
        _newController.text,
      );
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF151412),
          title: const Text('Success', style: TextStyle(color: Color(0xFFD4AF37))),
          content: const Text(
            'Your password has been changed successfully.',
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pop(context); // Close screen
              },
              child: const Text('OK', style: TextStyle(color: Color(0xFFD4AF37))),
            )
          ],
        ),
      );
    } catch (e) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF151412),
          title: const Text('Error', style: TextStyle(color: Colors.redAccent)),
          content: Text(
            e.toString().replaceAll('Exception: ', ''),
            style: const TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK', style: TextStyle(color: Color(0xFFD4AF37))),
            )
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final darkInk = const Color(0xFF151412);
    final goldColor = const Color(0xFFD4AF37);
    final fieldFill = const Color(0xFF23211E);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: const Text(
          'CHANGE PASSWORD',
          style: TextStyle(
            color: Color(0xFFD4AF37),
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        backgroundColor: darkInk,
        elevation: 0,
        iconTheme: IconThemeData(color: goldColor),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Update Credentials',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'serif',
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Change your account password. Make sure it is secure and easy to remember.',
                style: TextStyle(color: Colors.white60, fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 32),

              // Current Password
              _buildLabel('Current Password'),
              TextFormField(
                controller: _currentController,
                style: const TextStyle(color: Colors.white),
                obscureText: true,
                decoration: _buildInputDecoration('Enter current password', fieldFill),
                validator: (val) => val == null || val.isEmpty ? 'Please enter current password' : null,
              ),
              const SizedBox(height: 20),

              // New Password
              _buildLabel('New Password'),
              TextFormField(
                controller: _newController,
                style: const TextStyle(color: Colors.white),
                obscureText: true,
                decoration: _buildInputDecoration('Enter new password', fieldFill),
                validator: (val) => val == null || val.length < 4 ? 'Password must be at least 4 characters' : null,
              ),
              const SizedBox(height: 20),

              // Confirm New Password
              _buildLabel('Confirm New Password'),
              TextFormField(
                controller: _confirmController,
                style: const TextStyle(color: Colors.white),
                obscureText: true,
                decoration: _buildInputDecoration('Confirm new password', fieldFill),
                validator: (val) => val == null || val.isEmpty ? 'Please confirm new password' : null,
              ),
              const SizedBox(height: 36),

              LuxeButton(
                onPressed: _handleReset,
                text: 'Update Password',
                isLoading: authProvider.isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: Colors.white30,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint, Color fill) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13.5),
      filled: true,
      fillColor: fill,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }
}
