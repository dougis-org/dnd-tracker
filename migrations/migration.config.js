// Migration config for @mongoosejs/migrations
module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd-tracker',
    databaseName: 'dnd-tracker',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: __dirname,
  // Optionally, you can add more config here
};
