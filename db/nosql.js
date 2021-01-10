const { builtinModules } = require("module");
const mongoose = require("mongoose");
const { environment } = require("../environment");

module.exports.connectDB = /** @return {typeof mongoose} */function connectDB() {
  const mongoUri = `mongodb+srv://${environment.mongoUser}:${environment.mongoPass}@cluster0.njw0u.mongodb.net/${environment.mongoDb}?retryWrites=true&w=majority`;
  return mongoose.connect(mongoUri, {useUnifiedTopology: true, useNewUrlParser: true}).catch((error) => {
    console.error(error);
    return null;
  });
};
