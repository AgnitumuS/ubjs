import { storiesOf } from '@storybook/vue'
import inputStory from './controls/inputStory.vue'
import selectStory from './controls/selectEntityStory.vue'
import enumStory from './controls/selectEnumStory'
import selectManyStory from './controls/selectManyStory'
import codeMirrorStory from './controls/codeMirrorStory'
import uploadDocumentStory from './controls/uploadDocumentStory'
import toolbarStory from './components/toolbarStory'

const paddedList = () => {
  return {
    template: `<div style="padding: 20px; font-family: 'Segoe UI',serif"><story/></div>`
  }
}

storiesOf('Vue Controls', module)
  .addDecorator(paddedList)
  .add('Input', () => inputStory)
  .add('Select', () => selectStory)
  .add('Enum', () => enumStory)
  .add('Many', () => selectManyStory)
  .add('CodeMirror', () => codeMirrorStory)
  .add('UploadDocument', () => uploadDocumentStory)

storiesOf('Vue Components', module)
  .addDecorator(paddedList)
  .add('ToolBar', () => toolbarStory)
