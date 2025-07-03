// -----
// PARSERS
// -----

// Access and parse data attributes
const parseDate = d3.timeParse('%m/%d/%y %H:%M');
const idAccessor = (d) => d.id;
//const timeAccessor = (d) => parseDate(d.timestamp);
const timeAccessor = (d) => parseFloat(d.timestamp_relative_seconds)  / 86400; // 86400 seconds in a day
const actAccessor = (d) => d.activity;
const caseAccessor = (d) => d.case; //parseInt(d.case)
const resAccessor = (d) => d.resources;
const nodes = (d) => d.nodes;
const edges = (d) => d.edges;

export {
  idAccessor,
  timeAccessor,
  actAccessor,
  caseAccessor,
  resAccessor,
  nodes,
  edges };