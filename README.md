# nx-grapher-demo

A minimal Nx workspace demonstrating [nx-mermaid-grapher](https://github.com/Fcmam5/nx-mermaid-grapher) by automatically generating dependency graphs and stats in CI.

## What this demo does

This repository contains a tiny Nx workspace with 2 applications (`web`, `api`) and 4 shared libraries (`ui`, `data`, `utils`, `shared`) wired with cross-dependencies to produce an interesting dependency graph.

On every push and pull request, a GitHub Actions pipeline:

1. Generates the full project dependency graph (`nx graph`)
2. Generates the affected project dependency graph (`nx affected:graph`) on PRs
3. Feeds both graphs into `nx-mermaid-grapher` to produce Mermaid diagrams and stats
4. Posts a PR comment with collapsible sections showing both the full and affected graphs

The PR comment is **idempotent** — it updates the same comment on subsequent pushes instead of spamming new ones.

## How to try it locally

### Full graph

```bash
pnpm nx graph --file=graph.json
npx nx-mermaid-grapher -f graph.json -o mermaid --raw
npx nx-mermaid-grapher -f graph.json -o stats
```

### Affected graph

```bash
pnpm nx graph --file=graph.json
pnpm nx show projects --affected --base=main --head=HEAD --json > affected-projects.json

# Build -p args for the affected subgraph (affected projects + their dependencies)
node -e "
const fs = require('fs');
const graph = JSON.parse(fs.readFileSync('graph.json')).graph;
const affected = JSON.parse(fs.readFileSync('affected-projects.json'));
const included = new Set();
function add(x) { if (included.has(x)) return; included.add(x); (graph.dependencies[x] || []).forEach(d => add(d.target)); }
affected.forEach(add);
fs.writeFileSync('affected-args.txt', [...included].map(p => '-p ' + p).join(' '));
"

npx nx-mermaid-grapher -f graph.json $(cat affected-args.txt) -o mermaid --raw
npx nx-mermaid-grapher -f graph.json $(cat affected-args.txt) -o stats
```

### Other output formats

`nx-mermaid-grapher` supports multiple output formats useful for AI agents and CI pipelines:

- `-o mermaid --raw` — raw Mermaid syntax (no code fence)
- `-o stats` — project and dependency counts
- `-o edges` — edge list
- `-o json` — structured JSON
- `-o dot` — Graphviz DOT format

## How the CI bot works

The `.github/workflows/graph-demo.yml` pipeline has three jobs:

- **`graph-all`** — runs on every push and PR. Generates the full dependency graph and runs `nx-mermaid-grapher` against it.
- **`graph-affected`** — runs on PRs only. Uses `nx show projects --affected` to find changed projects, computes the transitive closure (affected + their dependencies), then runs `nx-mermaid-grapher` with `-p` flags to render the subgraph.
- **`pr-comment`** — runs on PRs only, depends on both graph jobs. Downloads the generated Mermaid and stats files, then creates or updates a PR comment with collapsible `<details>` sections.

## Workspace structure

```
apps/
  web/          — web application
  api/          — api application
libs/
  ui/           — UI components library
  data/         — data access library
  utils/        — shared utilities library
  shared/       — core shared library
```

### Dependency graph (diamond pattern)

- `web` → `ui`, `utils`
- `api` → `data`, `utils`
- `ui` → `shared`
- `data` → `shared`

Both apps share `utils`, and both `ui` and `data` depend on `shared`, creating a diamond-like structure.

## Link to the tool

- [nx-mermaid-grapher on GitHub](https://github.com/Fcmam5/nx-mermaid-grapher)

The tool supports multiple output formats designed for AI agents and CI pipelines.
# test
