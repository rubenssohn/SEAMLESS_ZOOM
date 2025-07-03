// -----
// CHART DIMENSIONS
// -----

// Define chart dimensions
let dimensions = {
    width: 800, // default: 800
    height: 500, // default: 500
    margin: 
    {
        top: 50,
        bottom: 50,
        left: 230, //140 for standard // 230 for large activity names
        right: 50,
    }
};

    // Container dimensions
dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

export { dimensions };