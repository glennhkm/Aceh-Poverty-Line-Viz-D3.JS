d3.csv("../garis-kemiskinan-aceh-menurut-kabupaten-kota.csv").then((data) => {
  data = data.filter((item) => item.tahun > 2015);

  const grouppedData = d3.group(data, (d) => d.bps_nama_kabupaten_kota);
  const rataRataByProv = Array.from(grouppedData, ([kota, nilaiGroupped]) => ({
    kota: kota
      .split(" ")
      .filter((word) => word != "Kabupaten" && word != "Kota")
      .join(" "),
    rata_rata_angka_garis_kemiskinan: Math.round(
      d3.mean(nilaiGroupped, (d) => d.angka_garis_kemiskinan)
    ),
  }));

  console.log("RATA RATA PROV: ", rataRataByProv);

  data.forEach(function (d) {
    d.tahun = +d.tahun;
    d.angka_garis_kemiskinan = +d.angka_garis_kemiskinan;
  });

  var rata_rata_per_tahun = d3.rollup(
    data,

    (v) => Math.round(d3.mean(v, (d) => d.angka_garis_kemiskinan)),

    (d) => d.tahun
  );

  console.log("Rata-rata angka garis kemiskinan per tahun:");
  rata_rata_per_tahun.forEach((value, key) => {
    console.log("Tahun: " + key + ", Rata-rata: " + value);
  });

  var rata_rata_data = Array.from(
    rata_rata_per_tahun,
    ([tahun, rata_rata]) => ({ tahun, rata_rata })
  );
  console.log("RATA RATA DATA: ", rata_rata_data);

  var margin = { top: 20, right: 30, bottom: 30, left: 70 },
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const maxChart1 = d3.max(
    rataRataByProv.map((d) => {
      return d.rata_rata_angka_garis_kemiskinan;
    })
  );

  var x1 = d3
    .scaleBand()
    .domain(
      rataRataByProv.map((d) => {
        return d.kota;
      })
    )
    .range([0, width])
    .padding(0.1);

  var y1 = d3
    .scaleLinear()
    .domain([100000, maxChart1])
    .range([height, 0])
    .nice();

  var svg1 = d3
    .select("#chart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 100 + height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg1
    .append("g")
    .call(
      d3.axisLeft().scale(y1).tickFormat(d3.format(".0f")).tickSizeInner(3)
    );

  svg1
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2 - 110)
    .attr("dy", "1em")
    .attr("fill", "white")
    .style("text-anchor", "left")
    .style("font-size", "13px")
    .text("Garis Kemiskinan (Rp/kapita/bulann)");

  svg1
    .append("text")
    .attr("x", width / 2 - 10)
    .attr("y", height + margin.top + 89)
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Kota/Kabupaten");

  svg1
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x1))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg1
    .selectAll(".bar")
    .data(rataRataByProv)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "#2D9596")
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut)
    .attr("x", (d) => {
      return x1(d.kota);
    })
    .attr("width", "30px")
    .attr("y", (d) => {
      return y1(d.rata_rata_angka_garis_kemiskinan);
    })
    .attr("height", (d) => {
      return height - y1(d.rata_rata_angka_garis_kemiskinan);
    });

  const maxChart2 = d3.max(
    rata_rata_data.map(function (d) {
      return d.rata_rata;
    })
  );

  var x2 = d3
    .scaleTime()
    .domain(
      d3.extent(rata_rata_data, function (d) {
        return new Date(d.tahun, 0, 1);
      })
    )
    .range([0, width]);

  var y2 = d3
    .scaleLinear()
    .domain([100000, maxChart2])
    .range([height, 0])
    .nice();

  var line = d3
    .line()
    .x((d) => {
      return x2(new Date(d.tahun, 0, 1));
    })
    .y((d) => {
      return y2(d.rata_rata);
    });

  var svg2 = d3
    .select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const chart2SVG = d3.select("#chart2 svg").node();

  svg2
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft().scale(y2).tickSize(-width).tickFormat(""));

  svg2
    .append("g")
    .attr("class", "grid")
    .call(d3.axisBottom().scale(x2).tickSize(height).tickFormat(""));

  svg2
    .append("g")
    .call(
      d3.axisLeft().scale(y2).tickFormat(d3.format(".0f")).tickSizeInner(3)
    );

  svg2
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom().scale(x2));

  svg2
    .append("path")
    .datum(rata_rata_data)
    .attr("fill", "none")
    .attr("stroke", "#2D9596")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg2
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2 - 110)
    .attr("dy", "1em")
    .attr("fill", "white")
    .style("text-anchor", "left")
    .style("font-size", "13px")
    .text("Garis Kemiskinan (Rp/kapita/bulann)");

  svg2
    .append("text")
    .attr("x", width / 2 - 10)
    .attr("y", height + margin.top + 30)
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .text("Tahun");

  svg2
    .selectAll(".dot")
    .data(rata_rata_data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function (d) {
      return x2(new Date(d.tahun, 0, 1));
    })
    .attr("cy", function (d) {
      return y2(d.rata_rata);
    })
    .attr("r", 4)
    .attr("fill", "#2D9596")
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut);

  function onMouseOver(d, i) {
    var xPos, yPos;
    d3.select(this).attr("fill", "#1A6665");
    if ("tahun" in i) {
      xPos = parseFloat(d3.select(this).attr("cx"));
      yPos = parseFloat(d3.select(this).attr("cy"));

      const chartRect = chart2SVG.getBoundingClientRect();
      const offsetX = 0;
      const offsetY = 700;

      d3.select("#tooltip")
        .style("left", xPos + chartRect.left + offsetX + "px")
        .style("top", yPos + chartRect.top + offsetY + "px")
        .select("#tahun")
        .text(`Tahun: ${i.tahun}`);

      d3.select("#tooltip")
        .select("#garisKemiskinan")
        .text(
          `Rata-rata garis kemiskinan: ${i.rata_rata.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}/kapita/bulan`
        );
    } else {
      xPos = parseFloat(d3.select(this).attr("x")) + x1.bandwidth();
      yPos = parseFloat(d3.select(this).attr("y")) + height / 2;

      d3.select("#tooltip")
        .style("left", xPos + 100 + "px")
        .style("top", yPos + 100 + "px")
        .select("#tahun")
        .text(`Kota/Kabupaten: ${i.kota}`);

      d3.select("#tooltip")
        .select("#garisKemiskinan")
        .text(
          `Rata-rata garis kemiskinan: ${i.rata_rata_angka_garis_kemiskinan.toLocaleString(
            "id-ID",
            {
              style: "currency",
              currency: "IDR",
            }
          )}/kapita/bulan`
        );
    }

    d3.select("#tooltip").classed("hidden", false);
  }

  function onMouseOut(d, i) {
    d3.select(this).attr("class", "bar");
    d3.select(this).attr("fill", "#2D9596");
    d3.select("#tooltip").classed("hidden", true);
  }
});
