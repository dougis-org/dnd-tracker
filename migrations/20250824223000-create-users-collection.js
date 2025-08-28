// Migration for new package: receives 'db' (MongoDB Database instance)
module.exports.up = async function (db) {
  await db.createCollection('users');
  await db.collection('users').createIndex({ clerkId: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 });
  // Add more indexes as needed based on schema requirements
};

module.exports.down = async function (db) {
  await db.dropCollection('users');
};
