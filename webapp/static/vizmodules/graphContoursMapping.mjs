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
// MAP GRAPH DATA TO CONTOURS (ISOLINES)
// -----

function assignGraphByContours(graphData, contours, xAccessor, xScale, yAccessor, yScale) {
    // Note: Contours array is 0=outermost layer, n=innermost layer.
    const nodes = graphData.nodes
    const edges = graphData.edges

    const contourLevels = contours.map(() => ({ nodes: [], edges: [] }));
    const outliers = { nodes: [], edges: [] };

    // Assign Nodes
    for (const node of nodes){
        const coordinates = [xScale(xAccessor(node)), yScale(yAccessor(node))]
        // We treat all nodes as outliers before being assigned to a layer.
        let outlier = true;
        node.island = -1; // new attribute for graphdata (-1 means outlier)

        // Assign each node to exactly one contour level, starting with the inner most one 
        for (let i = contours.length - 1; i >= 0; i--) {
            const polygons = contours[i].coordinates.flat();
            const levelIndex = (contours.length - 1) - i; // reversed, inner = 0, outer = n-1, outliers = n

            if (polygons.some(polygon => d3.polygonContains(polygon, coordinates))) {
                contourLevels[levelIndex].nodes.push(node);
                node.level = levelIndex; // new attribute for graphdata
                //node.island = islandIndex; // new attribute for graphdata (TODO: Implement island mechanism.)
                outlier = false;
                break; // assign only to one layer
            }
        }
        if (outlier) {
            node.level = contours.length;
            outliers.nodes.push(node);
        }
    }
    // Assign Edges
    for (let i = 0; i < contourLevels.length; i++) {
        contourLevels[i].edges = getEdgesForNodes(edges, contourLevels[i].nodes);
    }
    outliers.edges = getEdgesForNodes(edges, outliers.nodes);
    return [...contourLevels, outliers];
};

function getEdgesForNodes(edges, nodes) {
    const nodeIds = new Set(nodes.map(d => d.id));
    const connectedEdges = edges.filter(d => nodeIds.has(d.source) || nodeIds.has(d.target));
    return connectedEdges;
}

export { assignGraphByContours };