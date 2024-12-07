export function loadCSVData(filePath, callback) {
    d3.csv(filePath)
        .then((data) => {
            console.log("Data Loaded:", data);
            callback(data); 
        })
        .catch((error) => {
            console.error("Error loading CSV data:", error);
        });
}