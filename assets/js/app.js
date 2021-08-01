//create my SVG dimensions Like the Savage coder I am
var svgWidth = 960;
var svgHeight = 500;


//Define my margin sizes for the HTML
var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    },
    //do some maths so that my chart fits nicely in the SVG
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;
//Assign my chart to the HTML using the css class and give it my dimesions
// from above. Also do some mor e mathe to assign scales
var chart = d3.select("#scatter")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Chsen X Axis to show when page loads
var chosenXAxis = "poverty";
// Chosen Y Axis to show when page loads
var chosenYAxis = "healthcare";


//Function that creates the scale that will appear on the x axis
// Doesnt display scale just does the maths
function xScale(data, chosenXAxis) {
    var x = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]), d3.max(data, d => d[chosenXAxis])])
        .range([0, width]);
    return x;
}



// same as abovei but for the Y axis, Couldnt get this to work tho
function yScale(data, chosenYAxis) {
    var y = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]), d3.max(data, d => d[chosenYAxis])])
        .range([height, 0]);
    return y;
}
//This displays the new X scale with the tick marks and labels 
//on the X         
function renderX(newXscale, xAxis) {
    var axisXaxis = d3.axisBottom(newXscale)
    xAxis.call(axisXaxis)
    xAxis.transition()
        .duration(1000)
        .call(axisXaxis);

    return xAxis;
}
// Same as above however I couldnt get it to work
function renderY(newYscale, yAxis) {
    var axisYaxis = d3.axisLeft(newYscale)
    yAxis.call(axisYaxis)
    yAxis.transition()
        .duration(1000)
        .call(axisYaxis);

    return yAxis;
}
// Funtion that assigns the markers to the new scale
function circles(groups, newXscale, chosenXAxis) {
    groups.transition()
        .duration(1000)
        .attr('cx', d => newXscale(d[chosenXAxis]))
    return groups;
}
//Funtion that assigns new values to the data that the tooltip displays 
//based on which x axis is picked
function justThetip(chosenXAxis, chosenYAxis, groups) {
    var x_label;

    if (chosenXAxis === "poverty") {
        x_label = "Percentage of population in poverty";
    } else if (chosenXAxis === 'age') {
        x_label = "Average age of popultaion";
    } else {
        x_label = 'Average income of Population';
    }
    // varible to display tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${x_label} :${d[chosenXAxis]}<br>percent of population with healthcare : ${d[chosenYAxis]}`);
        });

    groups.call(toolTip);

    groups.on('mouseover', function(data) {
        toolTip.show(data, this);
    })
    groups.on('mouseout', function(data) {
        toolTip.hide(data);
    })
    return groups;
}
//read in my csv. Some reason it always has to at a random spot in the 
// script and that is why i dont like JS
d3.csv('data.csv').then(function(data, err) {
    if (err) throw err;
    data.forEach(function(change) {
        change.poverty = +change.poverty
        change.healthcare = +change.healthcare
        change.age = +change.age
        change.income = +change.income
    });
    //Perform my functions above and assign it to variable
    var x_scale = xScale(data, chosenXAxis)
    var y_scale = yScale(data, chosenYAxis)
    var axisYaxis = d3.axisLeft(y_scale);
    var axisXaxis = d3.axisBottom(x_scale);
    //change my x ticks with the new choen x axis
    var x = chart.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(axisXaxis);
    //same as above but it doesnt workk for the y
    var y = chart.append("g")
        .classed('y-axis', true)
        .call(axisYaxis);
    // creates our markes and assigns it ro the variable markers
    var markers = chart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x_scale(d[chosenXAxis]))
        .attr("cy", d => y_scale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");
    //creates our labels and adds then to the chart
    var x_labels = chart.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    // New label for poverty
    var poverty_label = x_labels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty Rate(%)");
    // new label for age
    var age_label = x_labels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Population age");
    // new label for income
    var income_label = x_labels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Population average income");
    // Tried the same for my y labels but wasnt successful
    var y_labels = chart.append("g")
        .attr("transform", "rotate(-90)")

    var healthcare = y_labels.append('text')
        .attr("y", 50 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("active", true)
        .text("Percent of population with healthcare(%)");
    //update the markers using every function from above and 
    //then tying it together with the selected labels
    var markers = justThetip(chosenXAxis, chosenYAxis, markers);

    x_labels.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                x_scale = xScale(data, chosenXAxis);

                // updates x axis with transition
                x = renderX(x_scale, x);

                // updates circles with new x values
                markers = circles(markers, x_scale, chosenXAxis);

                // updates tooltips with new info
                markers = justThetip(chosenXAxis, chosenYAxis, markers);

                if (chosenXAxis === "poverty") {
                    poverty_label
                        .classed("active", true)
                        .classed("inactive", false);
                    age_label
                        .classed("active", false)
                        .classed("inactive", true);
                    income_label
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === 'age') {
                    poverty_label
                        .classed("active", false)
                        .classed("inactive", true);
                    age_label
                        .classed("active", true)
                        .classed("inactive", false);
                    income_label
                        .classed("active", false)
                        .classed("inactive", true);

                } else {
                    poverty_label
                        .classed("active", false)
                        .classed("inactive", true);
                    age_label
                        .classed("active", false)
                        .classed("inactive", true);
                    income_label
                        .classed("active", true)
                        .classed("inactive", false);

                }
            }
        });
});