class Offer {
  final String id;
  final String title;
  final bool special;
  final String discount;
  final String description;
  final String promoCode;
  final String startDate;
  final String endDate;

  Offer({
    required this.id,
    required this.title,
    required this.special,
    required this.discount,
    required this.description,
    required this.promoCode,
    required this.startDate,
    required this.endDate,
  });

  factory Offer.fromJson(Map<String, dynamic> json) {
    return Offer(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      special: json['special'] ?? false,
      discount: json['discount'] ?? '',
      description: json['description'] ?? '',
      promoCode: json['promo_code'] ?? json['promoCode'] ?? '',
      startDate: json['start_date'] ?? json['startDate'] ?? '',
      endDate: json['end_date'] ?? json['endDate'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'special': special,
      'discount': discount,
      'description': description,
      'promo_code': promoCode,
      'start_date': startDate,
      'end_date': endDate,
    };
  }
}
