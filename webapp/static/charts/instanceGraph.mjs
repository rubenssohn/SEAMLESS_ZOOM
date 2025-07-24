// -----
// DRAW AN INSTANCE GRAPH
// -----

import { caseAccessor, actAccessor, timeAccessor, resAccessor, nodes, edges } from "../utils/parsers.mjs";

function renderInstanceGraph(graphData, link, container, xAccessor, xScale, yAccessor, yScale, options = {}) {
    // Graph initialization
    const {
        classNameGraph = "instance-graph",
        classNameNodes = "instance-nodes",
        classNameNode = "event-circle",
        classNameEdges = "instance-edges",
        classNameEdgeUp = "link link-up",
        classNameEdgeDown = "link link-down",
        opacityGraph = 1,
        opacityStroke = 0.6,
        strokeWidth = 1.0,
    } = options;


    const ctrInstance = container.append('g')
        .attr('class', classNameGraph)
        .style('opacity', opacityGraph)
    
    const edge = ctrInstance.append('g')
        .attr('class', classNameEdges)
        .attr('fill', 'none')
        //.attr('stroke', '#feb24c')
        .attr('stroke-opacity', opacityStroke)
        .attr('stroke-width', strokeWidth)
    edge.selectAll()
        .data(edges(graphData))
        .join('path')
        .attr('id', d => `edge-${d.id}`)
        .attr('d', link)
        .attr('class', d =>
            yScale(d.source_coordinates[1]) > yScale(d.target_coordinates[1])
                ? classNameEdgeUp
                : classNameEdgeDown
            );

    // Draw events
    const events = ctrInstance.append('g')
        .attr("class", classNameNodes)

    events.selectAll('circle')
        .data(nodes(graphData))
        .join('circle')
        .attr('id', d => `node-${d.id}`) // keys to find these elements
        .attr('cx', d => xScale(xAccessor(d)))
        .attr('cy', d => yScale(yAccessor(d)))
        .attr('r', 2)
        .attr('class', classNameNode)
        .attr('case', caseAccessor)
        .attr('activity', actAccessor)
        .attr('timestamp', timeAccessor)
        .attr('resource', resAccessor)
}

export { renderInstanceGraph };