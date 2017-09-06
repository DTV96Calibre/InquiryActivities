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

// The Highcharts objects used to render the graphs
var PVTGraph3D;
var TSgraph;
var PVgraph;

// Arrays of points for pressure, volume, temperature, and entropy
var Ppoints;
var Vpoints;
var Tpoints;
var Spoints;

// True when the last (i.e. most recent) point on the graphs hasn't been saved
var dotPreviewed;

/*
********************************************************************************
*                            Graph Functionality                               *
********************************************************************************
*/

/*
 * Initializes the Raphael (2D vector library for JS) objects by passing in the 
 * HTML divs meant to store the pressure/volume and temperature/entropy graphs.
 * Also calls the function responsible for instantiating the 3D graph from the
 * Highcharts library.
 */
function initializeGraphs() {
  init3DGraph();
  init2DGraphs();
}

/*
 * Graph the points on all three graphs.
 */
function graph() {
  var points = generateGraphPoints();

  Ppoints = Ppoints.concat(points["P"]);
  Vpoints = Vpoints.concat(points["V"]);
  Tpoints = Tpoints.concat(points["T"]);
  Spoints = Spoints.concat(points["S"]);
  
  // Graph the data using the Highcharts library
  set3DGraphData(Ppoints, Tpoints, Vpoints);
  setPVGraphData(Ppoints, Vpoints);
  setTSGraphData(Tpoints, Spoints);

  hasUpdated = true;
  toggleUpdate();
}

/*
 * Graph the points on the graphs while taking into consideration that the 
 * "preview" point may need to be overwritten.
 */
function graphPreviewDot() {
  var color = colors[(numSavedSteps + 1) % colors.length];

  var points = generateGraphPoints();

  /* If the user has pressed 'Save Step' since the last time the graph updated,
   * push the new data points so they become permanent fixtures of this cycle. 
   */
  if (!dotPreviewed) {
    Vpoints.push(new DataPoint(volume, color));
    Ppoints.push(new DataPoint(pressure, color));
    Tpoints.push(new DataPoint(temp, color));
    Spoints.push(new DataPoint(entropy, color));
  }
  
  graph();

  dotPreviewed = true;
}

/*
 * Simulates the collection of points needed to graph the latest endpoint, 
 * which may be a curved line.
 */
function generateGraphPoints() {
  var color = colors[(numSavedSteps + 1) % colors.length];

  /* Create an empty object to act as an associative array containing the sets 
   * of point values for P, V, T, and S */
  var points = {};
  points["P"] = new Array();
  points["V"] = new Array();
  points["T"] = new Array();
  points["S"] = new Array();
  
  // If the step is adiabatic, must simulate a curve (rather than a straight line) for the PV graph
  if (stepType == "Adiabatic") {
    var P = oldPressure;
    var V = oldVolume;
    var oldP = oldPressure;
    var oldV = oldVolume;

    // Remove residual lines from the 2D PV plot
    if (!dotPreviewed) {
      Ppoints.pop();
      Vpoints.pop();
    }
    
    var Vstep = (volume - oldVolume) / 50;
    
    // simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
    for (var i = 1; i <= 50; i++) {
      oldV = V;
      oldP = P;
      V += Vstep;
      
      P = oldP * Math.pow((oldV / V), (Cp / Cv));
      
      points["P"].push(new DataPoint(P, color));
      points["V"].push(new DataPoint(V, color));
      points["T"].push(new DataPoint(temp, color));
      points["S"].push(new DataPoint(entropy, color));
    }
  }
  
  // If the step is not adiabatic, then there is no need to simulate a curve for the PV graph,
  // because that graph should be a straight line, which graphael does automatically
  
  // If the step is isobaric or isochoric, must simulate a curve for the TS graph
  else if (stepType == "Isobaric") {
    var T = oldTemp;
    var S = oldEntropy;
    var oldT = oldTemp;
    var oldS = oldEntropy;
    
    var Sstep = (entropy - oldEntropy) / 50;
    
    // simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
    for (var i = 1; i <= 50; i++) {
      oldS = S;
      oldT = T;
      S += Sstep;
      
      T = oldT * Math.exp((S - oldS)/Cp);
      
      points["T"].push(new DataPoint(T, color));
      points["S"].push(new DataPoint(S, color));
      points["P"].push(new DataPoint(pressure, color));
      points["V"].push(new DataPoint(volume, color));
    }
  }
  else if (stepType == "Isochoric") {
    // Tpoints.pop();
    // Spoints.pop();
    
    var T = oldTemp;
    var S = oldEntropy;
    var oldT = oldTemp;
    var oldS = oldEntropy;
    
    var Sstep = (entropy - oldEntropy) / 50;
    
    // simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
    for (var i = 1; i <= 50; i++) {
      oldS = S;
      oldT = T;
      S += Sstep;
      
      T = oldT * Math.exp((S - oldS)/Cv);
      
      points["T"].push(new DataPoint(T, color));
      points["S"].push(new DataPoint(S, color));
      points["P"].push(new DataPoint(pressure, color));
      points["V"].push(new DataPoint(volume, color));
    }
  }
  
  // If the step is isothermal, there is no need to interpolate because both graphs will be straight lines
  else {
    points["P"].push(new DataPoint(pressure, color));
    points["V"].push(new DataPoint(volume, color));
    points["T"].push(new DataPoint(temp, color));
    points["S"].push(new DataPoint(entropy, color));
  }
  
  return points;
}

