# Описание
Cоздает стор для формы и рендерит ее в таб или модальное окно.
Стор отслеживает изменения формы и строит запросы на изменение формы.
В форме доступна валидация и ее проверка перед сохранением.

> Пример на живой форме
> apps\autotest\models\TST\public\forms\tst_dictionary-ft-fm.vue

## Пример минимального использования

```javascript
const Form = require('@unitybase/adminui-vue')

module.exports.mount = function ({ title, entity, instanceID }) {
  Form({
    component: MyCustomVueComponent,
    entity,
    instanceID,
    title
  }).mount()
}
const MyCustomVueComponent = module.exports.default ={
  name: 'MyCustomVueComponent'
}
```

## Пример полного использования
```javascript
Form({
  component: MyCustomVueComponent,
  entity,
  instanceID,
  title: 'Any custom title',
  isModal: true,
  modalClass: 'test-class', // кастомный класс для модального окна
  modalWidth: '900px', // ширина модального окна
  formCode
})
  .store({ // .store можно не использовать если не требуется иметь дополнительные параметры в нем
    state: {},
    getters: {},
    mutations: {},
    //...
  })
  .instance()
  .processing({
    // хуки
    // стор создан, данные еще не загружены
    beforeInit: (store) => { 
      console.log('before init')
    },
    // после выполнения load или create в зависимости от isNew
    inited: (store) => {
      console.log('inited')
    },
    // до сохранения и валидации
    beforeSave: (store) => {
      console.log('before save')
    },
    // после успешного сохранения
    saved: (store) => {
      console.log('saved')
    },
    // хуки **конец**
    masterFieldList: ['ID', 'name', 'age', 'phone'], // можно не указывать
    /**
    * collections - запросы для связаных с формой записей.
    * Принимает данные вида {[ключ коллекции]: [UB repository]}
    * Если нужно что б данные в коллекции были загружены не сразу а по какому то событию, то можно добавить коллецию
    * указав данные в таком виде {
    *   [ключ коллекции]: {
    *     repository: [UB repository],
    *     lazy: true
    *   }
    * }
    * В этом случае данные будут загружены только после вызова экшена loadCollections, 
    * который принимает в себя массив ключей коллекций, пример: loadCollections(['todo'])
    */
    collections: {
      todo: {
        repository:  UB.connection
          .Repository('tst_dictionary_todo')
          .attrs('ID', 'objectID', 'name', 'status', 'link')
          .where('objectID', '=', instanceID),
        lazy: true
      },
        
      dueDate: UB.connection
        .Repository('tst_due_date')
        .attrs('ID', 'dateFrom', 'dateTo', 'status')
        .where('dateTo', '<', Date.now())
    }
  })
  .validation()
  .mount()
```

## Предупреждение
> instance -> processing -> validation должны использоватся последовательно.
> Tо есть можно использовать instance отдельно, но processing без instance нельзя, то же касается и validation

### Instance
  Хранит данные формы и отслеживает изменения в ней.
  Все взаимодействие со стором рекомендуется делать используя мутации описаные ниже. 
  
#### state
 - `data` - it is an object with actual (to be shown on UI) data values, regardless if values are untouched by user 
 or already edited.
 - `originalData` - his object is initially empty, but as user starts editing, it is filled by original values, as they 
 loaded from DB, so that it would be always possible to say if a certain attribute was changed or not. 
 If after some editing, value returned to its original state, value is deleted from this object. 
 When this object is has no attributes, we know there is nothing to save.
 - `collections` - this is a property for complex object, objects which consist of one master record and collection
 or multiple collections of detail records. Each collection tracks added, changed and deleted items, so that we know
 if there is any change to save in the collection. Collection item is tracked just like the master record, using the
 same technique - "data" and "originalData" properties for item.  Item also has "isNew" property, indicating if item
 was added after original loading of collection or not. The "deleted"

#### getters
 - `isDirty` геттер, вернет `true` если в форме были изменены какие либо данные

