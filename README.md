<h2>Subprime Pie Charts</h2>
A flexible HTML5 Canvas API used to create interactive Pie & Donut Charts. Very simple to implement, configure and personalize. It is coded in pure javascript in order to avoid conflicts with libraries such as jQuery and Mootools. Works on HTML5 compatible browsers. Tested on IE9-10, Firefox, Opera, Chrome and Safari.

![Subprime Pie Charts](http://imageshack.com/a/img197/6740/6k3q.png)
<h2>Demo</h2>
See Subprime Pie Charts in action [here](http://subprimead.com/subprime_piecharts_static).
<h2>Basic Usage</h2>
<h4>Step 1</h4>
Include subprimecharts.js in the head section of your page.
```html
<script src="path/to/my/js/folder/subprimecharts.js"></script>
```
<h4>Step 2</h4>
Define the Canvas element on which the chart will be drawn.
```html
<canvas id="myChart"></canvas>
```
You can define multiple canvas elements and draw multiple charts width different sets of data and configuration.
<h4>Step 3</h4>
Initialize the chart and provide the required data.
```javascript
var myChart = new canvasPieChart();

// Initialize the chart(container id,width,height).
// if null values are passed for the width and/or height the parent element's dimentions will be assigned.
// ex. myChart.init("myChart",null,null);
myChart.init("myChart",500,500); 

// Provide the data to be transfered on the chart
// value : the actual numeric value of the data entry
// color : the color of the corresponding pie slice
// name  : the textual reference to the data entry
var data = [
        {
            value : 57,
            color : "#50c0e9",
            name  : "iOS"
        },
        {
            value : 43,
            color : "#cb97e5",
            name  : "Android"
        },
        {
            value : 11,
            color : "#a8d324",
            name  : "BlackBerry"
        },
        {
            value : 24,
            color : "#ffa713",
            name  : "Symbian"
        },
        {
            value : 32,
            color : "#f83a3a",
            name  : "Windows OS"
        }
    ];
    
myChart.draw(data); // draw the chart
```
<h2>Customising</h2>
<h4>Adding a Legend</h4>
Create a container for the legend.
```html
<div id="myChart-legend"></div>
<canvas id="myChart"></canvas>
```
The reason the Legend is defined in a different container is to provide maximum flexibility. You can put it wherever it feels right. Above the chart, below it, left, right, it's up to you.


Pass the option to the chart
```javascript
var myChart = new canvasPieChart();

myChart.init("myChart",500,500); 

var data = [...]; // data object array as displayed above

var options = [{
                legend :
                [{
                        containerId : "myChart-legend",
                        title       : "Mobile operating Systems",
                        columns     : ["Operating systems","Awesomeness","%"],
                        showTotal   : true,
                        totalText   : " Total :"
                }]
            }];
    
myChart.draw(data,options); // draw the chart!
```
The generated table is not styled by default so that you are able to apply your own unique styling.
<h4>Chart Legend Options</h4>
<table>
        <tr>
                <td><strong>Name</strong></td>
                <td><strong>Type</strong></td>
                <td><strong>Description</strong></td>
                <td><strong>Default</strong></td>
                <td><strong>Required</strong></td>
        </tr>
        <tr>
                <td>containerId</td>
                <td>String</td>
                <td>The id of the element that contains the legend table</td>
                <td> - </td>
                <td>required</td>
        </tr>
        <tr>
                <td>title</td>
                <td>String</td>
                <td>The charts title</td>
                <td> - </td>
                <td>optional</td>
        </tr>
        <tr>
                <td>columns</td>
                <td>Array</td>
                <td>The legend's table column name</td>
                <td> - </td>
                <td>At least one is required</td>
        </tr>
        <tr>
                <td>showTotal</td>
                <td>Boolean</td>
                <td>Whether or not to display the total sum of data values</td>
                <td>true</td>
                <td>optional</td>
        </tr>
        <tr>
                <td>totalText</td>
                <td>String</td>
                <td>The text that describes the sum of data values</td>
                <td>Total : </td>
                <td>depends on showTotal</td>
        </tr>
        
</table>
<h4>Exploding Slices</h4>
You can define which slices will explode by default.
```javascript
var data = [
        {
            value   : 57,
            color   : "#50c0e9",
            name    : "iOS",
            explode : true
        },
        {
            value   : 43,
            color   : "#cb97e5",
            name    : "Android"
        },
        {
            value   : 11,
            color   : "#a8d324",
            explode : true
        }
    ];
```
<h4>Focusing Slices</h4>
You can also define which slices will be focused by default.
```javascript
var data = [
        {
            value   : 57,
            color   : "#50c0e9",
            name    : "iOS",
            focused : true
        },
        {
            value   : 43,
            color   : "#cb97e5",
            name    : "Android"
        },
        {
            value   : 11,
            color   : "#a8d324",
            focused : true
        }
    ];
```
<h4>Pie Chart Preferences</h4>
<table>
        <tr>
                <td><strong>Name</strong></td>
                <td><strong>Type</strong></td>
                <td><strong>Description</strong></td>
                <td><strong>Default</strong></td>
        </tr>
        <tr>
                <td>showSliceInfo</td>
                <td>boolean</td>
                <td>Whether or not to display the data and info of the corresponding slice by default</td>
                <td>false</td>
        </tr>
        <tr>
                <td>showInlinePercentages</td>
                <td>boolean</td>
                <td>Whether or not to display the percentage occupied by each data value inside the dorresponding slice</td>
                <td>true</td>
        </tr>
        <tr>
                <td>inlinePercentagesColor</td>
                <td>HEX String</td>
                <td>The text color of inline percentages</td>
                <td>Black or white, depending on each slice's contrast</td>
        </tr>
        <tr>
                <td>fontFace</td>
                <td>String</td>
                <td>The text's font.</td>
                <td>segoe ui</td>
        </tr>
        <tr>
                <td>fontSize</td>
                <td>Number</td>
                <td>The text's size in pixels.</td>
                <td>16</td>
        </tr>
        <tr>
                <td>strokeColor</td>
                <td>HEX String</td>
                <td>The color of each slice's stroke.</td>
                <td>no stroke is applied</td>
        </tr>
        <tr>
                <td>dataValuesPrefix</td>
                <td>String</td>
                <td>The text prefixing the each value as it is displayed on the chart.</td>
                <td> - </td>
        </tr>
        <tr>
                <td>dataValuesSuffix</td>
                <td>String</td>
                <td>The text that follows each data value as it is displayed on the chart.</td>
                <td> - </td>
        </tr>
        <tr>
                <td>interactivity</td>
                <td>String</td>
                <td>Enable/Disable Legend - Chart interactivity. <br>Values : "enabled","disabled"</td>
                <td>enabled</td>
        </tr>
        <tr>
                <td>donutize</td>
                <td>Boolean</td>
                <td>Creates a donut chart.</td>
                <td>false</td>
        </tr>
        <tr>
                <td>donutHoleRadius</td>
                <td>Number</td>
                <td>The radius of the donut hole relative to the chart's radius (0-1).</td>
                <td>0.5</td>
        </tr> 
</table>
Example :
```javascript
var options = [
            {
                showSliceInfo          : false,
                showInlinePercentages  : true,
                inlinePercentagesColor : "#FFFFFF",
                strokeColor            : "#FFFFFF",
                dataValuesPrefix       : "",
                dataValuesSuffix       : "",
                fontFace               : "segoe ui",
                fontSize               : 16,
                legend                 :[{
                        containerId : "canvas-legend",
                        title       : "Connected Devices",
                        columns     : ["Operating systems","Awesomeness","%"],
                        showTitle   : true,
                        showTotal   : true,
                        totalText   : "Total : "
                }]
            }
        ];
```

