const drawBuildings = buildings => {
  const maxHeight = _.maxBy(buildings, "height").height;
  const chartSize = { width: 600, height: 400 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const width = chartSize.width - (margin.left + margin.right);
  const height = chartSize.height - (margin.top + margin.bottom);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(buildings, "name"))
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, maxHeight])
    .range([0, height]);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => d + "m")
    .ticks(3);

  const xAxis = d3.axisBottom(x);

  const chartArea = d3.select("#chart-area");
  const svg = chartArea
    .append("svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Tall buildings");

  g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Height (m)")
    .attr("transform", "rotate (-90)");

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  g.append("g")
    .attr("class", "x-axis")
    .call(xAxis)
    .attr("transform", `translate (0, ${height})`);

  g.selectAll(".x-axis text")
    .attr("transform", "rotate (-40)")
    .attr("x", -5)
    .attr("y", 10)
    .attr("text-anchor", "end");

  const rectangles = g.selectAll("rect").data(buildings);

  const newReactangles = rectangles
    .enter()
    .append("rect")
    .attr("y", 0)
    .attr("x", b => x(b.name))
    .attr("width", x.bandwidth)
    .attr("height", b => y(b.height))
    .attr("fill", "grey");
};

const main = () => {
  d3.json("data/buildings.json").then(drawBuildings);
};

window.onload = main;
