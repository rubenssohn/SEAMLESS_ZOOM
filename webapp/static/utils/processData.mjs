// -----
// MODULES FOR PROCESSING DATA
// -----
function convertLogtoGraph(d, groupBy, xAccessor, yAccessor, idAccessor){
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
        };
    };
    return dirfol;
};

function getUniqueValues(d, accessor) {
    return [...new Set(d.map(accessor))].sort().reverse();
};

export { convertLogtoGraph, deriveDFRelations, getUniqueValues };