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