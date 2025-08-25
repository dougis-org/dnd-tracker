require('dotenv').config();

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: process.env.MONGODB_DB_NAME,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  migrationsPath: './migrations',
  templatePath: './migrations/template.js',
  collectionName: 'migrations',
  autosync: true
};
