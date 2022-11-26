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
let Ctx  = {}; // Electr Canvas 
let CtxG = {}; // Gas    Canvas
let dataY = [];
let dataYG = [];
let dataX = [];
let datal1 = [];
let datal2 = [];
let datal3 = [];
let dataGas = [];
let dataGasPoint = [];
let un = 0
let ys = 0;
let dataT = [];
let button_stop = false;
let tabE = {};
let tabG = {};

let debug = false;

var MMU; // Minimum Maximum Unit

const max_seconds = 1500;
let e_start = {};
let e_stop  = {};
let _string = ''; // Gas string accumulated
let min = 0,
    max = 0;


let iteration = 0;

function Init(){

        if(e_start && e_start.style){
        e_start.style.opacity = 1 };
        if(e_stop && e_stop.style){
        e_stop.style.opacity = 0 };

        iteration = 0;
        dataY = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        dataX = [0,100];
        un = Math.round((Math.max(...dataX)-Math.min(...dataX))/10)
        ys = (w-80)/dataY.length; // steps on horizontal axis
        dataT = [];

        // Initialise Diagram framwork
        chart.setCtx(Ctx);
        chart.chartLine()
        chart.digram();

        // Set Canvas focus to Gas and draw empty diagram
        chart.setCtx(CtxG);
        chart.chartLine();
        chart.digram();

}

window.onload = function() {

     e_start = document.getElementById('Start');
     e_stop  = document.getElementById('Stop');

     if(e_start){
        e_start.style.opacity = 1 };

     if(e_stop){
        e_stop.style.opacity = 0 };

        c   = document.querySelector("canvas[le]");
        cg  = document.querySelector("canvas[lg]");

        tabE = document.querySelector("draw-canvas-data-set");
        tabG = document.querySelector("draw-canvas-data-setG");

        // Electr.
        h   = c.height;
        w   = c.width ;
        // Gas
        hg   = cg.height;
        wg   = cg.width ;

        // Canvas Context
        Ctx  = c.getContext('2d');
        CtxG = cg.getContext('2d');

        cg.onmousemove = function(e){ 
            document.getElementById('G').focus();
            tabE.style.opacity = "0" // $('draw-canvas-data-set')
            tabG.style.opacity = "0" // $('draw-canvas-data-setG')
            mouseMove(e) 
        };

        c.onmousemove  = function(e){ 
            tabE.style.opacity = "0" // $('draw-canvas-data-set')
            tabG.style.opacity = "0" // $('draw-canvas-data-setG')
            document.getElementById('E').focus();
            mouseMove(e) 
        };

    function mouseMove(e){ 

        let _ID       = e.currentTarget.attributes[1].nodeValue; // E  G
        let _tabIndex = e.currentTarget.attributes[4].nodeValue; // 1  2

        //  console.log(_ID, _tabIndex, 'Client:', e.clientX, e.clientY, 'Layer:' , e.layerX, e.layerY, 'Offset:' , e.offsetX , e.offsetY);

    for(let data of dataT){
        for (const [key, value] of Object.entries(data)) {
            let dataG = value.split(","),
            lx = Number(e.offsetX), // - 10,
            ly = Number(e.offsetY), // - c.height + 25,
            dx = Number(dataG[1]), // x axis
            dy = Number(dataG[0]); // y axis

           let _delta = Math.floor(Number(dataG[4])/ 3);
           if (_delta < 10){ _delta = 10};
              
            if ( ( lx > dx - _delta && lx < dx + _delta  )  && ( ly > dy - _delta && ly < dy + _delta  ) ){
               
                if ( _ID == 'E'){
                  
                        tabE.innerHTML     = dataG[3] + ':' + dataG[2]    // $('draw-canvas-data-set')
                        tabE.style.opacity = "1"                      // $('draw-canvas-data-set') 
                        tabE.style.left    = e.layerX + "px"            // $('draw-canvas-data-set') 
                        tabE.style.top     = e.layerY + "px"             // $('draw-canvas-data-set') 



                    }else if ( _ID == 'G'){

                        tabG.innerHTML     = dataG[3] + ':' + dataG[2]   //$('draw-canvas-data-setG')
                        tabG.style.opacity = "1"                     //$('draw-canvas-data-setG')
                        tabG.style.left    = e.layerX + "px"           //$('draw-canvas-data-setG')
                        tabG.style.top     = e.layerY + "px"            //$('draw-canvas-data-setG')

                    }
                }
                else{ 
                   // not found...
                 }
                lx = lx -1
                dx = dx -1
        }
    }
}

    Init();
    document.getElementById('IP').value = '192.168.2.45';
};

