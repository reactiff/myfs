# Generate Dependency Graphs

## For hyperspace 

```bash
depcruise --exclude="(node_modules|path|console|fs|child_process|bin|utils|schema|public|EventManager|StateManager)"  --output-type dot hyperspace | dot -T svg > hyperspace-graph.svg
```