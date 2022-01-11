module.exports = {
  props: {
    defaultValue: {
      type: [String, Number, Boolean]
    }
  },
  created() {
    if (this.defaultValue !== undefined) this.value = this.defaultValue;
  },
  watch: {
    isEmpty: {
      immediate: true,
      handler(newValue) {
        this.$emit("search-disabled", newValue);
      }
    }
  },
  methods: {
    submitHandler() {
      this.$emit("search", this.getCondition());
    }
  }
};
