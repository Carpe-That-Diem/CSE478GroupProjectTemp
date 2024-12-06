import { createBarChart } from './visualizations/barChart.js';
import { createScatterPlot } from './visualizations/scatterPlot.js';
import { createPieChart } from './visualizations/pieChart.js';
import { createTreemapWithPie } from './visualizations/innovativeChart.js';
import { createStackedAreaChart } from './visualizations/stackedAreaChart.js';
import { createBoxPlot } from './visualizations/boxPlot.js';

export function createVisualization(vizType, data, options) {
    const visualizationArea = d3.select(".visualization");
    visualizationArea.selectAll("*").remove();

    const svg = visualizationArea
        .append("svg")
        .attr("width", 1200)
        .attr("height", 800);

    switch (vizType) {
        case "bar":
            createBarChart(svg, data, options);
            break;
        case "scatter":
            createScatterPlot(svg, data, options);
            break;
        case "pie":
            createPieChart(svg, data, options);
            break;
        case "innovative":
            createTreemapWithPie(svg, data, options)
            break;
        case "stacked":
            createStackedAreaChart(svg, data, options);
            break;
        case "box":
            createBoxPlot(svg, data, options);
            break;
        default:
            svg.append("text")
                .attr("x", 400)
                .attr("y", 250)
                .attr("text-anchor", "middle")
                .text("No Valid Viz Selected!");
    }
}

