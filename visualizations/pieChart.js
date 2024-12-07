export function createPieChart(svg, data, options) {
  const width = +svg.attr("width") - 50;
  const height = +svg.attr("height") - 50;
  const radius = Math.min(width, height) / 2;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 40);

  const labelArc = d3.arc()
    .innerRadius(radius - 80)
    .outerRadius(radius - 80);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 3},${height / 2})`);

  const groupedData = d3.group(data, d => d[options.Category]);

  const pieData = Array.from(groupedData, ([key, group]) => ({
    key,
    value: d3.sum(group, d => +d[options.Value])
  }));
  console.log(pieData.length);
  const arcs = g.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .style("fill", d => color(d.data.key))
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .style("opacity", 0.8);

  // arcs.append("text")
  //   .attr("transform", d => `translate(${labelArc.centroid(d)})`)
  //   .attr("dy", ".35em")
  //   .style("text-anchor", "middle")
  //   .style("font-size", "12px")
  //   .style("fill", "white")
  //   .text(d => {
  //     const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
  //     return percentage > 5 ? `${d.data.key} (${percentage}%)` : '';
  //   });

  // Create a scrollable container for the legend
  // Create a scrollable container using foreignObject (HTML container inside SVG)
  const legendContainer = svg.append("foreignObject")
    .attr("x", width - 300)       // Position the container group for the legend
    .attr("y", 20)
    .attr("width", 350)           // Set the width for the scrollable area
    .attr("height", 460)          // Set the max height for the scrollable area
    .style("overflow", "hidden"); // Hide overflow for the outer container

  // Append a div inside the foreignObject to hold the legend items
  const legendDiv = legendContainer.append("xhtml:div")
      .style("height", "100%")        // Take up all available height
      .style("overflow-y", "scroll")    // Enable vertical scrolling within the div
      .style("display", "block")      // Ensure div behaves as block-level element
      .style("max-height", "460px")   // Limit the height to the container height
      .style("width", "100%");        // Make div take up the full width of the foreignObject

  // Create the legend items
  const legend = legendDiv.selectAll(".legend")
      .data(pieData)
      .enter().append("div")
      .attr("class", "legend-item")
      .style("display", "flex")          // Use flexbox layout for color square and text
      .style("align-items", "center")    // Align items vertically
      .style("margin-bottom", "5px")    // Add space between items
      .style("margin-left", "100px");

  // Add color squares and labels
  legend.append("div")  // Color square
      .style("width", "20px")
      .style("height", "20px")
      .style("background-color", d => color(d.key));  // Set color from your data

  legend.append("span")  // Label
      .style("margin-left", "10px")
      .style("white-space", "nowrap")  // Prevent text wrapping in the legend
      .text(d => d.key);  // Set the label from your data (assuming `d.key` contains the legend label)
}

