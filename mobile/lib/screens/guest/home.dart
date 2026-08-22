import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../services/cache.dart';
import '../../widgets/luxe_button.dart';
import '../../widgets/chatbot.dart';
import 'services.dart';
import 'offers.dart';
import 'location.dart';
import 'testimonials.dart';
import 'enquiry.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _aboutImage = '';
  Map<String, dynamic> _categoryCovers = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCachedData();
    _fetchFreshData();
  }

  Future<void> _loadCachedData() async {
    final cachedAbout = await CacheService.get('about_image', '');
    final cachedCovers = await CacheService.get('category_covers', {});
    setState(() {
      _aboutImage = cachedAbout;
      _categoryCovers = Map<String, dynamic>.from(cachedCovers);
      if (_aboutImage.isNotEmpty || _categoryCovers.isNotEmpty) {
        _isLoading = false;
      }
    });
  }

  Future<void> _fetchFreshData() async {
    try {
      final aboutData = await ApiService.get('/api/content/about');
      if (aboutData != null && aboutData['image_url'] != null) {
        setState(() {
          _aboutImage = aboutData['image_url'];
        });
        await CacheService.set('about_image', _aboutImage);
      }
    } catch (e) {
      print('Failed to load about image: $e');
    }

    try {
      final services = await ApiService.get('/api/content/services') as List;
      final covers = <String, String>{};
      final mapping = {
        'skin-rejuvenation': 'Advanced Facials',
        'skin-tightening': 'High Intensity Focused Ultrasound (HIFU)',
        'hair-regenerative': 'Exosome Therapy',
        'iv-nutrient-infusions': 'Skin & Wellness Drips',
        'injectables': 'Dermal Fillers',
        'lasers': 'Carbon Laser',
      };

      for (var entry in mapping.entries) {
        final match = services.firstWhere(
          (s) => s['name'] == entry.value,
          orElse: () => null,
        );
        if (match != null && match['image_url'] != null) {
          covers[entry.key] = match['image_url'];
        }
      }

      setState(() {
        _categoryCovers = covers;
        _isLoading = false;
      });
      await CacheService.set('category_covers', covers);
    } catch (e) {
      print('Failed to load service covers: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final goldColor = const Color(0xFFD4AF37);
    final darkInk = const Color(0xFF151412);
    final bgCard = const Color(0xFF23211E);

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: const Text(
          'AGLOW AESTHETICS',
          style: TextStyle(
            color: Color(0xFFD4AF37),
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 3,
          ),
        ),
        centerTitle: true,
        backgroundColor: darkInk,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.login, color: Color(0xFFD4AF37)),
            onPressed: () => Navigator.pushNamed(context, '/login'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 36),
              color: const Color(0xFF1C1A17),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Chennai's First Ever Korean Aesthetics".toUpperCase(),
                    style: TextStyle(
                      color: goldColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "The Pinnacle of\nKorean Skincare\nPrestige",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                      fontFamily: 'serif',
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: 60,
                    height: 2,
                    color: goldColor,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "Authentic skin, beauty and wellness treatments direct from South Korea, personalized for you in Chennai.",
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      height: 1.5,
                      fontWeight: FontWeight.w300,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Row(
                    children: [
                      Expanded(
                        child: LuxeButton(
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const EnquiryScreen()),
                          ),
                          text: 'Book Consultation',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: LuxeButton(
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const ServicesScreen()),
                          ),
                          text: 'Explore',
                          isPrimary: false,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Highlights
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Why Aglow".toUpperCase(),
                    style: TextStyle(
                      color: goldColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Korean Standards",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'serif',
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildHighlightCard(Icons.auto_awesome, "Authentic Korean Tech", "Advanced skincare procedures direct from Seoul.", bgCard, goldColor),
                  _buildHighlightCard(Icons.spa, "Skin, Beauty & Wellness", "Holistic treatments to look radiant from inside out.", bgCard, goldColor),
                  _buildHighlightCard(Icons.verified_user, "Clinical Precision", "Treatments executed by trained medical staff.", bgCard, goldColor),
                ],
              ),
            ),

            // About Us Banner
            Container(
              color: const Color(0xFF1C1A17),
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "About Us".toUpperCase(),
                    style: TextStyle(
                      color: goldColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "First Korean Aesthetic Clinic",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'serif',
                    ),
                  ),
                  const SizedBox(height: 20),
                  _aboutImage.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(2),
                          child: Image.network(
                            _aboutImage,
                            fit: BoxFit.cover,
                            height: 200,
                            width: double.infinity,
                          ),
                        )
                      : Container(
                          height: 200,
                          width: double.infinity,
                          color: Colors.white10,
                          child: const Icon(Icons.image, color: Colors.white30),
                        ),
                  const SizedBox(height: 16),
                  const Text(
                    "We bring you the secrets of flawless, glass-skin beauty straight from South Korea — combining advanced technology and individualized protocols in Chennai.",
                    style: TextStyle(color: Colors.white70, fontSize: 13.5, height: 1.6),
                  ),
                  const SizedBox(height: 16),
                  LuxeButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LocationScreen()),
                    ),
                    text: 'Contact & Branch Info',
                    isPrimary: false,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 120), // Spacer for Chatbot visibility
          ],
        ),
      ),
      floatingActionButton: const ChatbotWidget(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: darkInk,
        selectedItemColor: goldColor,
        unselectedItemColor: Colors.white30,
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.spa), label: 'Services'),
          BottomNavigationBarItem(icon: Icon(Icons.local_offer), label: 'Offers'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble), label: 'Stories'),
        ],
        onTap: (index) {
          if (index == 1) {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ServicesScreen()));
          } else if (index == 2) {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const OffersScreen()));
          } else if (index == 3) {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const TestimonialsScreen()));
          }
        },
      ),
    );
  }

  Widget _buildHighlightCard(IconData icon, String title, String body, Color bg, Color gold) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: gold, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  body,
                  style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
