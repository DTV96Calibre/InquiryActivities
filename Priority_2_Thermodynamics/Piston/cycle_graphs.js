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

// Components for the 2D graphs (rendered using a library called Raphael)
var PVgraphBase;
var TSgraphBase;
var TSgraph;
var PVgraph;

// The Highcharts object used to render the 3D graph
var PVTGraph3D;

// Arrays of points for pressure, volume, temperature, and entropy
var Ppoints;
var Vpoints;
var Tpoints;
var Spoints;

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
  PVgraphBase = Raphael('PVgraphDiv');
  TSgraphBase = Raphael('TSgraphDiv');
  init3DGraph();
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
  
  // Graph the 2D plots
  PVgraphBase.clear();
  PVgraph = PVgraphBase.g.linechart(10,10,190,160, Vpoints, Ppoints, {"axis":"0 0 0 0"});
  TSgraphBase.clear();
  TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints, Tpoints, {"axis":"0 0 0 0"});

  set3DGraphData();
}

/*
 * Graph the points on both the PV and TS graphs while taking into consideration
 * that the "preview" point may need to be overwritten.
 */
function graphPreviewDot() {
  if (dotPreviewed) {
    Vpoints[Vpoints.length - 1] = volume;
    Ppoints[Ppoints.length - 1] = pressure;
    Tpoints[Tpoints.length - 1] = temp;
    Spoints[Spoints.length - 1] = entropy;
  }
  else {
    Vpoints.push(volume);
    Ppoints.push(pressure);
    Tpoints.push(temp);
    Spoints.push(entropy);
  }
  
  var points = generateGraphPoints();

  PVgraphBase.clear();
  PVgraph = PVgraphBase.g.linechart(10,10,190,160, Vpoints.concat(points["V"]), 
    Ppoints.concat(points["P"]), {"axis":"0 0 0 0"});
  
  TSgraphBase.clear();
  TSgraph = TSgraphBase.g.linechart(10,10,190,160, Spoints.concat(points["S"]), 
    Tpoints.concat(points["T"]), {"axis":"0 0 0 0"});

  dotPreviewed = true;
}

/*
 * Simulates the collection of points needed to graph the latest endpoint, 
 * which may be a curved line.
 */
function generateGraphPoints() {
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
    
    var Vstep = (volume - oldVolume) / 50;
    
    // simulate a curve with 100 intermediate points (technically 99 intermediate points plus the endpoint)
    for (var i = 1; i <= 50; i++) {
      oldV = V;
      oldP = P;
      V += Vstep;
      
      P = oldP * Math.pow((oldV / V), (Cp / Cv));
      
      //Ppoints.push(P);
      //Vpoints.push(V);
      points["P"].push(P);
      points["V"].push(V);
    }
    
    points["T"].push(temp);
    points["S"].push(entropy);
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
      
      //Tpoints.push(T);
      //Spoints.push(S);
      points["T"].push(T);
      points["S"].push(S);
    }
    
    points["P"].push(pressure);
    points["V"].push(volume);
  }
  else if (stepType == "Isochoric") {
    Tpoints.pop();
    Spoints.pop();
    
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
      
      //Tpoints.push(T);
      //Spoints.push(S);
      points["T"].push(T);
      points["S"].push(S);
    }
    
    points["P"].push(pressure);
    points["V"].push(volume);
  }
  
  // If the step is isothermal, there is no need to interpolate because both graphs will be straight lines
  else {
    points["P"].push(pressure);
    points["V"].push(volume);
    points["T"].push(temp);
    points["S"].push(entropy);
  }
  
  return points;
}

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

/*
 * Initializes a Highcharts' Chart object as a 3D scatterplot.
 */
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
      min: 0,
      title: {
          text: 'Temperature'
      }
    },

    plotOptions: {
      series: {
        lineWidth: 1,
        marker: {
          enabled: false
        }
      }
    },

    legend: {
      enabled: false
    },

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
 * Pulls triples from the pressure/temperature/volume arrays of values and stores them
 * sequentially as data in the 3D scatterplot.
 */
function set3DGraphData() {
  var length = Math.min(Ppoints.length, Tpoints.length, Vpoints.length);
  var data = [];
  for (var i = 0; i < length; i++) {
    data.push([Ppoints[i], Tpoints[i], Vpoints[i]]);
  }

  // If cycle is closed, the endpoint must be equal to the initial point
  if (numSavedSteps >= 3) {
    data[data.length - 1] = data[0];
  }

  // Update the data of the chart
  PVTGraph3D.series[0].setData(data);
}
