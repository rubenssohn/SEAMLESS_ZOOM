// -----
// MODULES FOR IMPORTING/EXPORTING DATA
// -----
async function loadData(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
  
    switch (ext) {
      case "csv":
        return await d3.csv(fileName);
      //case "json":
      //  return await d3.json(fileName);
      default:
        throw new Error(`Unsupported file type: .${ext}`);
    };
};

async function loadDataFromServer(endpoint) {
  const ext = endpoint.split('.').pop().toLowerCase();

  switch (ext) {
    //case "csv":
    case "json":
      return await d3.json(endpoint);
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  };
};

export { loadData, loadDataFromServer };