Update [Unreleased] in CHANGELOG.md to current package version and add a new [Unreleased] section at the top

## Setup

 - install as devDependency
```
npm i --save-dev @unitybase/update-changelog
```

 - add "version" hook to the `package.json`:
```
...
"scripts": {
    ...
    "version": "update-changelog && git add CHANGELOG.md"
}
```

## Usage
Chandelog before publishing package:

```
[Unreleased]
## Added
....

```

npm publish

Changelod after publishing:

```
[Unreleased]

[X.x.x] - YYYY-MM-DD
## Added
....

```
