const mongoose = require("mongoose");
const { environment } = require("../environment");

function constructModule() {
  // the db connection string
  let mongoServer = null;
  /** @type {import("mongoose").Mongoose} */
  let mongooseConnection = null;
  /** @type {Promise<import("mongoose").Mongoose>} */
  let $mongooseConnection = new Promise(()=>{});
  let connectionPending = false;

  return {
    /** connect mongoose to the mongo-db database end return the result
     * @async
     * @param {import("express").Express} app
     * @return {Promise<import("mongoose").Mongoose>}
     */
    connectDB(app) {
      /** if connection has already been made, just return it */
      if (mongooseConnection) return Promise.resolve(mongooseConnection);
      if (connectionPending) return $mongooseConnection;

      console.info("connecting mongoose to MongoDB...");
      if (environment().test) {
        // spin in memory db only in test environment
        $mongooseConnection = inMemoryDatabase();
      } else {
        // connect to actual db
        $mongooseConnection = atlasDatabase();
      }
      connectionPending = true;

      return $mongooseConnection
        .then((connection) => {
          mongooseConnection = connection;
          connectionPending = false;
          return connection;
        })
        .catch((error) => {
          console.error("could not connect to database");
          throw error;
        });
    },
  };

  /** spin-up an in-memory mongodb, and connect mongoose to it */
  function inMemoryDatabase() {
    console.info("test environment detected, using in-memory database");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const db = new MongoMemoryServer({});
    return db.getUri().then((uri) =>
      mongoose.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
    );
  }

  /** connect mongoose to the atlas-cloud mongodb as configured in the environment*/
  function atlasDatabase() {
    const { dbUser, dbPass, db } = environment();
    const mongoUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.njw0u.mongodb.net/${db}?retryWrites=true&w=majority`;

    return mongoose.connect(mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  }
}

module.exports = constructModule();
