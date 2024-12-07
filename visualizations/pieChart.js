export function createPieChart(svg, data, options) {
  const width = +svg.attr("width") - 100;
  const height = +svg.attr("height") - 100;
  const radius = Math.min(width, height) / 3;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

  d3.selectAll(".tooltip").remove();

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid white")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("opacity", 0);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 40);

  const labelArc = d3.arc()
    .innerRadius(radius - 80)
    .outerRadius(radius - 80);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const values = data.map(d => +d[options.Value]);
  console.log(values);
  const uniqueValues = [...new Set(values)];
  const numBins = Math.min(uniqueValues.length, 5);
  const min = d3.min(values);
  const max = d3.max(values);

  const binScale = d3.scaleQuantize()
    .domain([min, max])
    .range(d3.range(numBins));

  const bins = new Array(numBins).fill(0);
  values.forEach(value => {
    const binIndex = binScale(value);
    bins[binIndex] += 1;
  });

  const totalDataPoints = values.length;
  const percentages = bins.map(binCount => (binCount / totalDataPoints) * 100);

  const binLabels = d3.range(numBins).map((binIndex) => {
    const start = binScale.invertExtent(binIndex)[0];
    const end = binScale.invertExtent(binIndex)[1];
    return `${Math.floor(start)} - ${Math.floor(end)}`;
  });

  const pieData = d3.range(numBins).map((binIndex, i) => ({
    key: binLabels[i],
    value: percentages[i]
  }));

  console.log(pieData);

  const arcs = g.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");


  arcs.append("path")
    .attr("d", arc)
    .style("fill", (d, i) => color(i))
    .style("stroke", "white")
    .style("stroke-width", "1px")
    .style("opacity", 0.8)
    .on("mouseover", function (event, d) {
      div.style("opacity", .9);
      div.html(
        options.Value + ": " + d.data.key + "<br/>" +
        "Percentage: " + d.data.value
      )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", d => {
      div.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
      div.style("opacity", .9);;
    })
    .on("mouseout", d => {
      div.style("opacity", 0);
    });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 80)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`Player ${options.Value} Distribution`);
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(`Hover over a slice of the chart for more info about the category`);
}

