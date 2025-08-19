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