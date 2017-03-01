// Function that takes an array of two dates signifying a range
// and expands that range by the unit and value passed
function expandTimeDomain(extent, unit, val) {
  val = Math.floor(val);
  let change = [val * (-1), val];
  if (extent[0] > extent[1]) {
    change = [val, val * (-1)];
  }

  extent.forEach((entry, index) => {
    let year = entry.getFullYear();
    let month = entry.getMonth();
    let day = entry.getDate();
    let hours = entry.getHours();
    let minutes = entry.getMinutes();
    let seconds = entry.getSeconds();
    let milliseconds = entry.getMilliseconds();
    let dateArray = [year, month, day, hours, minutes, seconds, milliseconds];
    let unitArray = ["years", "months", "days", "hours", "minutes", "seconds", "milliseconds"];
    let unitIndex = unitArray.indexOf(unit);

    dateArray[unitIndex] = dateArray[unitIndex] + change[index];

    let newDate = new Date(dateArray[0], dateArray[1], dateArray[2], dateArray[3], dateArray[4], dateArray[5]);
    extent[index] = newDate;
  });
  return extent;
}
