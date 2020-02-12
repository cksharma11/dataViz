const drawCompanies = companies => {
  const { Name, ...b } = _.first(companies);
  const fields = _.keys(b);
  let field = _.first(fields);

  setInterval(() => {
    fields.push(fields.shift());
    field = _.first(fields);
  }, 2000);

  const maxHeight = _.maxBy(companies, field)[field];
  const chartSize = { width: 800, height: 600 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };
  const width = chartSize.width - (margin.left + margin.right);
  const height = chartSize.height - (margin.top + margin.bottom);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, maxHeight])
    .range([height, 0]);

  const c = d3.scaleOrdinal(d3.schemeDark2);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => d + " ₹")
    .ticks(10);

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
    .text("Companies");

  g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text(field)
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

  const rectangles = g.selectAll("rect").data(companies);

  const newReactangles = rectangles
    .enter()
    .append("rect")
    .attr("y", b => y(b[field]))
    .attr("x", b => x(b.Name))
    .attr("width", x.bandwidth)
    .attr("height", b => y(0) - y(b[field]))
    .attr("fill", b => c(b.Name));
};

const main = () => {
  d3.csv("data/companies.csv", ({ Name, ...rest }) => {
    Object.keys(rest).forEach(c => (rest[c] = +rest[c]));
    return { Name, ...rest };
  }).then(drawCompanies);
};

window.onload = main;
