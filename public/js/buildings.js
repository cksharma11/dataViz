const WIDTH = 400;
const HEIGHT = 400;

const drawBuildings = buildings => {
  const maxHeight = _.maxBy(buildings, "height").height;

  const x = d3
    .scaleBand()
    .range([0, WIDTH])
    .domain(_.map(buildings, "name"))
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, maxHeight])
    .range([0, HEIGHT]);

  const chartArea = d3.select("#chart-area");
  const svg = chartArea
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  const rectangles = svg.selectAll("rect").data(buildings);

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
