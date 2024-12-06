export function createBoxPlot(svg, data, options) {
    const margin = { top: 40, right: 20, bottom: 120, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
  
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Group the data by the selected category
    const groupedData = d3.group(data, d => d[options.Group]);
  
    // Compute quartiles, median, min, max, and outliers for each group
    const boxPlotData = Array.from(groupedData, ([key, group]) => {
      const values = group
        .map(d => +d[options.Values])
        .filter(v => v >= 0) // Omit negative values
        .sort(d3.ascending);
  
      if (values.length === 0) {
        return null; // Skip groups with no valid values
      }
  
      // If fewer than 5 points, return the raw points only
      if (values.length < 5) {
        return { key, values, isScatter: true }; // Mark this group for scatter plotting
      }
  
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const interQuantileRange = q3 - q1;
      const min = Math.max(q1 - 1.5 * interQuantileRange, d3.min(values));
      const max = Math.min(q3 + 1.5 * interQuantileRange, d3.max(values));
  
      // Identify positive outliers (values above max)
      const outliers = values.filter(v => v > max);
  
      return { key, q1, median, q3, interQuantileRange, min, max, values, outliers, isScatter: false };
    }).filter(d => d !== null); // Remove groups with no valid values
  
    // Set up scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(boxPlotData.map(d => d.key))
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(boxPlotData, d => Math.max(d.max || 0, ...(d.outliers || []), ...(d.values || [])))]).nice();
  
    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
  
    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y));
  
    // Draw the box plot or scatter plot based on data
    const boxWidth = x.bandwidth();
  
    g.selectAll(".boxplot")
      .data(boxPlotData)
      .join("g")
      .attr("transform", d => `translate(${x(d.key)},0)`)
      .each(function (d) {
        const group = d3.select(this);
  
        if (d.isScatter) {
          // Scatter plot for groups with fewer than 5 points
          group.selectAll(".point")
            .data(d.values)
            .join("circle")
            .attr("class", "point")
            .attr("cx", boxWidth / 2)
            .attr("cy", v => y(v))
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);
        } else {
          // Draw the box
          group.append("rect")
            .attr("x", 0)
            .attr("y", d => y(d.q3))
            .attr("width", boxWidth)
            .attr("height", d => y(d.q1) - y(d.q3))
            .attr("fill", "steelblue")
            .attr("stroke", "black");
  
          // Draw the median line
          group.append("line")
            .attr("x1", 0)
            .attr("x2", boxWidth)
            .attr("y1", d => y(d.median))
            .attr("y2", d => y(d.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
  
          // Draw the whiskers
          group.append("line")
            .attr("x1", boxWidth / 2)
            .attr("x2", boxWidth / 2)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.q1))
            .attr("stroke", "black");
  
          group.append("line")
            .attr("x1", boxWidth / 2)
            .attr("x2", boxWidth / 2)
            .attr("y1", d => y(d.q3))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");
  
          // Draw the min and max horizontal lines
          group.append("line")
            .attr("x1", boxWidth * 0.25)
            .attr("x2", boxWidth * 0.75)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.min))
            .attr("stroke", "black");
  
          group.append("line")
            .attr("x1", boxWidth * 0.25)
            .attr("x2", boxWidth * 0.75)
            .attr("y1", d => y(d.max))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");
  
          // Add positive outliers
          group.selectAll(".outlier")
            .data(d.outliers)
            .join("circle")
            .attr("class", "outlier")
            .attr("cx", boxWidth / 2)
            .attr("cy", v => y(v))
            .attr("r", 3)
            .attr("fill", "red")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);
        }
      });
  
    // Add X-axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 90})`)
      .style("text-anchor", "middle")
      .text(options.Group);
  
    // Add Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(options.Values);
  
    // Add dynamic chart title
    svg.append("text")
      .attr("x", (width / 2) + margin.left)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${options.Values} Distribution Across ${options.Group}`);
  }
  