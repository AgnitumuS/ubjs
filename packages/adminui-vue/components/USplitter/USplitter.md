A wrapper for [Splitpanes](https://antoniandre.github.io/splitpanes/) package with the function of saving to localStorage.
You can pass any parameter or subscribe to any event that this package supports.

Data that has been saved is deleted in the user menu

## Basic Usage

More examples in the package [documentation](https://antoniandre.github.io/splitpanes/)
```vue
<template>
<div class="doc-splitpanes">
    <u-splitter :split-id="location.href + 0">
    <u-pane>1</u-pane>
      <u-pane>
        <u-splitter horizontal>
          <u-pane>3</u-pane>
          <u-pane>4</u-pane>
        </u-splitter>
      </u-pane>
      <u-pane>2</u-pane>
    </u-splitter>
  </div>
</template>

<style>
.doc-splitpanes {
  height: 300px;
}
.doc-splitpanes .splitpanes__pane {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 34px
}
</style>
```