import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CacheService {
  static Future<dynamic> get(String key, dynamic fallback) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final val = prefs.getString('cache_$key');
      if (val != null) {
        return jsonDecode(val);
      }
    } catch (e) {
      print('Cache read error for key $key: $e');
    }
    return fallback;
  }

  static Future<void> set(String key, dynamic value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cache_$key', jsonEncode(value));
    } catch (e) {
      print('Cache write error for key $key: $e');
    }
  }

  static Future<void> clear() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys();
      for (final key in keys) {
        if (key.startsWith('cache_')) {
          await prefs.remove(key);
        }
      }
    } catch (e) {
      print('Cache clear error: $e');
    }
  }
}
