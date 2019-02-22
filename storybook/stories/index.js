import {
    storiesOf
} from '@storybook/vue';

import inputStory from './controls/inputStory.vue';
import selectStory from './controls/selectStory.vue';

const paddedList = () => {
    return {
        template: '<div style="padding: 20px;"><story/></div>'
    };
};

storiesOf('Vue Controls', module).addDecorator(paddedList)
    .add('Input', () => inputStory)
    .add('Select', () => selectStory);