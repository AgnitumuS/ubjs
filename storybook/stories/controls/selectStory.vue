<template>
    <div>
        <h1>UbSelect</h1>
        <ub-select-entity style="width:50%" :entityName="'tst_maindata'" v-model="someString"></ub-select-entity>
        <h2>Props</h2>
        <ul>
            <li>value - String</li>
            <li>isMultiLang - Boolean (default: false)</li>
            <li>entityName - String (required for MultiLang fields)</li>
            <li>attributeName - String (required for MultiLang fields)</li>
            <li>primaryValue - String, Number (required for MultiLang fields)</li>
        </ul>
    </div>
</template>

<script>
    import UbSelectEntity from '@unitybase/adminui-vue/components/controls/UbSelectEntity.vue';

    export default {
        components: {
            UbSelectEntity
        },
        data() {
            return {
                someString: 123
            }
        }
    }
</script>