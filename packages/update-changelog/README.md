Update [Unreleased] in CHANGELOG.md to current package version and add a new one unreleased section at the top

1. Install as devDependency
```
npm i -D @unitybase/update-changelog
```

2. Add script version to package.json:
```
...
"scripts": {
    ...
    "version": "update-changelog && git add CHANGELOG.md"
}
```