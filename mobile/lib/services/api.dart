import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Replace with your local IP, 10.0.2.2 (Android Emulator), or production Render backend URL
  static const String baseLocalAndroid = 'http://10.0.2.2:8000';
  static const String baseLocalIos = 'http://localhost:8000';
  static const String productionUrl = 'https://aglowaesthetic-backend.onrender.com'; // Correct Render URL
  
  static String get baseUrl => productionUrl; // Default to production, switch as needed

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('aglow_token');
  }

  static Future<Map<String, String>> getHeaders({bool isMultipart = false}) async {
    final token = await getToken();
    final headers = <String, String>{};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  static Future<dynamic> get(String path) async {
    final url = Uri.parse('$baseUrl$path');
    final headers = await getHeaders();
    final response = await http.get(url, headers: headers);
    return _handleResponse(response);
  }

  static Future<dynamic> post(String path, dynamic body) async {
    final url = Uri.parse('$baseUrl$path');
    final headers = await getHeaders();
    final response = await http.post(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  static Future<dynamic> put(String path, dynamic body) async {
    final url = Uri.parse('$baseUrl$path');
    final headers = await getHeaders();
    final response = await http.put(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  static Future<dynamic> delete(String path) async {
    final url = Uri.parse('$baseUrl$path');
    final headers = await getHeaders();
    final response = await http.delete(url, headers: headers);
    return _handleResponse(response);
  }

  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      String errorMessage = 'An error occurred';
      try {
        final errJson = jsonDecode(response.body);
        errorMessage = errJson['detail'] ?? errJson['message'] ?? errorMessage;
      } catch (_) {}
      throw Exception('Status ${response.statusCode}: $errorMessage');
    }
  }
}
