import {
  storiesOf
} from '@storybook/vue'

import inputStory from './controls/inputStory.vue'
import selectStory from './controls/selectStory.vue'
import enumStory from './controls/enumStory'

const paddedList = () => {
  return {
    template: `<div style="padding: 20px; font-family: 'Segoe UI',serif"><story/></div>`
  }
}

storiesOf('Vue Controls', module).addDecorator(paddedList)
  .add('Input', () => inputStory)
  .add('Select', () => selectStory)
  .add('Enum', () => enumStory)
