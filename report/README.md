# Academic reports

This directory contains the academic reports for the project.

- `mongodb-ais-maritime-analytics-report-en.pdf` - English report
- `mongodb-ais-maritime-analytics-report-gr.pdf` - Greek report
- `main.tex` - English LaTeX source

The reports cover:

1. Dataset and preprocessing
2. MongoDB schema design
3. Geospatial and temporal modeling
4. Indexing strategy
5. Hashed sharding and balancing diagnostics
6. Relational-style, spatial, and spatio-temporal queries
7. Query-result examples
8. Experimental methodology
9. p50/p95 latency and execution statistics
10. Limitations and future work

## Build

From the repository root:

```bash
make report
```

or directly:

```bash
cd report
latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex
```

The checked-in PDFs are provided for convenience. LaTeX auxiliary files are excluded by `.gitignore`.

## Measurement note

The Q1 text-query latency values are retained, but the scan/return counts are not published because the values used during report formatting were not retained as verified execution statistics. The repository therefore reports them as `N/A` rather than presenting placeholders as measurements.
