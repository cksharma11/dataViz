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

const drawCompanies = companies => {
  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(companies, "CMP").CMP])
    .range([height, 0]);
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);
  const svg = d3
    .select("#chart-area svg")
    .attr("height", chartSize.height)
    .attr("width", chartSize.width);
  const companiesG = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  const rectangles = companiesG.selectAll("rect").data(companies, c => c.Name);
  const newRects = rectangles.enter().append("rect");
  newRects
    .attr("y", b => y(b.CMP))
    .attr("x", b => x(b.Name))
    .attr("width", x.bandwidth)
    .attr("height", b => y(0) - y(b.CMP))
    .attr("fill", b => c(b.Name));
  companiesG
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Companies")
    .attr("class", "x axis-label");
  companiesG
    .append("text")
    .text("CMP")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("class", "y axis-label");
  const yAxis = d3
    .axisLeft(y)
    .tickFormat(formats["CMP"])
    .ticks(10);
  companiesG
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis);
  const xAxis = d3.axisBottom(x);
  companiesG
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  companiesG
    .selectAll(".x-axis text")
    .attr("text-anchor", "end")
    .attr("x", -5)
    .attr("y", 10)
    .attr("transform", "rotate(-40)");
};

const updateCompanies = function(companies, fieldName) {
  const svg = d3.select("#chart-area svg");
  svg.select(".y.axis-label").text(fieldName);
  const maxValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);
  const y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([height, 0]);
  const yAxis = d3
    .axisLeft(y)
    .tickFormat(formats[fieldName])
    .ticks(10);
  svg.select(".y-axis").call(yAxis);
  const t = d3
    .transition()
    .duration(1000)
    .ease(d3.easeLinear);
  svg
    .selectAll("rect")
    .data(companies, c => c.Name)
    .exit()
    .remove()
    .transition(t);
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);
  const xAxis = d3.axisBottom(x);

  svg
    .select("g")
    .selectAll("rect")
    .data(companies, c => c.Name)
    .enter()
    .append("rect")
    .attr("x", b => x(b.Name))
    .attr("y", b => y(0))
    .attr("width", x.bandwidth)
    .transition(t)
    .attr("height", b => y(0) - y(b[fieldName]))
    .attr("fill", b => c(b.Name));

  svg.select(".x-axis").call(xAxis);
  svg
    .selectAll("rect")
    .data(companies, c => c.Name)
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
    drawCompanies(companies);
    const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");
    let step = 1;
    setInterval(
      () => updateCompanies(companies, fields[step++ % fields.length]),
      2000
    );
    frequentlyMoveCompanies(companies, []);
  });
};

window.onload = main;
