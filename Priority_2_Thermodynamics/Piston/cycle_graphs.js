/*
 * File: cycle_graphs.js
 * Author: Emily Ehrenberger (August 2011), Modified by Brooke Bullek (July 2017)
 *         Under the supervision of Margot Vigeant, Bucknell University
 *         Based on Flash simulation by Gavin MacInnes
 * (c) Margot Vigeant 2017
*/

/* This file is a collection of functions related to the graphing functionality 
 * of this simulation. (2D pressure/volume & entropy/temperature graphs, and a
 * 3D pressure/temperature/volume graph.) */

var PVTGraph3D;

/*
********************************************************************************
*                          3D Graph Functionality                              *
********************************************************************************
*/

// Give the points a 3D feel by adding a radial gradient
Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function (color) {
    return {
        radialGradient: {
            cx: 0.4,
            cy: 0.3,
            r: 0.5
        },
        stops: [
            [0, color],
            [1, Highcharts.Color(color).brighten(-0.2).get('rgb')]
        ]
    };
});

function init3DGraph() {
  PVTGraph3D = new Highcharts.Chart({
    chart: {
      renderTo: 'PVTGraphDiv',
      margin: 50,
      type: 'scatter',
      options3d: {
        enabled: true,
        alpha: 20,
        beta: 30,
        depth: 200,
        frame: {
          bottom: {
            size: 1,
            color: '#C0C0C0'
          }
        }
      }
    },

    title: {
      text: ''
    },

    xAxis: {
      min: 0,
      gridLineWidth: 1,
      title: {
          text: 'Pressure'
      }
    },

    yAxis: {
      min: 0,
      title: {
          text: 'Temperature'
      }
    },

    zAxis: {
      min: 0,
      title: {
          text: 'Volume'
      }
    },

    plotOptions: {
      series: {
        lineWidth: 1
      }
    },

    legend: {
      enabled: false
    },

    series: [{
      data: [
        // [Pressure, Temperature, Volume]
      ]
    }]
  });

  // Add mouse events for rotation
  $(PVTGraph3D.container).on('mousedown.hc touchstart.hc', function (eStart) {
      eStart = PVTGraph3D.pointer.normalize(eStart);

      var posX = eStart.chartX,
          posY = eStart.chartY,
          alpha = PVTGraph3D.options.chart.options3d.alpha,
          beta = PVTGraph3D.options.chart.options3d.beta,
          newAlpha,
          newBeta,
          sensitivity = 5; // lower is more sensitive

      $(document).on({
          'mousemove.hc touchmove.hc': function (e) {
              // Run beta
              e = PVTGraph3D.pointer.normalize(e);
              newBeta = beta + (posX - e.chartX) / sensitivity;
              PVTGraph3D.options.chart.options3d.beta = newBeta;

              // Run alpha
              newAlpha = alpha + (e.chartY - posY) / sensitivity;
              PVTGraph3D.options.chart.options3d.alpha = newAlpha;

              PVTGraph3D.redraw(false);
          },
          'mouseup touchend': function () {
              $(document).off('.hc');
          }
      });
  });
}

/*
 * Pulls triples from the pressure/temperature/volume arrays of values and stores them
 * sequentially as data in the 3D scatterplot.
 */
function set3DGraphData() {
  var length = Math.min(Ppoints.length, Tpoints.length, Vpoints.length);
  var data = [];
  for (var i = 0; i < length; i++) {
    data.push([Ppoints[i], Tpoints[i], Vpoints[i]]);
  }
  // Update the data of the chart
  PVTGraph3D.series[0].setData(data);
}
