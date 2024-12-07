export function createTreemapWithPie(svg, data, options) {
  const outerWidth = +svg.attr("width");
  const outerHeight = +svg.attr("height");

  const margin = { top: 20, right: 20, bottom: 20, left: 20 }; 
  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;

  // Create a group element for margins
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip setup
  // FROM HW3
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid white")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("opacity", 0);

  // Group and aggregate data by "Group By" field
  const groupedData = d3.group(data, d => d[options["Group By"]]);

  const treemapData = [];

  // For any in group data
  for (const [key, group] of groupedData) {
      // Calculate the frequency
      const size = group.length;
      // Do not print groups with a length of 0
      if (size > 0) {
          // Morph data into something the treemap can use
          const entry = {
              key: key, 
              size: size, 
              details: group 
          };
          // Add the data
          treemapData.push(entry);
      }
  }

  // Submit the hierarhcy data
  const root = d3.hierarchy({ name: "root", children: treemapData })
    .sum(d => d.size);

  // Treemap layout configuration
  const treemap = d3.treemap()
    .size([width, height]) 
    .padding(5);

  // Create the treemap from the root
  treemap(root);

  // TREEMAP LEAVES
  const nodes = g.selectAll(".node")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // FORMAT RECTANGLES
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", "lightblue")
    .attr("stroke", "white")
    // ADD TOOLTIP ANIMATION
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(100).style("opacity", 1);
      tooltip.html(`
        <strong>Group:</strong> ${d.data.key}<br>
        <strong>Size:</strong> ${d.data.size}
      `)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(100).style("opacity", 0);
    });

  // DRAW INNTER PIE CHARTS FOR PROPORTIONAL DATA
  nodes.each(function (d) {
    const group = d3.select(this);
    const rectWidth = d.x1 - d.x0;
    const rectHeight = d.y1 - d.y0;
    // Choosing 3 because it looks better for the inner pie charts
    const radius = Math.min(rectWidth, rectHeight) / 3;

    // Extract data for the current block
    const details = d.data.details;
    const pieData = d3.group(details, item => item[options["Category"]]);
    const aggregatedPieData = [];

    // Similar functionality to the treemap data
    for (const [key, group] of pieData) {

        let sum = 0;
        for (const g of group) {
            sum += +g[options["Value"]]; 
        }
        if (sum > 0) {

            aggregatedPieData.push({
                key: key, 
                value: sum 
            });
        }
    }

    // Dont bother drawing empty pie charts
    if (aggregatedPieData.length === 0) {
      return; 
    }

    // DRAW PIE CHART
    // Derived from existing pie chart code
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const pieGroup = group.append("g")
      .attr("transform", `translate(${rectWidth / 2}, ${rectHeight / 2})`);

    // HANDLE TOOL PIT ANIMATION FOR THE PIE CHART
    pieGroup.selectAll("path")
      .data(pie(aggregatedPieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(`
              <strong>Category:</strong> ${d.data.key}<br>
              <strong>${options["Value"]} Value:</strong> ${d.data.value}

            `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(100).style("opacity", 0);
      });
  });

  // ADD DYNAMIC TITLE
  svg.append("text")
    .attr("x", outerWidth / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${options["Group By"]} Treemap with ${options["Category"]} Distribution`);
}
