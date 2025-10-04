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

// -----------------------------
// MAIN DRAWING FUNCTION for TIME ORDER MAP
// -----------------------------
// == IMPORT ==
import { convertLogtoGraph, getUniqueValues, sortStringArrayByStartNumber } from '../utils/processData.mjs';
import { idAccessor, timeAccessor, actAccessor, caseAccessor, resAccessor, nodes, edges } from '../utils/parsers.mjs';
import { dimensions } from '../layout/chartDimensions.mjs';
import { SCALE } from '../layout/scales.mjs';
import { drawAxis } from '../components/axes.mjs';
import { CONTOURGRAPH } from '../charts/contourGraph.mjs';
import { assignGraphByContours } from '../vizmodules/graphContoursMapping.mjs';
import { multiLevelGraphBuilder } from '../vizmodules/multiLevelGraphBuilder.mjs';
import { renderInstanceGraph } from '../charts/instanceGraph.mjs';
import { renderAbstractionLevelGraph } from '../charts/modelabstractionlevelGraph.mjs';
import { defineArrowHeads } from '../components/arrowheads.mjs';
import { defineLinkVertical, defineLinkBezier } from '../vizmodules/linkCalculator.mjs';

// == MAIN GRAPH DRAWING FUNCTION ==
function TIMEORDERMAP(csvdata) {
    // Contour plot values
    let currentContourBandwidth = 60;
    let currentContourThreshold = 3;
    
    // LevelIndex tracker and transitions
    let levelIndex = -1; 
    let previousLevelIndex = -1;
    let currentLevelIndex = -1;
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
    const xScale = SCALE.linear(d3.extent(nodes(data), timeAccessor), dimensions, { vertical: false });
    const yScale = SCALE.categories(activities, dimensions);
    
    console.log(nodes(data))

    // == CANVAS ==
    // Draw SVG
    const svg = d3.select('#chart')
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    // Create marker points for arrowheads
    defineArrowHeads(svg);
    
    // Draw container
    const ctr = svg.append("g")
        .attr(
            "transform",
            `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
        )

    // Draw edges for instance graph
    const linkInstance = defineLinkVertical(xScale, yScale);
    const linkBundled = defineLinkBezier(xScale, yScale);

    // == AXES ==
    // Draw x-axis
    drawAxis(ctr, xScale, 'bottom', dimensions, {
        className: 'x-axis',
        axisLabel: 'Relative time (in days)',
        labelDistance: -10,
        });

    // Draw y-axis
    drawAxis(ctr, yScale, 'left', dimensions, {
        className: 'y-axis',
        axisLabel: 'Activities',
        ticks: d3.max(nodes(data), caseAccessor),
        tickPadding: 15,
        removeDomain: true,      // remove the y-axis line domain
        opacity: opacityLevelYAxis
    });

    // == CONTOUR GRAPH ==
    let contours = CONTOURGRAPH.generateContours(nodes(data), currentContourBandwidth, currentContourThreshold, dimensions, timeAccessor, xScale, actAccessor, yScale);
    // Draw contour graph
    CONTOURGRAPH.drawContourGraph(contours, ctr);

    console.info("Instance graph data:")
    console.log(data)
    console.info("Contours data:")
    console.log(contours)

    // Creating multilevelgraph data
    let levelData = assignGraphByContours(data, contours, timeAccessor, xScale, actAccessor, yScale)
    console.info("Level data (nodes and edges for each level):")
    console.log(levelData)
    console.log(data)

    let multiLevelGraph = multiLevelGraphBuilder(data, levelData, timeAccessor, actAccessor);
    console.info("Multi level graph:")
    console.log(multiLevelGraph)

    // == INTERFACE ==
    // TODO: MODULARIZE INTERFACE
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
                renderAbstractionLevelGraph(multiLevelGraph, selectedLevel, previousLevelIndex, linkBundled, ctr, xScale, yScale, {opacityLevelDFG: opacityLevelDFG, opacityLevelActRange: opacityLevelActRange, toggleHideInstanceElements: toggleHideInstanceElements}); //data, link, ctr, timeAccessor, xScale, actAccessor, yScale
                previousLevelIndex = selectedLevel;
            }
            d3.select("#slider-abstraction-level-value").text(selectedAbstLevel); // The displayed value of the slider
    });

    // Contour bandwidth slider
    d3.select("#contour-bandwidth-slider").on("input", function() {
        currentContourBandwidth = +this.value;
        d3.select("#contour-bandwidth-value").text(currentContourBandwidth);
        //updateContours();
        console.log("Contour graph with new values:")
        // Generate new contours with current values of bandwidth and thresholds
        contours = CONTOURGRAPH.generateContours(nodes(data), currentContourBandwidth, currentContourThreshold, dimensions, timeAccessor, xScale, actAccessor, yScale);

        console.log("Contours data:", contours.length)
        // Re-render the contour graph with the new contours
        CONTOURGRAPH.drawContourGraph(contours, ctr);

        d3.select(".contour-graph")
            .style("display", toggleContours ? "block" : "none");
    });
    d3.select("#contour-threshold-slider").on("input", function() {
        currentContourThreshold = +this.value;
        d3.select("#contour-threshold-value").text(currentContourThreshold);
        //updateContours();
        console.log("Contour graph with new values:")
        // Generate new contours with current values of bandwidth and thresholds
        contours = CONTOURGRAPH.generateContours(nodes(data), currentContourBandwidth, currentContourThreshold, dimensions, timeAccessor, xScale, actAccessor, yScale);

        console.log("Contours data:", contours.length)
        // Re-render the contour graph with the new contours
        CONTOURGRAPH.drawContourGraph(contours, ctr);

        d3.select(".contour-graph")
            .style("display", toggleContours ? "block" : "none");
    });

    // Update multilevel graph
    d3.select("#button-update-abstraction-graph").on("click", function() {
        //updateMultiLevelGraph();  // Call the function that updates the abstraction graph
        // Return updating message
        d3.select("#graph-update-status").text("Updating graph...");

        // Reset the level indices
        levelIndex = -1; 
        previousLevelIndex = -1;

        // Regenerate the multi-level graph
        levelData = assignGraphByContours(data, contours, timeAccessor, xScale, actAccessor, yScale);
        multiLevelGraph = multiLevelGraphBuilder(data, levelData, timeAccessor, actAccessor);

        // Reset the abstraction level slider
        d3.select("#slider-abstraction-level")
            .attr("max", multiLevelGraph.length - 1)
            .property("value", -1)  // Reset to default level (e.g., -1 means "off")
            .dispatch("input");
        
        //Reset the abstraction level
        renderAbstractionLevelGraph(multiLevelGraph, levelIndex, previousLevelIndex, linkBundled, ctr, xScale, yScale, {opacityLevelDFG: opacityLevelDFG, opacityLevelActRange: opacityLevelActRange, toggleHideInstanceElements: toggleHideInstanceElements})
        previousLevelIndex = currentLevelIndex;

        // Show finished message
        d3.select("#graph-update-status").text("Successful graph update!");
        setTimeout(() => {d3.select("#graph-update-status").text("")}, 3000);
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

    renderInstanceGraph(data, linkInstance, ctr, timeAccessor, xScale, actAccessor, yScale);
    console.log("end")
};

export { TIMEORDERMAP };