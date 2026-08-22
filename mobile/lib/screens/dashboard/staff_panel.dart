import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../widgets/luxe_button.dart';

class StaffPanel extends StatefulWidget {
  const StaffPanel({Key? key}) : super(key: key);

  @override
  _StaffPanelState createState() => _StaffPanelState();
}

class _StaffPanelState extends State<StaffPanel> {
  int _activeTab = 0;
  bool _isLoading = false;

  // Tab 0: Client Registration Form
  final _regFormKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _ageController = TextEditingController();
  final _locController = TextEditingController();
  bool _isRegSubmitting = false;

  // Tab 1: Schedule Session Form
  final _schFormKey = GlobalKey<FormState>();
  List<dynamic> _clients = [];
  List<dynamic> _services = [];
  String? _selectedClientId;
  String? _selectedServiceName;
  final _dateController = TextEditingController();
  final _timeController = TextEditingController();
  bool _isSchSubmitting = false;

  // Tab 2: Log History Form
  final _logFormKey = GlobalKey<FormState>();
  String? _logClientId;
  String? _logServiceName;
  final _logPriceController = TextEditingController();
  final _logDateController = TextEditingController();
  final _logCommentsController = TextEditingController();
  bool _isLogSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchLists();
  }

  Future<void> _fetchLists() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final clientsList = await ApiService.get('/api/users/clients') as List;
      final servicesList = await ApiService.get('/api/content/services') as List;

      setState(() {
        _clients = clientsList;
        _services = servicesList;
        if (_clients.isNotEmpty) {
          _selectedClientId = _clients[0]['id'];
          _logClientId = _clients[0]['id'];
        }
        if (_services.isNotEmpty) {
          _selectedServiceName = _services[0]['name'];
          _logServiceName = _services[0]['name'];
        }
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching dropdown values: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _registerClient() async {
    if (!_regFormKey.currentState!.validate()) return;
    setState(() => _isRegSubmitting = true);

    try {
      final response = await ApiService.post('/api/users/clients', {
        'email': _emailController.text.trim(),
        'name': _nameController.text.trim(),
        'mobile_no': _mobileController.text.trim(),
        'age': int.tryParse(_ageController.text) ?? 0,
        'location': _locController.text.trim(),
      });

      if (response != null) {
        _emailController.clear();
        _nameController.clear();
        _mobileController.clear();
        _ageController.clear();
        _locController.clear();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Client registered successfully! Login credential email sent.')),
        );
        _fetchLists();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() => _isRegSubmitting = false);
    }
  }

  Future<void> _scheduleSession() async {
    if (!_schFormKey.currentState!.validate() || _selectedClientId == null || _selectedServiceName == null) return;
    setState(() => _isSchSubmitting = true);

    try {
      final response = await ApiService.post('/api/records/sessions', {
        'client_id': _selectedClientId,
        'service_name': _selectedServiceName,
        'date': _dateController.text.trim(),
        'time': _timeController.text.trim(),
      });

      if (response != null) {
        _dateController.clear();
        _timeController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Treatment session scheduled successfully!')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() => _isSchSubmitting = false);
    }
  }

  Future<void> _logHistory() async {
    if (!_logFormKey.currentState!.validate() || _logClientId == null || _logServiceName == null) return;
    setState(() => _isLogSubmitting = true);

    try {
      final response = await ApiService.post('/api/records/histories', {
        'client_id': _logClientId,
        'service_name': _logServiceName,
        'price': double.tryParse(_logPriceController.text) ?? 0.0,
        'date': _logDateController.text.trim(),
        'comments': _logCommentsController.text.trim(),
        'document_url': '', // Attachments can be uploaded from web dashboard
      });

      if (response != null) {
        _logPriceController.clear();
        _logDateController.clear();
        _logCommentsController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Treatment logged successfully!')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: ${e.toString().replaceAll('Exception: ', '')}')),
      );
    } finally {
      setState(() => _isLogSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final goldColor = const Color(0xFFD4AF37);
    final fieldFill = const Color(0xFF23211E);

    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
        ),
      );
    }

    return Column(
      children: [
        // Tabs
        Container(
          height: 48,
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Color(0xFF2C2A24))),
          ),
          child: Row(
            children: [
              _buildTabButton(0, 'Add Client'),
              _buildTabButton(1, 'Book Session'),
              _buildTabButton(2, 'Log Treatment'),
            ],
          ),
        ),

        // Forms
        Expanded(
          child: IndexedStack(
            index: _activeTab,
            children: [
              // Tab 0: Client Registration Form
              SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _regFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Register New Client Account',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'serif'),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Password is automatically generated using the last 5 digits of their mobile number. Credentials will be emailed automatically via Resend.',
                        style: TextStyle(color: Colors.white38, fontSize: 12.5, height: 1.4),
                      ),
                      const SizedBox(height: 24),

                      _buildLabel('Full Name'),
                      TextFormField(
                        controller: _nameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration('Enter client name', fieldFill),
                        validator: (val) => val == null || val.isEmpty ? 'Enter name' : null,
                      ),
                      const SizedBox(height: 16),

                      _buildLabel('Email Address'),
                      TextFormField(
                        controller: _emailController,
                        style: const TextStyle(color: Colors.white),
                        keyboardType: TextInputType.emailAddress,
                        decoration: _buildInputDecoration('Enter client email address', fieldFill),
                        validator: (val) => val == null || !val.contains('@') ? 'Enter valid email' : null,
                      ),
                      const SizedBox(height: 16),

                      _buildLabel('Mobile Number'),
                      TextFormField(
                        controller: _mobileController,
                        style: const TextStyle(color: Colors.white),
                        keyboardType: TextInputType.phone,
                        decoration: _buildInputDecoration('Enter client mobile number', fieldFill),
                        validator: (val) => val == null || val.length < 5 ? 'Enter valid mobile' : null,
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Age'),
                                TextFormField(
                                  controller: _ageController,
                                  style: const TextStyle(color: Colors.white),
                                  keyboardType: TextInputType.number,
                                  decoration: _buildInputDecoration('Age', fieldFill),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Location'),
                                TextFormField(
                                  controller: _locController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: _buildInputDecoration('City (e.g. Chennai)', fieldFill),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      LuxeButton(
                        onPressed: _registerClient,
                        text: 'Register Client',
                        isLoading: _isRegSubmitting,
                      ),
                    ],
                  ),
                ),
              ),

              // Tab 1: Book Session Form
              SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _schFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Schedule Slotted Appointment',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'serif'),
                      ),
                      const SizedBox(height: 24),

                      _buildLabel('Select Registered Client'),
                      _buildDropdown(_selectedClientId, _clients, (val) {
                        setState(() => _selectedClientId = val);
                      }, isClient: true, fill: fieldFill, gold: goldColor),
                      const SizedBox(height: 20),

                      _buildLabel('Select Skincare Treatment'),
                      _buildDropdown(_selectedServiceName, _services, (val) {
                        setState(() => _selectedServiceName = val);
                      }, isClient: false, fill: fieldFill, gold: goldColor),
                      const SizedBox(height: 20),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Appointment Date'),
                                TextFormField(
                                  controller: _dateController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: _buildInputDecoration('YYYY-MM-DD', fieldFill),
                                  validator: (val) => val == null || val.isEmpty ? 'Enter date' : null,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Start Time Slot'),
                                TextFormField(
                                  controller: _timeController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: _buildInputDecoration('HH:MM AM/PM', fieldFill),
                                  validator: (val) => val == null || val.isEmpty ? 'Enter time' : null,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 36),

                      LuxeButton(
                        onPressed: _scheduleSession,
                        text: 'Schedule Session',
                        isLoading: _isSchSubmitting,
                      ),
                    ],
                  ),
                ),
              ),

              // Tab 2: Log History Form
              SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _logFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Log Completed Treatment Record',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'serif'),
                      ),
                      const SizedBox(height: 24),

                      _buildLabel('Select Client'),
                      _buildDropdown(_logClientId, _clients, (val) {
                        setState(() => _logClientId = val);
                      }, isClient: true, fill: fieldFill, gold: goldColor),
                      const SizedBox(height: 20),

                      _buildLabel('Select Treatment'),
                      _buildDropdown(_logServiceName, _services, (val) {
                        setState(() => _logServiceName = val);
                      }, isClient: false, fill: fieldFill, gold: goldColor),
                      const SizedBox(height: 20),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Treatment Date'),
                                TextFormField(
                                  controller: _logDateController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: _buildInputDecoration('YYYY-MM-DD', fieldFill),
                                  validator: (val) => val == null || val.isEmpty ? 'Enter date' : null,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildLabel('Charged Price (₹)'),
                                TextFormField(
                                  controller: _logPriceController,
                                  style: const TextStyle(color: Colors.white),
                                  keyboardType: TextInputType.number,
                                  decoration: _buildInputDecoration('Price in ₹', fieldFill),
                                  validator: (val) => val == null || val.isEmpty ? 'Enter price' : null,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      _buildLabel('Optional Treatment Comments'),
                      TextFormField(
                        controller: _logCommentsController,
                        maxLines: 3,
                        style: const TextStyle(color: Colors.white),
                        decoration: _buildInputDecoration('Enter comments or notes about the session results...', fieldFill),
                      ),
                      const SizedBox(height: 36),

                      LuxeButton(
                        onPressed: _logHistory,
                        text: 'Log Treatment',
                        isLoading: _isLogSubmitting,
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
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ),
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

  Widget _buildDropdown(
    String? currentValue,
    List<dynamic> list,
    void Function(String?) onChanged, {
    required bool isClient,
    required Color fill,
    required Color gold,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(4),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: currentValue,
          dropdownColor: fill,
          style: const TextStyle(color: Colors.white, fontSize: 13.5),
          icon: Icon(Icons.arrow_drop_down, color: gold),
          isExpanded: true,
          onChanged: onChanged,
          items: list.map<DropdownMenuItem<String>>((dynamic item) {
            final id = isClient ? item['id'] : item['name'];
            final name = isClient ? '${item['name']} (${item['mobile_no']})' : item['name'];
            return DropdownMenuItem<String>(
              value: id,
              child: Text(name),
            );
          }).toList(),
        ),
      ),
    );
  }
}
