const { environment } = require("../environment");
const express = require("express");

function constructModule() {

  // return the exported object
  return {
    /**
     * @returns {import("express").Express} express app with middleware registered
     */
    createApp() {
      console.log("creating express application");
      return express();
    },

    /** register cleanup handlers
     * @param {import("http").Server} server the Server intance created by app.listen()
     *
     */
    handleProcessSignals(server) {
      console.info(
        "*".repeat(50),
        "\napp is listening on ",
        environment().port,
        "\n" + "*".repeat(50)
      );

      process.on("SIGTERM", () => {
        console.log("received SIGTERM, closing gracefully...");
        server && server.close(0);
        process.exit(0);
      });

      process.on("SIGINT", () => {
        console.log("received SIGINT, closing gracefully...");
        server && server.close();
        process.exit(0);
      });

      process.on("SIGINT", () => {
        console.log("received SIGKILL, closing gracefully...");
        server && server.close();
        process.exit(0);
      });      

      return server;
    },
  };
}

module.exports = constructModule();
