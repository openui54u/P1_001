// Author: Edwin Glaser
// --------  Only for private usage -----------
// Date Nov. 2022
// HomeWizard P1 
// https://homewizard-energy-api.readthedocs.io/endpoints.html#basic-information-api
// Tested on HWE-P1

// Data	Description
    // smr_version	                The DSMR version of the smart meter
    // meter_model	                The brand indification the smart meter
    // wifi_ssid	                The Wi-Fi network that the meter is connected to
    // wifi_strength	            The strength of the Wi-Fi signal in %
    // total_power_import_t1_kwh	The power usage meter reading for tariff 1 in kWh
    // total_power_import_t2_kwh	The power usage meter reading for tariff 2 in kWh
    // total_power_export_t1_kwh	The power feed-in meter reading for tariff 1 in kWh
    // total_power_export_t2_kwh	The power feed-in meter reading for tariff 2 in kWh
    // active_power_w	            The total active usage in Watts
    // active_power_l1_w	        The active usage for fase 1 in Watts
    // active_power_l2_w	        The active usage for fase 2 in Watts
    // active_power_l3_w	        The active usage for fase 3 in Watts
    // total_gas_m3	                The gas meter reading in m3
    // gas_timestamp	            The most recent gas update time stamp structured as YYMMDDhhmmss
    // active_liter_lpm	            Active water usage in liters per minute
    // total_liter_m3	            Total water usage in cubic meters since installation

// Credits o.a.:
// Linechart source based on:  https://codepen.io/yahiaelbnna/pen/KKgLOro

var ip;

let c = {};
let h = 0;
let w = 0;
let ctx = {};
let dataY = [];
let dataX = [];
let datal1 = [];
let datal2 = [];
let datal3 = [];
let un = 0
let ys = 0;
let dataT = [];


let iteration = 0;

function Init(){
iteration = 0;
dataY = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
dataX = [0,100];
un = Math.round((Math.max(...dataX)-Math.min(...dataX))/10)
un = Math.round(un / 10) * 10;
// ys = (w-40)/dataY.length; // steps on horizontal axis
ys = (w-80)/dataY.length; // steps on horizontal axis
dataT = [];
chart.chartLine()
chart.digram()
}

window.onload = function() {
c = document.querySelector("canvas[le]");
 h = c.height;
 w = c.width ;
ctx = c.getContext('2d');
Init();

    document.getElementById('IP').value = '192.168.2.45';
};

async function wrapper(){
    console.log('start');
    await waitInterval( meter, 999);
    console.log(iteration);
    console.log('finish');
};

function drawLine(){
    if (dataX.length != 0){
    // Draw the line-chart
    // un = Math.round((Math.max(...dataX)-Math.min(...dataX))/10)
    
    let A = [ dataX, datal1, datal2, datal3];           // Combine all arrays
    let maxArray = A.map(a => Math.max.apply(null, a)); // Get max of each array
    max = Math.max(...maxArray)                         // Get max of that maxArray
    let minArray = A.map(a => Math.min.apply(null, a));
    min = Math.min(...minArray)
    un = Math.ceil((max - min)/10)

    max = Math.ceil(max / 10) * 10;
    min = Math.ceil(min / 10) * 10;
    un = Math.ceil(un / 10) * 10;

    // ys = (w-40)/dataY.length;
    ys = (w-80)/dataY.length;
    dataT = [];
    chart.chartLine()
    chart.digram()
    chart.data();
    chart.draw();
    // chart.pointes();
    }

    return true;
}

function run(){
    ip = document.getElementById('IP').value; 
        if (ip != ''){
        Init(); 
        dataY = [];    
        dataX = [];  
        datal1 = [];  
        datal2 = [];  
        datal3 = [];  
        dataT = [];
        iteration = 1;       
        wrapper() ;
    }
}



