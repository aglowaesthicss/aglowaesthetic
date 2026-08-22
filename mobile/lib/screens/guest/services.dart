import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../services/cache.dart';
import '../../models/service.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({Key? key}) : super(key: key);

  @override
  _ServicesScreenState createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  List<MedicalService> _services = [];
  bool _isLoading = true;
  final List<String> _categories = [
    'Skin Rejuvenation and Resurfacing',
    'Energy Based Skin Tightening and Lifting',
    'Hair and Regenerative Therapies',
    'IV Nutrient Infusions',
    'Injectables and Anti Aging',
    'Lasers'
  ];

  @override
  void initState() {
    super.initState();
    _loadCachedServices();
    _fetchServices();
  }

  Future<void> _loadCachedServices() async {
    final cached = await CacheService.get('/api/content/services', []);
    if (cached != null && cached is List) {
      setState(() {
        _services = cached.map((s) => MedicalService.fromJson(s)).toList();
        if (_services.isNotEmpty) {
          _isLoading = false;
        }
      });
    }
  }

  Future<void> _fetchServices() async {
    try {
      final response = await ApiService.get('/api/content/services') as List;
      setState(() {
        _services = response.map((s) => MedicalService.fromJson(s)).toList();
        _isLoading = false;
      });
      await CacheService.set('/api/content/services', response);
    } catch (e) {
      print('Failed to fetch services: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final darkInk = const Color(0xFF151412);
    final goldColor = const Color(0xFFD4AF37);

    // Group services by category
    final groupedServices = <String, List<MedicalService>>{};
    for (var cat in _categories) {
      groupedServices[cat] = _services.where((s) => s.category == cat).toList();
    }

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: const Text(
          'TREATMENTS',
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
          : _services.isEmpty
              ? const Center(
                  child: Text(
                    'No clinical treatments registered yet.',
                    style: TextStyle(color: Colors.white60, fontSize: 14),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _categories.length,
                  itemBuilder: (context, catIndex) {
                    final category = _categories[catIndex];
                    final list = groupedServices[category] ?? [];
                    if (list.isEmpty) return const SizedBox.shrink();

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Category ${catIndex + 1}".toUpperCase(),
                                style: TextStyle(
                                  color: goldColor,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                category,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'serif',
                                ),
                              ),
                              const SizedBox(height: 10),
                              Container(width: 40, height: 1.5, color: goldColor),
                            ],
                          ),
                        ),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 1,
                            mainAxisSpacing: 16,
                            childAspectRatio: 1.25,
                          ),
                          itemCount: list.length,
                          itemBuilder: (context, index) {
                            final service = list[index];
                            return _buildServiceCard(service, goldColor);
                          },
                        ),
                        const SizedBox(height: 20),
                      ],
                    );
                  },
                ),
    );
  }

  Widget _buildServiceCard(MedicalService service, Color gold) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF23211E),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: const Color(0xFF2C2A24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: service.imageUrl.isNotEmpty
                ? Image.network(
                    service.imageUrl,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  )
                : Container(
                    color: const Color(0xFF1C1A17),
                    width: double.infinity,
                    child: const Icon(Icons.spa, color: Colors.white24, size: 40),
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  service.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12.5,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'KOREAN STANDARD',
                      style: TextStyle(
                        color: gold,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                    Text(
                      service.price != null ? '₹${service.price!.toStringAsFixed(0)}' : 'Pricing on Consult',
                      style: TextStyle(
                        color: service.price != null ? Colors.white : Colors.white54,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        fontStyle: service.price != null ? FontStyle.normal : FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