async function wrapper(){
    console.log('start');
    await waitInterval( meter, 999);
    console.log(iteration);
    console.log('finish');
};

function getMinMaxUn(_A){

        min = 0,
        max = 0;

    let _result =[];
if (_A.length >= 1){

    if (Array.isArray(_A[0])){
    let maxArray = _A.map(a => Math.max.apply(null, a)); // Get max of each array
     max = Math.max(...maxArray)   
    // Get max of that maxArray
    let minArray = _A.map(a => Math.min.apply(null, a));
     min = Math.min(...minArray)
    }else{
        max = Math.max(..._A)   
        min = Math.min(..._A)
    }
}
if(min == max){

        if ( (max-min) > 10){
            min = _A[0] * 0.999;
            max = _A[0] * 1.001;
        }else{
            min = _A[0] - 10;
            max = _A[0] + 10;
        }

}

    let un = Math.ceil((max - min)/10)

    if ( (max-min) > 100){
    max = Math.ceil(max / 10) * 10;
    min = Math.ceil(min / 10) * 10;
    un = Math.ceil(un / 10) * 10;
    }else if ( (max-min) > 10){
        max = Math.ceil(max * 1) / 1;
        min = Math.ceil(min * 1) / 1;
        un = Math.ceil(un * 10) / 10;
    }else if ( (max-min) > 1){
      un = (Math.ceil( (max - min) *10) ) /10;
      max = Math.ceil( max * 10) / 10;
      min = Math.ceil( min * 10) / 10;
    }else if ( (max-min) > 0){
        un = (Math.ceil( (max - min) *10) ) / 10;
        max = Math.ceil( max * 100) / 100;
        min = Math.ceil( min * 100) / 100;
    }
    
    _result.push(min);
    _result.push(max);
    _result.push(un);

    return _result;

}

function drawLine(){

    // Electric
    if (dataX.length != 0){

    let A = [ dataX, datal1, datal2, datal3];           // Combine all arrays
    let result = getMinMaxUn(A);
    min = result[0];
    max = result[1];
    un  = result[2];  

    // ys = (w-40)/dataY.length;
    ys = (w-80)/dataY.length;
    dataT = [];
    chart.setCtx(Ctx);
    chart.chartLine()
    chart.digram()
    chart.data();
    chart.draw();
    chart.pointes();
    }

    // Gas
    if (dataGasPoint.length != 0){

        let datag = [];
    for (datagas of dataGasPoint){
        datag.push(datagas[5]);
    }
        let result = getMinMaxUn(datag);
        min = result[0];
        max = result[1];
        un  = result[2];  // 1/10 of the axis
  
        ys = (w-80)/dataYG.length; // Every points distance on x-axis
        chart.setCtx(CtxG);
        chart.chartLine()
        chart.digram()
        chart.dataGas();
        chart.drawG();
        chart.pointesGas();
    }

    return true;
}

