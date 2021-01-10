const path = require("path");

const PathUtils = {
    /** @param {string[]} path */
    fromBaseDir(...filePath){
        return path.join(path.dirname(require.main.filename), ...filePath);
    },
}

module.exports = PathUtils;