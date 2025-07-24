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