# Filter by file type
```bash
fs ls --glob **/*.css 
```

# Find all function definitions
```bash
fs ls --find "(function\s+[\w\W]+\(|const\s+[\w\W]+\s*=\s*\([\w\W]*\)[\w\W]*=>)"
```

## Find all workspace imports that are missing an extension
import\s.+?\sfrom\s"[a-zA-Z-_]+?/[a-zA-Z-_]+?"