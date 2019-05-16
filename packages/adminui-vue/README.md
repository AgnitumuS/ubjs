#Adminui Vue

This model extend UnityBase adminUI by Vue + ElementUI libraries

# What included
## JavaScript
 - Vue (exported as global Vue variable and registered in SystemJS as 'vue')
 - ElementUI (exported as global ElementUI variable and registered in SystemJS as 'element-ui')
 - UB.i18n intergated into Vue as `$ut`
 - UB injected into Vue.prototype as `$UB`

## CSS
 - `dist/adminui-vue.css` theme include normalize.css && modified element-theme-chalk
 - theme will add border radius to ExtJS form fields, so Ext based forms looks like Elements based forms

## Views
### Modern login page

Placed in `/views/ub-auth.html`

To use it in `adminUI` based apps in ubConfig
```
"uiSettings": {
  "adminUI": {
	"loginWindowTopLogoURL": "/models/ub-pub/img/ub-login-logo.png",
	"loginURL": "/models/adminui-vue/views/ub-auth.html",
  ...
```

# Usage
## adminUI based app
 For adminUI based application just add a `@unitybase/adminui-vue` in the domain.models section of config
 after `adminui-pub`

```
"application": {
  "domain": {
    "models": [
		...
		{
			"path": "./node_modules/@unitybase/ub-pub"
		},
		{
			"path": "./node_modules/@unitybase/adminui-pub"
		},
		{
			"path": "./node_modules/@unitybase/adminui-reg"
		},
		{
			"path": "./node_modules/@unitybase/adminui-vue"
		}
		..
```

## Stand-alone app
See `/views/ub-auth.html` for sample

### Compiled Vue app
In case you embed a compiled Vue app into adminUI:

- define output section in the webpack config to prevent loading modules twice:
```
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'YUR_LIB_NAME',
    libraryTarget: 'var',
    filename: 'your-lib-entry-point.min.js',
    publicPath: '/clientRequire/YOUR_MODULE_NAME/dist/'
  },
```

- define externals section in the webpack config to prevent loading modules twice:

```
  externals: {
    lodash: '_',
    '@unitybase/ub-pub': 'UB',
    '@unitybase/adminui-pub': '$App',
    'vue': 'Vue',
    'element-ui': 'ElementUI',
  },
```

# Contribution
## Debugging
### ElemetUI in debug mode 
 For better debugging experience we recommend to rebuild element-ui in development mode.
 Use `element-ui` brunch for version specified in `adminui-vue` package.json (2.5.4 in a moment of writing this manual)
 
 ```bash
  git clone https://github.com/ElemeFE/element.git
  cd element
  git checkout v2.5.4
  npm i
  npm run clean && npm run build:file && npx webpack --config build/webpack.conf.js --mode development
```

 and copy /lib/index.js into your project. In my case project is located in `~/dev/ubjs/apps/autotest`  
 
 ```bash
 cp ./lib/index.js ~/dev/ubjs/apps/autotest/node_modules/element-ui/lib
 ```

### Prevent debugger to dig into vue sources
 While debugging a components source you can prevent debugger to dig into vue sources.
 
 To do this in Source tab of debugger press F1 to open `Preferences`,
 select `Blackboxing` on the left and add a pattern `vue.common.dev.js$`.
 
 After this `Step into` (F11) will skip vue sources
   
## Theme
Generate variables 
```
npm run gen-el-vars
```

Edit theme/ub-el.scss. Build it:

```
npm run build:theme
```

# Helper modules

## Get started
```javascript
const UB = require('@unitybase/ub-pub')
const { formBoilerplate } = require('@unitybase/adminui-vue')

module.exports.mount = function (params) {
  // Запрос для мастер записи
  const masterRequest = UB.connection
    .Repository(params.entity)
    .attrs('ID', 'code', 'caption')

  /**
   * Запрос для инициализации мастер записей, для них будут созданы пустые массивы в сторе,
   * но загрузятся они только если вызвать экшн dispatch('loadCollections', ['todo']), массив с именами коллекций
   */
  const collectionRequests = {
    todo: UB.connection
      .Repository('tst_dictionary_todo')
      .attrs('ID', 'objectID', 'name', 'status')
      .where('objectID', '=', params.instanceID)
  }

  formBoilerplate({
    params,
    FormComponent: MyCustomVueForm,
    masterRequest,
    collectionRequests
  })
}
const MyCustomVueForm = {
  name: 'MyCustomVueForm',
  data () {},
  computed: {}
  // ...
}
```

## Подключение помодульно
  Модуль mount является самостоятельным и может как использоваться так и нет
  Остальные 3 модуля последовательно связаны друг с другом, instance -> processing -> validation
  Tо есть можно использовать instance отдельно, но processing без instance нельзя (только на свой стах и риск, если соблюдать все requirement этого модуля)
  validation зависит и от instance, и от processing 