function run(){

    button_stop = false;
  
    ip = document.getElementById('IP').value; 

        if (ip != ''){
        Init(); 

        if(e_start){
            e_start.style.opacity = 0 }; // hide Start
         if(e_stop){
            e_stop.style.opacity = 1 };  // Show Stop

        dataY = []; 
        dataYG = [];    
        dataX = [];  
        datal1 = [];  
        datal2 = [];  
        datal3 = [];  
        dataT = []; // All entries of all graphs
        dataGas = [];
        dataGasPoint = [];
        iteration = 1;       
        wrapper() ;
        
    }else{
        // fake numbers insert
        dataY = [1,2,3,4,5,6,7,8,9,10];  // x-axis :) 
        dataYG = [1,2,3,4,5,6,7,8,9,10]; // x-axis :) 

        dataX = [1000,10010,1001,980,1023,899,455,1200,300,10]; // y-axis values Totals
        datal1 = [151,242,353,264,115,36,645,374,493,2];
        datal2 = [12,14,15,33,22,44,77,22,33,34];
        datal3 = [34,866,333,700,600,345,333,1111,233,1];

        dataGas = [ 
        ['21:10:06/22-11-22', 3037.961, 76206],
        ['21:10:06/22-11-22', 3037.961, 76206],
        ['21:10:06/22-11-22', 3037.961, 76206],
        ['21:15:05/22-11-22', 3038.991, 76505],
        ['21:15:05/22-11-22', 3038.991, 76505],
        ['21:15:05/22-11-22', 3038.991, 76505],
        ['21:20:05/22-11-22', 3039.991, 76505],
        ['21:20:05/22-11-22', 3039.991, 76505]
        ];
       
        dataGasPoint = [ 
            ["18:10:00/22-11-22",2000.101, 75005, 2, 5, 0.4], 
            ["18:10:00/22-11-22",2000.108, 75305, 125, 5, 25], 
            ["18:10:00/22-11-22",2000.150, 75605, 100, 5, 20], 
            ["18:10:00/22-11-22",2000.200, 75905, 0.0, 5, 0], 
            ["18:10:00/22-11-22",2000.202, 76205, 28, 5, 15], 
            ["18:10:00/22-11-22",2000.205, 76505, 255, 5, 50],
            ["18:10:00/22-11-22",2001.206, 76805, 25, 5, 5], 
            ["18:10:00/22-11-22",2001.209, 77105, 133, 5, 25]  
            ];
        iteration = 1;       
        Ctx.clearRect(0, 0, w, h);
        CtxG.clearRect(0,0,wg,hg);
        drawLine();

    }
}

function stop(){
    button_stop = !button_stop;

    if(e_start){
        e_start.style.opacity = 1 };
     if(e_stop){
        e_stop.style.opacity = 0 };

}



