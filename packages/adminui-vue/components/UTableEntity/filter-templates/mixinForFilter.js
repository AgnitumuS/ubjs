module.exports = {
  props: {
    defaultValue: {
      type: [String, Number, Boolean, Array]
    }
  },
  created() {
    if (this.defaultValue === undefined) return;
    this.value = this.defaultValue;
    if (Array.isArray(this.defaultValue)) {
      this.valueFrom = this.defaultValue[0];
      this.valueTo = this.defaultValue[1];
    }
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
