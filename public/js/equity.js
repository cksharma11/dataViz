const chartSize = { width: 1400, height: 700 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };
const height = chartSize.height - margin.top - margin.bottom;
const width = chartSize.width - margin.left - margin.right;

const get100DayAverage = (quotes, i, span) => {
  const closingPrices = quotes.slice(i - span, i);
  const sumOfClosingPrices = closingPrices.reduce((x, y) => x + y.Close, 0);
  const average = sumOfClosingPrices / span;
  return _.round(average);
};

const analyseData = quotes => {
  const span = 100;
  for (let i = span; i <= quotes.length; i++) {
    quotes[i - 1].sma = get100DayAverage(quotes, i, 100);
  }
};

const initChart = () => {
  const svg = d3
    .select("#chart-area svg")
    .attr("height", chartSize.height)
    .attr("width", chartSize.width);

  prices = svg
    .append("g")
    .attr("class", "prices")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  prices
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Time")
    .attr("class", "x axis-label");

  prices
    .append("text")
    .text("Closed price")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("class", "y axis-label");

  prices
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  prices
    .selectAll(".x-axis text")
    .attr("text-anchor", "end")
    .attr("x", -5)
    .attr("y", 10);

  prices.append("g").attr("class", "y-axis");
};

const formatTime = ms => {
  return new this.Date(ms).toJSON().split("T")[0];
};

const isBetweenDate = (date, start, end) => {
  return date > start && date < end;
};

const getRangeData = (quotes, startDate, endDate) => {
  const rangeQuotes = quotes.filter(q =>
    isBetweenDate(q.time, startDate, endDate)
  );
  return rangeQuotes;
};

const createRangeBar = quotes => {
  const startDate = _.first(quotes).time.getTime();
  const lastDate = _.last(quotes).time.getTime();

  const slider = createD3RangeSlider(startDate, lastDate, "#slider-container");

  slider.onChange(newRange => {
    d3.select("#range-label").text(
      formatTime(newRange.begin) + " - " + formatTime(newRange.end)
    );

    newQuotes = getRangeData(quotes, newRange.begin, newRange.end);
    d3.selectAll("path").remove();
    updatePrices(newQuotes);
  });

  slider.range(startDate, lastDate);
};

const updatePrices = function(quotes) {
  const fq = _.first(quotes);
  const lq = _.last(quotes);

  const minCP = _.get(_.minBy(quotes, "Close"), "Close", 0);
  const maxCP = _.get(_.maxBy(quotes, "Close"), "Close", 0);
  const minSMA = _.get(_.minBy(quotes, "sma"), "sma", 0);

  const g = d3.select("#chart-area svg .prices");

  const y = d3
    .scaleLinear()
    .domain([Math.min(minCP, minSMA), maxCP])
    .range([height, 0]);

  const x = d3
    .scaleTime()
    .range([0, width])
    .domain([fq.time, lq.time]);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y).ticks(10);

  g.select(".x-axis").call(xAxis);
  g.select(".y-axis").call(yAxis);

  const line = field =>
    d3
      .line()
      .x(q => x(q.time))
      .y(q => y(q[field]));

  g.append("path")
    .attr("class", "close")
    .attr("d", line("Close")(quotes));

  g.append("path")
    .attr("class", "sma")
    .attr("d", line("sma")(quotes.filter(q => q.sma)));
};

const toNumericFormat = ({ Date, Volume, AdjClose, ...rest }) => {
  _.forEach(rest, (v, k) => (rest[k] = +v));
  return { Date, ...rest, time: new this.Date(Date) };
};

const drawEquityChart = quotes => {
  initChart();
  analyseData(quotes, 100);
  updatePrices(quotes);
  createRangeBar(quotes);
};

const main = () => {
  d3.csv("data/equity.csv", toNumericFormat).then(drawEquityChart);
};

window.onload = main;