async function meter(i){
    iteration = i;
    let url = 'http://' + ip + '/api/v1/data';
    let response = await fetch(url);

    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      let json = await response.json();

    document.getElementById('WifiSSID').innerHTML       = json.wifi_ssid;  // wifi_ssid :  WifiSSID
    document.getElementById('WifiStrength').innerHTML   = json.wifi_strength;  // wifi_strength : 
    document.getElementById('MM').innerHTML             = json.meter_model;     //meter_model
    document.getElementById('SV').innerHTML             = json.smr_version;     //smr_version: 
    
    // Always Phase 1    
    document.getElementById('P1').innerHTML             = json.active_power_l1_w;

    // Phase 2 when given in api, clear otherwise
      if(json.active_power_l2_w){
        document.getElementById('P2').innerHTML = json.active_power_l2_w }else{
        document.getElementById('P2').innerHTML = '';
      }
    // Phase 3 when given in api, clear otherwise
      if(json.active_power_l3_w){
        document.getElementById('P3').innerHTML = json.active_power_l3_w }else{
        document.getElementById('P3').innerHTML = '';
      };
    document.getElementById('PT').innerHTML             = json.active_power_w;

    dataX.push(json.active_power_w);
    datal1.push(json.active_power_l1_w);
    datal2.push(json.active_power_l2_w);
    datal3.push(json.active_power_l3_w);
    dataY.push(i);

    let deltas = delta_calc(dataX);
    document.getElementById('PTd3').innerHTML             = deltas[0];
    document.getElementById('PTd2').innerHTML             = deltas[1];
    document.getElementById('PTd1').innerHTML             = deltas[2];

    // ctx.clear();
    //  ctx.clearRect(0, 0, window.width, window.height);
     ctx.clearRect(0, 0, w, h);
    drawLine();

    // total_power_export_t1_kwh:  
    document.getElementById('ET1').innerHTML = json.total_power_export_t1_kwh;
    // total_power_export_t2_kwh: 
    document.getElementById('ET2').innerHTML = json.total_power_export_t2_kwh;
    // total_power_import_t1_kwh : 
    document.getElementById('IT1').innerHTML = json.total_power_import_t1_kwh;
    // total_power_import_t2_kwh :
    document.getElementById('IT2').innerHTML = json.total_power_import_t2_kwh;

    // Gas details
    if(json.gas_timestamp){
        // YYMMDDhhmmss
   let _stamp = json.gas_timestamp.toString();
        let _time = 
        _stamp.substring(6,8) + ':' + _stamp.substring(8,10) + ':' + _stamp.substring(10,12) + '  /  ' +
        _stamp.substring(4,6) + '-' + _stamp.substring(2,4) + '-' + _stamp.substring(0,2) ;
    
    document.getElementById('GTS').innerHTML = _time;
    //total_gas_m3 G0
    document.getElementById('G0').innerHTML = json.total_gas_m3;
    }

    // Water details
    if(json.active_liter_lpm){
        document.getElementById('AL').innerHTML = json.active_liter_lpm;   // active_liter_lpm	            Active water usage in liters per minute
        document.getElementById('TL').innerHTML = json.total_liter_m3;    // total_liter_m3	            Total water usage in cubic meters since installation
    }else{
        document.getElementById('AL').innerHTML =  document.getElementById('TL').innerHTML = '';
    }

    return i == 300;

    } else {
      alert("HTTP-Error: " + response.status);
    }

}


async function waitInterval(callback, ms) {
    return new Promise(resolve => {
       
        const interval = setInterval(async () => {
            if (await 
                
                callback(iteration, interval)
            
            ) {
                resolve();
                clearInterval(interval);
                return true;
            }
            iteration++;
        }, ms);
    });
}

function delta_calc(_array){
    let delta = [];
    if(_array.length > 3){
        delta.push(_array[_array.length-4] - _array[_array.length-1])}else{delta.push(0)}
    if(_array.length > 2){
        delta.push(_array[_array.length-3] - _array[_array.length-1])}else{delta.push(0)}
    if(_array.length > 1){
        delta.push(_array[_array.length-2] - _array[_array.length-1])}else{delta.push(0)}
    
    return delta
}

