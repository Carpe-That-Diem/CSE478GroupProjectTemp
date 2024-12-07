export function createPieChart(svg, data, options) {

  // read the width/ height from svg
  const width = +svg.attr("width") - 100;
  const height = +svg.attr("height") - 100;
  const radius = Math.min(width, height) / 3;

  // color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  // init pie chart
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);
  // remove in case repeating
  d3.selectAll(".tooltip").remove();

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid white")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("opacity", 0);

  // init arc
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 40);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // caculate for # of bins
  const values = data.map(d => +d[options.Value]);
  console.log(values);
  const uniqueValues = [...new Set(values)];
  const numBins = Math.min(uniqueValues.length, 5);

  // crate sacle
  const binScale = d3.scaleQuantize()
  .domain(d3.extent(values)) 
  .range(d3.range(numBins)); 

  // array to count the number of items in each bin
  const bins = new Array(numBins).fill(0);
  values.forEach(value => {
    const binIndex = binScale(value);
    bins[binIndex] += 1;
  });

  //  percentatge for each
  const totalDataPoints = values.length;
  const percentages = bins.map(binCount => (binCount / totalDataPoints) * 100);

  // labels
  const binLabels = d3.range(numBins).map((binIndex) => {
    const start = binScale.invertExtent(binIndex)[0];
    const end = binScale.invertExtent(binIndex)[1];
    return `${Math.floor(start)} - ${Math.floor(end)}`;
  });

  // data w/ label and values
  const pieData = d3.range(numBins).map((binIndex, i) => ({
    key: binLabels[i],
    value: percentages[i]
  }));

  const arcs = g.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

  // drawing and add hover
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
  // add titlle
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 80)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`Player ${options.Value} Distribution`);
  // annotation for user
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(`Hover over a slice of the chart for more info about the category`);
}

