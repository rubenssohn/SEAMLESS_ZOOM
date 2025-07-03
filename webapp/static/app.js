// -----------------------------
// MAIN DRAWING FUNCTION
// -----------------------------
// Import
import { convertLogtoGraph, getUniqueValues, sortStringArrayByStartNumber } from './utils/processData.mjs';
import { defineSuperNodes, defineSuperEdges } from './vizmodules/nodeAbstraction.mjs';
import { exportData } from './utils/exportData.mjs';
import { idAccessor, timeAccessor, actAccessor, caseAccessor, resAccessor, nodes, edges } from './utils/parsers.mjs';
import { dimensions } from './layout/chartDimensions.mjs';
import { SCALE } from './layout/scales.mjs';

// Graph drawing function
async function draw(inputData = null) {
    d3.select("#chart").selectAll("*").remove();
    let csvdata = inputData;
    if (!csvdata) {
        try {
            csvdata = await d3.json('/api/get_data');
        } catch (err) {
            console.error("Failed to load default data:", err);
            return;
        }
    }

    // Access and parse data attributes
/*     const parseDate = d3.timeParse('%m/%d/%y %H:%M');
    const idAccessor = (d) => d.id;
    //const timeAccessor = (d) => parseDate(d.timestamp);
    const timeAccessor = (d) => parseFloat(d.timestamp_relative_seconds)  / 86400; // 86400 seconds in a day
    const actAccessor = (d) => d.activity;
    const caseAccessor = (d) => d.case; //parseInt(d.case)
    const resAccessor = (d) => d.resources;
    const nodes = (d) => d.nodes;
    const edges = (d) => d.edges; */

    // Contour plot values
    let currentContourBandwidth = 60;
    let currentContourThreshold = 3;
    

    // LevelIndex tracker and transitions
    let previousLevelIndex = -1;
    let toggleHideInstanceElements = false;
    let toggleContours = false;
    let switcherGradualElementRendering = 0;
    let opacityLevel = 1;
    let opacityLevelDFG = 0;
    let opacityLevelActRange = .8;
    let opacityLevelYAxis = 1;
    let toggleDFG = false;

    // Create graph data set
    const data = convertLogtoGraph(csvdata, caseAccessor, timeAccessor, actAccessor, idAccessor);

    // Data processing
    let activities = getUniqueValues(nodes(data), actAccessor);
    //let cases = getUniqueValues(nodes(data), caseAccessor);
    
    // Define chart dimensions
/*     let dimensions = {
        width: 800, // default: 800
        height: 500, // default: 500
        margin: 
        {
            top: 50,
            bottom: 50,
            left: 230, //140 for standard // 230 for large activity names
            right: 50,
        }
    }; */
    
    // Container dimensions
/*     dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom */

    // Scales
    /* TIMESTAMP
    const xScale = d3.scaleUtc()
        .domain(d3.extent(nodes(data), timeAccessor))
        .range([0, dimensions.ctrWidth])
    */
    const xScale = d3.scaleLinear()
        .domain(d3.extent(nodes(data), timeAccessor))
        .range([0, dimensions.ctrWidth])

    
    console.log(nodes(data))

    const yScale = d3.scalePoint()
        .domain(sortStringArrayByStartNumber(activities, true))
        .range([dimensions.ctrHeight, 0])
        .padding(1)

    let edgeFreq = [];
    const strokeScale = d3.scaleLinear()
        .domain(d3.extent(edgeFreq))
        .range([1, 10])
        .clamp(true);

    // Draw canvas
    const svg = d3.select('#chart')
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    // Create marker points for arrowheads
    const defs = svg.append("defs");

    const markerBoxWidth = 10;
    const matchBoxHeight = 10;   
    const refXarrow = 15;
    const refYarrow = 5;
    const markerWidth = 7;
    const markerHeight = 7;

    // Up arrows
    defs.append("marker")
        .attr("id", "arrowhead-up")
        .attr("class", "arrowhead-marker-up")
        .attr("viewBox", [0, 0, markerBoxWidth, matchBoxHeight]) // (x1,x2) top-left corner starts, (x3, x4) width and height of marker's viewbox
        .attr("refX", refXarrow)
        .attr("refY", refYarrow)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .attr("markerUnits", "userSpaceOnUse")
        .append('path')
        .attr("d", "M0,0 L10,5 L0,10 L2,5 Z")
        .attr("class", "arrowhead-shape-up")

    // Down arrows
    defs.append("marker")
        .attr("id", "arrowhead-down")
        .attr("class", "arrowhead-marker-down")
        .attr("viewBox", [0, 0, markerBoxWidth, matchBoxHeight]) // (x1,x2) top-left corner starts, (x3, x4) width and height of marker's viewbox
        .attr("refX", refXarrow)
        .attr("refY", refYarrow)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .attr("markerUnits", "userSpaceOnUse")
        .append('path')
        .attr("d", "M0,0 L10,5 L0,10 L2,5 Z")
        .attr("class", "arrowhead-shape-down")
    
    // Draw container
    const ctr = svg.append("g")
        .attr(
            "transform",
            `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
        )

    // Draw edges
    const link = d3.linkVertical(d3.curveBumpY)
        .source(d => d.source_coordinates)
        .target(d => d.target_coordinates)
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))













    function renderInstanceGraph(currentAbstractionLevel) {
        const ctrInstance = ctr.append('g')
            .attr('class', 'instance-graph')
            .style('opacity', 1)
        
        const edge = ctrInstance.append('g')
            .attr('class', 'instance-edges')
            .attr('fill', 'none')
            //.attr('stroke', '#feb24c')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 1.0)
        edge.selectAll()
            .data(edges(data))
            .join('path')
            .attr('id', d => `edge-${d.id}`)
            .attr('d', link)
            .attr('class', d =>
                yScale(d.source_coordinates[1]) > yScale(d.target_coordinates[1])
                    ? 'link link-up'
                    : 'link link-down'
                );

        // Draw events
        const events = ctrInstance.append('g')
            .attr("class", 'instance-nodes')

        events.selectAll('circle')
            .data(nodes(data))
            .join('circle')
            .attr('id', d => `node-${d.id}`) // keys to find these elements
            .attr('cx', d => xScale(timeAccessor(d)))
            .attr('cy', d => yScale(actAccessor(d)))
            .attr('r', 2)
            //.attr('fill', '#f03b20')
            .attr('class', 'event-circle')
            .attr('case', caseAccessor)
            .attr('activity', actAccessor)
            .attr('timestamp', timeAccessor)
            .attr('resource', resAccessor)
    }

















    
    // Draw axes
    const xAxis = d3.axisBottom(xScale)
    const xAxisName = "Relative time (in days)"

    ctr.append('g')
        .attr("class", "x-axis")
        .style(
            "transform", 
            `translateY(${dimensions.ctrHeight}px)`)
        .call(xAxis)
        .append('text')
        .attr('x', dimensions.ctrWidth / 2)
        .attr('y', dimensions.margin.bottom - 10)
        .attr('fill', 'black')
        .text(xAxisName)

    const yAxis = d3.axisLeft(yScale)
        .ticks(d3.max(nodes(data), caseAccessor))
        .tickPadding(15)
        //.tickFormat((d) => `${d}`)
    
    const yAxisName = "Activities"

    ctr.append('g')
        .attr("class", "y-axis")
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .append('text')
        .attr('x', -dimensions.ctrHeight / 2)
        .attr('y', -dimensions.margin.left + 15)
        .attr('fill', 'black')
        .html(yAxisName)
        .style('transform', 'rotate(270deg')
        .style('text-anchor', 'middle')
        .style('opacity', opacityLevelYAxis);









    // Draw abstraction levels
    function renderAbstractionLevel(levelIndex) {
        // Hide previous layer
        ctr.select("#abstraction-layer").remove();
        console.log(levelIndex)

        // Initialize data for the abstraction layer
        const levelGraph = multiLevelGraph[levelIndex];
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
        console.log(`Prev: ${previousLevelIndex}, Curr: ${levelIndex}`)

        // == LAYERS CHECK ==
        // Show/Hide instance nodes and edges (go up in the slider)
        if (toggleHideInstanceElements) {
            if (previousLevelIndex <= levelIndex) {
                d3.selectAll(instanceNodeIds.join(",")).classed("hidden-instance-nodes", true);
                d3.selectAll(instanceEdgeIds.join(",")).classed("hidden-instance-edges", true);
            } else if (previousLevelIndex > levelIndex) {
                // Unhide the previously hidden nodes and edges (go down in the slider)
                d3.selectAll(".instance-graph .hidden-instance-nodes").classed("hidden-instance-nodes", false);
                d3.selectAll(".instance-graph .hidden-instance-edges").classed("hidden-instance-edges", false);
                d3.selectAll(instanceNodeIds.join(",")).classed("hidden-instance-nodes", true);
                d3.selectAll(instanceEdgeIds.join(",")).classed("hidden-instance-edges", true);
            }
        }
        previousLevelIndex = levelIndex;

        if (!levelGraph) return;
        
        // Remove previous abstraction layer
        const layer = ctr.append("g").attr("id", "abstraction-layer");
        

        // == SUPER EDGES ==
        // Create a super edges group
        const superEdgesGroup = layer.append("g").attr("class", "superedges");
        
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
        };
        
        
        superEdgesGroup.selectAll("path")
            .data(edges)
            .join("path")
            .attr("d", linkSuper)
            .attr("fill", "none")
            //.attr("stroke", "#555")
            //.attr("stroke-width", d => d.frequency || 1)
            //.attr("stroke-width", d => strokeScale(+d.frequency || 0))
            .attr("stroke-width", 1.2)
            //.attr("stroke-opacity", 0.6)
            .attr('class', d =>
                yScale(d.source_coordinates[1]) > yScale(d.target_coordinates[1])
                    ? 'link-abstract-up'
                    : 'link-abstract-down'
                )
            .attr("marker-end", d => 
                yScale(d.source_coordinates[1]) > yScale(d.target_coordinates[1]) 
                    ? "url(#arrowhead-up)" 
                    : "url(#arrowhead-down)"
                );
        
            




        // === SUPER NODES ===
        // Create a super nodes group
        const superNodesGroup = layer.append("g").attr("class", "supernodes")

        // Draw super nodes as boxes (range)
        const superNodeRects = superNodesGroup.selectAll("rect")
        //superNodesGroup.selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => xScale(d.x.min) - 7)
            .attr("y", d => yScale(d.y) - 5)
            .attr("width", d => xScale(d.x.max) - xScale(d.x.min) + 14)
            .attr("height", 10)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", "activity-range")
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
            .attr("class", "event-circle-mean")

        // Animate super nodes as circles
        //superNodeCircles.transition()

        // Draw classic activity boxes 
        const classicActivityGroup = layer.append("g").attr("class", "classic-activity-group");
        classicActivityGroup.selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => xScale(d.x.mean) - 60)
            .attr("y", d => yScale(d.y) - 7)
            .attr("width", 120)
            .attr("height", 14)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", "activity-classic")
            .style("opacity", opacityLevelDFG)

            console.log("Classic activity group:", nodes)

        classicActivityGroup.selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => xScale(d.x.mean))  // center of the box
            .attr("y", d => yScale(d.y))   // vertically centered, adjust as needed
            .attr("text-anchor", "middle")     // center align
            .attr("alignment-baseline", "middle")
            .attr("class", "activity-label")
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




    
    // == CONTOUR GRAPH ==
    // Create contours
    function generateContours(nodes, bandwidth, threshold) {
        return d3.contourDensity()
            .x(d => xScale(timeAccessor(d)))
            .y(d => yScale(actAccessor(d)))
            .size([dimensions.ctrWidth, dimensions.ctrHeight])
            .bandwidth(bandwidth)
            .thresholds(threshold)
            (nodes);
    }
    let contours = generateContours(nodes(data), currentContourBandwidth, currentContourThreshold);

    // Draw contour graph
    function drawContourGraph(contoursData) {
        // Remove old contours
        ctr.select(".contour-graph").remove();

        // Append new contours
        const ctrContours = ctr.append("g")
            .attr("class", "contour-graph");

        ctrContours.selectAll("path")
            .data(contoursData)
            .join("path")
            .attr("d", d3.geoPath())
    }
    drawContourGraph(contours);

    // Update contours function
    function updateContours() {
        console.log("Contour graph with new values:")
        // Generate new contours with current values of bandwidth and thresholds
        contours = generateContours(nodes(data), currentContourBandwidth, currentContourThreshold);

        console.log("Contours data:", contours.length)
        // Re-render the contour graph with the new contours
        drawContourGraph(contours);

        d3.select(".contour-graph")
            .style("display", toggleContours ? "block" : "none");
    }



    console.info("Instance graph data:")
    console.log(data)
    console.info("Contours data:")
    console.log(contours)

    // Creating multilevelgraph data
    function assignGraphByContours(graphData, contours) {
        // Note: Contours array is 0=outermost layer, n=innermost layer.
        const nodes = graphData.nodes
        const edges = graphData.edges

        const contourLevels = contours.map(() => ({ nodes: [], edges: [] }));
        const outliers = { nodes: [], edges: [] };

        // Assign Nodes
        for (const node of nodes){
            const coordinates = [xScale(timeAccessor(node)), yScale(actAccessor(node))]
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
    let levelData = assignGraphByContours(data, contours)
    console.info("Level data (nodes and edges for each level):")
    console.log(levelData)
    console.log(data)

    function getEdgesForNodes(edges, nodes) {
        const nodeIds = new Set(nodes.map(d => d.id));
        const connectedEdges = edges.filter(d => nodeIds.has(d.source) || nodeIds.has(d.target));
        return connectedEdges;
    }

    function multiLevelGraphBuilder(graphData, levelData) {
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
            let superNodes = defineSuperNodes(cumulativeLevelGraph.nodes, timeAccessor, actAccessor, levelIndex)

            level.nodes.push(...superNodes)

            // Add edges
            let superEdges = defineSuperEdges(cumulativeLevelGraph.edges, superNodes, nodes(graphData), levelIndex, timeAccessor, actAccessor)
            //console.log(superEdges)
            level.edges.push(...superEdges)

            // Add the level with all data
            multiLevelGraphData.push(level)
        }

        // Create nodes by summarizing or leave as is
        return multiLevelGraphData
    }

    let multiLevelGraph = multiLevelGraphBuilder(data, levelData)
    console.info("Multi level graph:")
    console.log(multiLevelGraph)

    // Function to update abstraction graph
    function updateMultiLevelGraph(levelIndex) {
        // Return updating message
        d3.select("#graph-update-status").text("Updating graph...");

        // Reset the level indices
        levelIndex = -1; 
        previousLevelIndex = -1;

        // Regenerate the multi-level graph
        levelData = assignGraphByContours(data, contours);
        multiLevelGraph = multiLevelGraphBuilder(data, levelData);

        // Reset the abstraction level slider
        d3.select("#slider-abstraction-level")
            .attr("max", multiLevelGraph.length - 1)
            .property("value", -1)  // Reset to default level (e.g., -1 means "off")
            .dispatch("input");
        
        //Reset the abstraction level
        renderAbstractionLevel(levelIndex)

        // Show finished message
        d3.select("#graph-update-status").text("Successful graph update!");
        setTimeout(() => {d3.select("#graph-update-status").text("")}, 6000);
    }


    // == INTERFACE ==
    // Test fading in/out slider for new abstraction levels
    console.info("Slider test:")
    d3.select("#slider-abstraction-level")
        .attr("min", -1)
        .attr("max", multiLevelGraph.length - 1)
        .attr("value", -1)
        .on('input', function() {
            const selectedLevel = this.value;
            const selectedAbstLevel = +selectedLevel + 1; // Defines the visable abstractin level 
            const totalLevels = multiLevelGraph.length - 1;

            console.log("Selected level:", selectedLevel);
            // Clear previous level (you can refine this later)
            d3.select("#graph-container").selectAll("*").remove();

            // Change opacity of a graph
            if (selectedLevel >= 0) {
                opacityLevel = 1 - (selectedLevel / totalLevels);
            }

            const abstractionLayer = d3.select("#abstraction-layer")

            // Show/Hide the instance graph
            updateInstanceGraphOpacityLevel(switcherGradualElementRendering, opacityLevel);

            // Show/Hide the abstraction layer
            if (selectedLevel === -1) {
                abstractionLayer.style("display", "none");
            } else {
                // Render the graph for selected level
                abstractionLayer.style("display", "block");
                renderAbstractionLevel(selectedLevel);
            }
            d3.select("#slider-abstraction-level-value").text(selectedAbstLevel); // The displayed value of the slider
    });

    // Contour bandwidth slider
    d3.select("#contour-bandwidth-slider").on("input", function() {
        currentContourBandwidth = +this.value;
        d3.select("#contour-bandwidth-value").text(currentContourBandwidth);
        updateContours();
    });
    d3.select("#contour-threshold-slider").on("input", function() {
        currentContourThreshold = +this.value;
        d3.select("#contour-threshold-value").text(currentContourThreshold);
        updateContours();
    });

    // Update multilevel graph
    d3.select("#button-update-abstraction-graph").on("click", function() {
        updateMultiLevelGraph();  // Call the function that updates the abstraction graph
    });
    
    // Instance element rendering toggle
    d3.select("#toggle-instance-element-rendering").on("change", function () {
        toggleHideInstanceElements = this.checked;
    });

    // Contour lines rendering toggle
    
    d3.select("#toggle-contour-lines").on("change", function () {
        toggleContours = this.checked;
        // Show/Hide the contour lines
            d3.select(".contour-graph")
            .transition()
            .duration(100)
            .style("display", toggleContours ? "block" : "none");
            //.style("stroke-opacity", toggleContours ? .5 : 0);
    });
    
    // Instance element rendering toggle
    d3.select("#toggle-dfg-graph").on("change", function () {
        toggleDFG = this.checked;
        opacityLevelDFG = toggleDFG ? .95 : 0;
        opacityLevelYAxis = toggleDFG ? .1 : 1;
        opacityLevelActRange = toggleDFG ? .1 : .8;

        d3.selectAll(".activity-classic")
            .transition()
            .duration(100)
            .style("opacity", opacityLevelDFG);
        d3.selectAll(".activity-label")
            .transition()
            .duration(100)
            .style("opacity", opacityLevelDFG);
        d3.select(".y-axis")
            .transition()
            .duration(100)
            .style("opacity", opacityLevelYAxis);
        d3.select(".x-axis")
            .transition()
            .duration(100)
            .style("opacity", opacityLevelYAxis);
        d3.selectAll(".activity-range")
            .transition()
            .duration(100)
            .style("opacity", opacityLevelActRange);
        console.log("DFG hider toggle is now:", toggleDFG);
    });
    

    // Instance element rendering toggle
    d3.selectAll('input[name="option-switcher-value"]').on("change", function () {
        switcherGradualElementRendering = +this.value;
        updateInstanceGraphOpacityLevel(switcherGradualElementRendering, opacityLevel);
    });
    function updateInstanceGraphOpacityLevel(switcherGradualElementRendering, opacityLevel) {
        if (switcherGradualElementRendering === 1) {
            d3.select(".instance-edges")
                .transition()
                .duration(50)
                .style("opacity", opacityLevel)
            d3.select(".instance-graph")
                .style("opacity", 1)
        } else if (switcherGradualElementRendering === 2) {
            d3.select(".instance-graph")
                .transition()
                .duration(50)
                .style("opacity", opacityLevel)
            d3.selectAll(".instance-edges")
                .style("opacity", opacityLevel)
        } else {
            d3.selectAll(".instance-graph", ".instance-edges")
                .style("opacity", 1)
        }
    }

    //countourGraph()
    renderInstanceGraph(0)
    console.log("end")
}






// -----------------------------
// MODULES FOR PROCESSING DATA
// -----------------------------
/* async function loadData(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
  
    switch (ext) {
      case "csv":
        return await d3.csv(fileName);
      //case "json":
      //  return await d3.json(fileName);
      default:
        throw new Error(`Unsupported file type: .${ext}`);
    }
}

async function loadDataFromServer(endpoint) {
  const ext = endpoint.split('.').pop().toLowerCase();

  switch (ext) {
    //case "csv":
    case "json":
      return await d3.json(endpoint);
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
} */

/* function convertLogtoGraph(d, groupBy, xAccessor, yAccessor, idAccessor){
    let graph = [{type: "directed"}]
    let nodes = d.map((object, index) => ({
        ...object,
        id: String('n' + index)
    }));
    let edges = deriveDFRelations(nodes, groupBy, xAccessor, yAccessor, idAccessor);
    return { 'graph': graph, 'nodes': nodes, 'edges': edges };
}; 

function deriveDFRelations(d, groupBy, xAccessor, yAccessor, idAccessor){
    const eventgroups = d3.group(d, groupBy);
    const traces = getUniqueValues(d, groupBy);
    let dirfol = [];
    let edgeId = 0;

    // Define all directly follows relation over each entity-instance
    for (let i = 0; i < traces.length; i++){
        let sortedTrace = eventgroups.get(traces[i]).sort((a, b) => xAccessor(a) - xAccessor(b));
        for (let j = 0; j < sortedTrace.length - 1; j++) {
            let currentSource = sortedTrace[j];
            let currentTarget = sortedTrace[j + 1];

            let source = idAccessor(currentSource);
            let target = idAccessor(currentTarget);
            // TODO: Might need to create a coordinate mapping function for this instead
            let source_coordinates = [xAccessor(currentSource), yAccessor(currentSource)];
            let target_coordinates = [xAccessor(currentTarget), yAccessor(currentTarget)];
            let entity = groupBy(currentSource);
            dirfol.push({ 
                id: `e${edgeId++}`, 
                source: source, target: target, 
                source_coordinates: source_coordinates, target_coordinates: target_coordinates,
                entity: entity });
        }
    }
    return dirfol;
};

function getUniqueValues(d, accessor) {
    return [...new Set(d.map(accessor))].sort().reverse()
} 

function sortStringArrayByStartNumber (arr, descending = false) {
    const sortedArr = arr.slice().sort((a, b) => {
        const [numA, strA = ""] = a.split(/_(.*)/s);
        const [numB, strB = ""] = b.split(/_(.*)/s);

        const intA = parseInt(numA, 10);
        const intB = parseInt(numB, 10);

        return intA !== intB
            ? intA - intB
            : strA.localeCompare(strB)
    });

    return descending ? sortedArr.reverse() : sortedArr;
} */

// -----------------------------
// MODULES FOR CREATING SUPER NODES/EDGES
// -----------------------------
/* function defineSuperNodes(nodes, xAccessor, yAccessor, levelIndex) {
    const nodeGroups = d3.group(nodes, (d) => yAccessor(d))
    let nodeId = 0;
    const superNodes = Array.from(nodeGroups, ([y_key, group]) => ({
        id: `lv${levelIndex}_n${nodeId++}`,
        y: y_key,
        x: {
            //for date format
            //min: new Date(d3.min(group, xAccessor)),
            //mean: new Date(d3.mean(group, xAccessor)),
            //median: new Date(d3.median(group, xAccessor)),
            //max: new Date(d3.max(group, xAccessor))
            
            min: d3.min(group, xAccessor),
            mean: d3.mean(group, xAccessor),
            median: d3.median(group, xAccessor),
            max: d3.max(group, xAccessor)
            
        },
        has: group.map(d => d.id)
    }))
    return superNodes;
}

function defineSuperEdges(edges, superNodes, allNodes, levelIndex, xAccessor, yAccessor) {

    // Map each node to its super node, if applicable
    const nodeToSuperNodeMap = new Map();
    for (const superNode of superNodes) {
        for (const childNode of superNode.has) {
            nodeToSuperNodeMap.set(childNode, superNode)
        }
    }

    // Map the data from all nodes, to retrieve it later for the coordinates
    const nodeById = new Map();
    for (const node of allNodes) {
        nodeById.set(node.id, node);
    }
    for (const superNode of superNodes) {
        nodeById.set(superNode.id, superNode);
    }

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
        
    }

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
    }
    return superEdges;
} */

// == EXPORT GRAPH ==
// Add event listener to the export button
//window.exportData = exportData; // (Old)

const exportButton = document.getElementById('button-export');
exportButton.addEventListener('click', () => {
  console.log("Exporting data...");
  exportData();
  console.log("Data exported successfully.");
});

/* function exportData() {
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
} */

draw()

// Redraw the chart with uploaded data
document.getElementById('upload-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  console.log("Uploading data...");
  const fileInput = document.getElementById('file-input');
  if (!fileInput.files.length) return;

  console.log("File selected:", fileInput.files[0].name);
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  console.log("Form data prepared for upload.");
  const response = await fetch('/api/upload_data', {
    method: 'POST',
    body: formData
  });

  console.log("Response received from server:", response.status);
  const uploadedData = await response.json();
  console.log("Server response:", uploadedData);
  draw(uploadedData); 
});

// Reset the chart with default data
const resetButton = document.getElementById('button-reset');
resetButton.addEventListener('click', () => {
  draw(null);
});