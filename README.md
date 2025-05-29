# SEAMLESS_ZOOM

Install in root folder:
1. Download the repository to your computer and go to the project root folder in the terminal.
2. Create a new virtual environment with `python -m venv [namevenv]`
3. Activate the new virtual environment with `python -m venv [namevenv]`
4. Install the requirements with `pip install -r requirements/requirements_base.txt` (alternative: `pip install -r requirements/requirements_freeze202505.txt`)

Run:
* Console: `python -m flask --app webapp run` with the alternative to add `--port 8000`and  `--debug`
* Browser: `http://127.0.0.1:5000/` (adapt port number `5000` if necessary)