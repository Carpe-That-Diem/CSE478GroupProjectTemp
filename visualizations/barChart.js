export function createBarChart(svg, data, options) {
    const margin = { top: 40, right: 20, bottom: 120, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .rangeRound([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Set the domains based on the data
    x.domain(data.map(d => d[options["X Axis"]]));
    y.domain([0, d3.max(data, d => +d[options["Y Axis"]])]);

    // Add the x-axis
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add the y-axis
    g.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Add the bars
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[options["X Axis"]]))
        .attr("y", d => y(+d[options["Y Axis"]]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(+d[options["Y Axis"]]))
        .attr("fill", "steelblue");

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 90})`) // Adjusted vertical position
        .style("text-anchor", "middle")
        .text(options["X Axis"]);

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 4)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(options["Y Axis"]);

    // Add chart title
    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(options["Y Axis"] + " vs " + options["X Axis"]);
}
