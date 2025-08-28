// Migration for new package: receives 'db' (MongoDB Database instance)
module.exports.up = async function (db) {
  await db.createCollection('characters');
  await db.collection('characters').createIndex({ userId: 1 });
  await db.collection('characters').createIndex({ name: 1 });
  // Add more indexes as needed based on schema requirements
};

module.exports.down = async function (db) {
  await db.dropCollection('characters');
};
