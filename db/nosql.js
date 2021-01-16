const mongoose = require("mongoose");
const { environment } = require("../environment");

function constructModule() {
  // the db connection string
  const mongoUri = `mongodb+srv://${environment().dbUser}:${environment().dbPass}@cluster0.njw0u.mongodb.net/${environment().db}?retryWrites=true&w=majority`;
  let mongooseConnection = null;

  return {
    /** connect mongoose to the mongo-db database end return the result
     * @return {Promise<typeof mongoose>} */
    connectDB() {
      if(mongooseConnection) return Promise.resolve(mongooseConnection);
      return mongoose
        .connect(mongoUri, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(connection => mongooseConnection = connection)
        .then( () => mongooseConnection )
        .catch((error) => {
          console.error("could not connect to database");
          throw new Error(error);
        });
    },
  };
}

module.exports = constructModule();
