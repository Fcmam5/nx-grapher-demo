Let's create a minimal NX workspace to demo  nx-mermaid-grapher (https://github.com/Fcmam5/nx-mermaid-grapher)

The repo must contain a GitHub Actions pipeline that generates dependency graphs and stats, then posts them as PR comments via a bot.

## Plan

### 1. Create a minimal NX workspace

Build a tiny Nx workspace purely for demonstrating nx-mermaid-grapher.

Do not build a real product. No database, authentication, API implementation, UI features, Docker, or business logic.

The workspace should exist only to produce an interesting dependency graph.

### 2. Create the GitHub Actions pipeline

Create .github/workflows/graph-demo.yml with **two jobs**:

**Job A: graph-all** — runs on every push and PR
- Checks out the repo with fetch-depth: 0 (needed for Nx affected).
- Installs dependencies.
- Runs nx graph --file=graph.json.
- Runs npx nx-mermaid-grapher **three times** against the full graph:
  - -o mermaid --raw (raw Mermaid, no fence)
  - -o stats 
  - Optionally -o json or -o edges if useful for debugging.
- Uploads the generated outputs as workflow artifacts.

**Job B: graph-affected** — runs on PRs only
- Checks out the repo with fetch-depth: 0.
- Installs dependencies.
- Uses Nx affected to determine the affected projects: nx affected:graph --file=affected-graph.json --base=origin/main --head=HEAD (or equivalent).
- Runs nx-mermaid-grapher **three times** against the affected graph:
  - -o mermaid --raw 
  - -o stats 
  - Optionally -o json or -o edges.
- Uploads the generated outputs as workflow artifacts.

### 4. PR comment bot

Add a third job (or extend the pipeline) that **posts a PR comment** when the workflow runs on a pull request:

- Use actions/github-script
- The comment body must contain:
  - A collapsible section titled **"Graph — All Projects"** with the raw Mermaid diagram and the stats output.
  - A collapsible section titled **"Graph — Affected Projects"** with the raw Mermaid diagram and the stats output.
- Use <details> / <summary> HTML in the markdown comment so the PR thread stays readable.
- The bot should update the same comment on subsequent pushes (do not spam new comments).

### 5. Test the pipeline end-to-end

- Commit the workflow file and any package upgrades to a branch.
- Open **PR #1** (e.g. chore/setup-ci). This should trigger the pipeline. Verify the graph-all job runs and the affected job also runs (it may show an empty / no-change graph, which is fine).
- **Merge PR #1** so Nx cache is populated on main.
- Open **PR #2** with a small code change in one app or lib (e.g. add a console.log, rename a function, or change a type). This should trigger the pipeline again.
- Confirm the bot **comments** with:
  - All-projects Mermaid graph + stats.
  - Affected-projects Mermaid graph + stats (should now be non-empty / smaller than the full graph).
- Iterate on the workflow YAML until both PR comments render correctly.

### 6. README

Write a comprehensive README.md (or append to the existing one) containing:

1. **What this demo does** — explain that it showcases nx-mermaid-grapher by automatically generating dependency graphs and stats in CI.
2. **How to try it locally** — copy-paste commands:
   - npx nx graph --file=graph.json && npx nx-mermaid-grapher -f graph.json -o mermaid 
   - npx nx affected:graph --file=affected.json --base=main --head=HEAD && npx nx-mermaid-grapher -f affected.json -o mermaid 
   - Mention -o stats, -o edges, -o json, -o dot.
3. **How the CI bot works** — briefly describe the two jobs (graph-all, graph-affected) and the PR comment bot.
4. **Link to the tool** — https://github.com/Fcmam5/nx-mermaid-grapher with a note that the tool supports multiple output formats for AI agents and CI pipelines.

### 7. Final cleanup

- Ensure .gitignore ignores any locally generated graph.json, affected-graph.json, and other temporary artifacts.
- Make sure the package.json scripts are tidy and the repo still builds/tests pass after all changes.
- Delete any temporary files created during development.

## Constraints

- Keep changes minimal and focused on demo / CI setup.
- Prefer pnpm
- The bot comment must be idempotent (update, not duplicate).

## Success criteria

- [ ] nx graph and nx affected:graph both work locally.
- [ ] nx-mermaid-grapher is installed and produces valid mermaid + stats output for both graphs.
- [ ] GHA pipeline has two jobs (graph-all, graph-affected) that run successfully.
- [ ] A bot posts a PR comment with collapsible sections showing both the full and affected graphs + stats.
- [ ] README explains the demo, links to the tool, and explains local usage.
