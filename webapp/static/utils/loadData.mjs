/*
SEAMLESS_ZOOM — A technique for seamless zooming between process models and process instances.
Copyright (C) 2025  Christoffer Rubensson

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Website: https://hu-berlin.de/rubensson
E-Mail: {firstname.lastname}@hu-berlin.de
*/

// -----
// MODULES FOR IMPORTING/EXPORTING DATA
// -----
async function loadData(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
  
    switch (ext) {
      case "csv":
        return await d3.csv(fileName);
      //case "json":
      //  return await d3.json(fileName);
      default:
        throw new Error(`Unsupported file type: .${ext}`);
    };
};

async function loadDataFromServer(endpoint) {
  const ext = endpoint.split('.').pop().toLowerCase();

  switch (ext) {
    //case "csv":
    case "json":
      return await d3.json(endpoint);
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  };
};

export { loadData, loadDataFromServer };