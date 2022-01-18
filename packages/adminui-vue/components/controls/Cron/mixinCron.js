module.exports = {
  created () {
    if (!parseFloat(this.data.minute) || Number.isNaN(this.data.minute)) { this.data.minute = '1' }
    if (!parseFloat(this.data.hour) || Number.isNaN(this.data.hour)) { this.data.hour = '1' }
    if (!parseFloat(this.data.day) || Number.isNaN(this.data.day)) { this.data.day = '1' }
    if (!parseFloat(this.data.hour) || Number.isNaN(this.data.hour)) { this.data.hour = '1' }
    if (!parseFloat(this.data.hour) || Number.isNaN(this.data.hour)) { this.data.hour = '1' }
  }
}
