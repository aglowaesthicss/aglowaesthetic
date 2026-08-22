import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../services/cache.dart';
import '../../models/offer.dart';
import 'enquiry.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({Key? key}) : super(key: key);

  @override
  _OffersScreenState createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> {
  List<Offer> _offers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCachedOffers();
    _fetchOffers();
  }

  Future<void> _loadCachedOffers() async {
    final cached = await CacheService.get('/api/content/offers', []);
    if (cached != null && cached is List) {
      setState(() {
        _offers = cached.map((o) => Offer.fromJson(o)).toList();
        if (_offers.isNotEmpty) {
          _isLoading = false;
        }
      });
    }
  }

  Future<void> _fetchOffers() async {
    try {
      final response = await ApiService.get('/api/content/offers') as List;
      setState(() {
        _offers = response.map((o) => Offer.fromJson(o)).toList();
        _isLoading = false;
      });
      await CacheService.set('/api/content/offers', response);
    } catch (e) {
      print('Failed to load offers: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final darkInk = const Color(0xFF151412);
    final goldColor = const Color(0xFFD4AF37);

    // Sort special offers first
    final specialOffers = _offers.where((o) => o.special).toList();
    final regularOffers = _offers.where((o) => !o.special).toList();
    final sortedOffers = [...specialOffers, ...regularOffers];

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: const Text(
          'SPECIAL OFFERS',
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
          : sortedOffers.isEmpty
              ? const Center(
                  child: Text(
                    'No active promotions right now.',
                    style: TextStyle(color: Colors.white55),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: sortedOffers.length,
                  itemBuilder: (context, index) {
                    final offer = sortedOffers[index];
                    return _buildOfferCard(offer, goldColor);
                  },
                ),
    );
  }

  Widget _buildOfferCard(Offer offer, Color gold) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: offer.special ? const Color(0xFF23211E) : const Color(0xFF1C1A17),
        border: Border.all(
          color: offer.special ? gold.withOpacity(0.5) : const Color(0xFF2C2A24),
          width: offer.special ? 1.5 : 1.0,
        ),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (offer.special) ...[
                Icon(Icons.star, color: gold, size: 14),
                const SizedBox(width: 6),
                Text(
                  'SPECIAL OFFER',
                  style: TextStyle(
                    color: gold,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ] else
                const Text(
                  'CAMPAIGN',
                  style: TextStyle(
                    color: Colors.white30,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            offer.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              fontFamily: 'serif',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            offer.discount,
            style: TextStyle(
              color: gold,
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            offer.description,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 13.5,
              height: 1.5,
              fontWeight: FontWeight.w300,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              if (offer.promoCode.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    border: Border.all(color: gold.withOpacity(0.5), style: BorderStyle.solid),
                    color: gold.withOpacity(0.05),
                  ),
                  child: Text(
                    offer.promoCode.toUpperCase(),
                    style: TextStyle(
                      color: gold,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ),
              const Spacer(),
              Text(
                'Valid till ${offer.endDate}',
                style: const TextStyle(
                  color: Colors.white38,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const EnquiryScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: offer.special ? gold : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              child: Text(
                'APPLY NOW',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