async function meter(i){
    iteration = i;
    let url = 'http://' + ip + '/api/v1/data';
    let response = await fetch(url);

    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      let json = await response.json();

      dataX.push(json.active_power_w);
      datal1.push(json.active_power_l1_w);
      datal2.push(json.active_power_l2_w);
      datal3.push(json.active_power_l3_w);
      dataY.push(i);

// Write to Screen

    // Details
    document.getElementById('WifiSSID').innerHTML       = json.wifi_ssid;       // wifi_ssid :  WifiSSID
    document.getElementById('WifiStrength').innerHTML   = json.wifi_strength;   // wifi_strength : 
    document.getElementById('MM').innerHTML             = json.meter_model;     //meter_model
    document.getElementById('SV').innerHTML             = json.smr_version;     //smr_version: 
    
    // Electric
      writeNumbers_E(json);

    Ctx.clearRect(0, 0, w, h);
    CtxG.clearRect(0,0,wg,hg);

    drawLine();

    // Gas details
    if(json.gas_timestamp){
    
    // YYMMDDhhmmss
        let _stamp = json.gas_timestamp.toString();
        
        let hh = _stamp.substring(6,8)  ;
        let mm = _stamp.substring(8,10) ;
        let ss = _stamp.substring(10,12);

        let YY = _stamp.substring(4,6) ;
        let MM = _stamp.substring(2,4) ;
        let DD = _stamp.substring(0,2) ;
    
        let _time = hh + ':' + mm + ':' + ss;
        let _date = YY + '-' + MM + '-' + DD;

        // hh:mm:ss/YY-MM-DD
            _time = _time + '/' + _date;

        // Timestamp in seconds as number    
        let _timestamp  = Number(ss) + Number(60*mm) + Number(3600*hh);
        let _deltaGas   = 0;
        let _min        = 0;
        let _usage      = 0;

        // When have a first entrie...we want unique entris afterwards
        if (dataGasPoint.length != 0){
        // Is this entry unique now?    
        if (dataGasPoint[dataGasPoint.length-1][2]  != _timestamp || debug == true){
            
         if(debug){ console.log(hh,mm,ss,_time,_timestamp)};
            // String to screen
            _string = _string + _time + ' : ' + json.total_gas_m3;

            // Save this unique timestamped Gas result to internal table
            //  dataGasPoint.push([_time, json.total_gas_m3, _timestamp])

            // When we have 2 or more entries saved...we can make some calculations
            if ( dataGasPoint.length > 0){
                 _deltaGas =  Math.floor( ( json.total_gas_m3*100 -  dataGasPoint[dataGasPoint.length-1][1]*100 ) *1000 ) / 100;
                
                 _min    = (_timestamp - dataGasPoint[dataGasPoint.length-1][2]) /60; // temp constant 
                 _string = _string + ' Delta:' + _deltaGas + ' liter/' + Math.floor(_min*10)/10 + 'min. ';

                if (_min != 0){
                 _usage = Math.round(_deltaGas * 100 / _min) / 100;
                 // console.log(dataGasPoint[dataGasPoint.length-1][2], dataGasPoint[dataGasPoint.length-2][2],_usage, _min)
                 _string = _string + 'Flow:' + _usage + ' l/min';
                }

            }
             _string = _string + '<br>';
             dataGasPoint.push([_time, json.total_gas_m3, _timestamp, _deltaGas, _min, _usage])  
             dataYG.push(i);
            }
            dataGas.push([_time, json.total_gas_m3, _timestamp]) ; // perhaps not needed 

        }else{
            dataGas.push([_time, json.total_gas_m3, _timestamp]) ; // perhaps not needed
            dataGasPoint.push([_time, json.total_gas_m3, _timestamp, null, null, null]);
            dataYG.push(i);
            _string = _time + ' : ' + json.total_gas_m3 + '<br>';
        }

        // let _string = '';
        // for (Gas of dataGas){   
        // _string = _string + Gas[0] + ' : ' + Gas[1] + '<br>';
        // }
        document.getElementById('TimeGasM3').innerHTML = _string;

        //total_gas_m3 G0
    }

    // Water details
    if(json.active_liter_lpm){
        document.getElementById('AL').innerHTML = json.active_liter_lpm;   // active_liter_lpm	            Active water usage in liters per minute
        document.getElementById('TL').innerHTML = json.total_liter_m3;    // total_liter_m3	            Total water usage in cubic meters since installation
    }else{
        document.getElementById('AL').innerHTML =  document.getElementById('TL').innerHTML = '';
    }

    let _return = ( i == max_seconds || button_stop );
    if (_return){
        stop()
    }
    return _return ;

    }           // response OK 
    else {      // response ERROR
      alert("HTTP-Error: " + response.status);
    }

}

function writeNumbers_E(json){
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
  
      let deltas = delta_calc(dataX);
      document.getElementById('PTd3').innerHTML             = deltas[0];
      document.getElementById('PTd2').innerHTML             = deltas[1];
      document.getElementById('PTd1').innerHTML             = deltas[2];
      let deltal1 = delta_calc(datal1);
      document.getElementById('P1d3').innerHTML             = deltal1[0];
      document.getElementById('P1d2').innerHTML             = deltal1[1];
      document.getElementById('P1d1').innerHTML             = deltal1[2];
      let deltal2 = delta_calc(datal2);
      document.getElementById('P2d3').innerHTML             = deltal2[0];
      document.getElementById('P2d2').innerHTML             = deltal2[1];
      document.getElementById('P2d1').innerHTML             = deltal2[2];
      let deltal3 = delta_calc(datal3);
      document.getElementById('P3d3').innerHTML             = deltal3[0];
      document.getElementById('P3d2').innerHTML             = deltal3[1];
      document.getElementById('P3d1').innerHTML             = deltal3[2];
  
      // total_power_export_t1_kwh:  
      document.getElementById('ET1').innerHTML = json.total_power_export_t1_kwh;
      // total_power_export_t2_kwh: 
      document.getElementById('ET2').innerHTML = json.total_power_export_t2_kwh;
      // total_power_import_t1_kwh : 
      document.getElementById('IT1').innerHTML = json.total_power_import_t1_kwh;
      // total_power_import_t2_kwh :
      document.getElementById('IT2').innerHTML = json.total_power_import_t2_kwh;
  
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
        delta.push(  _array[_array.length-1] - _array[_array.length-4])}else{delta.push(0)}
    if(_array.length > 2){
        delta.push(  _array[_array.length-1] - _array[_array.length-3])}else{delta.push(0)}
    if(_array.length > 1){
        delta.push(  _array[_array.length-1] - _array[_array.length-2])}else{delta.push(0)}
    
    return delta
}

