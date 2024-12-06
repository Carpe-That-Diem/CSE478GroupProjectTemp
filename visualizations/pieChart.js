export function createPieChart(svg, data, options) {
  const width = +svg.attr("width");
  const height = +svg.attr("height");
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
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Group the data by the selected category
  const groupedData = d3.group(data, d => d[options.Category]);

  // Calculate the sum for each category
  const pieData = Array.from(groupedData, ([key, group]) => ({
    key,
    value: d3.sum(group, d => +d[options.Value])
  }));

  const arcs = g.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .style("fill", d => color(d.data.key))
    .style("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.8);

  arcs.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "white")
    .text(d => {
      const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
      return percentage > 5 ? `${d.data.key} (${percentage}%)` : '';
    });

  // Add a legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 100},20)`)
    .selectAll(".legend")
    .data(pieData)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", d => color(d.key));

  legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("font-size", "12px")
    .text(d => d.key);

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${options.Category} by ${options.Value}`);
}

