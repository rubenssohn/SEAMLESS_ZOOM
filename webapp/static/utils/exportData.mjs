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
// EXPORT DATA
// -----

function exportData() {
    // Export SVG
    exportSVGDOM();
    // Export text file (timer to avoid collision)
    setTimeout(() => {
        exportTextFile();
    }, 100);
}

function exportSVGDOM() {
    // Adapted from source: https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
    // Get the SVG DOM
    const svgDOM = document.querySelector("#chart svg");
    if (!svgDOM) {
        console.error("SVG element not found inside #chart.");
        return;
    }
    // Keep the rendered styles.
    getInlineStyles(svgDOM);

    // Serialize SVG to a string
    let source = new XMLSerializer().serializeToString(svgDOM);

    // Add XML declaration at the top of the document
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    console.log(d3.selectAll(".event-circle-mean").nodes())

    // Convert svg source to URI data scheme.
    const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

    // Create a temporary download link
    const downloadLinkSVG = document.createElement("a");
    downloadLinkSVG.href = url;
    downloadLinkSVG.download = "chart.svg";
    document.body.appendChild(downloadLinkSVG);
    downloadLinkSVG.click();
    document.body.removeChild(downloadLinkSVG);
};

function getInlineStyles(svg) {
    const allElements = svg.querySelectorAll("*");
    const computedStyle = window.getComputedStyle;

    // Loop through all elements and set the inline styles
    allElements.forEach(el => {
        const style = computedStyle(el);

        el.setAttribute("fill", style.fill);
        el.setAttribute("stroke", style.stroke);
        el.setAttribute("font-size", style.fontSize);
        el.setAttribute("font-family", style.fontFamily);
        el.setAttribute("stroke-width", style.strokeWidth);
        el.setAttribute("display", style.display);
        el.setAttribute("visibility", style.visibility);

        // Don't override existing transform attributes (e.g., axis)
        if (!el.hasAttribute("transform")) {
            const transform = style.transform;
            if (transform && transform !== "none") {
                el.setAttribute("transform", transform);
            }
        }
    });
}

// Export a text file with parameters
function exportTextFile() {
    const abstractionLevel = document.getElementById("slider-abstraction-level-value")?.textContent || "NaN";
    const thresholdLevel = document.getElementById("contour-threshold-value")?.textContent || "NaN";
    const bandwidthLevel = document.getElementById("contour-bandwidth-value")?.textContent || "NaN";    

    const lines = [
        `==PARAMETERS==`,
        `Abstraction Level: ${abstractionLevel}`,
        `Threshold Level: ${thresholdLevel}`,
        `Bandwidth Level: ${bandwidthLevel}`,
    ];

    const textBlob = new Blob([lines.join("\n")], { type: 'text/plain' });

    // Create a download link
    const downloadLinkText = document.createElement("a");
    downloadLinkText.href = URL.createObjectURL(textBlob);
    downloadLinkText.download = "chart.txt";
    document.body.appendChild(downloadLinkText);
    downloadLinkText.click(); // trigger download
    document.body.removeChild(downloadLinkText);  
}

export { exportData };