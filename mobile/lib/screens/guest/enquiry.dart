import 'package:flutter/material.dart';
import '../../services/api.dart';
import '../../widgets/luxe_button.dart';

class EnquiryScreen extends StatefulWidget {
  const EnquiryScreen({Key? key}) : super(key: key);

  @override
  _EnquiryScreenState createState() => _EnquiryScreenState();
}

class _EnquiryScreenState extends State<EnquiryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  
  String _selectedLocation = 'Aglow Aesthetics Puzhuthivakkam';
  String _selectedService = 'Advanced Facials';
  bool _isSubmitting = false;

  final List<String> _locations = [
    'Aglow Aesthetics Puzhuthivakkam',
  ];

  final List<String> _services = [
    'Medical Grade Chemical Peels',
    'Micro Needling',
    'Laser Skin Resurfacing',
    'Intense Pulsed Light',
    'Advanced Facials',
    'Derma Planing',
    'High Intensity Focused Ultrasound (HIFU)',
    'Radio Frequency',
    'RF Micro Needling',
    'Thread Lifts',
    'Exosome Therapy',
    'Scalp Micro Needling & Hair Mesotherapy',
    'Skin & Wellness Drips',
    'Botox',
    'Dermal Fillers',
    'Bio Stimulators',
    'Skin Boosters',
    'Carbon Laser',
    'Laser Hair Reduction',
  ];

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final response = await ApiService.post('/api/content/enquiry', {
        'name': _nameController.text,
        'email': _emailController.text,
        'phone': _phoneController.text,
        'location': _selectedLocation,
        'service': _selectedService,
      });

      if (response != null && response['message'] != null) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: const Color(0xFF151412),
            title: const Text('Success', style: TextStyle(color: Color(0xFFD4AF37))),
            content: const Text(
              'Your enquiry has been submitted successfully! Our clinic coordinator will contact you shortly.',
              style: TextStyle(color: Colors.white70),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Close screen
                },
                child: const Text('OK', style: TextStyle(color: Color(0xFFD4AF37))),
              )
            ],
          ),
        );
      }
    } catch (e) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF151412),
          title: const Text('Submission Failed', style: TextStyle(color: Colors.redAccent)),
          content: Text(
            'Error: ${e.toString().replaceAll('Exception: ', '')}',
            style: const TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK', style: TextStyle(color: Color(0xFFD4AF37))),
            )
          ],
        ),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final darkInk = const Color(0xFF151412);
    final goldColor = const Color(0xFFD4AF37);
    final fieldFill = const Color(0xFF23211E);

    return Scaffold(
      backgroundColor: darkInk,
      appBar: AppBar(
        title: const Text(
          'BOOK CONSULTATION',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Personalized Skincare Journey',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'serif',
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Please share your contact details and select the service you are interested in. We will reach out to confirm your booking.',
                style: TextStyle(color: Colors.white60, fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 32),

              // Full Name
              _buildLabel('Full Name'),
              TextFormField(
                controller: _nameController,
                style: const TextStyle(color: Colors.white),
                decoration: _buildInputDecoration('Enter your full name', fieldFill),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your name' : null,
              ),
              const SizedBox(height: 20),

              // Email Address
              _buildLabel('Email Address'),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white),
                decoration: _buildInputDecoration('Enter your email address', fieldFill),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter your email';
                  if (!val.contains('@') || !val.contains('.')) return 'Invalid email format';
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Phone Number
              _buildLabel('Phone Number'),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: _buildInputDecoration('Enter your phone number', fieldFill),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your phone number' : null,
              ),
              const SizedBox(height: 20),

              // Preferred Branch
              _buildLabel('Preferred Branch'),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: fieldFill,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedLocation,
                    dropdownColor: fieldFill,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    icon: Icon(Icons.arrow_drop_down, color: goldColor),
                    isExpanded: true,
                    items: _locations.map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedLocation = val;
                        });
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Desired Treatment
              _buildLabel('Desired Treatment'),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: fieldFill,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedService,
                    dropdownColor: fieldFill,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    icon: Icon(Icons.arrow_drop_down, color: goldColor),
                    isExpanded: true,
                    items: _services.map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedService = val;
                        });
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 36),

              LuxeButton(
                onPressed: _submitForm,
                text: 'Submit Request',
                isLoading: _isSubmitting,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: Colors.white30,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint, Color fill) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13.5),
      filled: true,
      fillColor: fill,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }
}
