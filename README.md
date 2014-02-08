<h2>Subprime Pie Charts</h2>
A flexible HTML5 Canvas API used to create interactive Pie Charts. Very simple to implement, configure and personalize. It is coded in pure javascript in order to minimize and avoid conflicts with libraries such as jQuery and Mootools. Works on HTML5 compatible browsers. Tested on IE10, Firefox, Opera, Chrome and Safari.
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
You can define multiple canvas elements and draw multiple charts width different sets of data.
<h4>Step 3</h4>
Initialize the chart and provide the required data.
```javascript
var myChart = new canvasPieChart();
myChart.init("myChart",500,500); // container id,width,height
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
myChart.draw(data);
```