//  -- - - - - - - - LINE CHART - - - - - - - - - - - - - - - - - - - 

var chart = {

    ctx : {}, 

 setCtx : function(_ctx){
    ctx = _ctx
 },    
 setStrokeStyle: function(_color){
    ctx.strokeStyle = _color ;//"#00FF00"
 },

digram: function(){
    y = 60
    x = 1
    ctx.strokeStyle = "#a7a7a7"
    // Vertical lines left to right
    while(y < w){
        ctx.beginPath()
        ctx.moveTo(y,0)
        ctx.lineTo(y,h-30)
        ctx.stroke()
        y += 30
    }
    // Horizontal lines top to bottom
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
    ctx.lineWidth = 4
    ctx.beginPath()
    // ctx.lineJoin = "round";
    y = 60
    height = h-30
    line = 30
    start = 0;
    let A = [ dataX, datal1, datal2, datal3];
    MMU = getMinMaxUn(A);

    for(data of dataX){

        test = 30; // offset
        test += ( 10 - ( data - MMU[0] ) / MMU[2] ) * line ;

        ctx.lineTo(y,test)
        y += ys
    }
    ctx.stroke()
    
    chart.setStrokeStyle("#00FF00");
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0;// 30
  
    for(data of datal1){

        test = 30;
        test += ( 10 - ( data - MMU[0] ) / MMU[2] ) * line ;
        ctx.lineTo(y,test)
        y += ys
    }
    ctx.stroke()
   
    chart.setStrokeStyle("#d6d610");
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0 ;//30
    for(data of datal2){
        test = 30;
        test += ( 10 - ( data - MMU[0] ) / MMU[2] ) * line ;
        ctx.lineTo(y,test)
        y += ys
    }
    ctx.stroke()

    chart.setStrokeStyle("#A020F0");// purple
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0 ; //30
    for(data of datal3){
        test = 30;
        test += ( 10 - ( data - MMU[0] ) / MMU[2] ) * line ;
        ctx.lineTo(y,test)
        y += ys
    }
    ctx.stroke()
    ctx.restore()
},

drawG: function() {
    ctx.save()
    ctx.strokeStyle = "#0b95d3"  //"#03a9f4" 
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30;
            let datag = [];
            for (datagas of dataGasPoint){
                datag.push(datagas[5]); // datagas[1], datagas[3], 
            }

    const MMU = getMinMaxUn(datag);

    for(data of dataGasPoint){   //dataGas has second info, ...Point has unique points

        test = 30;
        test += ( 10 - ( data[5] - MMU[0] ) / MMU[2] ) * line ;
        ctx.lineTo(y,test)
        y += ys
    }

    ctx.stroke()
    ctx.restore()
},

pointes: function() {

    let A = [ dataX, datal1, datal2, datal3];
    const MMU = getMinMaxUn(A);

    ctx.fillStyle = "#0b95d3"
    y = 60
    height = h-30
    line = 30
    for (data of dataX) {
        this.points(data, dataX, 'Tot.')
    }

    ctx.fillStyle = "#00FF00" //green
    y = 60
    height = h-30
    line = 30
    start = 30
    for (data of datal1) {
        this.points(data, datal1, 'l1')
    }

    ctx.fillStyle = "#d6d610" //"#FFFF00" //yellow
    y = 60
    height = h-30
    line = 30
    start = 30
    for (data of datal2) {
        this.points(data, datal2, 'l2')
    }

    ctx.fillStyle = "#A020F0" // purple
    y = 60
    height = h-30
    line = 30
    start = 30
    for (data of datal3) {
        this.points(data, datal3 ,'l3')
    }
    ctx.fillStyle = "#00000F" 

    ctx.stroke()
},
points: function(d, dX, f){

test = 30;
test += ( 10 - ( d - MMU[0] ) / MMU[2] ) * line ;
chart.circle(y, test)
dataT.push({ d : Math.round(test) + "," + Math.round(y) +","+Math.round(d) +","+f +"," + MMU})
y += ys;
},


pointesGas: function() {

    ctx.fillStyle = "#0b95d3"
    y = 60
    height = h-30
    line = 30
    start = 30;

    let datag = [];
    for (datagas of dataGasPoint){
        datag.push(datagas[5]);
    }
    MMU = getMinMaxUn(datag);

    for (data of dataGasPoint) {
        this.pointsGas(data[5], dataGasPoint, 'Gas')
    }

    ctx.fillStyle = "#00000F" 

    ctx.stroke()
},
pointsGas: function(d, dX, f){

test = 30;
test += ( 10 - ( d - MMU[0] ) / MMU[2] ) * line ;
chart.circle(y, test)
dataT.push({ d : Math.round(test) + "," + Math.round(y) +","+Math.round(d) +","+f + "," + MMU})
y += ys ; // Every 5 minutes : should be
},

 data: function() {
    y = 60
    x = 30

    let A = [ dataX, datal1, datal2, datal3];
    let maxArray = A.map(a => Math.max.apply(null, a));
    n = max;

    for(ydata of dataY){
        ctx.font = "12px Arial";
        if (dataY.length > 300){
            ctx.fillText(ydata*60, y +60*ys -ys ,h-10); 
            y += ys*60;
        }else
        if (dataY.length > 140){
            ctx.fillText(ydata*20, y +20*ys -ys ,h-10); 
            y += ys*20;
        }else
        if (dataY.length > 50){
            ctx.fillText(ydata*10, y +10*ys -ys ,h-10); 
            y += ys*10;
        }else
        if (dataY.length > 20){
            ctx.fillText(ydata*5, y +5*ys - ys ,h-10); 
            y += ys*5;
        }else 
        if (dataY.length > 10){
            ctx.fillText(ydata*2, y +2*ys - ys ,h-10); 
            y += ys*2;
        }else{
        ctx.fillText(ydata, y,h-10);
        y += ys;
        }
        
    }
    while(x < h-30){
        ctx.font = "11px Arial";
        ctx.fillText(n, 0,x+5);
        n = n -un
        x += 30
    }
    
},

dataGas: function() {
    y = 60
    x = 30
    n = max;

    for(ydata of dataYG){
        ctx.font = "12px Arial";
        if (dataYG.length > 300){
            ctx.fillText(ydata*60, y +60*ys -ys ,h-10); 
            y += ys*60;
        }else
        if (dataYG.length > 140){
            ctx.fillText(ydata*20, y +20*ys -ys ,h-10); 
            y += ys*20;
        }else
        if (dataYG.length > 50){
            ctx.fillText(ydata*10, y +10*ys -ys ,h-10); 
            y += ys*10;
        }else
        if (dataYG.length > 20){
            ctx.fillText(ydata*5, y +5*ys - ys ,h-10); 
            y += ys*5;
        }else 
        if (dataYG.length > 10){
            ctx.fillText(ydata*2, y +2*ys - ys ,h-10); 
            y += ys*2;
        }else{
        ctx.fillText(ydata, y,h-10);
        y += ys;
        }
        
    }
    while(x < h-30){
        ctx.font = "11px Arial";
        ctx.fillText(n, 0,x+5);
        n = n -un
        n = Math.floor(n*100)/100;
        x += 30
    }
    
},

circle: function(x,y) {
    ctx.beginPath();
    ctx.arc(x,y,4, 0, 2 * Math.PI);
    ctx.fill()
}
}

function $(object){
    return document.querySelector(object);
}

//  -- - - - - - - - - - - - - - - - - - - - - - - - - - - 

