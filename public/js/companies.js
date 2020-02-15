const chartSize = { width: 700, height: 500 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };
const height = chartSize.height - margin.top - margin.bottom;
const width = chartSize.width - margin.left - margin.right;

const percentageFormat = d => `${d}%`;
const kCroresFormat = d => `${d / 1000}k Cr ₹`;
const rupeeFormat = d => d + " ₹";

const formats = {
  MarketCap: kCroresFormat,
  DivYld: percentageFormat,
  ROCE: percentageFormat,
  QNetProfit: kCroresFormat,
  QSales: kCroresFormat,
  CMP: rupeeFormat
};

const c = d3.scaleOrdinal(d3.schemeCategory10);

const initChart = () => {
  const svg = d3
    .select("#chart-area svg")
    .attr("height", chartSize.height)
    .attr("width", chartSize.width);

  const g = svg
    .append("g")
    .attr("class", "companies")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Companies")
    .attr("class", "x axis-label");

  g.append("text")
    .text("CMP")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("class", "y axis-label");

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  g.selectAll(".x-axis text")
    .attr("text-anchor", "end")
    .attr("x", -5)
    .attr("y", 10)
    .attr("transform", "rotate(-40)");

  g.append("g").attr("class", "y-axis");
};

const updateCompanies = function(companies, fieldName) {
  const g = d3.select("#chart-area svg .companies");
  const maxValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);
  const rects = g.selectAll("rect").data(companies, c => c.Name);

  const y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([height, 0]);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3
    .axisLeft(y)
    .tickFormat(formats[fieldName])
    .ticks(10);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  g.select(".x-axis").call(xAxis);
  g.select(".y-axis").call(yAxis);

  g.select(".y.axis-label").text(fieldName);
  const t = d3
    .transition()
    .duration(1000)
    .ease(d3.easeLinear);

  rects.exit().remove();

  rects
    .enter()
    .append("rect")
    .attr("x", b => x(b.Name))
    .attr("fill", b => c(b.Name))
    .attr("y", b => y(0))
    .attr("width", x.bandwidth)
    .merge(rects)
    .transition(t)
    .attr("y", c => y(c[fieldName]))
    .attr("x", c => x(c.Name))
    .attr("height", c => y(0) - y(c[fieldName]))
    .attr("width", x.bandwidth);
};

const parseNumerics = ({ Name, ...numericFields }) => {
  _.forEach(numericFields, (v, k) => (numericFields[k] = +v));
  return { Name, ...numericFields };
};

const frequentlyMoveCompanies = (src, dest) => {
  setInterval(() => {
    const c = src.shift();
    if (c) dest.push(c);
    else [src, dest] = [dest, src];
  }, 2000);
};

const main = () => {
  d3.csv("data/companies.csv", parseNumerics).then(companies => {
    initChart();
    const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");
    let step = 1;
    updateCompanies(companies, fields[step++ % fields.length]);
    setInterval(
      () => updateCompanies(companies, fields[step++ % fields.length]),
      2000
    );
    frequentlyMoveCompanies(companies, []);
  });
};

window.onload = main;
