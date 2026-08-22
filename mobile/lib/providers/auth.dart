import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api.dart';

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  UserProfile? _profile;
  String? _token;
  bool _isLoading = false;
  List<String> _allowedFeatures = [];

  bool get isAuthenticated => _isAuthenticated;
  UserProfile? get profile => _profile;
  String? get token => _token;
  bool get isLoading => _isLoading;
  List<String> get allowedFeatures => _allowedFeatures;

  bool hasAccess(String feature) {
    if (_profile?.role == 'master_admin') return true;
    return _allowedFeatures.contains(feature);
  }

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('aglow_token')) {
      return false;
    }
    
    _isLoading = true;
    notifyListeners();

    try {
      _token = prefs.getString('aglow_token');
      // Fetch user profile from backend
      final response = await ApiService.get('/api/auth/profile');
      if (response != null) {
        _profile = UserProfile.fromJson(response['user']);
        _allowedFeatures = List<String>.from(response['allowed_features'] ?? []);
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Auto login failed: $e');
      // Token might be expired, clear it
      await logout();
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/api/auth/login', {
        'email': email,
        'password': password,
      });

      if (response != null && response['access_token'] != null) {
        _token = response['access_token'];
        _profile = UserProfile.fromJson(response['user']);
        _allowedFeatures = List<String>.from(response['allowed_features'] ?? []);
        _isAuthenticated = true;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('aglow_token', _token!);
        await prefs.setString('aglow_role', _profile!.role);
      }
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.post('/api/auth/change-password', {
        'current_password': currentPassword,
        'new_password': newPassword,
      });
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _profile = null;
    _isAuthenticated = false;
    _allowedFeatures = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('aglow_token');
    await prefs.remove('aglow_role');
    notifyListeners();
  }
}
