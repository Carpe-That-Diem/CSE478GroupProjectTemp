export function createTreemapWithPie(svg, data, options) {
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  svg.selectAll("*").remove(); // Clear any previous visualization

  // Tooltip setup
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid #d3d3d3")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Treemap layout configuration
  const treemap = d3.treemap()
    .size([width, height])
    .padding(5);

  // Process data for treemap
  const root = d3.hierarchy({ name: "root", children: data })
    .sum(d => +d[options["Size"]]) // Use "Size" for rectangle area
    .sort((a, b) => b.value - a.value); // Sort to prioritize larger areas

  treemap(root);

  const nodes = svg.selectAll(".node")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Draw treemap rectangles
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", "lightblue")
    .attr("stroke", "white")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <strong>Group:</strong> ${d.data[options["Group By"]]}<br>
        <strong>Size:</strong> ${d.value}
      `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Draw Pie Charts in each rectangle
  nodes.each(function (d) {
    const group = d3.select(this);
    const rectWidth = d.x1 - d.x0;
    const rectHeight = d.y1 - d.y0;
    const radius = Math.min(rectWidth, rectHeight) / 3; // Ensure the pie chart fits within the rectangle

    // Get data for the current block
    const groupName = d.data[options["Group By"]];
    const filteredData = data.filter(row => row[options["Group By"]] === groupName);

    // Aggregate values for the pie chart based on "Category" and "Value"
    const groupedData = d3.group(filteredData, row => row[options["Category"]]);
    const pieData = Array.from(groupedData, ([key, group]) => ({
      key,
      value: d3.sum(group, row => +row[options["Value"]])
    }));

    // Create Pie Chart
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const pieGroup = group.append("g")
      .attr("transform", `translate(${rectWidth / 2}, ${rectHeight / 2})`);

    pieGroup.selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10]) // Assign colors based on category
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>Category:</strong> ${d.data.key}<br>
          <strong>Value:</strong> ${d.data.value}<br>
          <strong>Group:</strong> ${groupName}
        `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  });

  // Add chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${options["Group By"]} Treemap with Pie Charts`);
}
