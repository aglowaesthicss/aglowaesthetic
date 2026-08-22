import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../widgets/luxe_button.dart';

class AdminPanel extends StatefulWidget {
  const AdminPanel({Key? key}) : super(key: key);

  @override
  _AdminPanelState createState() => _AdminPanelState();
}

class _AdminPanelState extends State<AdminPanel> {
  int _activeTab = 0;
  bool _isLoading = false;

  // Tab 0: LLM Settings State
  final _llmFormKey = GlobalKey<FormState>();
  String _selectedProvider = 'gemini';
  final _apiKeyController = TextEditingController();
  bool _isLlmSubmitting = false;

  // Tab 1: Access Control State
  Map<String, dynamic> _clientAccess = {'allowed_features': []};
  Map<String, dynamic> _staffAccess = {'allowed_features': []};
  bool _isAcSubmitting = false;

  // Tab 2: Feedback & Complaints Management
  List<dynamic> _reports = [];
  final _replyController = TextEditingController();
  String? _activeReplyReportId;
  bool _isReplySubmitting = false;

  final List<String> _featuresList = [
    'service_history',
    'session_tracking',
    'services',
    'offers',
    'feedback',
    'location',
    'testimonial'
  ];

  @override
  void initState() {
    super.initState();
    _fetchAdminData();
  }

  Future<void> _fetchAdminData() async {
    setState(() => _isLoading = true);
    
    try {
      // 1. Fetch LLM settings
      final llmResponse = await ApiService.get('/api/chat/settings');
      if (llmResponse != null) {
        setState(() {
          _selectedProvider = llmResponse['provider'] ?? 'gemini';
          // API key is masked in GET settings response, but we can pre-populate if configured
          if (llmResponse['configured'] == true) {
            _apiKeyController.text = llmResponse['api_key'] ?? '';
          }
        });
      }

      // 2. Fetch Access Controls
      final acResponse = await ApiService.get('/api/users/access-control') as List;
      final clientPolicy = acResponse.firstWhere((p) => p['role'] == 'client', orElse: () => null);
      final staffPolicy = acResponse.firstWhere((p) => p['role'] == 'staff', orElse: () => null);

      if (clientPolicy != null) _clientAccess = clientPolicy;
      if (staffPolicy != null) _staffAccess = staffPolicy;

      // 3. Fetch Feedbacks/Complaints
      final reportsResponse = await ApiService.get('/api/feedback') as List;
      setState(() {
        _reports = reportsResponse;
      });
    } catch (e) {
      print('Error loading admin settings: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveLlmSettings() async {
    if (!_llmFormKey.currentState!.validate()) return;
    setState(() => _isLlmSubmitting = true);

    try {
      final response = await ApiService.post('/api/chat/settings', {
        'provider': _selectedProvider,
        'api_key': _apiKeyController.text,
      });

      if (response != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('AI Chatbot settings updated successfully!')),
        );
        _fetchAdminData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() => _isLlmSubmitting = false);
    }
  }

  Future<void> _saveAccessControls() async {
    setState(() => _isAcSubmitting = true);

    try {
      await ApiService.post('/api/users/access-control', {
        'client': _clientAccess['allowed_features'],
        'staff': _staffAccess['allowed_features'],
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Role-based access permissions updated successfully!')),
      );
      _fetchAdminData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() => _isAcSubmitting = false);
    }
  }

