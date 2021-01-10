const mongodb = require("mongodb");
const { environment } = require("../environment");
const MongoClient = mongodb.MongoClient;

/** @returns {Promise<mongodb.MongoClient>} */
async function connectMongo() {
  const connectionUrl = `mongodb+srv://${environment.mongoUser}:${environment.mongoPass}@cluster0.njw0u.mongodb.net/${environment.mongoDb}?retryWrites=true&w=majority`;
  return new Promise((resolve, reject) =>
    MongoClient.connect(connectionUrl, (err, client) =>
      err ? reject(err) : resolve(client)
    )
  )
    .then((client) => {
      console.log("connected to MongoDB Successfully");
      return client;
    })
    .catch((err) => {
      console.error("could not connect to MongoDB", err);
      return null;
    });
}

module.exports = { connectMongo };

class MongoManager {
  /** the MongoDB Driver Client used to connect
   * @static
   * @type {MongoClient}
   */
  static __db = null;

  /** factory to create a singleton instance of the mongo client
   * @static
   * @method
   * @returns {MongoManager} the singleton instance if it has been already instantiated
   * @returns {Promise<MongoManager>} if the instance has not been created yet
   * You should initialize this method at the bootstrap stage of your application
   */
  static getMongoManager = __createMongoManagerSingleton();

  static init = async ()=>{
    const getManager = __createMongoManagerSingleton();
    const manager$ = Promise.resolve(getManager());
    return manager$.then(manager => {MongoManager.__db = manager.client});
  }

  /**
   * @type {()=>mongodb.Db}
   */
  static db = () => {
    return this.getMongoManager().client.db();
  }

  /** @type {mongodb.MongoClient} */
  client;

  /** @param {mongodb.MongoClient} client */
  constructor(client) {
    if(!client) throw new Error("MongoManager.constructor was called, please use the factory methods");
    this.client = client;
  }
}

module.exports.MongoManager = MongoManager;

/**
 * @returns {()=>MongoManager}
 */
function __createMongoManagerSingleton() {
  let mongoCreated = false;
  let mongoManagerInst = null;
  return /** @returns {MongoManager | Promise<MongoManager>} */ function __createMongoManager() {
    if (mongoCreated) {
      return mongoManagerInst;
    }
    mongoCreated = true;
    const connectionUrl = `mongodb+srv://${environment.mongoUser}:${environment.mongoPass}@cluster0.njw0u.mongodb.net/${environment.mongoDb}?retryWrites=true&w=majority`;
    const client = new Promise((resolve, reject) =>
      MongoClient.connect(connectionUrl, {useUnifiedTopology: true}, (error, client) => {
        error ? reject(error) : resolve(client);
      })
    );
    return client
      .then((client) => (MongoManager.client = client))
      .catch((error) => {
        console.error("Could not establish connection to mongo db");
      })
      .then((client) => {
        mongoManagerInst = new MongoManager(client);
        mongoCreated = true;
        return mongoManagerInst;
      });
  };
}
