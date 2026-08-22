import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/api.dart';
import '../../services/cache.dart';

class LocationScreen extends StatefulWidget {
  const LocationScreen({Key? key}) : super(key: key);

  @override
  _LocationScreenState createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  List<dynamic> _locations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCachedLocations();
    _fetchLocations();
  }

  Future<void> _loadCachedLocations() async {
    final cached = await CacheService.get('/api/content/locations', []);
    if (cached != null && cached.isNotEmpty) {
      setState(() {
        _locations = cached;
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchLocations() async {
    try {
      final response = await ApiService.get('/api/content/locations') as List;
      setState(() {
        _locations = response;
        _isLoading = false;
      });
      await CacheService.set('/api/content/locations', response);
    } catch (e) {
      print('Failed to load locations: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _launchMaps(double lat, double lng, String name) async {
    final googleMapsUrl = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng");
    final appleMapsUrl = Uri.parse("https://maps.apple.com/?q=$lat,$lng");

    if (await canLaunchUrl(googleMapsUrl)) {
      await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
    } else if (await canLaunchUrl(appleMapsUrl)) {
      await launchUrl(appleMapsUrl, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch maps application';
    }
  }

  @override
  Widget build(BuildContext context) {
    final darkInk = const Color(0xFF151412);
    final goldColor = const Color(0xFFD4AF37);
    final bgCard = const Color(0xFF23211E);

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: const Text(
          'CLINIC BRANCH',
          style: TextStyle(
            color: Color(0xFFD4AF37),
            fontSize: 15,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        backgroundColor: darkInk,
        elevation: 0,
        iconTheme: IconThemeData(color: goldColor),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
              ),
            )
          : _locations.isEmpty
              ? const Center(
                  child: Text(
                    'No branch locations registered yet.',
                    style: TextStyle(color: Colors.white55),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _locations.length,
                  itemBuilder: (context, index) {
                    final loc = _locations[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 24),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: bgCard,
                        borderRadius: BorderRadius.circular(2),
                        border: Border.all(color: const Color(0xFF2C2A24)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.location_on, color: goldColor, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  loc['name'] ?? 'Branch Name',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            loc['address'] ?? '',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'WORKING HOURS',
                            style: TextStyle(
                              color: Colors.white30,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Monday – Sunday · 10:00 AM – 8:00 PM',
                            style: TextStyle(color: Colors.white70, fontSize: 13),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'CONTACT PHONE',
                            style: TextStyle(
                              color: Colors.white30,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            '+91 99943 90069',
                            style: TextStyle(color: Colors.white70, fontSize: 13),
                          ),
                          const SizedBox(height: 28),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                final lat = loc['latitude'] != null ? (loc['latitude'] as num).toDouble() : 12.9746823;
                                final lng = loc['longitude'] != null ? (loc['longitude'] as num).toDouble() : 80.2081747;
                                _launchMaps(lat, lng, loc['name'] ?? '');
                              },
                              icon: const Icon(Icons.directions, color: Colors.black),
                              label: const Text(
                                'GET DIRECTIONS',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: goldColor,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
