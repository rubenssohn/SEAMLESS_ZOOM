# SEAMLESS_ZOOM
This repository comprises a web application to seamlessly transition between instance- and process-level over multiple abstraction levels of event data in process mining. 

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
3. Execute the program in the command-line tool with `flask --app webapp run` (optional: add `--port 8000` and/or  `--debug`)
4. Run the program over the URL `http://127.0.0.1:5000/` (adapt port number `5000` if necessary)

## Import own log (.xes)
By default, the program utilizes a running example log from https://processmining.org/old-version/event-book.html. 
To add your own event log (.xes), simply upload it via the *Choose File* option and then select *Import Event Log*. After import, the program will pre-process the log for d3.js (.json). 
The program also allows .csv files, although they must be pre-processed manually. The Python function `process_log_for_d3js(df)`in `"src/orchestration"` can be used for this purpose.

Some logs recommended are: 
* Sepsis cases: https://doi.org/10.4121/uuid:915d2bfb-7e84-49ad-a286-dc35f063a460
* Road traffic fine management process: https://doi.org/10.1007/s00607-015-0441-1

## Define new abstraction levels
See `Contour lines` below.

## Interface
### Element transitions
The following parameters adapt the visual encoding of the graph and the transitions. 

* *Gradual change in opacity for instance elements*: Enable the the opacity level of the underlying instance graph to be dynamically adapted with the abstraction level. (*Off*: Graph always visible; *Edges*: Only adapt edges; *Graph*: Adapt entire graph)
* *Enable instance element rendering*: Enable all visual elements to be dynamically hidden with the abstraction levels. (*Note: Enabling this alternative slows down performance.)*
* *Show/Hide activities*: Change the visual encoding to a typical DFG.

### Contour lines
The following parameters can be used to redefine the abstraction levels using a contour diagram.

* *Bandwidth*: Changes the smoothness of the kernel density estimator that produces the contour diagram.
* *Thresholds*: Changes the number of abstraction levels (*Note: The threshold does not equal the number of abstraction levels. This parameter draws approximately uniformly spaced lines based on a 2D Gaussian kernel density estimator.*)
* *Show/Hide contour lines*: Shows or hides the contour diagram.
* *Update Graph*: Updates the graph with new abstraction levels based on the current contour diagram configurations.

### Import / Export
* *Choose File*: Choose a file to upload. Only takes .xes- and (pre-processed) .csv files.
* *Import Event Log*: Import the uploaded file. When done, the graph will be updated.
* *Reset to Example Log*: Reset the graph to the example log in `"data/example_data"`.
* *Export SVG*: Downloads the graph with its current styles in .svg format. Also, a .txt document with the current configurations will be downloaded.


---
## TROUBLESHOOTING
**(1) Directory problem:**
The program was only tested on macOS. On other OS, the program might have trouble finding the folders in the directories of your computer. 
Please consider adapting the `project_root` variable in `"webapp/pages.py"`.

**(2) Import problem:**
Please consider only .xes files or pre-process .csv files (as described above). If a log doesn't work, be sure that it contains at least the following columns:
* Activity: `"concept:name"`
* Case: `"case:concept:name"`
* Time: `"time:timestamp"`

None of these columns should contain any empty values.

**(3) Export problem:**
If the .txt file is downloaded without a .svg, something is wrong. This is a bug that only happens for some log and will be fixed soon.

**(4) Dynamic opacity problems:**
When using the dynamic opacity transition (Edges/Graph) in combination with *Enable instance element rendering*, some hidden elements can be stuck. If this happens, turn on *Graph* and *Enable instance element rendering* and move the abstraction slider to the highest level. Then, turn off *Enable instance element rendering* and move back the abstraction slider to the lowest level again.
This is a bug that will be fixed soon.

**(5) Slow Performance:**
The application should be able to render any typical benchmark event log in process mining relatively quickly. However, large data sets (approx. > 10,000 cases) can result in slower transitions. Therefore, it is recommended to:
* Filter logs (< 1,000 cases).
* Use *Enable instance element rendering* only for smaller logs (e.g., 100 cases). Use instead the dynamic opacity parameters (*Edges/Graph*).