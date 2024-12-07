import { loadCSVData } from './csvLoader.js';
import { filterByInterval, identifyAttributes } from './dataProcessor.js';
import { createVisualization } from './Visualization.js';

export class UI {
    constructor() {
        // Define intervals for the timeline
        // Each interval represents a specific era
        this.intervals = [
            "2003-2007",
            "2007-2011",
            "2011-2015",
            "2015-2019",
            "2019-2023"
        ];
        this.currentIntervalIndex = 0;
        // Grab the HTML elements for future use
        this.yearDisplay = document.getElementById("year-display");
        this.prevButton = document.getElementById("prev-button");
        this.nextButton = document.getElementById("next-button");
        this.vizTypeSelect = document.getElementById("viz-type-select");
        this.data = null;
        this.categorical = null;
        this.numerical = null;

        // Hard coded content for the visualization
        this.intervalContent = {
            "2003-2007": {
                heading: "Rebuilding and Stabilization",
                body: "This era marked Manchester City's journey to rebuild and find stability after years of inconsistency. In 1999, the club escaped the third tier of English football, achieving promotion to the First Division (now EFL Championship), and by 2000, they were back in the Premier League. However, City struggled to compete consistently at the highest level, often finishing in the lower half of the table. Lacking squad depth and resources, they remained a largely mediocre side, laying the groundwork for future growth."
            },
            "2007-2011": {
                heading: "Investment and Innovation",
                body: "The Abu Dhabi United Group's purchase of Manchester City in 2008 was a turning point, bringing unprecedented investment into the club. Key signings like Carlos Tevez in 2009 and Roberto Mancini's appointment as manager that same year signaled the start of an ambitious project. In 2011, City won their first major trophy in decades with an FA Cup victory, and the signing of Sergio Agüero that summer added another star to their growing roster. This period set the stage for the club's rise to elite status in football."
            },
            "2011-2015": {
                heading: "Transformation and Rise",
                body: "Under Mancini and later Manuel Pellegrini, Manchester City solidified themselves as a powerhouse. The dramatic 2011/2012 Premier League title win, sealed by Agüero's iconic last-minute goal, ended a 44-year drought. Pellegrini's arrival in 2013 introduced a more attacking style, and by 2015, the signing of Kevin De Bruyne showcased City's intent to compete at the highest level. This era was pivotal in establishing City as consistent contenders in both domestic and European competitions."
            },
            "2015-2019": {
                heading: "Performance and Excellence",
                body: "Pep Guardiola's appointment in 2016 ushered in a period of dominance defined by tactical brilliance and record-breaking achievements. In the 2017/2018 season, City became “Centurions,” amassing 100 points—a feat rarely achieved in football history. Guardiola's team combined style with substance, regularly setting new benchmarks for success in the Premier League and beyond."
            },
            "2019-2023": {
                heading: "Leadership and Success",
                body: "This era cemented Manchester City's place among the footballing elite. The 2022 signing of Erling Haaland added a prolific scorer to an already world-class squad. In 2023, City achieved a historic Treble, winning the Premier League, FA Cup, and their first UEFA Champions League title. These accomplishments underscored their dominance and marked one of the most successful periods in the club's history."
            }
        };
    }

    // Initializes the navigation functionality
    initializeYearNavigation() {
        // Make sure the displayed interval matches the current interval
        this.updateYearDisplay();

        // Check for the existence of the buttons
        if (this.prevButton && this.nextButton) {
            // For the previous button
            this.prevButton.addEventListener("click", () => {
                // Do not go past the first interval
                if (this.currentIntervalIndex > 0) {
                    // Decrease the interval
                    this.currentIntervalIndex--;
                    // Make sure the displayed interval matches the current interval
                    this.updateYearDisplay();
                    // Refresh the visualization for the current interval
                    this.refreshVisualization();
                }
            });

            // For the next button
            this.nextButton.addEventListener("click", () => {
                // Do not go past the last interval
                if (this.currentIntervalIndex < this.intervals.length - 1) {
                    // Increase the interval
                    this.currentIntervalIndex++;
                    // Make sure the displayed interval matches the current interval
                    this.updateYearDisplay();
                    // Refresh the visualization for the current interval
                    this.refreshVisualization();
                }
            });
        }
    }

