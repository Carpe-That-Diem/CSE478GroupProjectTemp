export function createBoxPlot(svg, data, options) {

  const margin = { top: 40, right: 20, bottom: 120, left: 60 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const groupedData = d3.group(data, d => d[options.Group]);

  const boxPlotData = [];

  // HW4 Be mindful of less than 5 points
  for (const [key, group] of groupedData) {

    const values = group.map(d => +d[options.Values])
      .filter(v => v >= 0)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      continue;
    }

    // HW4
    if (values.length < 5) {
      boxPlotData.push({ key, values, isSmallData: true });
      continue;
    }

    // TODO ADD TO INDEPENDENT HELPER FUNCTION FOR READABILIY 
    // FROM HW4
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const interQuantileRange = q3 - q1;
    const min = Math.max(q1 - 1.5 * interQuantileRange, d3.min(values));
    const max = Math.min(q3 + 1.5 * interQuantileRange, d3.max(values));
    const outliers = values.filter(v => v > max);

    boxPlotData.push({ key, q1, median, q3, interQuantileRange, min, max, values, outliers, isScatter: false });

  }

  // X SCALE
  const x = d3.scaleBand()
    .range([0, width])
    .domain(boxPlotData.map(d => d.key))
    .padding(0.1);

  let overallMax = 0;

  // FIND THE MAX TO PROPERLY SCALE AXIS
  boxPlotData.forEach(group => {
    const maxWhisker = group.max || 0;
    const maxOutlier = group.outliers ? Math.max(...group.outliers) : 0;
    const maxValue = group.values ? Math.max(...group.values) : 0;
    const groupMax = Math.max(maxWhisker, maxOutlier, maxValue);
    if (groupMax > overallMax) {
      overallMax = groupMax;
    }
  });

  // Y SCALE
  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, overallMax])


  // X AXIS
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  // TITLE
  svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${options.Values} by ${options.Group}`);

  // Y AXIS
  g.append("g")
    .call(d3.axisLeft(y));

  // X LABEL
  svg.append("text")
    .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 90})`)
    .style("text-anchor", "middle")
    .text(options.Group);

  // Y LABELL
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 4)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(options.Values);

  // HW4 no min maxing
  const boxWidth = x.bandwidth();

  // START THE BOX PLOT FOUNDATION
  g.selectAll(".boxplot")
    .data(boxPlotData)
    .join("g")
    .attr("transform", d => `translate(${x(d.key)},0)`)
    .each(function (d) {
      const group = d3.select(this);

      // LESS THAN 5 POINTS?
      if (d.isSmallData) {
        // JUST PRINT THE POINTS
        group.selectAll(".point")
          .data(d.values)
          .join("circle")
          .attr("class", "point")
          .attr("cx", boxWidth / 2)
          .attr("cy", v => y(v))
          .attr("r", 5)
          .attr("fill", "steelblue")
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);
      } else {

        // BOX (of the box plot :D)
        group.append("rect")
          .attr("x", 0)
          .attr("y", d => y(d.q3))
          .attr("width", boxWidth)
          .attr("height", d => y(d.q1) - y(d.q3))
          .attr("fill", "steelblue")
          .attr("stroke", "black");

        // MEDIAN
        group.append("line")
          .attr("x1", 0)
          .attr("x2", boxWidth)
          .attr("y1", d => y(d.median))
          .attr("y2", d => y(d.median))
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        // BOTTOM LINE
        group.append("line")
          .attr("x1", boxWidth / 2)
          .attr("x2", boxWidth / 2)
          .attr("y1", d => y(d.min))
          .attr("y2", d => y(d.q1))
          .attr("stroke", "black");

        // TOP LINE
        group.append("line")
          .attr("x1", boxWidth / 2)
          .attr("x2", boxWidth / 2)
          .attr("y1", d => y(d.q3))
          .attr("y2", d => y(d.max))
          .attr("stroke", "black");

        // WHISKER
        group.append("line")
          .attr("x1", boxWidth * 0.25)
          .attr("x2", boxWidth * 0.75)
          .attr("y1", d => y(d.min))
          .attr("y2", d => y(d.min))
          .attr("stroke", "black");

        // WHISKER
        group.append("line")
          .attr("x1", boxWidth * 0.25)
          .attr("x2", boxWidth * 0.75)
          .attr("y1", d => y(d.max))
          .attr("y2", d => y(d.max))
          .attr("stroke", "black");

        // ADD ONLY POSITIVE OUTLIER
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
}