#### mutations
 - `SET_DATA` - вносит изменения в `data`
 - `ASSIGN_DATA` - тоже что и `SET_DATA` только для нескольких значений сразу
 - `SET` - вносит изменения в остальные опции стора (не `data`), не влияет на отслеживание изменений
 - `LOAD_DATA` - принимает в себя объект с данными формы и записывает в `data`, мутация очищает `originalData`
 по этому форма будет `isDirty === false`
 - `LOAD_DATA_PARTIAL` - догружает данные в `data`, чистит из `originalData` только те поля которые были переданы
 - `LOAD_COLLECTION` - тоже что и `LOAD_DATA` только для коллекции
 - `LOAD_COLLECTION_PARTIAL` - тоже что и `LOAD_DATA_PARTIAL` только для коллекции
 - `ADD_COLLECTION_ITEM` - добавляет новый элемент в коллецию. Вместо этой мутации рекомендуюется использовать
 `action -> addCollection` из модуля **processing**  
 - `DELETE_COLLECTION_ITEM` - убирает елемент из коллекции и добавляет его в массив `deleted`,
 после сохранения формы для всех елементом массива `deleted` будут отправлены запросы на удаление. 
 - `CLEAR_ALL_DELETED_ITEMS` - очищает массив `deleted` у всех коллекций, чаще всего вам не прийдется его использовать,
 так как он вызывается автоматически после сохранения формы в модуле **processing**
 - `DELETE_ALL_COLLECTION_ITEMS` - добавляет все элементы коллекции в массив удаления, после сохранения формы для всех
 елементом массива `deleted` будут отправлены запросы на удаление. 

### Processing
  Создает в сторе CRUD экшены в которых лежат UB запросы построенные на основе instance-module data
  
#### state
 - `isNew` - указывает новая ли это форма
 - `formCrashed` - указывает была ли ошибка при загрузке формы

#### getters
 - `loading` - true если происходит какая либо загрузка в форме
 - `canRefresh` - true если у пользователя есть доступ к обновлению формы
 - `canSave` - true если у пользователя есть доступ к сохранению формы
 - `canDelete`  - true если у пользователя есть доступ к удалению формы

#### mutations
 - `LOADING` - добавляет/исключает флаг из массива загрузки.
 > Пример 
 ```javascript
  commit('LOADING', {
    isLoading: true,
    target: 'loadSomeRepo'
  }

  await UB.Repository('some_repo')
    .attrs('*')
    .select()

  commit('LOADING', {
    isLoading: false,
    target: 'loadSomeRepo'
  })
  ```

#### actions
 - `deleteInstance` - выводит yes/no диалоговое окно, при клике на yes удаляет запись
 - `refresh` - обновляет данные в форме
 - `save` - сохраняет форму
 - `loadCollections` - данные в этих коллекциях будут загружены только тогда когда вручную будет вызван этот экшн.
  Это сделано специально для того что б загружать связаные записи только тогда когда они необходимы,
  например когда данные записи коллекции находятся на вкладке которая не включена при открытии формы.

### Validation
  На основе данных в instance модуле и entitySchema создает объект валидации `$v` - [vuelidate](https://github.com/vuelidate/vuelidate)
  полученый объект через provide прокидывается в компонент.
  Можно получить в любом дочернем компоненте формы с помощью `inject: ['$v']`

## Рекомендации к написанию шаблона формы

```vue
<template>
  <!-- класс который растягивает форму на высоту окна и делает правильную работу скрола -->
  <div class="ub-form-container">
    <!-- тулбар-->
    <u-toolbar />

    <!-- компонент позволяет указать ширину для дочерних u-form-row. Лоадер рекомендуется вешать на него -->
    <u-form-container
      v-loading.body="loading"
      :label-width="160"
    >
      <!-- рядок формы с лейблом -->
      <u-form-row
        :label="getLabel('code')"
        required
        :error="$v.code.$error"
      >
        <el-input v-model="code" />
      </u-form-row>

      <!-- обертка для u-form-row которая смотрит на атрибут в сущности -->
      <!--и по его типу рендерит нужный html и определяет валидацию -->
      <u-auto-field
        v-model="caption"
        code="caption"
      />
    </u-form-container>
  </div>
</template>

<script>
const { mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')

export default {
  inject: ['$v'], // валидация, 

  computed: {
    ...mapInstanceFields(['code', 'caption']), // хелпер для получение/изменения данных формы

    ...mapGetters(['loading'])
  }
}
</script>
```
