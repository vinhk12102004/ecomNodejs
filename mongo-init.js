// MongoDB initialization script
// This script creates the admin user if it doesn't exist
db = db.getSiblingDB('admin');

// Check if user already exists
var user = db.getUser('vinhtrong04');
if (!user) {
  // Create admin user
  db.createUser({
    user: 'vinhtrong04',
    pwd: 'Vinh1204',
    roles: [
      { role: 'root', db: 'admin' }
    ]
  });
  print('User vinhtrong04 created successfully');
} else {
  print('User vinhtrong04 already exists');
}

// Switch to ecommerce database
db = db.getSiblingDB('ecommerce');
print('Switched to ecommerce database');

