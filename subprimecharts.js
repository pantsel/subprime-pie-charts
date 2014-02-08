window.onload = canvasPieChart; // Wait for the window to load
function canvasPieChart() {
    var canvasId;
    var canvasWidth;
    var canvasHeight;
    var can;
    var ctx;
    var radius;
    var innerCircleRadius;
    var centerX;
    var centerY;
    var chartData = [];
    var explodedArray = [];  // Exploded Slices Array
    var newOptions = [];  // Used when redrawing
    var legend;
    var dataValuesPrefix = ""; // slice data value prefic
    var dataValuesSuffix = ""; // slice data value suffix

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
        innerCircleRadius = radius / 2;
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

    function draw(dat,chartOptions){
        
        // Clear the canvas
        ctx.clearRect(0, 0, can.width, can.height);
        
        // Set Defaults
        var showSliceInfo = (chartOptions && chartOptions[0].showSliceInfo)?chartOptions[0].showSliceInfo:false;
        var showInlinePercentages = (chartOptions && chartOptions[0].showInlinePercentages)?chartOptions[0].showInlinePercentages:true;
        var strokeColor = (chartOptions && chartOptions[0].strokeColor)?chartOptions[0].strokeColor:"#FFFFFF";
        var fontFace = (chartOptions && chartOptions[0].fontFace)?chartOptions[0].fontFace:"segoe ui";
        var textColor = (chartOptions && chartOptions[0].textColor)?chartOptions[0].textColor:"";
        var fontSize = (chartOptions && chartOptions[0].fontSize)?chartOptions[0].fontSize:16;
        var inlinePercentagesColor = (chartOptions && chartOptions[0].inlinePercentagesColor)?chartOptions[0].inlinePercentagesColor:"white";
        var donutize = (chartOptions && chartOptions[0].donutize)?chartOptions[0].donutize:false;
        dataValuesPrefix = (chartOptions && chartOptions[0].dataValuesPrefix)?chartOptions[0].dataValuesPrefix:"";
        dataValuesSuffix = (chartOptions && chartOptions[0].dataValuesSuffix)?chartOptions[0].dataValuesSuffix:"";
        
        // get data Array
        var data = dat;

        // calculate total value of pie
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

        //Initilize some options to start with
        ctx.strokeStyle = strokeColor;
        ctx.font = fontSize + "px " + fontFace;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Clear chartData
        chartData = [];
        
        // Exploded Slices Array will be drawn last
        explodedArray = [];
        
        // Initialize charts legend
        legend = (chartOptions && chartOptions[0].legend)?document.getElementById(chartOptions[0].legend[0].containerId):null;
        
        //Create Legend Html
        if(legend) createLegend(legend,dat,chartOptions,total);
        
        // For each data set
        for (var i = 0; i < data.length; i++) {
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

            //Arc ending point
            var arcEndX = centerX + Math.cos(angle) * radius;
            var arcEndY = centerY + Math.sin(angle) * radius;

            //Arc startPoint to endPoint distance
            var arcStartEndDistance = Math.sqrt( Math.pow( Math.abs( arcEndX - arcStartX ), 2 ) + Math.pow( Math.abs( arcEndY - arcStartY ), 2 ) );

            // Percentage text width
            var percentageTextWidth = ctx.measureText(dataPercentage[i]).width;

            //Draw non exploded slices first, put exploded ones in an array so they can be drawn after
            if(data[i].explode){
                explodedArray.push({
                    oldAngle      :oldAngle,
                    angle         :angle,
                    name          : data[i].name,
                    value         : data[i].value,
                    percentage    : dataPercentage[i],
                    offsetX       : offsetX,
                    offsetY       : offsetY,
                    color         : data[i].color,
                    arcStartEndDistance : arcStartEndDistance,
                    percentageTextWidth : percentageTextWidth,
                    labAngle      : labAngle,
                    labX          : labX,
                    labY          : labY,
                    arrIndex      : i // Keep track of the slice index
                });
            }else{ 
                // Draw the slice
                drawSlice(ctx,centerX,centerY,radius,oldAngle,angle,data[i].color,strokeColor,false);

                // If showSliceInfo is true draw slice information
                if(showSliceInfo || data[i].popInfo)
                    drawSliceInfo(ctx,textColor,data[i].name,dataPercentage[i],fontSize,data[i].value,labX,labY);
                
                // Draw inline percentages if option is set but make sure that  text is not overlapping the slice
                if(showInlinePercentages && arcStartEndDistance > percentageTextWidth + 10  && arcStartEndDistance > fontSize){
                    var dataX = centerX + Math.cos(labAngle) * radius*0.8;
                    var dataY = centerY + Math.sin(labAngle) * radius*0.8;
                    drawInlinePercentages(ctx,inlinePercentagesColor,dataX,dataY,dataPercentage[i]);
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

                // Move context to offset point
                ctx.moveTo(explodedArray[i].offsetX,explodedArray[i].offsetY);
                drawSlice(ctx,explodedArray[i].offsetX+centerX,explodedArray[i].offsetY+centerY,radius,explodedArray[i].oldAngle,explodedArray[i].angle,explodedArray[i].color,"#222222",true);

                // Always show slice info for the exploded slices
                drawSliceInfo(ctx,textColor,explodedArray[i].name,explodedArray[i].percentage,fontSize,explodedArray[i].value,explodedArray[i].offsetX+explodedArray[i].labX,explodedArray[i].offsetY+explodedArray[i].labY);
                
                // Draw inline percentages if option is set but make sure that  text is not overlapping the slice
                if(showInlinePercentages && explodedArray[i].arcStartEndDistance > explodedArray[i].percentageTextWidth+10 && explodedArray[i].arcStartEndDistance > fontSize){
                    var dataX = explodedArray[i].offsetX + centerX + Math.cos(explodedArray[i].labAngle) * radius*0.8;
                    var dataY = explodedArray[i].offsetY + centerY + Math.sin(explodedArray[i].labAngle) * radius*0.8;
                    drawInlinePercentages(ctx,getContrastYIQ(data[i].color),dataX,dataY,explodedArray[i].percentage);

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
        
        // Clip inner circle to create a donut chart
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
                            draw(this.chrtData,this.options);
                        }
             },false);  
        }
        
        function handleOver(data,options,sliceData){
            // Assign the hoverd element in sliceData
            if(!sliceData.mouseIn) {
                sliceData.mouseIn = true;
                sliceData.popInfo = true;
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
     * Draws Charts Slices
     */
    function drawSlice(ctx,centerX,centerY,radius,oldAngle,angle,color,strokeColor,isExploded){

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, oldAngle, angle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();    // fill with slice color
        ctx.strokeStyle = strokeColor;
        (isExploded)?ctx.lineWidth = 2:ctx.lineWidth = 1; // If slice is explode double the strokes width
        ctx.stroke();  // outline
    }

    /*
     * Draws Charts Slices Information
     */
    function drawSliceInfo(ctx,textColor,dataNames,dataPercentage,fontSize,data,labX,labY){
        /*var textHeight = fontSize * 2;
        var topTextWidth = ctx.measureText(dataNames).width;
        var bottomTextWidth = ctx.measureText(data).width + ctx.measureText(dataPercentage).width;
        var totalTextWidth = 0;
        if(topTextWidth > bottomTextWidth){
            totalTextWidth = topTextWidth;
        }else{
            totalTextWidth = bottomTextWidth;
        }
        var textClr = textColor;
        
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#FFF";
        ctx.fillRect(labX - (totalTextWidth/2) - 5,labY - (textHeight/2) + 2, totalTextWidth + 10, (textHeight*2)-15);
        ctx.closePath();
        ctx.moveTo(labX - (totalTextWidth/2) - 5,labY - (textHeight/2) + 2);
        ctx.lineTo(labX - (totalTextWidth/2) - 5 + totalTextWidth + 10,labY - (textHeight/2) + 2);
        ctx.lineTo(labX - (totalTextWidth/2) - 5 + totalTextWidth + 10,labY - (textHeight/2) + 2 + (textHeight*2)-15);
        ctx.lineTo(labX - (totalTextWidth/2) - 5,labY - (textHeight/2) + 2 + (textHeight*2)-15);
        ctx.lineTo(labX - (totalTextWidth/2) - 5,labY - (textHeight/2) + 2);
        ctx.strokeStyle="#BBBBBB";
        ctx.stroke(); 
        //ctx.closePath();
        ctx.restore();*/
        ctx.beginPath();
        ctx.fillStyle = textColor;
        ctx.fillText(dataNames, labX, labY);
        ctx.fillText(dataValuesPrefix +""+data +""+dataValuesSuffix+""+dataPercentage, labX, labY + (fontSize)+5);
        ctx.closePath();
        
        
    }

    /*
     * Draws percentage inside the slice
     */
    function drawInlinePercentages(ctx,inlinePercentagesColor,dataX,dataY,dataPercentage){

        if(inlinePercentagesColor) ctx.fillStyle = inlinePercentagesColor;
        ctx.beginPath();
        ctx.fillText(dataPercentage.replace("(","").replace(")",""), dataX, dataY);
        ctx.closePath();
    }
    
    /*
     * Calculates color contrast
     */
    function getContrastYIQ(hexcolor){
        while(hexcolor.charAt(0) === '#')
            hexcolor = hexcolor.substr(1);
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }
    
    /*
     * Converts HEX color values to RGBA equivalents
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
    
    function rgbaOpacity(rgba,opa){
        var arr = rgba.split(",");
        var totalItems = arr.length;
        arr[totalItems - 1] = opa;
        
        return arr.join();
        
    }

    /*
     * Color luminance function.
     * Changes the tone of a given HEX color string
     */

    function ColorLuminance(color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
    }


    /*
     * Returns random color using HSL Color Space
     */
    function selectColor(colorNum, colors){
        if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
        return "hsl(" + (colorNum * (360 / colors) % 360) + ",100%,50%)";
    }       
}// End canvasPieChart
