class UserProfile {
  final String id;
  final String email;
  final String name;
  final String role; // 'master_admin', 'staff', 'client'
  final String mobileNo;
  final int age;
  final String location;
  final String clientId;

  UserProfile({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.mobileNo,
    required this.age,
    required this.location,
    required this.clientId,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? json['_id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'client',
      mobileNo: json['mobile_no'] ?? '',
      age: json['age'] ?? 0,
      location: json['location'] ?? '',
      clientId: json['client_id'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'mobile_no': mobileNo,
      'age': age,
      'location': location,
      'client_id': clientId,
    };
  }
}
