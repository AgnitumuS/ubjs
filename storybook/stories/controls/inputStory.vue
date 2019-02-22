<template>
    <div>
        <h1>UbInput</h1>
        <ub-input style="width:50%" v-model="objectValue[attributeName]" :entityName="entityName" :attributeName="attributeName"
            :objectValue="objectValue"></ub-input>
        <h2>Props</h2>
        <ul>
            <li>
                <span>value - String, Number *</span>
                <br>
                <el-input style="width: 300px" v-model="objectValue[attributeName]"></el-input>
            </li>
            <li>
                <span>entityName - String *</span>
                <br>
                <el-input :disabled="true" style="width: 300px" v-model="entityName"></el-input>
            </li>
            <li>
                <span>attributeName - String *</span>
                <br>
                <el-select style="width: 300px" v-model="attributeName">
                    <el-option value="caption"></el-option>
                    <el-option value="code"></el-option>
                </el-select>
            </li>
            <li>
                <span>objectValue - Object (required for MultiLang fields, used to add localization property in object)</span>
                <br>
                <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px" v-model="objectValueJSON"></el-input>
            </li>
        </ul>
        <h2>Entity Schema</h2>
        <tree-view :data="entitySchema" :options="{maxDepth: 7}"></tree-view>
    </div>
</template>

<script>
    import UbInput from '@unitybase/adminui-vue/components/controls/UbInput.vue';

    export default {
        components: {
            UbInput
        },
        data() {
            return {
                attributeName: 'caption',
                entityName: 'tst_maindata',
                objectValue: {
                    'caption': 'Caption text',
                    'code': 'Code text',
                    ID: 1
                }
            }
        },
        computed: {
            entitySchema() {
                return JSON.parse(JSON.stringify(this.$UB.connection.domain.get(this.entityName)))
            },
            objectValueJSON: {
                get() {
                    return JSON.stringify(this.objectValue, null, 2)
                },
                set(value) {
                    try {
                        this.objectValue = JSON.parse(value)
                    } catch {
                        console.log('INVALID JSON')
                    }
                }
            }
        },
        methods: {
            refresh() {
                this.control = {
                    ...this.form
                }
            }
        }
    }
</script>