/*
********************************************************************************
*                          3D Graph Functionality                              *
********************************************************************************
*/

/*
 * Initializes the Highcharts 2D lineplots.
 */
function init2DGraphs() {
  // Create pressure/volume graph
  PVgraph = new Highcharts.Chart({
    chart: {
      renderTo: 'PVgraphDiv',
      type: 'coloredline',
      zoomType: 'xy'
    },
    title: {
      useHTML: true,
      x: -11,
      y: 8,
      text: ''
    },
    series: [{
      data: [
        // [Volume, Pressure]
      ],
      states: {
          hover: {
            enabled: false
          }
        }
    }],

    // Disable everything but the graph's data
    xAxis: {
      visible: false
    },
    yAxis: {
      visible: false
    },
    legend: {
      enabled: false
    },
    exporting: { 
      enabled: false
    },
    tooltip: { enabled: false }
  });

  // Create temperature/entropy graph
  TSgraph = new Highcharts.Chart({
    chart: {
      renderTo: 'TSgraphDiv',
      type: 'coloredline',
      zoomType: 'xy'
    },
    title: {
      useHTML: true,
      x: -11,
      y: 8,
      text: ''
    },
    series: [{
      data: [
        // [Temperature, Entropy]
      ],
      states: {
          hover: {
            enabled: false
          }
        }
    }],

    // Disable everything but the graph's data
    xAxis: {
      visible: false
    },
    yAxis: {
      visible: false
    },
    legend: {
      enabled: false
    },
    exporting: { 
      enabled: false
    },
    tooltip: { enabled: false }
  });
}

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

/*
 * Initializes a Highcharts' Chart object as a 3D scatterplot.
 */
function init3DGraph() {
  PVTGraph3D = new Highcharts.Chart({
    chart: {
      renderTo: 'PVTGraphDiv',
      margin: 75,
      type: 'polygon',
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
          text: 'Volume'
      }
    },

    yAxis: {
      min: 0,
      title: {
          text: 'Pressure'
      }
    },

    zAxis: {
      title: {
          text: 'Temperature'
      }
    },

    plotOptions: {
      series: {
        lineWidth: 1,
        marker: {
          enabled: false
        },
        shadow: true,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    },

    legend: { enabled: false },

    tooltip: { enabled: false },

    series: [{
      data: [
        // [Volume, Pressure, Temperature]
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
 * Pulls tuples from the pressure/volume arrays of values and stores them
 * sequentially as data in the 2D scatterplot.
 * @param Ppoints - An array of pressure values
 * @param Vpoints - An array of volume values
 */
function setPVGraphData(Ppoints, Vpoints) {
  var length = Math.min(Ppoints.length, Vpoints.length);
  var data = [];
  for (var i = 0; i < length; i++) {
    data.push({x: Vpoints[i].value, y: Ppoints[i].value, segmentColor: Vpoints[i].color});
  }

  var chart = $("#PVgraphDiv").highcharts();
  // Update the data of the chart
  chart.series[0].setData(data);
}
6.
/*
 * Pulls tuples from the temperature/entropy arrays of values and stores them
 * sequentially as data in the 2D scatterplot.
 * @param Tpoints - An array of temperature values
 * @param Spoints - An array of entropy values
 */
function setTSGraphData(Tpoints, Spoints) {
  var length = Math.min(Tpoints.length, Spoints.length);
  var data = [];
  for (var i = 0; i < length; i++) {
    data.push({x: Tpoints[i].value, y: Spoints[i].value, segmentColor: Tpoints[i].color});
  }

  var chart = $("#TSgraphDiv").highcharts();
  // Update the data of the chart
  chart.series[0].setData(data);
}

/*
 * Pulls triples from the pressure/temperature/volume arrays of values and stores them
 * sequentially as data in the 3D scatterplot.
 * @param Ppoints - An array of pressure values
 * @param TPoints - An array of temperature values
 * @param Vpoints - An array of volume values
 */
function set3DGraphData(Ppoints, Tpoints, Vpoints) {
  var length = Math.min(Ppoints.length, Vpoints.length, Tpoints.length);
  var data = [];
  for (var i = 0; i < length; i++) {
    data.push([Vpoints[i].value, Ppoints[i].value, Tpoints[i].value]);
  }

  // Update the data of the chart
  PVTGraph3D.series[0].setData(data);
}

/*
 * Reads the type of the plot and sets it to the opposite (e.g. turns a 
 * surface plot into a line plot and vice versa).
 */
function transform3DGraph() {
  var type = PVTGraph3D.series[0].type;
  if (type == "polygon") {
    open3DGraph();
  }
  else if (type == "scatter") {
    close3DGraph();
  }
}

/*
 * Turns the 3D graph into an opaque surface plot (as opposed to a line plot).
 */
function close3DGraph() {
  PVTGraph3D.series[0].update({
    type: "polygon"
  });
}

/*
 * Turns the 3D graph into a simple line plot (as opposed to a surface plot).
 */
function open3DGraph() {
  PVTGraph3D.series[0].update({
    type: "scatter"
  });
}

/*
 * A small class used for storing data values as well as their colors to be
 * rendered on the graph.
 */
class DataPoint {
  constructor(value, color) {
    this.value = value;
    this.color = color;
  }
}
