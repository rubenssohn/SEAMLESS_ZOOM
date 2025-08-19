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
// DEFINE A MULTI-LEVEL GRAPH
// -----

import { defineSuperNodes, defineSuperEdges } from "./nodeAbstraction.mjs";
import { nodes } from "../utils/parsers.mjs";

function multiLevelGraphBuilder(graphData, levelData, xAccessor, yAccessor) {
    const multiLevelGraphData = []

    // Create a set of new nodes and edges for each new abstraction layer
    for (let levelIndex = 0; levelIndex < levelData.length; levelIndex++){
        console.info(`- creating level ${levelIndex}`)
        const level = {
            level: levelIndex,
            nodes: [],
            edges: []
        };

        // Cumulate nodes per level (TODO: Better mapping solution later)
        const cumulativeLevelGraph = levelData
            .slice(0, levelIndex + 1)
            .reduce((acc, layer) => {
            acc.nodes.push(...layer.nodes);
            acc.edges.push(...layer.edges);
            return acc;
            }, { nodes: [], edges: [] });

        // Add nodes
        let superNodes = defineSuperNodes(cumulativeLevelGraph.nodes, xAccessor, yAccessor, levelIndex)

        level.nodes.push(...superNodes)

        // Add edges
        let superEdges = defineSuperEdges(cumulativeLevelGraph.edges, superNodes, nodes(graphData), xAccessor, yAccessor, levelIndex)
        level.edges.push(...superEdges)

        // Add the level with all data
        multiLevelGraphData.push(level)
    }

    // Create nodes by summarizing or leave as is
    return multiLevelGraphData
}

export { multiLevelGraphBuilder };