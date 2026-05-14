const fs = require('fs');

const graphPath = process.argv[2];
const affectedPath = process.argv[3];
const outputPath = process.argv[4];

if (!graphPath || !affectedPath || !outputPath) {
  console.error('Usage: node filter-affected-graph.js <graph.json> <affected.json> <output.json>');
  process.exit(1);
}

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
const affected = JSON.parse(fs.readFileSync(affectedPath, 'utf-8'));

const affectedSet = new Set(affected);

// Collect all nodes that are either affected or are dependencies of affected nodes
const includedNodes = new Set();
const includedEdges = [];

function addNodeAndDeps(nodeName) {
  if (includedNodes.has(nodeName)) return;
  includedNodes.add(nodeName);

  const deps = graph.graph.dependencies[nodeName] || [];
  for (const dep of deps) {
    includedEdges.push(dep);
    addNodeAndDeps(dep.target);
  }
}

for (const name of affectedSet) {
  addNodeAndDeps(name);
}

// Filter edges to only those where both source and target are included
const filteredEdges = includedEdges.filter(
  (e) => includedNodes.has(e.source) && includedNodes.has(e.target)
);

const output = {
  graph: {
    nodes: {},
    dependencies: {},
  },
};

for (const name of includedNodes) {
  output.graph.nodes[name] = graph.graph.nodes[name];
  output.graph.dependencies[name] = filteredEdges.filter((e) => e.source === name);
}

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Filtered graph written to ${outputPath}`);
console.log(`Nodes: ${Object.keys(output.graph.nodes).length}`);
