export function createStackedAreaChart(svg, data, options) {
  const margin = { top: 20, right: 150, bottom: 60, left: 60 }; // Increased right margin for legend space
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Group the data by the selected category
  const groupedData = d3.group(data, d => d[options["Group By"]]);

  // Get unique categories for stacking
  const categories = Array.from(new Set(data.map(d => d[options["Stack By"]])));

  // Prepare data for stacking
  const stackData = Array.from(groupedData, ([key, values]) => {
    const obj = { [options["Group By"]]: key };
    categories.forEach(category => {
      const value = values.find(v => v[options["Stack By"]] === category);
      obj[category] = value ? +value[options["Values"]] : 0;
    });
    return obj;
  });

  // Sort data by the "Group By" field
  stackData.sort((a, b) => d3.ascending(a[options["Group By"]], b[options["Group By"]]));

  // Create color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);

  // Create scales
  const x = d3.scalePoint()
    .range([0, width])
    .padding(0.1)
    .domain(stackData.map(d => d[options["Group By"]]));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(stackData, d => d3.sum(categories, c => d[c]))]).nice();

  // Stack the data
  const stack = d3.stack().keys(categories);
  const stackedData = stack(stackData);

  // Create area generator
  const area = d3.area()
    .x(d => x(d.data[options["Group By"]]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  // Add stacked areas
  g.selectAll(".area")
    .data(stackedData)
    .enter().append("path")
    .attr("class", "area")
    .attr("d", area)
    .style("fill", d => color(d.key))
    .style("opacity", 0.7);

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

  // Add X axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 40})`)
    .style("text-anchor", "middle")
    .text(options["Group By"]);

  // Add Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 4)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(options["Values"]);

  // Add legend to the side
  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(categories)
    .enter().append("g")
    .attr("transform", (d, i) => `translate(${width + margin.left + 20},${margin.top + i * 20})`);

  legend.append("rect")
    .attr("x", 0)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", color);

  legend.append("text")
    .attr("x", 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(d => d);

  // Add title
  svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`Stacked Area Chart: ${options["Values"]} by ${options["Group By"]} and ${options["Stack By"]}`);
}
