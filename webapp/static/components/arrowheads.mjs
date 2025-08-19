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
// ARROW HEAD DRAWING
// -----

function defineArrowHeads(svg, options = {}) {
    // Initialization
    const {
        // Names for arrowheads upwards
        classIdArrowHeadUp = "arrowhead-up",
        classNameArrowHeadUpMarker = "arrowhead-marker-up",
        classNameArrowHeadUpShape = "arrowhead-shape-up",
        // Names for arrowheads downwards
        classIdArrowHeadDown = "arrowhead-down",
        classNameArrowHeadDownMarker = "arrowhead-marker-down",
        classNameArrowHeadDownShape = "arrowhead-shape-down",
        // Sizes
        markerBoxWidth = 10,
        matchBoxHeight = 10,
        markerWidth = 7,
        markerHeight = 7,
        // Positions
        refXarrow = 15,
        refYarrow = 5,
    } = options;

    // Create marker points for arrowheads
    const defs = svg.append("defs");

    // Up arrows
    defs.append("marker")
        .attr("id", classIdArrowHeadUp)
        .attr("class", classNameArrowHeadUpMarker)
        .attr("viewBox", [0, 0, markerBoxWidth, matchBoxHeight]) // (x1,x2) top-left corner starts, (x3, x4) width and height of marker's viewbox
        .attr("refX", refXarrow)
        .attr("refY", refYarrow)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .attr("markerUnits", "userSpaceOnUse")
        .append('path')
        .attr("d", "M0,0 L10,5 L0,10 L2,5 Z")
        .attr("class", classNameArrowHeadUpShape);

    // Down arrows
    defs.append("marker")
        .attr("id", classIdArrowHeadDown)
        .attr("class", classNameArrowHeadDownMarker)
        .attr("viewBox", [0, 0, markerBoxWidth, matchBoxHeight]) // (x1,x2) top-left corner starts, (x3, x4) width and height of marker's viewbox
        .attr("refX", refXarrow)
        .attr("refY", refYarrow)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .attr("markerUnits", "userSpaceOnUse")
        .append('path')
        .attr("d", "M0,0 L10,5 L0,10 L2,5 Z")
        .attr("class", classNameArrowHeadDownShape);

}

export { defineArrowHeads };