//  -- - - - - - - - LINE CHART - - - - - - - - - - - - - - - - - - - 

var chart = {

digram: function(){
    y = 60
    x = 1
    ctx.strokeStyle = "#a7a7a7"
    while(y < w){
        ctx.beginPath()
        ctx.moveTo(y,0)
        ctx.lineTo(y,h-30)
        ctx.stroke()
        y += 30
    }
    while(x < h-30){
        ctx.beginPath()
        ctx.moveTo(60,x)
        ctx.lineTo(w,x)
        ctx.stroke()
        x += 30
    }
},
chartLine: function() {
    ctx.strokeStyle = "#000"
    ctx.beginPath()
    ctx.moveTo(60,0)
    ctx.lineTo(60,h-30)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(w,h-30)
    ctx.lineTo(60,h-30)
    ctx.stroke()
}
,
draw: function() {
    ctx.save()
    ctx.strokeStyle = "#0b95d3"  //"#03a9f4" 
    ctx.lineWidth = 3
    ctx.beginPath()
    // ctx.lineJoin = "round";
    y = 60
    height = h-30
    line = 30
    start = 0;//30
    // ctx.moveTo(60, h-30);
    for(data of dataX){
        // max = Math.max(...dataX),
        // test = 30;
        let A = [ dataX, datal1, datal2, datal3];
        let maxArray = A.map(a => Math.max.apply(null, a));
        max = Math.max(...maxArray),
        test = 30;

        while (max > data){
            max = max - 1
            test += line/un
        }
        // ctx.lineTo(30+y,test)
        ctx.lineTo(y,test)
        x = 0 ;//30
        y += ys
    }
    ctx.stroke()
    // ctx.restore()

    // ctx.save()
   
    ctx.strokeStyle = "#00FF00" //green
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0;// 30
  
    for(data of datal1){
        let A = [ dataX, datal1, datal2, datal3];
        let maxArray = A.map(a => Math.max.apply(null, a));
        max = Math.max(...maxArray),
        test = 30;

        while (max > data){
            max = max - 1
            test += line/un
        }
        // ctx.lineTo(30+y,test)
        ctx.lineTo(y,test)
        x = 0;//30
        y += ys
    }
    ctx.stroke()
    // ctx.restore()

   
    ctx.strokeStyle = "#d6d610" //"#FFFF00" //yellow
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0 ;//30
    for(data of datal2){
        let A = [ dataX, datal1, datal2, datal3];
        let maxArray = A.map(a => Math.max.apply(null, a));
        max = Math.max(...maxArray),
        test = 30;
        while (max > data){
            max = max - 1
            test += line/un
        }
        // ctx.lineTo(30+y,test)
        ctx.lineTo(y,test)
        x = 0;//30
        y += ys
    }
    ctx.stroke()
    // ctx.restore()

   
    ctx.strokeStyle = "#A020F0" // purple
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0 ; //30
    for(data of datal3){
        let A = [ dataX, datal1, datal2, datal3];
        let maxArray = A.map(a => Math.max.apply(null, a));
        max = Math.max(...maxArray),
        test = 30;
        while (max > data){
            max = max - 1
            test += line/un
        }
        // ctx.lineTo(30+y,test)
        ctx.lineTo(y,test)
        x = 30
        y += ys
    }
    ctx.stroke()
    ctx.restore()
},
pointes: function() {

    ctx.fillStyle = "#0b95d3"
    y = 60
    height = h-30
    line = 30
    start = 0;//30
    for (data of dataX) {
        this.points(data, dataX)
    }

    ctx.fillStyle = "#00FF00" //green
    y = 60
    height = h-30
    line = 30
    start = 0; //30
    for (data of datal1) {
        this.points(data, datal1)
    }

    ctx.fillStyle = "#d6d610" //"#FFFF00" //yellow
    y = 60
    height = h-30
    line = 30
    start = 0; //30
    for (data of datal2) {
        this.points(data, datal2)
    }

    ctx.fillStyle = "#A020F0" // purple
    y = 60
    height = h-30
    line = 30
    start = 0; //30
    for (data of datal3) {
        this.points(data, datal3)
    }
    ctx.fillStyle = "#00000F" 

    ctx.stroke()
},
points: function(d, dX){
    // max = Math.max(...dX),
     // test = 30;
    // max = 1000; //test
    let A = [ dataX, datal1, datal2, datal3];
    let maxArray = A.map(a => Math.max.apply(null, a));
    max = Math.max(...maxArray),
    test = 30;

while (max > d) {
    max = max - 1
    test += line / un
}
// chart.circle(30 + y, test)
chart.circle(y, test)
dataT.push({ d : Math.round(test) + "," + Math.round(30 + y) +","+Math.round(d)})
x = 30
y += ys


},
 data: function() {
    y = 60
    x = 30
    // n = Math.max(...dataX)
    // n = 1000; //temp

        let A = [ dataX, datal1, datal2, datal3];
        let maxArray = A.map(a => Math.max.apply(null, a));
        n = Math.max(...maxArray)
        n = Math.ceil(n / 10) * 10;


    for(ydata of dataY){
        ctx.font = "12px Arial";
        if (dataY.length > 300){
            ctx.fillText(ydata*60, y +60*ys ,h-10); 
            y += ys*60;
        }else
        if (dataY.length > 140){
            ctx.fillText(ydata*20, y +20*ys ,h-10); 
            y += ys*20;
        }else
        if (dataY.length > 50){
            ctx.fillText(ydata*10, y +10*ys ,h-10); 
            y += ys*10;
        }else
        // if (dataY.length > 50){
        //     ctx.fillText(ydata*6, y +6*ys ,h-10); 
        //     y += ys*6;
        // }else
        if (dataY.length > 20){
            ctx.fillText(ydata*5, y +5*ys ,h-10); 
            y += ys*5;
        }else 
        if (dataY.length > 10){
            ctx.fillText(ydata*2, y +2*ys ,h-10); 
            y += ys*2;
        }else{
        ctx.fillText(ydata, y,h-10);
        y += ys;
        }
        
    }
    // while(x < h-30){
        while(x < h){
        ctx.font = "11px Arial";
        ctx.fillText(n, 0,x+5);
        n = n -un
        x += 30
    }
    
},

circle: function(x,y) {
    ctx.beginPath();
    ctx.arc(x,y,4, 0, 2 * Math.PI);
    ctx.fill()
}
}

c.onmousemove = function(e){
    for(let data of dataT){
        for (const [key, value] of Object.entries(data)) {
            let dataG = value.split(","),
            lx = e.layerX,
            ly = e.layerY,
            dx = dataG[1],
            dy = dataG[0]
                if (range(dx-10,Math.floor(dx)+10).includes(lx) && range(dy-10,Math.floor(dy)+10).includes(ly)) {
                    $('draw-canvas-data-set').innerHTML = dataG[2]
                    $('draw-canvas-data-set').style.opacity = "1"
                    $('draw-canvas-data-set').style.left = e.clientX + "px"
                    $('draw-canvas-data-set').style.top = e.clientY + "px"
                } if (range(dx-10,Math.floor(dx)+10).includes(lx) && !range(dy-10,Math.floor(dy)+10).includes(ly)) {
                    $('draw-canvas-data-set').style.opacity = "0"
                }
                lx = lx -1
                dx = dx -1
        }
    }
}

function range(start, end) {
    let range = [...Array(end + 1).keys()].filter(value => end >= value && start <= value );
    return range
}
function $(object){
    return document.querySelector(object);
}

//  -- - - - - - - - - - - - - - - - - - - - - - - - - - - 

