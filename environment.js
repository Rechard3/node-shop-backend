const { some, isNil } = require("lodash");
const path = require("path");
require("dotenv").config({
  path: process.env['dev'] ? "./env/dev.env" : "./env/prod.env",
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
    sessionSecret: process.env['sessionSecret'],
    /** the directory to the root of this project */
    baseDir: path.resolve(__dirname),
    /** the hashing algorithm used in the application */
    hashRounds: +process.env['hashRounds'],
    /** are we in development environment or production? */
    prod: (+process.env['dev'])==0,
    /** the public domain of the application */
    publicDomain: process.env['publicDomain'],
  };

  if( some(environment, isNil) ){
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
