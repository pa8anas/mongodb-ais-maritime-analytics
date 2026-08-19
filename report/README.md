# Report source

Place the final LaTeX report source in this directory, for example:

- `main.tex`
- bibliography files (`.bib`) if used
- figures referenced by the report

Recommended layout:

```text
report/
├── main.tex
├── references.bib
└── figures/
```

The report should document:

1. Dataset and preprocessing
2. MongoDB schema design
3. Indexing strategy
4. Sharding strategy
5. Relational-style queries
6. Spatial queries
7. Spatio-temporal queries
8. Experimental methodology
9. p50/p95 latency and execution statistics
10. Limitations and reproducibility notes

Do not commit generated LaTeX build artefacts; they are ignored by the repository `.gitignore`.
