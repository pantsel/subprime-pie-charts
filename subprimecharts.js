/********************************************************************************
** Author : Panagis Tselentis                                                  **
** tselentispanagis@gmail.com                                                  **
** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **
** Copyright (c) 2014 ICRL                                                     **
** See the file LICENSE.md for copying permission.
** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ **   
** A flexible HTML5 Canvas API used to create interactive Pie Charts.          **
** Simple to implement, configure and personalize.                             **
** It is coded in pure javascript in order to avoid conflicts with libraries   ** 
** such as jQuery and Mootools.                                                **
********************************************************************************/

window.onload = canvasPieChart; // Wait for the window to load
function canvasPieChart() {
    var canvasId;
    var canvasWidth;
    var canvasHeight;
    var can;
    var ctx;
    var radius;
    var innerCircleRadius; // Used in case of donut Chart
    var centerX; // Chart's center point x
    var centerY; // Chart's center point Y
    var chartData = [];
    var explodedArray = [];  // Exploded Slices Array
    var newOptions = [];  // Used when redrawing
    var legend; // Chart's LEGEND
    var dataValuesPrefix = ""; // slice data value prefix
    var dataValuesSuffix = ""; // slice data value suffix
    
    // Initialize xhart
    function init(canvas,cWidth,cHeight){
        canvasId = canvas;
        canvasWidth = cWidth;
        canvasHeight = cHeight;
        can = document.getElementById(canvasId);
        
        // Exit if the browser does not support the Canvas element
        if ( typeof can.getContext === 'undefined' ) return;

        //If canvas width/height are not set, assign parent nodes width
        can.width = (canvasWidth !== null)?canvasWidth:can.parentNode.offsetWidth;
        can.height = (canvasHeight !== null)?canvasHeight:can.width;
        ctx = can.getContext("2d");
        radius = Math.min( can.width, can.height ) / 2 * ( 60 / 100 );
        centerX = can.width / 2;
        centerY = can.height / 2;
        
        //Initialize MouseDown Event Listener
        can.addEventListener("mousedown", function(e){
                // Get the mouse cursor position at the time of the click, relative to the canvas
                var mousePos = getMousePos(this,e);
                var mouseX = mousePos.x;
                var mouseY = mousePos.y;
                // Was the click inside the pie chart?
                var xFromCenter = mouseX - centerX;
                var yFromCenter = mouseY - centerY;
                // Calculate the distance between the mouse click and the center of the chart
                var distanceFromCenter = Math.sqrt( Math.pow( Math.abs( xFromCenter ), 2 ) + Math.pow( Math.abs( yFromCenter ), 2 ) );
                if ( distanceFromCenter <= radius ) {// The click was inside the chart.
                    // Find the slice that was clicked by comparing angles relative to the chart's center.
                    var clickAngle = Math.atan2( yFromCenter, xFromCenter ) - 0;
                    if ( clickAngle < 0 ) clickAngle = 2 * Math.PI + clickAngle;
                    for(var i=0;i<chartData.length;i++){
                        if ( clickAngle >= chartData[i].startingAngle && clickAngle <= chartData[i].endingAngle ) {
                           // If selected slice is an explode one, pull it back in, else explode it
                            (chartData[i].explode)?chartData[i].explode = false:chartData[i].explode =  true; 
                        }else{
                            chartData[i].explode = false;
                        }
                    }
                    draw(chartData,newOptions);

                }else{// The click was outside the chart.
                    // Every slice must be pulled into place.
                    for(var i=0;i<chartData.length;i++){
                        chartData[i].explode = false;
                    }
                    draw(chartData,newOptions);
                }
                
            }, false);

            // Gets the mouse position relative to the canvas
            function getMousePos(canvas, e) {
                var rect = canvas.getBoundingClientRect();
                return {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                };
              }
            // ToDo
            /*var trackMouseMove = false;
            can.addEventListener("mousemove", function(e){ 
                // Get the mouse cursor position at the time of the click, relative to the canvas
                var mousePos = getMousePos(this,e);
                $("#mCoords").html(mousePos.x + "," + mousePos.y);
                // Was the click inside the pie chart?
                var xFromCenter = mousePos.x - centerX;
                var yFromCenter = mousePos.y - centerY;
                // Calculate the distance between the mouse click and the center of the chart
                var distanceFromCenter = Math.sqrt( Math.pow( Math.abs( xFromCenter ), 2 ) + Math.pow( Math.abs( yFromCenter ), 2 ) );
                if ( distanceFromCenter <= radius ) {// The click was inside the chart.
                    // Find the slice that was clicked by comparing angles relative to the chart's center.
                    var clickAngle = Math.atan2( yFromCenter, xFromCenter ) - 0;
                    if ( clickAngle < 0 ) clickAngle = 2 * Math.PI + clickAngle;
                    for(var i=0;i<chartData.length;i++){
                        if ( clickAngle >= chartData[i].startingAngle && clickAngle <= chartData[i].endingAngle ) {
                                if(!trackMouseMove){
                                    trackMouseMove = true;
                                    newChartData[0].dataColors[i] = "#cccccc";
                                    draw(newChartData,newOptions);
                                }
                            return;  
                        }
                    }

                }
                trackMouseMove = false;
            },false);*/
            
            
    };
    this.init = init;
    
    // Draw the Chart
    function draw(dat,chartOptions){
        
        // Clear the canvas
        ctx.clearRect(0, 0, can.width, can.height);
        
        // Initialize some default values
        var showSliceInfo = (chartOptions && chartOptions[0].showSliceInfo)?chartOptions[0].showSliceInfo:false;
        var showInlinePercentages = (chartOptions && chartOptions[0].showInlinePercentages)?chartOptions[0].showInlinePercentages:true;
        var strokeColor = (chartOptions && chartOptions[0].strokeColor)?chartOptions[0].strokeColor:"#FFFFFF";
        var fontFace = (chartOptions && chartOptions[0].fontFace)?chartOptions[0].fontFace:"segoe ui";
        var fontSize = (chartOptions && chartOptions[0].fontSize)?chartOptions[0].fontSize:16;
        var donutize = (chartOptions && chartOptions[0].donutize)?chartOptions[0].donutize:false;
        dataValuesPrefix = (chartOptions && chartOptions[0].dataValuesPrefix)?chartOptions[0].dataValuesPrefix:"";
        dataValuesSuffix = (chartOptions && chartOptions[0].dataValuesSuffix)?chartOptions[0].dataValuesSuffix:"";
        innerCircleRadius = (chartOptions && chartOptions[0].donutHoleRadius)?radius*chartOptions[0].donutHoleRadius:radius*0.5;
        
        // get data Array
        var data = dat;

        // calculate total data values
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            total += data[i].value;
        }
        
        // get data percentage set
        var dataPercentage = new Array();

        //Construct data names array
        for(var i=0;i<data.length;i++){
            dataPercentage.push("("+parseInt(Math.round((data[i].value/total)*100))+")%");
        }

        var oldAngle = 0; // Starting angle to start drawing the first slice
        
        newOptions = chartOptions;

        //Initialize some preferences to start with
        ctx.strokeStyle = strokeColor;
        ctx.font = fontSize + "px " + fontFace;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Clear chartData when redrawing
        chartData = [];
        
        // Exploded Slices Array. The exploded slices will be drawn last
        explodedArray = [];
        
        // Initialize charts legend
        legend = (chartOptions && chartOptions[0].legend)?document.getElementById(chartOptions[0].legend[0].containerId):null;
        
        //Create Legend table if preference is valid
        if(legend) createLegend(legend,dat,chartOptions,total);
        
        // For each data set
        for (var i = 0; i < data.length; i++) {
            
            // inlinePercentagesColor and textColor may be dependent on slice color
            var inlinePercentagesColor = (chartOptions && chartOptions[0].inlinePercentagesColor)?chartOptions[0].inlinePercentagesColor: getContrastYIQ(data[i].color);
            var textColor = (chartOptions && chartOptions[0].textColor)?chartOptions[0].textColor:data[i].color;
            
            // draw slice
            var portion = data[i].value / total;
            var slice = 2 * Math.PI * portion;

            // Set Ending Angle
            var angle = oldAngle + slice;
            
            // set angle to middle of slice
            var labAngle = oldAngle + slice / 2;
            
            // Arc middle point
            var arcMidX = centerX + Math.cos(labAngle) * radius;
            var arcMidY = centerY + Math.sin(labAngle) * radius;

            // Offset point, needed for pulling slice out.
            var offsetX = Math.cos(labAngle) - (centerX - arcMidX)/10;
            var offsetY = Math.cos(labAngle) - (centerY - arcMidY)/10;
            
            // adjust for the case that the text is wider than it is tall
            var labX = centerX + Math.cos(labAngle) * radius * 1.4;
            var labY = centerY + Math.sin(labAngle) * radius * 1.3 -12;
            
            //Arc starting point
            var arcStartX = centerX + Math.cos(oldAngle) * radius;
            var arcStartY = centerY + Math.sin(oldAngle) * radius;
            
            //Donut Arc starting point
            var donutArcStartX = centerX + Math.cos(oldAngle) * innerCircleRadius;
            var donutArcStartY = centerY + Math.sin(oldAngle) * innerCircleRadius;

            //Arc ending point
            var arcEndX = centerX + Math.cos(angle) * radius;
            var arcEndY = centerY + Math.sin(angle) * radius;
            
            //Donut Arc ending point
            var donutArcEndX = centerX + Math.cos(angle) * innerCircleRadius;
            var donutArcEndY = centerY + Math.sin(angle) * innerCircleRadius;

            //Arc startPoint to endPoint distance
            var arcStartEndDistance = Math.sqrt( Math.pow( Math.abs( arcEndX - arcStartX ), 2 ) + Math.pow( Math.abs( arcEndY - arcStartY ), 2 ) );
            
            //Donut Arc startPoint to endPoint distance.
            //var donutArcStartEndDistance = Math.sqrt( Math.pow( Math.abs( donutArcEndX - donutArcStartX ), 2 ) + Math.pow( Math.abs( donutArcEndY - donutArcStartY ), 2 ) );

            // Percentage text width
            var percentageTextWidth = ctx.measureText(dataPercentage[i]).width;

            //Draw non exploded slices first, put exploded ones in an array so they can be drawn later
            if(data[i].explode){
                explodedArray.push({
                    oldAngle               :oldAngle,
                    angle                  :angle,
                    name                   : data[i].name,
                    value                  : data[i].value,
                    percentage             : dataPercentage[i],
                    offsetX                : offsetX,
                    offsetY                : offsetY,
                    color                  : data[i].color,
                    textColor              : textColor,
                    arcStartEndDistance    : arcStartEndDistance,
                    percentageTextWidth    : percentageTextWidth,
                    inlinePercentagesColor : inlinePercentagesColor,
                    labAngle               : labAngle,
                    labX                   : labX,
                    labY                   : labY,
                    arrIndex               : i // Keep track of the slice's index
                });
            }else{ 
                // Draw the slice
                drawSlice(ctx,centerX,centerY,radius,oldAngle,angle,data[i].color,strokeColor,false,donutize);

                // If showSliceInfo is true draw slice information
                if(showSliceInfo || data[i].popInfo)
                    drawSliceInfo(ctx,textColor,data[i].name,dataPercentage[i],fontSize,data[i].value,labX,labY);
                
                // Draw inline percentages if option is set but make sure that  text is not overlapping the slice
                if(showInlinePercentages && arcStartEndDistance > percentageTextWidth + 10  && arcStartEndDistance > fontSize){
                    var dataX = centerX + Math.cos(labAngle) * radius*0.85;
                    var dataY = centerY + Math.sin(labAngle) * radius*0.85;
                    drawInlinePercentages(ctx,inlinePercentagesColor,dataX,dataY,dataPercentage[i]);
                }
                
                if(donutize)
                    drawDonutArc(ctx,centerX, centerY, innerCircleRadius, oldAngle, angle, data[i].color);
                
                if(data[i].focused){
                    ctx.save();
                    ctx.beginPath();
                     
                    ctx.arc(centerX, centerY, radius+8, oldAngle, angle);
                    ctx.strokeStyle = data[i].color;
                    ctx.lineWidth = 3; // If slice is explode double the strokes width
                    
                    ctx.stroke();  // outline
                    ctx.restore();
                }

                // Create chartData object and push to chartData array
                var chartDataObj = {
                    startingAngle : oldAngle,
                    endingAngle   : angle,
                    name          : data[i].name,
                    value         : data[i].value,
                    percentage    : dataPercentage[i],
                    offsetX       : offsetX,
                    offsetY       : offsetY,
                    color         : data[i].color,
                    explode      : false
                };
                chartData.push(chartDataObj);
            }

            // update beginning angle for next slice
            oldAngle += slice; 

        };

        // Draw exploded slices if there are any...
        if(explodedArray.length > 0){

            for(var i=0;i<explodedArray.length;i++){

                // Move context to offset point before drawing
                ctx.moveTo(explodedArray[i].offsetX,explodedArray[i].offsetY);
                drawSlice(ctx,explodedArray[i].offsetX+centerX,explodedArray[i].offsetY+centerY,radius,explodedArray[i].oldAngle,explodedArray[i].angle,explodedArray[i].color,ColorLuminance(explodedArray[i].color,-0.3),true,donutize);

                // Always show slice info for the exploded slices
                drawSliceInfo(ctx,explodedArray[i].textColor,explodedArray[i].name,explodedArray[i].percentage,fontSize,explodedArray[i].value,explodedArray[i].offsetX+explodedArray[i].labX,explodedArray[i].offsetY+explodedArray[i].labY);
                
                // Draw inline percentages if option is set but make sure that  text is not overlapping the slice
                if(showInlinePercentages && explodedArray[i].arcStartEndDistance > explodedArray[i].percentageTextWidth+10 && explodedArray[i].arcStartEndDistance > fontSize){
                    var dataX = explodedArray[i].offsetX + centerX + Math.cos(explodedArray[i].labAngle) * radius*0.85;
                    var dataY = explodedArray[i].offsetY + centerY + Math.sin(explodedArray[i].labAngle) * radius*0.85;
                    drawInlinePercentages(ctx,explodedArray[i].inlinePercentagesColor,dataX,dataY,explodedArray[i].percentage);

                }

                // After slice is drawn, restore context to center point
                ctx.moveTo(centerX,centerY);

                var chartDataObj2 = {
                    startingAngle : explodedArray[i].oldAngle,
                    endingAngle   : explodedArray[i].angle,
                    name          : explodedArray[i].name,
                    value         : explodedArray[i].value,
                    percentage    : explodedArray[i].percentage,
                    offsetX       : explodedArray[i].offsetX,
                    offsetY       : explodedArray[i].offsetY,
                    color         : explodedArray[i].color,
                    explode      : true
                };

                // Insert the new chartData object into its rightful index
                chartData.splice(explodedArray[i].arrIndex,0,chartDataObj2);
            }
        }
        
        // Clip inner circle to create a donut chart if preference is valid
        if(donutize){
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerCircleRadius, 0, 2 * Math.PI, false);
            ctx.closePath();
            // set composite mode
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
            // reset composite mode to default
            ctx.globalCompositeOperation = 'source-over';
        }
        
        
    };

    this.draw = draw;
    
    /*
     * Creates the chart's Legend html table
     */
    function createLegend(legend,chartData,chartOptions,total){
        
        var totalText = (chartOptions[0].legend[0].totalText)?chartOptions[0].legend[0].totalText:"Total : ";
        var legendTitle = (chartOptions[0].legend[0].title)?chartOptions[0].legend[0].title:"";
        var html = "";

        if(chartOptions[0].legend[0].title){
            html += "<div class='spc-legend-head'><h3>" + legendTitle + "</h3></div>";
        }
        html += "<table class='spc-legend-content'>";
        html += "<tr class='spc-legend-th'>";
        //html += "<td colspan='2'><span>#</span></td>";
        for(var i=0;i<chartOptions[0].legend[0].columns.length;i++){
            if(i === 0){
                html += "<td colspan='2'>" + chartOptions[0].legend[0].columns[i] + "</span></td>";
            }else{
                html += "<td>" + chartOptions[0].legend[0].columns[i] + "</span></td>";
            }
            
        }
        html += "</tr>";
        var rowsArray = [];
        for(var i=0;i<chartData.length;i++){
            var legendGuidesHmtl = "<div class='spc-legend-guides' style='width:16px;height:16px;background-color:"+chartData[i].color+"'></div>";
            var trId = canvasId+"_legcol_"+i;
            
            rowsArray.push(trId);
            
            html += "<tr id='"+trId+"' style='color:" + chartData[i].color + "'>";
            html += "<td width='21'>"+legendGuidesHmtl+"</td>"; // Slice guides
            
            for(var k=0;k<chartOptions[0].legend[0].columns.length;k++){
                var content = "";
                switch(k){
                    case 0:
                        content = chartData[i].name;
                        break;
                    case 1:
                        content = chartData[i].value;
                        break;
                    case 2:
                        content = Math.round((chartData[i].value / total)*100) + "%";
                        break;
                }
                html += "<td><span>" + content + "</span></td>";
            }
             html += "</tr>";
            
            
        }
        html += "</table>";
        if(chartOptions[0].legend[0].showTotal){
            html += "<div class='spc-legend-foot'><p>" + totalText + "" + total + "</span></div>";
        }
        
        legend.innerHTML = html;
        
        // Interactivity preference
        var interactivity = (chartOptions[0].interactivity)?chartOptions[0].interactivity:"enabled";
        if(interactivity === "enabled") { // If enabled
        
            // Attach mouse Event listeners to table rows
            for(var i=0;i<rowsArray.length;i++){
                var thisRow = document.getElementById(rowsArray[i]);
                thisRow.chrtData = chartData;
                thisRow.options = chartOptions;
                thisRow.sliceData = chartData[i];
                thisRow.slice = i;
                thisRow.mouseout = true;

                thisRow.addEventListener("mousedown", function(e){
                    return function() {
                        handleClick(this.chrtData,this.options,this.slice,this.sliceData);
                      };
                }(this.chrtData,this.options,this.slice,this.sliceData),false);

                var mouseOverFunc = function(){

                    return function() {
                        this.style.background = '#F3F3F3';
                        this.style.cursor = 'pointer';
                        handleOver(this.chrtData,this.options,this.sliceData);
                      };
                };

                thisRow.addEventListener("mouseover",mouseOverFunc(this.chrtData,this.options,this.sliceData),false);

                thisRow.addEventListener("mouseleave", function(e){
                            if(e.target === this && e.target.clientHeight !== 0){
                                this.style.background = 'transparent';
                                this.sliceData.mouseIn = false;
                                this.sliceData.popInfo = false;
                                this.sliceData.focused = false;
                                draw(this.chrtData,this.options);
                            }
                 },false);  
            }
        }
        
        function handleOver(data,options,sliceData){
            // Assign the hovered element in sliceData
            if(!sliceData.mouseIn) {
                sliceData.mouseIn = true;
                sliceData.popInfo = true;
                sliceData.focused = true;
                console.log("mouse in");
                draw(data,options);
            }
            return;
        }
        
        /*
         * Handles mouse clicks on legend table rows
         */
        function handleClick(data,options,slice,sliceData)
        {
            // Reset explode slices
            for(var i=0;i<data.length;i++){
                if(i !== slice) {
                    data[i].explode = false;
                }
            }
            
            // Check if slice is explode and pull it in or explode it accordingly
            sliceData.explode = (sliceData.explode)?false:true; 
            draw(data,options);
        }
            
        
    }

    /*
     * Draws chart's slices
     * 
     * @param {obj} ctx            : context
     * @param {number} centerX     : middle point x
     * @param {number} centerY     : middle point y
     * @param {number} radius      : chart's radius
     * @param {number} oldAngle    : arc's starting angle
     * @param {number} angle       : arc's ending angle
     * @param {String} color       : slice fill color
     * @param {String} strokeColor : slice stroke color
     * @param {boolean} isExploded : Whether or not the slice is exploded
     * @param {boolean} isDonut    : wether or not the chart is donut
     * @returns {null}
     */
    function drawSlice(ctx,centerX,centerY,radius,oldAngle,angle,color,strokeColor,isExploded,isDonut){

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, oldAngle, angle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();    // fill with slice color
        ctx.strokeStyle = strokeColor;
        (isExploded)?ctx.lineWidth = 3:ctx.lineWidth = 1; // If slice is explode double the strokes width
        ctx.stroke();  // outline
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, oldAngle, angle,false);
        ctx.strokeStyle = ColorLuminance(color,-0.2);
        ctx.lineWidth = 2; // If slice is explode double the stroke's width
        ctx.stroke();  // outline
        ctx.restore();
        
        if(isDonut && isExploded){
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius*0.5 + 3, oldAngle, angle,false);
            ctx.strokeStyle = ColorLuminance(strokeColor,-0.2);
            ctx.lineWidth = 2; // If slice is explode double the stroke's width
            ctx.stroke();  // outline

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius*0.5, oldAngle-0.02, angle+0.02,false);
            ctx.lineTo(centerX, centerY);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = ColorLuminance(strokeColor,-0.2);
            ctx.lineWidth = 2; 
            ctx.stroke();  // outline
            ctx.fillStyle = ColorLuminance(strokeColor,-0.2);
            ctx.fill();  // fill color
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
        
    }
    
    /*
     * Draws donut slice's arc
     * 
     * @param {obj} ctx                  : context
     * @param {number} centerX           : center point x
     * @param {number} centerY           : center point y
     * @param {number} innerCircleRadius : the radius of the donut clipping region
     * @param {number} oldAngle          : arc's staring angle
     * @param {number} angle             : arc's ending angle
     * @param {number} strokeColor       : arc's stroke color
     * @returns {null}
     */
    function drawDonutArc(ctx,centerX, centerY, innerCircleRadius, oldAngle, angle, strokeColor){
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerCircleRadius, oldAngle, angle,false);
        ctx.strokeStyle = ColorLuminance(strokeColor,-0.2);
        ctx.lineWidth = 4; // If slice is explode double the stroke's width
        ctx.stroke();  // outline
        ctx.restore();
    }

    /*
     * Draws Charts Slices Information
     * 
     * @param {obj} ctx : context
     * @param {string} textColor      : color of the text
     * @param {string} name           : the textual representation of the assigned data value
     * @param {number} dataPercentage : the values percentage
     * @param {string} fontSize       : fonts size
     * @param {string} value          : the data value
     * @param {number} labX           : x point of the center of the text
     * @param {number} labY           : y point of the center of the text
     * @returns {null}
     */
    function drawSliceInfo(ctx,textColor,name,dataPercentage,fontSize,value,labX,labY){
        ctx.beginPath();
        ctx.fillStyle = textColor;
        ctx.fillText(name, labX, labY);
        ctx.fillText(dataValuesPrefix +""+value +""+dataValuesSuffix+""+dataPercentage, labX, labY + (fontSize)+5);  
        
    }

    /*
     * Draws percentage inside the slice
     * 
     * @param {obj} ctx                       : context
     * @param {string} inlinePercentagesColor : text color
     * @param {number} dataX                  : x position
     * @param {number} dataY                  : y position
     * @param {number} dataPercentage         : data value percentage
     * @returns {null}
     */
    function drawInlinePercentages(ctx,inlinePercentagesColor,dataX,dataY,dataPercentage){

        if(inlinePercentagesColor) ctx.fillStyle = inlinePercentagesColor;
        ctx.beginPath();
        ctx.fillText(dataPercentage.replace("(","").replace(")",""), dataX, dataY);
        ctx.closePath();
    }
    
    /*
     * Calculates color contrast
     * and returns black or white hex color value
     * depending on which one stands out better
     * for the human eye
     * 
     * @param {string} hexcolor : HEX color string
     * @returns {string} : black or white HEX color value 
     */
    function getContrastYIQ(hexcolor){
        while(hexcolor.charAt(0) === '#')
            hexcolor = hexcolor.substr(1);
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? '#000000' : '#FFFFFF';
    }
    
    /*
     * Converts HEX color values to RGBA equivalents
     * 
     * @param {string} hex : HEX color string
     * @returns {string}   : rgba equivalent
     */
    function hexToRgba(hex){
        
        if (hex[0]==="#") hex=hex.substr(1);
        if (hex.length===3) {
            var temp=hex; hex='';
            temp = /^([a-f0-9])([a-f0-9])([a-f0-9])$/i.exec(temp).slice(1);
            for (var i=0;i<3;i++) hex+=temp[i]+temp[i];
        }
        var triplets = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
        return parseInt(triplets[0],16)+
                ","+parseInt(triplets[1],16)+
                ","+parseInt(triplets[2],16)+
                ","+0.5;
        
    }
    
    /*
     * Changes the opacity of an rgba color
     * 
     * @param {string} rgba : RGBA string (4 comma seperated values)
     * @param {number} opa  : desired opacity (0-1)
     * @returns {array}
     */
    function rgbaOpacity(rgba,opa){
        var arr = rgba.split(",");
        var totalItems = arr.length;
        arr[totalItems - 1] = opa;
        
        return arr.join();   
    }

    /*
     * Color luminance function.
     * Changes the tone of a given HEX color string
     * 
     * @param {string} hex : HEX color string
     * @param {number} lum : luminance (-1,1)
     * @returns {String}
     */
    function ColorLuminance(hex, lum) {

        // validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
    }

    /*
     * Returns random color using HSL Color Space
     */
    function selectColor(colorNum, colors){
        if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
        return "hsl(" + (colorNum * (360 / colors) % 360) + ",100%,50%)";
    }       
}// End canvasPieChart
