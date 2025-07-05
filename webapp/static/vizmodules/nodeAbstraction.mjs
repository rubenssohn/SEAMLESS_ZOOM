// -----
// ABSTRACTION TASKS FOR NODES AND EDGES
// -----

function defineSuperNodes(nodes, xAccessor, yAccessor, levelIndex) {
    const nodeGroups = d3.group(nodes, (d) => yAccessor(d))
    let nodeId = 0;
    const superNodes = Array.from(nodeGroups, ([y_key, group]) => ({
        id: `lv${levelIndex}_n${nodeId++}`,
        y: y_key,
        x: {
            /* for date format
            min: new Date(d3.min(group, xAccessor)),
            mean: new Date(d3.mean(group, xAccessor)),
            median: new Date(d3.median(group, xAccessor)),
            max: new Date(d3.max(group, xAccessor))
            */
            
            min: d3.min(group, xAccessor),
            mean: d3.mean(group, xAccessor),
            median: d3.median(group, xAccessor),
            max: d3.max(group, xAccessor)
            
        },
        has: group.map(d => d.id)
    }))
    return superNodes;
};

function defineSuperEdges(edges, superNodes, allNodes, xAccessor, yAccessor, levelIndex) {

    // Map each node to its super node, if applicable
    const nodeToSuperNodeMap = new Map();
    for (const superNode of superNodes) {
        for (const childNode of superNode.has) {
            nodeToSuperNodeMap.set(childNode, superNode)
        };
    };

    // Map the data from all nodes, to retrieve it later for the coordinates
    const nodeById = new Map();
    for (const node of allNodes) {
        nodeById.set(node.id, node);
    };
    for (const superNode of superNodes) {
        nodeById.set(superNode.id, superNode);
    };

    // Map each edge to a new super Edge (key)
    const superEdgeMap = new Map();
    for (const edge of edges) {
        // Get the source and target based based on if they exist as super nodes or not
        const sourceId = nodeToSuperNodeMap.get(edge.source)?.id || edge.source;
        const targetId = nodeToSuperNodeMap.get(edge.target)?.id || edge.target;

        // Group each edge to a unique super edge key
        const key = `${sourceId}->${targetId}`
        const group = superEdgeMap.get(key) || [];
        group.push(edge);
        superEdgeMap.set(key, group);
        
    };

    // Create the super edges
    let edgeId = 0;
    const superEdges = [];
    for (const [key, edgeSubset] of superEdgeMap) {
        const [sourceId, targetId] = key.split('->');
        
        // Get coordinate information from the source and target nodes
        const sourceNode = nodeById.get(sourceId);
        const targetNode = nodeById.get(targetId);

        const source_coordinates = Number.isFinite(sourceNode?.x?.mean) // (0 should not return nan) //old: sourceNode.x?.mean 
            ? [sourceNode.x.mean, sourceNode.y]
            : [xAccessor(sourceNode), yAccessor(sourceNode)];
        const target_coordinates = Number.isFinite(targetNode?.x?.mean) // (0 should not return nan) //old: targetNode.x?.mean
            ? [targetNode.x.mean, targetNode.y]
            : [xAccessor(targetNode), yAccessor(targetNode)];

        // Create the new edges (super edges)
        const hasSet = Array.from(new Set(edgeSubset.map(d => d.id))); // remove duplicates
        superEdges.push({
            id: `lv${levelIndex}_e${edgeId++}`,
            source: sourceId,
            target: targetId,
            source_coordinates: source_coordinates,
            target_coordinates: target_coordinates,
            frequency: hasSet.length,
            has: hasSet
            
        });
    };
    return superEdges;
};

export { defineSuperNodes, defineSuperEdges };