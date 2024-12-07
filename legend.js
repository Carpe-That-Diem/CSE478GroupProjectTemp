const legendContainer = svg.append("foreignObject")
    .attr("x", width - 500)
    .attr("y", 70)
    .attr("width", 500)
    .attr("height", height-100)
    .style("overflow", "hidden");


const legendDiv = legendContainer.append("xhtml:div")
    .style("height", "100%")
    .style("overflow-y", "scroll")
    .style("display", "block")
    .style("max-height", height-100)
    .style("width", "100%")
    .style("box-sizing", "border-box");

const legend = legendDiv.selectAll(".legend")
    .data(pieData)
    .enter().append("div")
    .attr("class", "legend-item")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-bottom", "5px")
    .style("margin-left", "200px")
    .style("margin-top", "10px");


legend.append("div")
    .style("width", "20px")
    .style("height", "20px")
    .style("background-color", d => color(d.key));

legend.append("span")
    .style("margin-left", "10px")
    .style("white-space", "nowrap")
    .text(d => d.key);
