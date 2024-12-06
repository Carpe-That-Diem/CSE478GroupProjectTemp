export function createScatterPlot(svg, data, options) {
  const margin = { top: 40, right: 120, bottom: 80, left: 80 }; // Adjust left margin
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(data, d => +d[options["X Axis"]])).nice();

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain(d3.extent(data, d => +d[options["Y Axis"]])).nice();


  // Create color scale (using the selected "Color" field from options)
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  const colorDomain = Array.from(new Set(data.map(d => d[options["Color"]]))); // Unique categories
  color.domain(colorDomain);

  // Add X axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("font-size", "12px")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  // Add X axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 40})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text(options["X Axis"]);

  // Add Y axis
  g.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "12px");

  // Add Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 1.3)
    .attr("x", 0 - (height / 2))
    .attr("dy", "-2em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text(options["Y Axis"]);

  // Add dots
  g.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", d => x(+d[options["X Axis"]]))
    .attr("cy", d => y(+d[options["Y Axis"]]))
    .style("fill", d => color(d[options["Color"]])) // Dynamically set color based on selected field
    .style("opacity", 0.7);

  // Add legend
  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(color.domain().sort())
    .enter().append("g")
    .attr("transform", (d, i) => `translate(${width + margin.left + 10},${margin.top + i * 20})`);

  legend.append("rect")
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", color);

  legend.append("text")
    .attr("x", 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(d => d);

  // Add chart title
  svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${options["Y Axis"]} vs ${options["X Axis"]} (Color by ${options["Color"]})`);
}
