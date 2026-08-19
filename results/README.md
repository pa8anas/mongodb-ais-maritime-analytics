# Benchmark results

`benchmark_results.csv` contains the benchmark values reported in the project documentation.

The benchmark methodology uses:

- 30 repeated wall-clock executions per query
- p50 (median) and p95 latency
- `explain("executionStats")` for `totalDocsExamined` and `nReturned` where available

Important notes:

- Q1 scan/return counts are intentionally blank because no verified values were retained.
- Sharded execution statistics may aggregate work performed independently by multiple shards.
- Values are environment-specific and can vary with cache state, cluster tier, data density, query location, and chunk distribution.

The runnable harness is in `scripts/06_benchmark.js`.
