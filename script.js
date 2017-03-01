const margin = {top: 50, right: 50, bottom: 50, left: 100},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

let x = d3.scaleTime()
          .range([0, width]);

let y = d3.scaleTime()
          .range([0, height]);

let formatYear = d3.timeFormat("%Y");
let formatMinutes = d3.timeFormat("%M:%S");

let xAxis = d3.axisBottom()
              .scale(x)
              .tickFormat((d) => { return formatYear(d); });

let yAxis = d3.axisLeft()
              .scale(y)
              .tickFormat((d) => { return formatMinutes(d); });

let chart = d3.select(".plot")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let toolTip = d3.select("body")
                .append("div")
                .attr("id", "toolTip");

let horizontalLine = chart.append("g").append("line")
                          .attr("class", "horizontal-line")
                          .attr("stroke-dasharray", "5, 5");
let verticalLine = chart.append("g").append("line")
                        .attr("class", "vertical-line")
                        .attr("stroke-dasharray", "5, 5");

// Creates Date object from time format provided in raw data
let parseTimeYear = d3.timeParse("%Y");
let parseTimeMinutes = d3.timeParse("%M:%S");

function checkDoping(d) {
  if (d.Doping === "") {
    return "rgba(8, 92, 160, 0.9)";
  } else {
    return "rgba(191, 24, 9, 0.9)";
  }
}

function formatToolTip(d) {
  let html = "<h3>" + d.Name + " (" + d.Nationality + ")" + "</h3>" +
              "<p><strong>Time:</strong> " + d.Time + " min</p>" +
              "<p><strong>Year:</strong> "+ d.Year + "</p>";
  if (d.Doping) html += "<p><strong>Details:</strong> " + d.Doping;
  return html;
}

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

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", (error, data) => {
  if (error) throw error;

  let xExtent = d3.extent(data, (d) => { return parseTimeYear(d.Year); });
  expandTimeDomain(xExtent, "months", 6);
  let yExtent = d3.extent(data, (d) => { return parseTimeMinutes(d.Time); });
  expandTimeDomain(yExtent, "seconds", 15);

  x.domain(xExtent);
  y.domain(yExtent);

  // x-Axis
  chart.append("g")
       .attr("class", "x-axis axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

  chart.append("text")
       .attr("class", "label")
       .attr("x", width / 2)
       .attr("y", height + margin.top)
       .attr("fill", "#000")
       .attr("text-anchor", "middle")
       .text("Year");

  // y-Axis
  chart.append("g")
       .attr("class", "y-axis axis")
       .call(yAxis);

 // y-Axis Label
 chart.append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - height / 2)
      .attr("y", 0 - margin.left)
      .attr("dy", "1em")
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .text("Time (minutes)");

  // Plot Border
  chart.append("rect")
       .attr("class", "border")
       .attr("x", 0)
       .attr("y", 0)
       .attr("height", height)
       .attr("width", width)
       .style("stroke", "black")
       //.style("stroke-width", "0.15em")
       .style("fill", "none")
       .style("shape-rendering", "crispEdges");

  chart.append("g").append("text")
       .attr("class", "title")
       .attr("x", width / 2)
       .attr("y", 0 - margin.top / 2)
       .style("text-anchor", "middle")
       .text("The 35 Fastest Times Up Alpe d'Huez: Doping in Professional Bicycle Racing");

  // Plot Points
  chart.selectAll(".dot")
       .data(data)
       .enter().append("circle")
       .attr("class", "dot")
       .attr("r", 5)
       .attr("cx", (d) => { return x(parseTimeYear(d.Year)); })
       .attr("cy", (d) => { return y(parseTimeMinutes(d.Time)); })
       .style("fill", (d) => { return checkDoping(d); })
       .on("mouseover", function(d) {
         toolTip
          .style("left", d3.event.pageX + 20 + "px")
          .style("top", d3.event.pageY - 25 + "px")
          .style("display", "block")
          .style("background", checkDoping(d))
          .html(formatToolTip(d));

        horizontalLine
          .style("display", "block")
          .attr("x1", 0)
          .attr("y1", y(parseTimeMinutes(d.Time)))
          .attr("x2", x(parseTimeYear(d.Year)))
          .attr("y2", y(parseTimeMinutes(d.Time)))
          .attr("stroke", "black")
          .attr("stroke-width", "2");

        verticalLine
          .style("display", "block")
           .attr("x1", x(parseTimeYear(d.Year)))
           .attr("y1", y(parseTimeMinutes(d.Time)))
           .attr("x2", x(parseTimeYear(d.Year)))
           .attr("y2", height)
           .attr("stroke", "black")
           .attr("stroke-width", "2");
       })
       .on("mouseout", () => {
         toolTip.style("display", "none");
         horizontalLine.style("display", "none");
         verticalLine.style("display", "none");
       });
})
