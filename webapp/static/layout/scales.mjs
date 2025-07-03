// -----
// SCALES
// -----

import { sortStringArrayByStartNumber } from "../utils/processData.mjs";

const SCALE = (function () {
    function categories (categories, dimensions, { sort = true, vertical = true } = {}) {
        const domain = sort 
            ? sortStringArrayByStartNumber(categories, true)
            : categories;
        const range = vertical 
            ? [dimensions.ctrHeight, 0]
            : [0, dimensions.ctrWidth];
        
        return d3.scalePoint()
        .domain(domain)
        .range(range)
        .padding(1);
    }  

    function linear (domain, dimensions, { vertical = true } = {}) {
        const range = vertical 
            ? [dimensions.ctrHeight, 0]
            : [0, dimensions.ctrWidth];
        return d3.scaleLinear()
            .domain(domain)
            .range(range);
    }

    function timeUTC (domain, dimensions, { vertical = true } = {}) {
        const range = vertical 
            ? [dimensions.ctrHeight, 0]
            : [0, dimensions.ctrWidth];
        return d3.scaleTime()
            .domain(domain)
            .range(range);
    }

    return {
        categories,
        linear,
        timeUTC
    };
})();

export { SCALE };