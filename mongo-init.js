db = db.getSiblingDB('task-manager');

db.createUser({
  user: 'task_user',
  pwd: 'task_password',
  roles: [
    {
      role: 'readWrite',
      db: 'task-manager',
    },
  ],
});

// Create initial collections
db.createCollection('users');
db.createCollection('tasks');

db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ owner: 1 });
