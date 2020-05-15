<template>
  <div class="u-chat">
    <div
      ref="messageContainer"
      class="u-chat__message-list"
    >
      <template v-if="messages.length">
        <div
          v-for="group in messageGroups"
          :key="group[0].ID"
          :class="{
            'u-chat__message-group__self': group[0].mi_owner === currentUserID
          }"
          class="u-chat__message-group"
        >
          <div class="u-chat__message-group-date">
            {{ formatGroupDate(group[0]) }}
          </div>
          <div
            v-for="message in group"
            :key="message.ID"
            class="u-chat__message-container"
          >
            <div
              class="u-chat__message"
              @contextmenu="showContextMenu($event, message)"
            >
              <span>{{ message[displayAttribute] }}</span>
            </div>

            <u-icon
              v-if="message.mi_modifyDate.getTime() !== message.mi_createDate.getTime()"
              class="u-chat__message-edit-icon"
              icon="u-icon-edit"
            />
          </div>
        </div>
      </template>

      <div
        v-else
        class="u-chat__message-empty"
      >
        {{ $ut('chat.emptyMessage') }}
      </div>
    </div>

    <form
      v-if="canAddNew"
      class="u-chat__input-container"
      @submit.prevent="send"
    >
      <textarea
        ref="input"
        v-model="inputValue"
        :rows="textareaRows"
        class="u-chat__input-textarea"
        :placeholder="$ut('chat.inputPlaceholder')"
        @keydown.ctrl.enter.exact="insertNewLine"
        @keydown.prevent.enter.exact="send"
        @keydown.up="editByArrow"
      />
      <button
        class="u-chat__input-submit"
        type="submit"
        @click="focusInput"
      >
        <i class="u-icon-arrow-right" />
      </button>
    </form>

    <u-dropdown ref="contextMenu">
      <template slot="dropdown">
        <u-dropdown-item
          label="Copy"
          @click="copyMessage"
        />
        <u-dropdown-item
          v-if="canEdit && (editedMessage || {}).mi_owner === currentUserID"
          label="Edit"
          @click="editMessage"
        />
        <u-dropdown-item
          v-if="canDelete && (editedMessage || {}).mi_owner === currentUserID"
          label="Delete"
          @click="deleteMessage"
        />
      </template>
    </u-dropdown>
  </div>
</template>

<script>
const lineBreakRegex = /\n/g

export default {
  name: 'UChat',

  props: {
    /**
       * Chat entity name.
       */
    entityName: {
      type: String,
      required: true
    },
    /**
       * Attribute which stores the text of the message.
       */
    displayAttribute: {
      type: String,
      required: true
    },
    /**
       * Attribute in chat entity which stores link (ID) to master document
       */
    associatedAttribute: {
      type: String,
      required: true
    },
    /**
       * Master document ID
       */
    documentId: {
      type: Number,
      required: true
    },
    /**
       * Whether user can edit own messages
       */
    canEdit: {
      type: Boolean,
      default: true
    },
    /**
       * Whether user add new messages
       */
    canAddNew: {
      type: Boolean,
      default: true
    },
    /**
       * Whether user can delete own messages
       */
    canDelete: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      inputValue: '',
      messages: [],
      editedMessage: null
    }
  },

  computed: {
    textareaRows () {
      const lineBreaks = [...this.inputValue.matchAll(lineBreakRegex)].length + 1
      return Math.min(lineBreaks, 5)
    },

    currentUserID () {
      return this.$UB.connection.userData().userID
    },

    messageGroups () {
      return this.messages.reduce((accum, message) => {
        if (accum.length) {
          const prevMessageGroup = accum[accum.length - 1]

          const isSameUser = prevMessageGroup[0].mi_owner === message.mi_owner
          const isSameMoment = this.testSameMoment(prevMessageGroup[0].mi_createDate, message.mi_createDate)
          if (isSameUser && isSameMoment) {
            prevMessageGroup.push(message)

            return accum
          }
        }
        accum.push([message])

        return accum
      }, [])
    },

    isEditing () {
      return this.editedMessage !== null
    },

    hasInputValue () {
      return this.inputValue !== null && this.inputValue !== ''
    }
  },

  watch: {
    messages: 'scrollBottom',

    inputValue (value) {
      if (this.isEditing) {
        if (value === '' || value === null) {
          this.editedMessage = null
        }
      }
    }
  },

  mounted () {
    this.fetchMessages()
    this.$UB.connection.on(`${this.entityName}:changed`, this.fetchMessages)
  },

  methods: {
    async scrollBottom () {
      await this.$nextTick()
      this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight
    },

    formatGroupDate (message) {
      const isToday = this.$moment().isSame(message.mi_createDate, 'day')
      const isCurrentUser = message.mi_owner === this.currentUserID
      const time = this.$moment(message.mi_createDate).format(isToday ? 'HH:mm' : 'll')
      if (isCurrentUser) {
        return time
      } else {
        return `${message['mi_owner.name']} ${time}`
      }
    },

    async fetchMessages () {
      const response = await this.$UB.Repository(this.entityName)
        .attrs(
          'ID',
          this.displayAttribute,
          this.associatedAttribute,
          'mi_owner',
          'mi_owner.name',
          'mi_modifyDate',
          'mi_createDate'
        )
        .where(this.associatedAttribute, '=', this.documentId)
        .orderBy('mi_createDate')
        .select()

      this.messages.splice(0, this.messages.length, ...response)
    },

    async send () {
      if (!this.hasInputValue) return
      if (this.isEditing && this.inputValue === this.editedMessage[this.displayAttribute]) {
        this.inputValue = ''
        this.editedMessage = null

        return
      }

      const fieldList = this.$UB.connection.domain.get(this.entityName).getAttributeNames()
      const execParams = {
        [this.associatedAttribute]: this.documentId,
        [this.displayAttribute]: this.inputValue
      }
      if (this.isEditing) {
        execParams.ID = this.editedMessage.ID
        execParams.mi_modifyDate = this.editedMessage.mi_modifyDate
      }
      await this.$UB.connection.query({
        entity: this.entityName,
        method: this.isEditing ? 'update' : 'insert',
        fieldList,
        execParams
      })
      this.$UB.connection.emit(`${this.entityName}:changed`)
      this.inputValue = ''
      this.editedMessage = null
    },

    insertNewLine () {
      document.execCommand('insertText', false, '\n')
    },

    testSameMoment (firstMessageDate, comparedDate) {
      const allowablePeriod = 5 * 60 * 1000 // 5 minutes
      return comparedDate - firstMessageDate < allowablePeriod
    },

    showContextMenu (event, message) {
      this.$refs.contextMenu.show(event)
      this.editedMessage = message
    },

    copyMessage () {
      const input = document.createElement('input')
      input.value = this.editedMessage[this.displayAttribute]
      input.style.position = 'absolute'
      input.style.top = '100%'
      input.style.left = '100%'
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy')) {
        document.body.removeChild(input)
        this.$notify.success(this.$ut('chat.copyNotification'))
      }
      window.getSelection().removeAllRanges()
    },

    editMessage () {
      this.inputValue = this.editedMessage[this.displayAttribute]
      this.focusInput()
    },

    focusInput () {
      this.$refs.input.focus()
    },

    editByArrow (event) {
      const userMessages = this.messages.filter(m => m.mi_owner === this.currentUserID)
      if (this.canEdit && !this.hasInputValue && userMessages.length) {
        event.preventDefault()
        const lastMessage = userMessages[userMessages.length - 1]
        this.inputValue = lastMessage[this.displayAttribute]
        this.editedMessage = lastMessage
        event.selectionStart = this.inputValue.length
      }
    },

    async deleteMessage () {
      const answer = await this.$dialogYesNo(
        'areYouSure',
        this.$ut('chat.removeMessageDialog', this.editedMessage[this.displayAttribute])
      )

      if (answer) {
        await this.$UB.connection.doDelete({
          entity: this.entityName,
          execParams: { ID: this.editedMessage.ID }
        })
        this.$UB.connection.emit(`${this.entityName}:changed`)
        this.$notify.success(this.$ut('chat.removeMessageNotification'))
      }
    }
  }
}
</script>