### Модуль mount
  `const { mountForm, activateIfMounted} = require('@unitybase/adminui-vue')`
  принимает в себя mountParams, в котором ожидает получить такие параметры
  ```javascript
  {
    showFormParams: {
      title: String, // заголовок формы
      isModal: Boolean, // рендерит форму в таб или в модалку
      modalWidth: String // ширина модалки
    },
    /**
     * компонент формы
     * форма перед закрытием проверяет грязная (isDirty) ли она, по этому желательно в компоненте иметь метод isDirty()
     * через props в форму передаются такие параметры (формируются из mountParams.showFormParams) но желательно их не использовать, а получить из стора
     *  - entityName    | код сущности
     *  - instanceID    | ID записи
     *  - currentTabId  | (temp devInfo) постараюсь избавится от этих параметров 
     *  - formCode      | код формы
     *  - commandConfig | (temp devInfo) постараюсь избавится от этих параметров 
     *  - parentContext | (temp devInfo) постараюсь избавится от этих параметров 
     */
    FormComponent: <VueComponent>,
    FormComponentProps: Object, // дополнительные props, опционально
    store: Object <VuexStore>, // store формы, опционально
  }
  ```
  Маунт provide-ит в в тот компонент которым мы ему передали объект с экшенами которые позволяют управлять тайтлом и закрытием формы

  Пример: (при условии что все модули подключены и в начальном `const storeConfig = { formTitle: params.title }` мы установили тайтл)
  ```vue
    <template>
      <div>
        <button @click="$formServices.close">
          Close with question if form dirty
        </button>
        <button @click="$formServices.forceClose">
          Force close
        </button>

        <el-input v-model="caption" />
      </div>
    </template>

    <script>
    const { mapInstanceFields } = require('...')

    export default {
      inject: ['$formServices'],

      computed: mapInstanceFields(['caption']),

      created () {
        this.$store.watch(
          (state, getters) => ({
            isDirty: getters.isDirty,
            isNew: state.isNew
          }),
          ({ isDirty, isNew }) => {
            let title = this.$store.state.formTitle
            if (isDirty) {
              title = `* ${title}`
            }
            if (isNew) {
              title += ` (${this.$ut('dobavlenie')})`
            }
            this.$formServices.setTitle(title)
          }
        )
      }
    }
    </script>
  ```

### Модуль Instance-store 
  `const { createInstanceModule } = require('@unitybase/adminui-vue')`
  Мержит тот стор который в него передали в instance-module
  Позволяет трекать измененные поля формы

### Модуль процессинга
  `const { processingModule } = require('@unitybase/adminui-vue')`
  Используется только со стором который построен на основе instance-module
  Мержит стор и добавляет в него экшены такие как load, update, addNew, save в которых лежат UB запросы построенные на основе instance-module data 
  добавляет в стейт стора loading, error и isNew состояния. С помощью error например заблокировать всю форму и вывести красный хедер у формы что ошибка при загрузке данных
  добавляет геттеры canDelete, canSave, canRefresh

### Модуль валидации
  `const { validateEntitySchema, validationInjectMixin } = require('@unitybase/adminui-vue')`
  Функция которая на основе данных в instance модуле и entitySchema создает объект валидации `$v` - vuelidate
  полученый объект через provide будет прокидыватся в компонент
  Если есть необходимость использовать кастомную валидацю, то нужно передать в `mount.validator` кастомный `$v`, для того что б работала валидация перед закрытием формы или когда вызывается `$formServices.close()`

### Пример использования всех 4 модулей
```javascript
const UB = require('@unitybase/ub-pub')
const Vuex = require('vuex')
const {
  activateIfMounted,
  mountForm,
  createInstanceModule,
  processingModule,
  validateEntitySchema,
  validationInjectMixin
} = require('@unitybase/adminui-vue')

module.exports.mount = function (params) {
  // активировать таб если форма уже открыта
  if (activateIfMounted(params)) return

  // для примера получаем все поля сущности (можно указать свой список)
  const fieldList = UB.connection.domain.get(params.entity).getAttributeNames()
  // формируем запрос для мастер записи
  const masterRequest = UB.connection.Repository(params.entity).attrs(fieldList)

  /**
   * создаем store config, в функцию можно передать свой стор,
   * она его смержит и добавит необходимые параметры
   */
  const assignInstance = createInstanceModule()
  /**
   * мержим стор с модулем процессинга
   * 2 параметром передаем запрос для мастер записи,
   * 3 параметром можно передать массив запросов для коллекций
   */
  const assignProcessing = processingModule(assignInstance, masterRequest)
  const store = new Vuex.Store(assignProcessing)

  /*
   * вызываем экшн инициализации,
   * который либо вызовет addNew и заполнит поля стандартными значениями,
   * либо загрузит данные по конкретному ID
   */
  store.dispatch('init', params.instanceID)
  /*
   * создает сущность которая трекает стор и на основе entitySchema мастер сущности создает правила валидации
   * вернет Vue instance в котором лежит $v
   * модуль mount будет provide-ить _validation функцию из которой мы сможем достать $v (рекомендовано использовать validationInjectMixin)
   */
  const validator = validateEntitySchema(store)

  mountForm({
    FormComponent: MyCustomVueForm,
    showFormParams: params,
    store,
    validator
  })
}

const MyCustomVueForm = {
  name: 'MyCustomVueForm',
  inject: [validationInjectMixin], // нужно что б в форме был доступен объект $v
  data () {},
  computed: {}
  // ...
}
```