  Future<void> _submitReportReply(String reportId) async {
    if (_replyController.text.trim().isEmpty) return;
    setState(() => _isReplySubmitting = true);

    try {
      final response = await ApiService.put('/api/feedback/$reportId/reply', {
        'reply': _replyController.text,
      });

      if (response != null) {
        _replyController.clear();
        _activeReplyReportId = null;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Reply submitted successfully!')),
        );
        _fetchAdminData();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() => _isReplySubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final goldColor = const Color(0xFFD4AF37);
    final fieldFill = const Color(0xFF23211E);
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
        // Tab Selection
        Container(
          height: 48,
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Color(0xFF2C2A24))),
          ),
          child: Row(
            children: [
              _buildTabButton(0, 'LLM Settings'),
              _buildTabButton(1, 'Permissions'),
              _buildTabButton(2, 'Client Reports'),
            ],
          ),
        ),

        Expanded(
          child: IndexedStack(
            index: _activeTab,
            children: [
              // Tab 0: LLM settings
              SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _llmFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'RAG Chatbot Configurations',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'serif'),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Choose the LLM provider for the clinic website/app floating chatbot. Ensure you input the correct API keys.',
                        style: TextStyle(color: Colors.white38, fontSize: 12.5, height: 1.4),
                      ),
                      const SizedBox(height: 28),

                      _buildLabel('Select AI Provider'),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: fieldFill,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedProvider,
                            dropdownColor: fieldFill,
                            style: const TextStyle(color: Colors.white, fontSize: 13.5),
                            icon: Icon(Icons.arrow_drop_down, color: goldColor),
                            isExpanded: true,
                            items: const [
                              DropdownMenuItem(value: 'gemini', child: Text('Google Gemini (gemini-1.5-flash)')),
                              DropdownMenuItem(value: 'openai', child: Text('OpenAI (gpt-4o-mini)')),
                              DropdownMenuItem(value: 'mistral', child: Text('Mistral AI (mistral-small-latest)')),
                              DropdownMenuItem(value: 'groq', child: Text('Groq (llama3-8b-8192)')),
                            ],
                            onChanged: (val) {
                              if (val != null) {
                                setState(() {
                                  _selectedProvider = val;
                                });
                              }
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      _buildLabel('API Key / Secret Token'),
                      TextFormField(
                        controller: _apiKeyController,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration('Enter API credential key', fieldFill),
                        validator: (val) => val == null || val.isEmpty ? 'Key is required' : null,
                      ),
                      const SizedBox(height: 36),

                      LuxeButton(
                        onPressed: _saveLlmSettings,
                        text: 'Save AI Config',
                        isLoading: _isLlmSubmitting,
                      ),
                    ],
                  ),
                ),
              ),

              // Tab 1: Access Controls (Permissions)
              SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Feature Access Permissions',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'serif'),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Control which pages and dynamic dashboard features are accessible for client and staff roles.',
                      style: TextStyle(color: Colors.white38, fontSize: 12.5, height: 1.4),
                    ),
                    const SizedBox(height: 24),

                    // Client Toggles
                    const Text(
                      'CLIENT ROLE ACCESS',
                      style: TextStyle(color: Colors.white55, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 12),
                    ..._featuresList.map((f) => _buildCheckboxRow(f, 'client', goldColor)),
                    const SizedBox(height: 32),

                    // Staff Toggles
                    const Text(
                      'STAFF ROLE ACCESS',
                      style: TextStyle(color: Colors.white55, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 12),
                    ..._featuresList.map((f) => _buildCheckboxRow(f, 'staff', goldColor)),
                    const SizedBox(height: 36),

                    LuxeButton(
                      onPressed: _saveAccessControls,
                      text: 'Update Permissions',
                      isLoading: _isAcSubmitting,
                    ),
                  ],
                ),
              ),

              // Tab 2: Feedback & Complaints Reports list
              _reports.isEmpty
                  ? const Center(
                      child: Text(
                        'No client reports recorded.',
                        style: TextStyle(color: Colors.white38),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _reports.length,
                      itemBuilder: (context, index) {
                        final r = _reports[index];
                        final type = r['type'] ?? 'feedback';
                        final msg = r['message'] ?? '';
                        final clientEmail = r['client_email'] ?? 'Unknown client';
                        final reply = r['admin_reply'] ?? '';
                        final reportId = r['id'] ?? r['_id']?.toString() ?? '';
                        final isReplying = _activeReplyReportId == reportId;

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
                                  mainAxisAlignment: MainAxisAlignment.between,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: type == 'complaint'
                                            ? Colors.redAccent.withOpacity(0.15)
                                            : Colors.green.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                      child: Text(
                                        type.toUpperCase(),
                                        style: TextStyle(
                                          color: type == 'complaint' ? Colors.redAccent : Colors.green,
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 1,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      r['created_at'] != null ? r['created_at'].toString().split(' ')[0] : '',
                                      style: const TextStyle(color: Colors.white30, fontSize: 11),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  msg,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'From: $clientEmail',
                                  style: const TextStyle(color: Colors.white38, fontSize: 11.5),
                                ),
                                
                                if (reply.isNotEmpty) ...[
                                  const SizedBox(height: 14),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    color: const Color(0xFF1C1A17),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'ADMIN REPLY:',
                                          style: TextStyle(color: goldColor, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          reply,
                                          style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                                        ),
                                      ],
                                    ),
                                  ),
                                ] else if (!isReplying) ...[
                                  const SizedBox(height: 14),
                                  OutlinedButton(
                                    onPressed: () {
                                      setState(() {
                                        _activeReplyReportId = reportId;
                                      });
                                    },
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: goldColor, width: 0.5),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
                                    ),
                                    child: Text(
                                      'WRITE REPLY',
                                      style: TextStyle(color: goldColor, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],

                                if (isReplying) ...[
                                  const SizedBox(height: 14),
                                  TextFormField(
                                    controller: _replyController,
                                    style: const TextStyle(color: Colors.white, fontSize: 13),
                                    maxLines: 2,
                                    decoration: _buildInputDecoration('Enter reply...', const Color(0xFF1C1A17)),
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      ElevatedButton(
                                        onPressed: () => _submitReportReply(reportId),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: goldColor,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(2)),
                                        ),
                                        child: _isReplySubmitting
                                            ? const SizedBox(
                                                height: 14,
                                                width: 14,
                                                child: CircularProgressIndicator(strokeWidth: 1.5, valueColor: AlwaysStoppedAnimation<Color>(Colors.black)),
                                              )
                                            : const Text('SUBMIT REPLY', style: TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold)),
                                      ),
                                      const SizedBox(width: 10),
                                      TextButton(
                                        onPressed: () {
                                          setState(() {
                                            _activeReplyReportId = null;
                                            _replyController.clear();
                                          });
                                        },
                                        child: const Text('CANCEL', style: TextStyle(color: Colors.white55, fontSize: 11)),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
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
          border: Border(
            bottom: BorderSide(
              color: isActive ? goldColor : Colors.transparent,
              width: 2,
            ),
          ),
          child: Text(
            label.toUpperCase(),
            style: TextStyle(
              color: isActive ? goldColor : Colors.white55,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCheckboxRow(String feature, String role, Color gold) {
    final policy = role == 'client' ? _clientAccess : _staffAccess;
    final List<dynamic> allowed = policy['allowed_features'] ?? [];
    final bool checked = allowed.contains(feature);

    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Checkbox(
            value: checked,
            activeColor: gold,
            onChanged: (val) {
              setState(() {
                if (val == true) {
                  allowed.add(feature);
                } else {
                  allowed.remove(feature);
                }
              });
            },
          ),
          Text(
            feature.replaceAll('_', ' '),
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: Colors.white30,
          fontSize: 9.5,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint, Color fill) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
      filled: true,
      fillColor: fill,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    );
  }
}
