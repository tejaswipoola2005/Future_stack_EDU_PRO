db = db.getSiblingDB('admin');

// Create the admin user
db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'quizmaker'
    },
    {
      role: 'dbAdmin',
      db: 'quizmaker'
    }
  ]
});

// Switch to quizmaker database and create collections
db = db.getSiblingDB('quizmaker');
db.createCollection('quizzes');
db.createCollection('users');

print('Database and user created successfully');
