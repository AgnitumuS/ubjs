const Vue = require('vue')
const tpl = `
<div>
<el-form size="mini">
<h1>Form mini </h1>
  <el-form-item>
    <el-input placeholder="Pavel"></el-input>
  </el-form-item>
  <el-form-item>
    <el-date-picker type="date"></el-date-picker>
  </el-form-item>
</el-form>
<hr/>

<el-form size="small">
  <h1>Form small</h1>
  <el-form-item>
    <el-input placeholder="Pavel"></el-input>
  </el-form-item>
  <el-form-item>
    <el-date-picker type="date"></el-date-picker>
  </el-form-item>
</el-form>
<hr/>

<el-form size="medium">
  <el-form-item>
    <h1>Form medium "Now = {{ $ut('el.datepicker.now') }}!"</h1>
    <el-input placeholder="Pavel"></el-input>
  </el-form-item>
  <el-form-item>
    <el-date-picker type="date"></el-date-picker>
  </el-form-item>
</el-form>
<hr/>

<el-form>
  <h1>Form default</h1>
  <el-form-item>
    <el-input placeholder="Pavel"></el-input>
  </el-form-item>
  <el-form-item>
    <el-date-picker type="date"></el-date-picker>
  </el-form-item>
</el-form>
</div>
`
exports.mount = function () {
  d = document.createElement('div')
  let tab = $App.viewport.centralPanel.add({
    title: 'VueJS form',
    bodyPadding: 10,
    html : '<div id="vueTmp"></div>',
    closable: true
  })
  let vm = new Vue({
    template: tpl,
    beforeDestroy: function() { console.log('beforeDestroy', vm) }
  })
  vm.$mount('#vueTmp')
  // !! important
  tab.on('close', function() {
    vm.$destroy()
  });  
  $App.viewport.centralPanel.setActiveTab(tab)
}