    //Match the displayed interval to the current interval
    updateYearDisplay() {
        // Check if the year exists
        if (this.yearDisplay) {
            // Update the display to show the current interval
            this.yearDisplay.textContent = this.intervals[this.currentIntervalIndex];
        }

        // Update the content dynamically
        const interval = this.intervals[this.currentIntervalIndex];
        const content = this.intervalContent[interval];

        // Grab the elements where the content will be displayed
        const headingElement = document.querySelector(".heading-text h2");
        const bodyElement = document.querySelector(".heading-text p");

        // Update the content
        if (content) {
            headingElement.textContent = content.heading;
            bodyElement.textContent = content.body;
        }

        // Do not print hte interval if it is at its extremes
        if (this.prevButton && this.nextButton) {
            this.prevButton.style.visibility = this.currentIntervalIndex === 0 ? "hidden" : "visible";
            this.nextButton.style.visibility = this.currentIntervalIndex === this.intervals.length - 1 ? "hidden" : "visible";
        }
    }


    initializeVisualizationDropdown() {
        // Does the viz exist?
        if (this.vizTypeSelect) {
            // For the viz choice
            this.vizTypeSelect.addEventListener("change", () => {
                // Grab the viz currently selected by the user
                const selectedVizType = this.vizTypeSelect.value;
                // Remove items in the visualziation area in all other scenarios
                if (selectedVizType === "default") {
                    d3.select(".visualization").selectAll("*").remove();; 
                    return;
                }
                // update the viz specific options based on the viz selected
                this.updateVizOptions(selectedVizType);
                // Reflect the viz selected by the user
                this.refreshVisualization();
            });
        }

        // If the user selects a viz type option refresh the viz
        document.getElementById("options-container").addEventListener("change", () => {
            this.refreshVisualization();
        });

        // load the data on move to a new visualization
        this.loadData();
    }

    loadData() {
        // Use the helper function
        loadCSVData("./data/Manchester_City_Standard_Stats_By_Season.csv", (data) => {
            // make the data in the dataset useable for the other visualziations
            this.data = data;
            const { categorical, numerical } = identifyAttributes(data);
            this.categorical = categorical;
            this.numerical = numerical;

            // Send the processed data over to the viz options and viz area
            const selectedVizType = this.vizTypeSelect.value;
            this.updateVizOptions(selectedVizType);
            this.refreshVisualization();
        });
    }

    updateVizOptions(vizType) {
        // Grab the container element
        const optionsContainer = document.getElementById("options-container");
        optionsContainer.innerHTML = "";
        // Trying to hardcode the viz option choices
        const optionsConfig = {
            bar: [
                { label: "X Axis", source: this.categorical },
                { label: "Y Axis", source: this.numerical }
            ],
            scatter: [
                { label: "X Axis", source: this.numerical },
                { label: "Y Axis", source: this.numerical },
                { label: "Color", source: this.categorical }
            ],
            pie: [
                { label: "Value", source: this.numerical }
            ],
            innovative: [
                { label: "Group By", source: this.categorical },
                { label: "Category", source: this.categorical },
                { label: "Value", source: this.numerical }
            ],
            stacked: [
                { label: "Group By", source: this.categorical },
                { label: "Stack By", source: this.categorical },
                { label: "Values", source: this.numerical }
            ],
            box: [
                { label: "Group", source: this.categorical },
                { label: "Values", source: this.numerical }
            ]
        };

        const options = optionsConfig[vizType];

        // DERIVED FROM AYDEN HW 4
        // DERIVED FROM https://stackoverflow.com/questions/7054187/dynamic-dropdown
        options.forEach(option => {
            if (!option.source || option.source.length === 0) {
                console.warn(`No data available for ${option.label}`);
                return;
            }
            const div = document.createElement("div");
            div.classList.add("option");

            const label = document.createElement("label");
            label.textContent = option.label;

            const select = document.createElement("select");
            option.source.forEach(value => {
                const opt = document.createElement("option");
                opt.value = value;
                opt.textContent = value;
                select.appendChild(opt);
            });

            div.appendChild(label);
            div.appendChild(select);
            optionsContainer.appendChild(div);
        });
    }

    refreshVisualization() {
        // is the data loaded?
        if (!this.data) {
            console.warn("Data not loaded yet");
            return;
        }

        // Prepare the data for visualization creation
        const selectedVizType = this.vizTypeSelect.value;
        const selectedInterval = this.intervals[this.currentIntervalIndex];
        const filteredData = filterByInterval(this.data, selectedInterval);
        
        // For safety
        if (filteredData.length === 0) {
            d3.select(".visualization").html("<p>No data found!</p>");
            return;
        }

        // Prepare the data for visualization creation
        const options = this.getSelectedOptions();
        createVisualization(selectedVizType, filteredData, options);
    }

    getSelectedOptions() {
        // Dynamically go through and grab all of the selection elements so that the viz's have attributes to work with
        const options = {};
        const optionsContainer = document.getElementById("options-container");
        const selects = optionsContainer.querySelectorAll("select");
        selects.forEach(select => {
            options[select.previousElementSibling.textContent] = select.value;
        });
        return options;
    }
}

