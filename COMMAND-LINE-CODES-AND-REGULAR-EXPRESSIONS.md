# Filter by file type
```bash
fs ls --glob **/*.css 
```

# Find all function definitions
```bash
fs ls --find "(function\s+[\w\W]+\(|const\s+[\w\W]+\s*=\s*\([\w\W]*\)[\w\W]*=>)"
```
