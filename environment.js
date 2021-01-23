const { some, isNil } = require("lodash");
const path = require("path");
const environmentChoice = {
  prod: "prod.env",
  test: "dev.env",
  dev: "dev.env",
};
const envPath = path.resolve(__dirname, "env", environmentChoice[process.env['NODE_ENV']]);
require("dotenv").config({
  path: envPath,
});

/** construct this module and return the exported object */
function constructModule() {
  const environment = {
    /** username of the db admin user */
    dbUser: process.env["dbUser"],
    /** password of the db admin user */
    dbPass: process.env["dbPass"],
    /** the database cluster */
    db: process.env["db"],
    /** the port run the server on */
    port: process.env["port"],
    /** configuration for express-session package */
    sessionSecret: process.env["sessionSecret"],
    /** the directory to the root of this project */
    baseDir: path.resolve(__dirname),
    /** the hashing algorithm used in the application */
    hashRounds: +process.env["hashRounds"],
    /** are we in development environment or production? */
    prod: /^prod$/.test(process.env["NODE_ENV"]),
    /** are we in test environment (unit/integration/e2e tests) */
    test: /^test$/.test(process.env["NODE_ENV"]),
    /** are we in development environment */
    dev: /^dev$/.test(process.env["NODE_ENV"]),
    /** the public domain of the application */
    publicDomain: process.env["publicDomain"],
  };

  if (some(environment, isNil)) {
    throw new Error("Environment not set properly");
  }

  return {
    /**
     * environment is a top secret object
     *
     * ***should NEVER be sent to the front-end***
     *
     * returns an instance of the environment
     * this instance should not be edited
     */
    environment() {
      return { ...environment };
    },
  };
}

module.exports = constructModule();
