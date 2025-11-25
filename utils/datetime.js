function formatToPh(date) {
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    hour12: false,
  });
}

module.exports = {
  formatToPh,
};
