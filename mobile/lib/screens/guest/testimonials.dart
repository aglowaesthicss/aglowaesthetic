import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../services/cache.dart';
import '../../models/testimonial.dart';

class TestimonialsScreen extends StatefulWidget {
  const TestimonialsScreen({Key? key}) : super(key: key);

  @override
  _TestimonialsScreenState createState() => _TestimonialsScreenState();
}

class _TestimonialsScreenState extends State<TestimonialsScreen> {
  List<Testimonial> _testimonials = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCachedTestimonials();
    _fetchTestimonials();
  }

  Future<void> _loadCachedTestimonials() async {
    final cached = await CacheService.get('/api/content/testimonials', []);
    if (cached != null && cached is List) {
      setState(() {
        _testimonials = cached.map((t) => Testimonial.fromJson(t)).toList();
        if (_testimonials.isNotEmpty) {
          _isLoading = false;
        }
      });
    }
  }

  Future<void> _fetchTestimonials() async {
    try {
      final response = await ApiService.get('/api/content/testimonials') as List;
      setState(() {
        _testimonials = response.map((t) => Testimonial.fromJson(t)).toList();
        _isLoading = false;
      });
      await CacheService.set('/api/content/testimonials', response);
    } catch (e) {
      print('Failed to load testimonials: $e');
      setState(() {
        _isLoading = false;
      });
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
          'CLIENT STORIES',
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
          : _testimonials.isEmpty
              ? const Center(
                  child: Text(
                    'No client stories posted yet.',
                    style: TextStyle(color: Colors.white55),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _testimonials.length,
                  itemBuilder: (context, index) {
                    final t = _testimonials[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Icon(
                                t.type == 'instagram'
                                    ? Icons.camera_alt
                                    : t.type == 'youtube'
                                        ? Icons.video_library
                                        : Icons.format_quote,
                                color: goldColor,
                                size: 24,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (t.imageUrl.isNotEmpty) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(2),
                              child: Image.network(
                                t.imageUrl,
                                height: 180,
                                width: double.infinity,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          if (t.quote.isNotEmpty)
                            Text(
                              '“${t.quote}”',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontStyle: FontStyle.italic,
                                height: 1.5,
                                fontWeight: FontWeight.w300,
                              ),
                            ),
                          const SizedBox(height: 16),
                          Container(
                            height: 1,
                            color: const Color(0xFF2C2A24),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            t.treatment.isNotEmpty
                                ? '${t.author.toUpperCase()} · ${t.treatment.toUpperCase()}'
                                : t.author.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white38,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
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