<style>
  .u-chat {
    background: hsl(var(--hs-background), var(--l-background-inverse));
    border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 600px;
    height: 400px;
  }

  .u-chat__input-container {
    background: hsl(var(--hs-background), 96%); /* TODO: replace to variable */
    display: flex;
    align-items: center;
    border-top: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  }

  .u-chat__input-textarea {
    flex-grow: 1;
    padding: 12px 16px;
    font-size: 16px;
    line-height: 1.2;
    resize: none;
    border: none;
    background: none;
  }

  .u-chat__input-textarea::placeholder {
    color: hsl(var(--hs-text), var(--l-text-description));
  }

  .u-chat__input-submit {
    margin: auto 16px;
    border: none;
    --l: var(--l-state-default);
    background: hsl(var(--hs-control), var(--l));
    color: hsl(var(--hs-text), var(--l-text-inverse));
    border-radius: 100px;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .u-chat__input-submit:hover {
    --l: var(--l-state-hover);
  }

  .u-chat__input-submit:active {
    --l: var(--l-state-active);
  }

  .u-chat__message-list {
    flex-grow: 1;
    padding: 16px;
    padding-bottom: 4px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .u-chat__message-group-date {
    font-size: 14px;
    line-height: 1;
    color: hsl(var(--hs-text), var(--l-text-description));
  }

  .u-chat__message {
    font-size: 16px;
    line-height: 1.4;
    color: hsl(var(--hs-text), var(--l-text-default));
    background: hsl(var(--hs-background), var(--l-background-default));
    padding: 12px;
    margin-top: 4px;
    border-radius: 4px;
    border-top-left-radius: 0;
    white-space: pre-line;
  }

  .u-chat__message-group {
    margin-bottom: 12px;
    max-width: 350px;
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .u-chat__message-group__self {
    align-self: flex-end;
    align-items: flex-end;
  }

  .u-chat__message-group__self .u-chat__message {
    border-top-left-radius: 4px;
    border-top-right-radius: 0;
    background: hsl(var(--hs-background), 90%); /* TODO: replace to variable */
  }

  .u-chat__message-empty {
    margin: auto;
    font-weight: 500;
    font-size: 18px;
    line-height: 1.2;
    color: hsl(var(--hs-text), var(--l-text-disabled));
  }

  .u-chat__message-container {
    display: flex;
    align-items: center;
  }

  .u-chat__message-edit-icon {
    margin: 0 4px;
    font-size: 18px;
    color: hsl(var(--hs-control), var(--l-state-disabled))
  }

  .u-chat__message-group__self .u-chat__message-edit-icon {
    order: -1;
  }
</style>

<docs>
  ### Usage

  ```vue
    <template>
      <u-chat
        entity-name="tst_Discussion"
        display-attribute="commentText"
        associated-attribute="documentID"
        :document-id="1"
      />
    </template>
  ```
</docs>
