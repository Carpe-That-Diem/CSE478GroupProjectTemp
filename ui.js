import { loadCSVData } from './csvLoader.js';
import { filterByInterval, identifyAttributes } from './dataProcessor.js';
import { createVisualization } from './Visualization.js';

export class UI {
    constructor() {
        this.intervals = [
            "2003-2007",
            "2007-2011",
            "2011-2015",
            "2015-2019",
            "2019-2023"
        ];
        this.currentIntervalIndex = 0;
        this.yearDisplay = document.getElementById("year-display");
        this.prevButton = document.getElementById("prev-button");
        this.nextButton = document.getElementById("next-button");
        this.vizTypeSelect = document.getElementById("viz-type-select");
        this.data = null;
        this.categorical = null;
        this.numerical = null;
    }

    initializeYearNavigation() {
        this.updateYearDisplay();
    
        if (this.prevButton && this.nextButton) {
            this.prevButton.addEventListener("click", () => {
                if (this.currentIntervalIndex > 0) {
                    this.currentIntervalIndex--;
                    this.updateYearDisplay();
                    this.refreshVisualization();
                }
            });
    
            this.nextButton.addEventListener("click", () => {
                if (this.currentIntervalIndex < this.intervals.length - 1) {
                    this.currentIntervalIndex++;
                    this.updateYearDisplay();
                    this.refreshVisualization();
                }
            });
        }
    }
    
    updateYearDisplay() {
        if (this.yearDisplay) {
            this.yearDisplay.textContent = this.intervals[this.currentIntervalIndex];
        }
    
        if (this.prevButton && this.nextButton) {
            this.prevButton.style.visibility = this.currentIntervalIndex === 0 ? "hidden" : "visible";
            this.nextButton.style.visibility = this.currentIntervalIndex === this.intervals.length - 1 ? "hidden" : "visible";
        }
    }
    
    initializeVisualizationDropdown() {
        if (this.vizTypeSelect) {
            this.vizTypeSelect.addEventListener("change", () => {
                const selectedVizType = this.vizTypeSelect.value;
                this.updateVizOptions(selectedVizType);
                this.refreshVisualization();
            });
        }

        document.getElementById("options-container").addEventListener("change", () => {
            this.refreshVisualization();
        });

        // Initial data load
        this.loadData();
    }
    
    loadData() {
        loadCSVData("/data/Manchester_City_Standard_Stats_By_Season.csv", (data) => {
            this.data = data;
            const { categorical, numerical } = identifyAttributes(data);
            this.categorical = categorical;
            this.numerical = numerical;
            
            // Initial visualization setup
            const selectedVizType = this.vizTypeSelect.value;
            this.updateVizOptions(selectedVizType);
            this.refreshVisualization();
        });
    }

    updateVizOptions(vizType) {
        const optionsContainer = document.getElementById("options-container");
        optionsContainer.innerHTML = ""; 
      
        const optionsConfig = {
          bar: [
            { label: "X Axis", source: this.categorical },
            { label: "Y Axis", source: this.numerical }
          ],
          scatter: [
            { label: "X Axis", source: this.numerical },
            { label: "Y Axis", source: this.numerical },
            { label: "Color", source: this.numerical }
          ],
          pie: [
            { label: "Category", source: this.categorical },
            { label: "Value", source: this.numerical }
          ],
          innovative: [
            { label: "Group By", source: this.categorical },
            { label: "Size", source: this.numerical},
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
        if (!this.data) {
            console.warn("Data not loaded yet");
            return;
        }

        const selectedVizType = this.vizTypeSelect.value;
        const selectedInterval = this.intervals[this.currentIntervalIndex];
        const filteredData = filterByInterval(this.data, selectedInterval);

        if (filteredData.length === 0) {
            d3.select(".visualization").html("<p>No data available for the selected interval.</p>");
            return;
        }

        const options = this.getSelectedOptions();
        createVisualization(selectedVizType, filteredData, options);
    }

    getSelectedOptions() {
        const options = {};
        const optionsContainer = document.getElementById("options-container");
        const selects = optionsContainer.querySelectorAll("select");
        selects.forEach(select => {
            options[select.previousElementSibling.textContent] = select.value;
        });
        return options;
    }
}

