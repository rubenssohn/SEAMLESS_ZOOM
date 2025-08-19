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