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

// -----------------------------
// MAIN DRAWING FUNCTION
// -----------------------------
// == IMPORT ==
import { exportData } from './utils/exportData.mjs';
import { TIMEORDERMAP } from './views/timeOrderMap.js';

// == MAIN GRAPH DRAWING FUNCTION ==
async function draw(inputData = null) {
    // == INITIALIZATION ==
    d3.select("#chart").selectAll("*").remove();
    let csvdata = inputData;
    if (!csvdata) {
        try {
            csvdata = await d3.json('/api/get_data');
        } catch (err) {
            console.error("Failed to load default data:", err);
            return;
        }
    }
    TIMEORDERMAP(csvdata);
};

draw();

// == EXPORT GRAPH ==
// Export button
const exportButton = document.getElementById('button-export');
exportButton.addEventListener('click', () => {
  console.log("Exporting data...");
  exportData();
  console.log("Data exported successfully.");
});


// Redraw the chart with uploaded data
document.getElementById('upload-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  console.log("Uploading data...");
  const fileInput = document.getElementById('file-input');
  if (!fileInput.files.length) return;

  console.log("File selected:", fileInput.files[0].name);
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  console.log("Form data prepared for upload.");
  const response = await fetch('/api/upload_data', {
    method: 'POST',
    body: formData
  });

  console.log("Response received from server:", response.status);
  const uploadedData = await response.json();
  console.log("Server response:", uploadedData);
  draw(uploadedData); 
});

// Reset the chart with default data
const resetButton = document.getElementById('button-reset');
resetButton.addEventListener('click', () => {
  draw(null);
});