// -----
// DEFINE LINKS FOR GRAPHS
// -----

function defineLinkVertical(xScale, yScale, options = {}) {
    const {
        curve = d3.curveBumpY,
    } = options;
    return d3.linkVertical(curve)
        .source(d => d.source_coordinates)
        .target(d => d.target_coordinates)
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
}

function defineLinkBezier(xScale, yScale, options = {}) {
    const {
        curveStrength = 0.3,
        curveOffset = 0,
    } = options;
    return function linkBezier(d) {
        // Calculate the source and target coordinates
        const [sourceX, sourceY] = [xScale(d.source_coordinates[0]), yScale(d.source_coordinates[1])];
        const [targetX, targetY] = [xScale(d.target_coordinates[0]), yScale(d.target_coordinates[1])];
        const verticalMidPointY = sourceY + (targetY - sourceY) * curveStrength - curveOffset;
        
        return `M${sourceX},${sourceY} C${sourceX},${verticalMidPointY} ${targetX},${verticalMidPointY} ${targetX},${targetY}`;
    }
        
}

export { defineLinkVertical, defineLinkBezier };