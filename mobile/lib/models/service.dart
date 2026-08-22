class MedicalService {
  final String id;
  final String name;
  final String category;
  final String description;
  final String imageUrl;
  final double? price;

  MedicalService({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.imageUrl,
    this.price,
  });

  factory MedicalService.fromJson(Map<String, dynamic> json) {
    return MedicalService(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? 'Skin Rejuvenation and Resurfacing',
      description: json['description'] ?? '',
      imageUrl: json['image_url'] ?? '',
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'description': description,
      'image_url': imageUrl,
      'price': price,
    };
  }
}
