export function filterByInterval(data, interval) {
    // Split the interval into start and end years
    const intervalParts = interval.split("-");
    const startYear = Number(intervalParts[0]);
    const endYear = Number(intervalParts[1]);

    // Step 1: Filter the data
    const filteredData = [];
    for (let i = 0; i < data.length; i++) {
        const row = data[i];

        const seasonStartYear = Number(row.Season.split("-")[0]);

        if (seasonStartYear >= startYear && seasonStartYear < endYear) {
            filteredData.push(row); 
        }
    }

    filteredData.sort((rowA, rowB) => {
        const yearA = Number(rowA.Season.split("-")[0]);
        const yearB = Number(rowB.Season.split("-")[0]);
        return yearA - yearB; 
    });

    return filteredData;
}



export function identifyAttributes(data) {
    const firstRow = data[0];


    const categorical = [];
    const numerical = [];

    for (let column in firstRow) {
        const value = firstRow[column];

        if (!isNaN(Number(value))) {
            numerical.push(column);
        } else {
            categorical.push(column);
        }
    }

    return { categorical, numerical };
}
