export function createStackedAreaChart(svg, data, options) {

  // init the margin here
  const margin = { top: 40, right: 150, bottom: 120, left: 60 }; 
  // read the width/ height from svg
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // group the data first
  const groupedData = d3.group(data, d => d[options["Group By"]]);

  // get all unique category
  const categories = Array.from(new Set(data.map(d => d[options["Stack By"]])));

  const stackData = Array.from(groupedData, ([key, values]) => {
    const obj = { [options["Group By"]]: key };
    categories.forEach(category => {
      const value = values.find(v => v[options["Stack By"]] === category);
      if (value) {
        obj[category] = +value[options["Values"]];
      } else {
        obj[category] = 0;
      }
    });
    return obj;
  });

  stackData.sort((a, b) => d3.ascending(a[options["Group By"]], b[options["Group By"]]));

  // color scale and init x and y axis
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);
  const x = d3.scaleBand()
    .range([0, width])
    .padding(0.2)
    .domain(stackData.map(d => d[options["Group By"]]));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(stackData, d => d3.sum(categories, c => d[c]))]).nice();

  const stack = d3.stack().keys(categories);
  const stackedData = stack(stackData);

  // init and generate the area
  const area = d3.area()
    .x(d => x(d.data[options["Group By"]]) + x.bandwidth() / 2)
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  g.selectAll(".area")
    .data(stackedData)
    .enter().append("path")
    .attr("class", "area")
    .attr("d", area)
    .style("fill", d => color(d.key))
    .style("opacity", 0.7);

  // deal w/ axises
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");
  g.append("g")
    .call(d3.axisLeft(y));

  // add labels for axises
  svg.append("text")
    .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 80})`) // Adjust vertical position
    .style("text-anchor", "middle")
    .text(options["Group By"]);
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left / 4)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(options["Values"]);

  // legend on left
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

  // title
  svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${options["Values"]} by ${options["Group By"]} and ${options["Stack By"]}`);
}
