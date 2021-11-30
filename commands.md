# get
```
> myfs get <variable>
```

# set
```
> myfs set <variable> <value>
```

# include <path/pattern>
# exclude <path/pattern>

---

# http
```
> myfs http serve [--views|V engine] [--port|P num] [--src|S dir] [--ngrok|-X --host|-H name]
```

---

Searching

# ls - shallow
match folders|files|contents
```
> myfs ls <regex> [--dir|-D path/to/dir] [--modified]

```

# search - deep
```
> myfs find <regex> [--dir|-D path/to/dir] 
```

---

# diff

For now diffing is only available from search results page
