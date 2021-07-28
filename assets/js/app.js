var svgWidth = 960;
var svgHeight = 500;



var margin = {top: 20, right: 40, bottom: 80, left: 100},
    width = svgWidth - margin.left - margin.right,
    height = svgHeight- margin.top - margin.bottom;

    var chart = d3.select("#scatter")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var chosenXAxis = "poverty";
    var chosenYAxis ="healthcare";


              // Add X axis
      function xScale(data, chosenXAxis){
              var x = d3.scaleLinear()
                .domain([d3.min(data, d=>d[chosenXAxis]), d3.max(data, d=>d[chosenXAxis])])
                .range([ 0, width ]);
                return x;
              }
                
                
            
              // Add Y axis
      function yScale(data, chosenYAxis){
              var y = d3.scaleLinear()
                .domain([d3.min(data, d=>d[chosenYAxis]),d3.max(data, d=>d[chosenYAxis])])
                .range([ height, 0]);
                return y;
              }
      function renderX(newXscale, xAxis){        
              var axisXaxis =d3.axisBottom(newXscale)
            xAxis.call(axisXaxis)
            xAxis.transition()
            .duration(1000)
            .call(axisXaxis);

            return xAxis;
      }

      function renderY(newYscale, yAxis){
            var axisYaxis =d3.axisLeft(newYscale)
            yAxis.call(axisYaxis)
            yAxis.transition()
            .duration(1000)
            .call(axisYaxis);

            return yAxis;
          }
      function circles(groups, newXscale, chosenXAxis){
              groups.transition()
              .duration(1000)
              .attr('cx',d=>newXscale(d[chosenXAxis]))
              return groups;
      }
      function justThetip(chosenXAxis, chosenYAxis, groups){
        var x_label;

        if (chosenXAxis === "poverty") {
          x_label = "Percentage of population in poverty";
        }
        else if (chosenXAxis === 'age'){ 
          x_label = "Average age of popultaion";
        }
        else{
          x_label = 'Average income of Population';
        }
      
              var toolTip = d3.tip()
              .attr("class", "tooltip")
              .offset([80, -60])
              .html(function(d) {
                return (`${d.state}<br>${x_label} :${d[chosenXAxis]}<br>percent of population with healthcare : ${d[chosenYAxis]}`);
              });

              groups.call(toolTip);
            
              groups.on('mouseover', function(data){
                toolTip.show(data,this);
              })
              groups.on('mouseout', function(data){
                toolTip.hide(data);
              })
              return groups;
            }
            
          d3.csv('data.csv').then(function(data, err) {
            if (err) throw err;
            data.forEach(function(change){
              change.poverty = +change.poverty
              change.healthcare = +change.healthcare
              change.age = +change.age
              change.income = +change.income 
            });
            var x_scale= xScale(data, chosenXAxis)
            var y_scale = yScale(data,chosenYAxis)
            var axisYaxis = d3.axisLeft(y_scale);
            var axisXaxis = d3.axisBottom(x_scale);
            
            var x = chart.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(axisXaxis);

            var y = chart.append("g")
            .classed('y-axis', true)
            .call(axisYaxis);

            var markers = chart.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x_scale(d[chosenXAxis]))
            .attr("cy", d => y_scale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("fill", "pink")
            .attr("opacity", ".5");

            var x_labels = chart.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

            var poverty_label = x_labels.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Poverty Rate(%)");

            var age_label = x_labels.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Population age");

            var income_label = x_labels.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Population average income");


            var y_labels = chart.append("g")
            .attr("transform", "rotate(-90)")
            
            var healthcare = y_labels.append('text')
            .attr("y", 50 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("active", true)
            .text("Percent of population with healthcare(%)");

            var markers = justThetip(chosenXAxis, chosenYAxis, markers);

            x_labels.selectAll("text")
            .on("click", function() {
              var value = d3.select(this).attr("value");
              if (value !== chosenXAxis) {
        
                // replaces chosenXAxis with value
                chosenXAxis = value;
        
                // console.log(chosenXAxis)
        
                // functions here found above csv import
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
                }
                else if (chosenXAxis === 'age'){
                  poverty_label
                    .classed("active", false)
                    .classed("inactive", true);
                  age_label
                    .classed("active", true)
                    .classed("inactive", false);
                  income_label
                  .classed("active", false)
                  .classed("inactive", true);

                }
                else{
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
