// -----
// CONTOUR GRAPH
// -----


const CONTOURGRAPH = (function () {
    function generateContours(
        data, bandwidth, threshold, dimensions, 
        xAccessor, xScale, yAccessor, yScale) {
        return d3.contourDensity()
            .x(d => xScale(xAccessor(d)))
            .y(d => yScale(yAccessor(d)))
            .size([dimensions.ctrWidth, dimensions.ctrHeight])
            .bandwidth(bandwidth)
            .thresholds(threshold)
            (data);
    }

    function drawContourGraph(contoursData, container, options = {}) {

        // Graph initialization
        const {
            className = `contour-graph`,
        } = options;

        // Remove old contours
        container.select(`.${className}`).remove();

        // Append new contours
        const ctrContours = container.append("g")
            .attr("class", className);

        ctrContours.selectAll("path")
            .data(contoursData)
            .join("path")
            .attr("d", d3.geoPath())

        return ctrContours;
    }
    return {
        generateContours,
        drawContourGraph
    };
})();


export { CONTOURGRAPH };