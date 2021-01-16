const fs = require("fs");

function moduleContructor() {
  const programBanner = `
    Osada Shoply Copyright (C) 2021  Omar Abu Saada <omarabusaada93@gmail.com>

    This program comes with ABSOLUTELY NO WARRANTY; for details type 'node ./app.js l'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type 'node ./app.js license' for details.
    `;

  const licenseShort = `
    Osada Shoply is a small experiment to learn MEAN stack. this is the backend module
    Copyright (C) 2021 Omar Abu Saada <omarabusaada93@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.`

  const licenseLong = fs.readFileSync("./LICENSE").toString();

  if (process.argv[2] && process.argv[2] == "l") {
    console.log(licenseShort);
    process.exit();
  }

  if(process.argv[2] && process.argv[2] == "license"){
    console.log(licenseLong);
    process.exit();
  }
  console.log(programBanner);

  return null;
}

module.exports = moduleContructor();
