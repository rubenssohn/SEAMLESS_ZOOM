// -----
// DRAW AN INSTANCE GRAPH
// -----

function renderAbstractionLevelGraph(
    multilevelGraphData, currentLevelIndex, previousLevelIndex, 
    link, container, xScale, yScale, options = {}) {
    // Graph initialization
    const {
        // Names for instance graph
        classNameInstanceGraph = "instance-graph",
        classNameHiddenInstanceNodes = "hidden-instance-nodes",
        classNameHiddenInstanceEdges = "hidden-instance-edges",
        // Names for abstraction layer graph
        classNameAbstractionLevelGraph = "abstraction-layer",
        classNameAbstractionLevelNodes = "supernodes",
        classNameAbstractionLevelEdges = "superedges",
        // Edge drawing options
        strokeWidth = 1.2,
        classNameAbstractLevelEdgeUp = "link-abstract-up",
        classNameAbstractLevelEdgeDown = "link-abstract-down",
        classNameArrowHeadUp = "arrowhead-up",
        classNameArrowHeadDown = "arrowhead-down",
        // Node drawing options
        classNameRectNode = "activity-range",
        classNameCircleNode = "event-circle-mean",
        classRectNodeHeight = 10,
        // Node drawing for classic activity boxes
        classNameClassicActivityGroup = "classic-activity-group",
        classNameClassicRectNodeName = "activity-classic",
        classNameClassicActivityLabel = "activity-label",
        classClassicRectNodeHeight = 14,
        classClassicRectNodeWidth = 120,
        classClassicRectNodeTextAlignment = "middle",
        // Opacity levels
        opacityLevelDFG = 0,
        opacityLevelActRange = .8,
        toggleHideInstanceElements = false,
    } = options;
    
    
    // Hide previous layer
    container.select(`#${classNameAbstractionLevelGraph}`).remove();
    console.log(currentLevelIndex)

    // Initialize data for the abstraction layer
    const levelGraph = multilevelGraphData[currentLevelIndex];
    let nodes = [];
    let edges = [];
    let instanceNodeIds = [];
    let instanceEdgeIds = [];
    if (levelGraph) {
        nodes = levelGraph.nodes;
        edges = levelGraph.edges;
        instanceNodeIds = nodes.flatMap(d => d.has.map(id => `#node-${id}`));
        instanceEdgeIds = edges.flatMap(d => d.has.map(id => `#edge-${id}`));
    }
    console.log(`Prev: ${previousLevelIndex}, Curr: ${currentLevelIndex}`)

    // == LAYERS CHECK ==
    // Show/Hide instance nodes and edges (go up in the slider)
    if (toggleHideInstanceElements) {
        if (previousLevelIndex <= currentLevelIndex) {
            d3.selectAll(instanceNodeIds.join(",")).classed(classNameHiddenInstanceNodes, true);
            d3.selectAll(instanceEdgeIds.join(",")).classed(classNameHiddenInstanceEdges, true);
        } else if (previousLevelIndex > currentLevelIndex) {
            // Unhide the previously hidden nodes and edges (go down in the slider)
            d3.selectAll(`.${classNameInstanceGraph} .${classNameHiddenInstanceNodes}`).classed(classNameHiddenInstanceNodes, false);
            d3.selectAll(`.${classNameInstanceGraph} .${classNameHiddenInstanceEdges}`).classed(classNameHiddenInstanceEdges, false);
            d3.selectAll(instanceNodeIds.join(",")).classed(classNameHiddenInstanceNodes, true);
            d3.selectAll(instanceEdgeIds.join(",")).classed(classNameHiddenInstanceEdges, true);
        }
    }
    // previousLevelIndex = currentLevelIndex;

    if (!levelGraph) return;
    
    // Remove previous abstraction layer
    const layer = container.append("g").attr("id", classNameAbstractionLevelGraph);
    

    // == SUPER EDGES ==
    // Create a super edges group
    const superEdgesGroup = layer.append("g").attr("class", classNameAbstractionLevelEdges);
    
    /*
    // Link drawing function according to a cubic bezier-curve
    const linkSuper = d => {
        // Calculate the source and target coordinates
        const [sourceX, sourceY] = [xScale(d.source_coordinates[0]), yScale(d.source_coordinates[1])];
        const [targetX, targetY] = [xScale(d.target_coordinates[0]), yScale(d.target_coordinates[1])];
        
        // Define the curve strength and mid-point
        const curveStrength = 0.3;
        const curveOffset = 0;
        const verticalMidPointY = sourceY + (targetY - sourceY) * curveStrength - curveOffset;

        return `M${sourceX},${sourceY} C${sourceX},${verticalMidPointY} ${targetX},${verticalMidPointY} ${targetX},${targetY}`;
    };*/
    
    
    superEdgesGroup.selectAll("path")
        .data(edges)
        .join("path")
        .attr("d", link)
        .attr("fill", "none")
        //.attr("stroke", "#555")
        //.attr("stroke-width", d => d.frequency || 1)
        //.attr("stroke-width", d => strokeScale(+d.frequency || 0))
        .attr("stroke-width", strokeWidth)
        //.attr("stroke-opacity", 0.6)
        .attr('class', d =>
            yScale(d.source_coordinates[1]) > yScale(d.target_coordinates[1])
                ? classNameAbstractLevelEdgeUp
                : classNameAbstractLevelEdgeDown
            )
        .attr("marker-end", d => 
            yScale(d.source_coordinates[1]) > yScale(d.target_coordinates[1]) 
                ? `url(#${classNameArrowHeadUp})`
                : `url(#${classNameArrowHeadDown})`
            );
    
        




    // === SUPER NODES ===
    // Create a super nodes group
    const superNodesGroup = layer.append("g").attr("class", classNameAbstractionLevelNodes);

    // Draw super nodes as boxes (range)
    const superNodeRects = superNodesGroup.selectAll("rect")
    //superNodesGroup.selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => xScale(d.x.min) - 7)
        .attr("y", d => yScale(d.y) - 5)
        .attr("width", d => xScale(d.x.max) - xScale(d.x.min) + 14)
        .attr("height", classRectNodeHeight)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("class", classNameRectNode)
        .attr("opacity", opacityLevelActRange)
    

    // Animate super nodes as boxes
    //superNodeRects.transition()

    // Draw super nodes as circles (mean)
    const superNodeCircles = superNodesGroup.selectAll("circle")
    //superNodesGroup.selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("cx", d => xScale(d.x.mean))
        .attr("cy", d => yScale(d.y))
        .attr("r", 5)
        .attr("class", classNameCircleNode)

    // Animate super nodes as circles
    //superNodeCircles.transition()

    // Draw classic activity boxes 
    const classicActivityGroup = layer.append("g").attr("class", classNameClassicActivityGroup);
    classicActivityGroup.selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => xScale(d.x.mean) - 60)
        .attr("y", d => yScale(d.y) - 7)
        .attr("width", classClassicRectNodeWidth)
        .attr("height", classClassicRectNodeHeight)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("class", classNameClassicRectNodeName)
        .style("opacity", opacityLevelDFG)

        console.log("Classic activity group:", nodes)

    classicActivityGroup.selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => xScale(d.x.mean))  // center of the box
        .attr("y", d => yScale(d.y))   // vertically centered, adjust as needed
        .attr("text-anchor", classClassicRectNodeTextAlignment)     // center align
        .attr("alignment-baseline", classClassicRectNodeTextAlignment)
        .attr("class", classNameClassicActivityLabel)
        //.text(d => d.y);
        .text(d => {
            const label = d.y;
            const maxLength = 20;
            return label.length > maxLength 
                ? label.slice(0, maxLength - 1) + "…" 
                : label;
            })
        .style("opacity", opacityLevelDFG);

}

export { renderAbstractionLevelGraph };