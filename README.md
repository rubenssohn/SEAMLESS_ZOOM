# SEAMLESS_ZOOM
This repository comprises a web application tool to seamlessly transition between instance- and process-level over multiple abstraction levels of event data in process mining. 

---

## Setup
1. Download and place the "SEAMLESS_ZOOM" folder somewhere on your computer
2. Create a new virtual environment with `python -m venv [namevenv]` (Recommended)
3. Activate the new virtual environment with `python -m venv [namevenv]` (Recommended)
3. Install the necessary requirements with `pip install -r requirements/requirements_base.txt` (alternative: `pip install -r requirements/requirements_freeze202505.txt`)

---
## HOW TO USE THE APPLICATION: 
## Execute Program
1. Open the terminal on your computer (e.g., "Terminal" on macOS)
2. In the terminal: Navigate to the folder "SEAMLESS_ZOOM" via the terminal (`$cd ./SEAMLESS_ZOOM `)
3. Execute the program in the command-line tool with `flask --app webapp run` (optional: add `--port 8000` and  `--debug`)
4. Run the program over the URL `http://127.0.0.1:5000/` (adapt port number `5000` if necessary)
5. The abstraction level can be adjusted with the slider under the graph. For defining new abstraction levels, see "Contour Lines" below.

## Import own log (.xes)
By default, the program utilizes a running example log from `"https://processmining.org/old-version/event-book.html"`. 
To add your own event log (.xes), simply upload it via the "Choose File" option and then select "Import Event Log." After import, the program will pre-process the log for d3.js (JSON). 
The program also allows pre-processed .csv files. Pre-processing must be manually done. The Python function `process_log_for_d3js(df)`in `"src/orchestration"` can be used for this purpose.

Some logs recommended are: 
* Sepsis cases: https://doi.org/10.4121/uuid:915d2bfb-7e84-49ad-a286-dc35f063a460
* Road traffic fine management process: https://doi.org/10.1007/s00607-015-0441-1

## Interface
### Element transitions
The following parameters adapt the visual coding between the transitions. 

* "Gradual change in opacity for instance elements": Dynamically adapt the opacity level of the underlying instance graph with the abstraction level. (Off: Graph always visible; Edges: Only adapt edges; Graph: Adapt entire graph)
* "Enable instance element rendering": Dynamically hide all visual elements that are abstracted. (*Note: Enabling this alternative slows down performance.*
* "Show/Hide activities": Change the visual encoding to a typical DFG.

### Contour lines
The following parameters can be used to redefine the abstraction levels using a contour diagram.

* "Bandwidth": Changes the smoothness of the Kernel Density Estimator that produces the graph.
* "Thresholds": Changes the number of abstraction levels (*Note: The threshold does not equal the number of abstraction levels. This parameter draws approximately uniformly spaced lines based on a 2D Gaussian kernel density estimator.*)
* "Show/Hide contour lines": Shows or hides the contour diagram.
* "Update Graph": Updates the graph with new abstraction levels based on the current contour diagram.

### Import / Export
* "Choose File": Choose a file to upload. Only takes .xes- and (pre-processed) .csv files.
* "Import Event Log": Import the uploaded file. When done, the graph will be updated.
* "Reset to Example Log": Reset the graph to the example log in `data/example_data `.
* "Export SVG": Downloads the graph with styles in SVG format. Also, a .txt document with the current configurations will be downloaded.


---
## TROUBLESHOOTING
**(1) Directory problem:**
The program was only tested on macOS. On other OS, the program might have trouble finding the folders in the directories of your computer. 
Please consider adapting the `project_root` variable in `"webapp/pages.py"`.

**(2) Import problem:**
Please consider only .xes files or pre-process .csv files (as described above). If a log doesn't work, be sure that it contains at least the following columns, none of which should contain any empty values:
* Activity: `concept:name`
* Case: `case:concept:name`
* Time: `time:timestamp`

**(3) Export problem:**
If the .txt file is downloaded without a .svg, something is wrong. This is a bug that only happens for some log and will be fixed soon.

**(4) Dynamic opacity problems:**
When using the dynamic opacity transition (Edges/Graph) in combination with "Enable instance element rendering", some elements are kept hidden. 
This is a bug that will be fixed soon.
It is recommended to go back to the lowest abstraction level before changing "Enable instance element rendering".


**(5) Slow Performance:**
The application should be able to render any typical benchmark event log in process mining relatively quickly. However, large data sets (approx. > 10,000 cases) can result in slower transitions. Therefore, it is recommended to:
* Filter logs (< 1,000 cases).
* Use "Enable instance element rendering" only for smaller logs (e.g., 100 cases). Use instead the dynamic opacity parameters (Edges/Graph).