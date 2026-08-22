import 'package:flutter/material.dart';
import '../services/api.dart';

class ChatbotWidget extends StatefulWidget {
  const ChatbotWidget({Key? key}) : super(key: key);

  @override
  _ChatbotWidgetState createState() => _ChatbotWidgetState();
}

class _ChatbotWidgetState extends State<ChatbotWidget> {
  bool _isOpen = false;
  final List<Map<String, String>> _messages = [
    {
      'role': 'assistant',
      'content': 'Hello! Welcome to Aglow Aesthetics. I am your Korean Skincare Assistant. Ask me anything about our clinical treatments, current offers, or branch locations!'
    }
  ];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isTyping = true;
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final history = _messages.sublist(1, _messages.length - 1).map((m) => {
        'role': m['role'],
        'content': m['content'],
      }).toList();

      final response = await ApiService.post('/api/chat', {
        'message': text,
        'history': history,
      });

      if (response != null && response['reply'] != null) {
        setState(() {
          _messages.add({'role': 'assistant', 'content': response['reply']});
        });
      }
    } catch (e) {
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': 'Sorry, I am having trouble connecting to the server. Please check your connection.'
        });
      });
    } finally {
      setState(() {
        _isTyping = false;
      });
      _scrollToBottom();
    }
  }

  void _openChatSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              decoration: const BoxDecoration(
                color: Color(0xFF151412),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                border: Border(
                  top: BorderSide(color: Color(0xFFD4AF37), width: 1.5),
                ),
              ),
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFF2C2A24)),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF2C2A24),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Icon(
                                Icons.auto_awesome,
                                color: Color(0xFFD4AF37),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Aglow GlowBot',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Korean Skincare AI Assistant',
                                  style: TextStyle(
                                    color: Color(0xFF8E8C82),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white70),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                  
                  // Messages list
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final msg = _messages[index];
                        final isUser = msg['role'] == 'user';
                        return Align(
                          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.75,
                            ),
                            decoration: BoxDecoration(
                              color: isUser ? const Color(0xFFD4AF37) : const Color(0xFF23211E),
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(12),
                                topRight: const Radius.circular(12),
                                bottomLeft: isUser ? const Radius.circular(12) : const Radius.circular(0),
                                bottomRight: isUser ? const Radius.circular(0) : const Radius.circular(12),
                              ),
                            ),
                            child: Text(
                              msg['content'] ?? '',
                              style: TextStyle(
                                color: isUser ? Colors.black : Colors.white,
                                fontSize: 13.5,
                                height: 1.4,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Typing indicator
                  if (_isTyping)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          'GlowBot is thinking...',
                          style: TextStyle(
                            color: Color(0xFF8E8C82),
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ),

                  // Quick Action Chips
                  Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: [
                        _buildQuickActionChip(context, 'Explore Treatments', setModalState),
                        _buildQuickActionChip(context, 'Current Special Offers', setModalState),
                        _buildQuickActionChip(context, 'Branch & Hours', setModalState),
                        _buildQuickActionChip(context, 'Book Consultation', setModalState),
                      ],
                    ),
                  ),

                  // Message Input
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Color(0xFF2C2A24)),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Ask about glass skin treatments...',
                              hintStyle: const TextStyle(color: Colors.white30, fontSize: 13.5),
                              filled: true,
                              fillColor: const Color(0xFF23211E),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24),
                                borderSide: BorderSide.none,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            final text = _controller.text;
                            if (text.trim().isNotEmpty) {
                              _sendMessage(text).then((_) => setModalState(() {}));
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: const BoxDecoration(
                              color: Color(0xFFD4AF37),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.send,
                              color: Colors.black,
                              size: 18,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildQuickActionChip(BuildContext context, String text, StateSetter setModalState) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(
          text,
          style: const TextStyle(color: Color(0xFFD4AF37), fontSize: 11, fontWeight: FontWeight.w600),
        ),
        backgroundColor: const Color(0xFF23211E),
        side: const BorderSide(color: Color(0xFFD4AF37), width: 0.5),
        onPressed: () {
          _sendMessage(text).then((_) => setModalState(() {}));
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () => _openChatSheet(context),
      backgroundColor: const Color(0xFF151412),
      foregroundColor: const Color(0xFFD4AF37),
      shape: CircleBorder(
        side: const BorderSide(color: Color(0xFFD4AF37), width: 1.5),
      ),
      child: const Icon(Icons.auto_awesome, size: 24),
    );
  }
}
