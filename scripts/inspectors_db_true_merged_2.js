(function() {

    var scatter_margin = { top: 120, right: 30, bottom: 30, left: 60 },
        scatter_margin2 = { top: 30, right: 30, bottom: 30, left: 60 },
        scatter_width = d3.select("#inspectors_db_true_merged_2").node().getBoundingClientRect().width - scatter_margin.left - scatter_margin.right,
        scatter_height = 700 - scatter_margin.top - scatter_margin.bottom,
        scatter_height2 = 100 - scatter_margin2.top - scatter_margin2.bottom;

    var scatter_x = d3.scaleLinear(),
        scatter_x2 = d3.scaleLinear(),
        scatter_y = d3.scaleLinear(),
        scatter_y2 = d3.scaleLinear();

    var scatter_rScale = d3.scaleSqrt().range([5, 10]);

    var scatter_svg = d3.select("#inspectors_db_true_merged_2")
        .append("svg")
        .attr("class", "svgWrapper")
        .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
        .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom);

    scatter_svg.append("text")
        .attr("id", "annotation")
        .attr("x", 200)
        .attr("y", 10)
        .text("Потягніть слайдер, щоб обрати період та змінити масштаб графіка")
        .style("font-size", "11px")
        .style("font-style", "italic")
        .attr('text-anchor', 'start');

    var clip5def = scatter_svg.append("defs")
        .append("clipPath")
        .attr("id", "clip5")
        .append("rect")
        .attr("transform", "translate(0,-30)");


    var focus = scatter_svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + scatter_height + ")");

    focus.append("g")
        .attr("class", "axis axis--y");


    var context = scatter_svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + scatter_margin2.left + "," + scatter_margin2.top + ")");

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + scatter_height2 + ")");

    var gBrush = context.append("g")
        .attr("class", "brush");


    var handle = gBrush.selectAll('.v-brush-handle')
        .data([{ type: 'w' }, { type: 'e' }])
        .enter()
        .append('path')
        .classed('v-brush-handle', true)
        .attr('cursor', 'ew-resize')
        .attr('stroke', 'grey')
        .attr("stroke-width", 1)
        .attr('d', (d) => {
            const e = +(d.type === 'e');
            const h = 20;
            const x = e ? 1 : -1;
            const y = 18;
            return [
                `M ${0.5 * x} ${y}`,
                `A 6 6 0 0 ${e} ${6.5 * x} ${y + 6}`,
                `V ${y + h - 6}`,
                `A 6 6 0 0 ${e} ${0.5 * x} ${y + h}`,
                'Z',
                `M ${2.5 * x} ${y + 8}`,
                `V ${y + h - 8}`,
                `M ${4.5 * x} ${y + 8}`,
                `V ${y + h - 8}`,
            ].join(' ');
        });


    var brushDotsContainer = context.append("g");

    var focusDotsContainer = focus.append("g")
        .attr("transform", "translate(0,5)");

    var handleLines = gBrush.selectAll('.c-brush-handle')
        .data([{ type: 'w' }, { type: 'e' }])
        .enter()
        .append('rect')
        .classed('c-brush-handle', true)
        .attr('cursor', 'ew-resize')
        .attr('stroke', '#333')
        .attr("y", 0)
        .attr("height", 50)
        .attr("width", 0.5)
        .attr("x", 0);

    d3.csv("data/inspectors_db_true_merged.csv").then(function(input) {


        // format the data
        input.forEach(function(d) {
            d.viol_sum = +d.viol_sum;
            d.insp_count = +d.insp_count;
            d.sphere = d.sphere.toString();
        });

        var allGroup = d3.map(input, function(d) { return (d.sphere) }).keys();

        // add the options to the button
        d3.select("#selectButton_3")
            .selectAll('myOptions')
            .data(allGroup)
            .enter()
            .append('option')
            .text(function(d) { return d; }) // text showed in the menu
            .attr("value", function(d) { return d; }) // corresponding value returned



        draw_scatter("Державна служба України з питань безпечності харчових продуктів та захисту споживачів");




        function draw_scatter(filtered_val) {


            var filtered = input.filter(function(d) { return d.sphere == filtered_val });

            scatter_x
                .range([10, scatter_width])
                .domain([0, d3.max(filtered, function(d) { return d.viol_sum })])

            scatter_x2
                .range([0, scatter_width])
                .domain([0, d3.max(filtered, function(d) { return d.viol_sum })])

            scatter_y
                .range([scatter_height, 0])
                .domain([0, d3.max(filtered, function(d) { return d.insp_count })]);

            scatter_y2
                .range([scatter_height2, 0])
                .domain([0, d3.max(filtered, function(d) { return d.insp_count })]);

            scatter_rScale.domain([0, d3.max(filtered, function(d) { return d.viol_sum })]);

            var brush = d3.brushX()
                .extent([
                    [0, 0],
                    [scatter_width, scatter_height2]
                ])
                .on("brush", brushed);


            clip5def
                .attr("width", scatter_width + 20)
                .attr("height", scatter_height + 30);


            focus.select(".axis.axis--x")
                .attr("transform", "translate(" + 0 + "," + scatter_height + ")")
                .transition()
                .duration(500)
                .call(d3.axisBottom(scatter_x)
                    .ticks(5)
                );

            focus.select(".axis.axis--y")
                .transition()
                .duration(500)
                .call(d3.axisLeft(scatter_y));


            context.select(".axis.axis--x")
                .attr("transform", "translate(" + 0 + "," + scatter_height2 + ")")
                .transition()
                .duration(500)
                .call(d3.axisBottom(scatter_x2)
                    .tickSizeOuter(0)
                );


            context.select(".brush")
                .call(brush)
                .call(brush.move, [0, scatter_width]);


            d3.selectAll("path.v-brush-handle")
                .raise();


            d3.selectAll("rect.c-brush-handle")
                .raise();


            focusDotsContainer
                .attr("clip-path", "url(#clip5)");


            var focusDots = focusDotsContainer
                .selectAll(".focus-dot")
                .data(filtered);

            focusDots.exit().remove();

            focusDots
                .attr("data-tippy-content", function(d) {
                    let tipyAmount = Math.round(d.viol_sum);

                })
                .transition()
                .duration(500)
                .attr("r", function(d) { return scatter_rScale(d.viol_sum) })
                .attr("cx", function(d) {
                    return scatter_x(d.viol_sum);
                })
                .attr("cy", function(d) {
                    return scatter_y(d.insp_count);
                });

            var tooltip = d3.select("#inspectors_db_true_merged_2")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")


            focusDots
                .enter().append("circle")
                .attr('class', 'focus-dot tip')
                .style("fill", "#4562AB")
                // .style("stroke", "#007EFF")
                //.attr("r", 5)
                .attr("r", function(d) { return scatter_rScale(d.viol_sum) })
                .style("opacity", 1)
                .attr("cx", function(d) {
                    return scatter_x(d.viol_sum);
                })
                .attr("cy", function(d) {
                    return scatter_y(d.insp_count);
                })
                .on("mouseover", function(d) {
                    d3.selectAll(".focus-dot").attr("r", function(d) { return scatter_rScale(d.viol_sum) })
                    d3.select(this).attr("r", 10);
                    tooltip
                        .style("opacity", 1);
                })
                .on("mouseout", function(d) {
                    d3.selectAll(".focus-dot")
                        .attr("r", function(d) { return scatter_rScale(d.viol_sum) })
                    tooltip
                        .transition()
                        .duration(200)
                        .style("opacity", 0);
                })
                .on("mousemove", function(d) {
                    tooltip
                        .html(d.pib + "<br>" + "кількість знайдених порушень: " + d.viol_sum + "<br>" + "кількість перевірок:  " + d.insp_count)
                        .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                        .style("top", (d3.mouse(this)[1]) + "px")
                });




            // append scatter plot to brush chart area

            brushDotsContainer
                .attr("clip-path", "url(#clip5)");

            var brushDots = brushDotsContainer
                .selectAll(".dot-context")
                .data(filtered);

            brushDots
                .transition()
                .duration(500)
                .attr("r", 3)
                .style("opacity", 0.5)
                .attr("cx", function(d) {
                    return scatter_x2(d.viol_sum);
                })
                .attr("cy", function(d) {
                    return scatter_y2(d.insp_count);
                });

            brushDots
                .enter().append("circle")
                .attr("class", "dot-context")
                .style("fill", "#4562AB")
                // .style("stroke", "#007EFF")
                .attr("r", 2.5)
                .style("opacity", .2)
                .attr("cx", function(d) {
                    return scatter_x2(d.viol_sum);
                })
                .attr("cy", function(d) {
                    return scatter_y2(d.insp_count);
                });

            brushDots.exit().remove();




            function brushed() {

                var selection = d3.event.selection;

                //якщо extent менше 30
                if ((selection[1] - selection[0]) < 40) {
                    selection[1] = selection[0] + 40;
                    context.select(".brush")
                        .call(brush.move, [selection[0], selection[1]]);
                }


                if (selection == null) {
                    handle.attr("display", "none");
                    handleLines.attr("display", "none");
                } else {
                    handleLines.attr("display", null).attr("transform", function(d, i) { return "translate(" + [selection[i], -30 / 4] + ")"; });
                    handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [selection[i], -30 / 4] + ")"; });
                }

                scatter_x.domain(selection.map(scatter_x2.invert, scatter_x2));

                focus.selectAll(".focus-dot")
                    .attr("cx", function(d) {
                        return scatter_x(d.viol_sum);
                    })
                    .attr("cy", function(d) {
                        return scatter_y(d.insp_count);
                    });

                focus.select(".axis--x").call(
                    d3.axisBottom(scatter_x)
                    .ticks(5));
            }

        }


        d3.select("#selectButton_3").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value");
            // run the updateChart function with this selected option
            draw_scatter(selectedOption);

        })

    })

})();