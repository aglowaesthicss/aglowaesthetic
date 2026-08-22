import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../services/api.dart';
import '../../widgets/luxe_button.dart';

class ClientPanel extends StatefulWidget {
  const ClientPanel({Key? key}) : super(key: key);

  @override
  _ClientPanelState createState() => _ClientPanelState();
}

class _ClientPanelState extends State<ClientPanel> {
  int _activeTab = 0;
  List<dynamic> _sessions = [];
  List<dynamic> _histories = [];
  bool _isLoading = true;
  
  // Feedback form state
  final _formKey = GlobalKey<FormState>();
  final _feedbackController = TextEditingController();
  String _selectedType = 'feedback'; // 'feedback' or 'complaint'
  bool _isFeedbackSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadClientData();
  }

  Future<void> _loadClientData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Fetch active treatment sessions
      final sessResponse = await ApiService.get('/api/records/sessions/my');
      // Fetch treatment histories
      final histResponse = await ApiService.get('/api/records/histories/my');

      setState(() {
        _sessions = sessResponse as List;
        _histories = histResponse as List;
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching client data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _submitFeedback() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isFeedbackSubmitting = true;
    });

    try {
      final response = await ApiService.post('/api/feedback', {
        'type': _selectedType,
        'message': _feedbackController.text,
      });

      if (response != null) {
        _feedbackController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Feedback submitted successfully! Thank you.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() {
        _isFeedbackSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final goldColor = const Color(0xFFD4AF37);
    final bgCard = const Color(0xFF23211E);

    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
        ),
      );
    }

    return Column(
      children: [
        // Tabs Selector
        Container(
          height: 48,
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Color(0xFF2C2A24))),
          ),
          child: Row(
            children: [
              _buildTabButton(0, 'Sessions'),
              _buildTabButton(1, 'Histories'),
              _buildTabButton(2, 'Report'),
            ],
          ),
        ),
        
        // Tab Content
        Expanded(
          child: IndexedStack(
            index: _activeTab,
            children: [
              // Tab 0: Active Sessions
              _sessions.isEmpty
                  ? const Center(
                      child: Text(
                        'No upcoming treatment sessions scheduled.',
                        style: TextStyle(color: Colors.white38),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _sessions.length,
                      itemBuilder: (context, index) {
                        final s = _sessions[index];
                        final dateStr = s['date'] ?? 'No Date';
                        final timeStr = s['time'] ?? 'No Time';
                        return Card(
                          color: bgCard,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(2),
                            side: const BorderSide(color: Color(0xFF2C2A24)),
                          ),
                          child: ListTile(
                            leading: Icon(Icons.calendar_month, color: goldColor),
                            title: Text(
                              s['service_name'] ?? 'Session Treatment',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              'Appointment: $dateStr @ $timeStr',
                              style: const TextStyle(color: Colors.white70),
                            ),
                            trailing: s['reminder_sent'] == true
                                ? const Icon(Icons.notifications_active, color: Colors.green, size: 18)
                                : const Icon(Icons.notifications, color: Colors.white30, size: 18),
                          ),
                        );
                      },
                    ),

              // Tab 1: Service Histories
              _histories.isEmpty
                  ? const Center(
                      child: Text(
                        'No completed treatments recorded.',
                        style: TextStyle(color: Colors.white38),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _histories.length,
                      itemBuilder: (context, index) {
                        final h = _histories[index];
                        final date = h['date'] ?? '';
                        final price = h['price'] != null ? (h['price'] as num).toDouble() : 0.0;
                        final docUrl = h['document_url'] ?? '';

                        return Card(
                          color: bgCard,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(2),
                            side: const BorderSide(color: Color(0xFF2C2A24)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      h['service_name'] ?? 'Completed Treatment',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '₹${price.toStringAsFixed(0)}',
                                      style: TextStyle(color: goldColor, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Treatment Date: $date',
                                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                                ),
                                if (h['comments'] != null && (h['comments'] as String).isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  Text(
                                    h['comments'],
                                    style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                                  ),
                                ],
                                if (docUrl.isNotEmpty) ...[
                                  const SizedBox(height: 16),
                                  SizedBox(
                                    height: 36,
                                    width: double.infinity,
                                    child: OutlinedButton.icon(
                                      onPressed: () async {
                                        final uri = Uri.parse(docUrl);
                                        if (await canLaunchUrl(uri)) {
                                          await launchUrl(uri, mode: LaunchMode.externalApplication);
                                        }
                                      },
                                      icon: Icon(Icons.receipt_long, color: goldColor, size: 16),
                                      label: Text(
                                        'VIEW DIGITAL INVOICE',
                                        style: TextStyle(color: goldColor, fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        side: BorderSide(color: goldColor, width: 0.5),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),

              // Tab 2: Feedback & Report Log
              SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Report Feedback / Complaints',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'serif'),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Let our administration know about your experience, or submit a complaint if something went wrong.',
                        style: TextStyle(color: Colors.white38, fontSize: 12.5, height: 1.4),
                      ),
                      const SizedBox(height: 24),

                      Row(
                        children: [
                          Radio<String>(
                            value: 'feedback',
                            groupValue: _selectedType,
                            activeColor: goldColor,
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedType = val);
                            },
                          ),
                          const Text('Feedback', style: TextStyle(color: Colors.white70)),
                          const SizedBox(width: 24),
                          Radio<String>(
                            value: 'complaint',
                            groupValue: _selectedType,
                            activeColor: goldColor,
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedType = val);
                            },
                          ),
                          const Text('Complaint', style: TextStyle(color: Colors.white70)),
                        ],
                      ),
                      const SizedBox(height: 20),

                      TextFormField(
                        controller: _feedbackController,
                        maxLines: 5,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: _selectedType == 'feedback'
                              ? 'Write your feedback or review...'
                              : 'Detail your issue/complaint here...',
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
                          filled: true,
                          fillColor: const Color(0xFF23211E),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(4),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a message' : null,
                      ),
                      const SizedBox(height: 28),

                      LuxeButton(
                        onPressed: _submitFeedback,
                        text: 'Submit Report',
                        isLoading: _isFeedbackSubmitting,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildTabButton(int index, String label) {
    final goldColor = const Color(0xFFD4AF37);
    final isActive = _activeTab == index;

    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _activeTab = index),
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isActive ? goldColor : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Text(
            label.toUpperCase(),
            style: TextStyle(
              color: isActive ? goldColor : Colors.white54,
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
        ),
      ),
    );
  }
}
