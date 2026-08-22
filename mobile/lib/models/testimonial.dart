class Testimonial {
  final String id;
  final String type; // 'text', 'instagram', 'youtube'
  final String author;
  final String treatment;
  final String quote;
  final String url;
  final String imageUrl;

  Testimonial({
    required this.id,
    required this.type,
    required this.author,
    required this.treatment,
    required this.quote,
    required this.url,
    required this.imageUrl,
  });

  factory Testimonial.fromJson(Map<String, dynamic> json) {
    return Testimonial(
      id: json['id'] ?? json['_id'] ?? '',
      type: json['type'] ?? 'text',
      author: json['author'] ?? '',
      treatment: json['treatment'] ?? '',
      quote: json['quote'] ?? json['text'] ?? '',
      url: json['url'] ?? json['content_url'] ?? '',
      imageUrl: json['image_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'author': author,
      'treatment': treatment,
      'quote': quote,
      'url': url,
      'image_url': imageUrl,
    };
  }
}
