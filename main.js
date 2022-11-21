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
let dataX = [];
let datal1 = [];
let datal2 = [];
let datal3 = [];
let dataGas = [];
let un = 0
let ys = 0;
let dataT = [];
let button_stop = false;

const max_seconds = 1500;
let e_start = {};
let e_stop  = {};
let _string = ''; // Gas string accumulated


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
un = Math.round(un / 10) * 10;
// ys = (w-40)/dataY.length; // steps on horizontal axis
ys = (w-80)/dataY.length; // steps on horizontal axis
dataT = [];

// Initialise Diagram framwork
chart.setCtx(Ctx);
chart.chartLine()
chart.digram();

// Set Canvas focus to Gas and draw empty diagram
// chart.setCtx(CtxG);
// chart.chartLine();
// chart.digram();

}

window.onload = function() {

     e_start = document.getElementById('Start');
     e_stop  = document.getElementById('Stop');

     if(e_start){
        e_start.style.opacity = 1 };

     if(e_stop){
        e_stop.style.opacity = 0 };

        c   = document.querySelector("canvas[le]");
        // cg  = document.querySelector("canvas[lg]");
        // Electr.
        h   = c.height;
        w   = c.width ;
        // Gas
        // hg   = cg.height;
        // wg   = cg.width ;
        Ctx  = c.getContext('2d');
        // CtxG = cg.getContext('2d');


        c.onmousemove = function(e){

    $('draw-canvas-data-set').style.opacity = "0"

    for(let data of dataT){
        for (const [key, value] of Object.entries(data)) {
            let dataG = value.split(","),
            lx = e.layerX - 10,
            ly = e.layerY - c.height + 25,
            dx = dataG[1],
            dy = dataG[0];
            if (range(dx-10,Math.floor(dx)+10).includes(lx)){
                //  console.log(dx, 'X includes', lx);
            } 
            if(range(dy-10,Math.floor(dy)+10).includes(ly)){
                // console.log(dy, 'Y includes', ly);
            }
           
                if (range(dx-10,Math.floor(dx)+10).includes(lx) && range(dy-10,Math.floor(dy)+10).includes(ly)) {
                    // console.log(lx,ly,dx,dy, dataG[2]);
                    // $('draw-canvas-data-set').innerHTML = dataG[2] + ':' + 'dx' + dataG[1] + 'dy' + dataG[0] + 'lx' +lx + 'ly' + ly;
                    $('draw-canvas-data-set').innerHTML = dataG[3] + ':' + dataG[2]
                    $('draw-canvas-data-set').style.opacity = "1"
                    $('draw-canvas-data-set').style.left = e.clientX + "px"
                    $('draw-canvas-data-set').style.top = e.clientY + "px"
                }else{ 
                // if (!range(dx-10,Math.floor(dx)+10).includes(lx) && !range(dy-10,Math.floor(dy)+10).includes(ly)) {
                    // $('draw-canvas-data-set').style.opacity = "0.3"
                    // console.log(lx,ly,dx,dy, dataG);
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

    let min = 0,
        max = 0;

    let _result =[];
    // let A = [ dataX, datal1, datal2, datal3];           // Combine all arrays
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

    // if (Array.isArray(_A_)){
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
        un = Math.ceil(un * 1) / 1;
    }else if ( (max-min) > 1){
      un = (Math.ceil( (max - min) *10) ) /10;
      max = Math.ceil( max * 10) / 10;
      min = Math.ceil( min * 10) / 10;
    }else if ( (max-min) > 0){
        un = (Math.ceil( (max - min) *100) ) / 100;
        max = Math.ceil( max * 100) / 100;
        min = Math.ceil( min * 100) / 100;
    }
    
    _result.push(min);
    _result.push(max);
    _result.push(un);

    return _result;

}

function drawLine(){

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

    // if (dataGas.length != 0){


    //     let datag = [];
    // for (datagas of dataGas){
    //     datag.push(datagas[1]);
    // }
    //     let result = getMinMaxUn(datag);
    //     min = result[0];
    //     max = result[1];
    //     un  = result[2];  
  
    //     ys = (w-80)/dataY.length;
    //     chart.setCtx(CtxG);
    //     chart.chartLine()
    //     chart.digram()
    //     chart.dataGas();
    //     chart.drawG();
    //     chart.pointesGas();
    // }

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
        dataX = [];  
        datal1 = [];  
        datal2 = [];  
        datal3 = [];  
        dataT = []; // All entries of all graphs
        dataGas = [];
        iteration = 1;       
        wrapper() ;
        
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

    // ctx.clear();
    //  ctx.clearRect(0, 0, window.width, window.height);
     Ctx.clearRect(0, 0, w, h);
    //  CtxG.clearRect(0,0,wg,hg);

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
    
        if (dataGas.length != 0){

        if (dataGas[dataGas.length-1][0]  != _time){
            console.log(_time);
            // dataGas.push([_time, json.total_gas_m3]) ;

            _string = _string +_time + ' : ' + json.total_gas_m3 + '<br>';
        }  
        dataGas.push([_time, json.total_gas_m3]) ;
        }else{
            dataGas.push([_time, json.total_gas_m3]) 
            // _string = Gas[0] + ' : ' + Gas[1] + '<br>';
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
        // let maxArray = A.map(a => Math.max.apply(null, a));
        // max = Math.max(...maxArray),
        max = getMinMaxUn(A)[1];
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
   
    // ctx.strokeStyle = "#00FF00" //green
    chart.setStrokeStyle("#00FF00");
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0;// 30
  
    for(data of datal1){
        let A = [ dataX, datal1, datal2, datal3];
        // let maxArray = A.map(a => Math.max.apply(null, a));
        // max = Math.max(...maxArray),
        max = getMinMaxUn(A)[1];
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

   
    // ctx.strokeStyle = "#d6d610" //"#FFFF00" //yellow
    chart.setStrokeStyle("#d6d610");
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0 ;//30
    for(data of datal2){
        let A = [ dataX, datal1, datal2, datal3];
        // let maxArray = A.map(a => Math.max.apply(null, a));
        // max = Math.max(...maxArray),
        max = getMinMaxUn(A)[1];
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

   
    // ctx.strokeStyle = "#A020F0" // purple
    chart.setStrokeStyle("#A020F0");
    ctx.lineWidth = 3
    ctx.beginPath()
    y = 60
    height = h-30
    line = 30
    start = 0 ; //30
    for(data of datal3){
        let A = [ dataX, datal1, datal2, datal3];
        // let maxArray = A.map(a => Math.max.apply(null, a));
        // max = Math.max(...maxArray),
        max = getMinMaxUn(A)[1];
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
// drawG: function() {
//     ctx.save()
//     ctx.strokeStyle = "#0b95d3"  //"#03a9f4" 
//     ctx.lineWidth = 3
//     ctx.beginPath()
//     // ctx.lineJoin = "round";
//     y = 60
//     height = h-30
//     line = 30
//     start = 0;//30
//     // ctx.moveTo(60, h-30);
//     for(data of dataGas){

//         // max = Math.max(...dataGas),
//         let datag = [];
//         for (datagas of dataGas){
//             datag.push(datagas[1]);
//         }
//         max = getMinMaxUn(datag)[1];
//         test = 30;

//         while (max > data[1]){
//             max = max - 1
//             test += line/un
//         }
//         // ctx.lineTo(30+y,test)
//         ctx.lineTo(y,test)
//         x = 0 ;//30
//         y += ys
//     }

//     ctx.stroke()
//     ctx.restore()
// },

pointes: function() {

    ctx.fillStyle = "#0b95d3"
    y = 60
    height = h-30
    line = 30
    start = 0;//30
    for (data of dataX) {
        this.points(data, dataX, 'Tot.')
    }

    ctx.fillStyle = "#00FF00" //green
    y = 60
    height = h-30
    line = 30
    start = 0; //30
    for (data of datal1) {
        this.points(data, datal1, 'l1')
    }

    ctx.fillStyle = "#d6d610" //"#FFFF00" //yellow
    y = 60
    height = h-30
    line = 30
    start = 0; //30
    for (data of datal2) {
        this.points(data, datal2, 'l2')
    }

    ctx.fillStyle = "#A020F0" // purple
    y = 60
    height = h-30
    line = 30
    start = 0; //30
    for (data of datal3) {
        this.points(data, datal3 ,'l3')
    }
    ctx.fillStyle = "#00000F" 

    ctx.stroke()
},
points: function(d, dX, f){
    // max = Math.max(...dX),
     // test = 30;
    // max = 1000; //test
    let A = [ dataX, datal1, datal2, datal3];
    // let maxArray = A.map(a => Math.max.apply(null, a));
    // max = Math.max(...maxArray),
    max = getMinMaxUn(A)[1];
    test = 30;

while (max > d) {
    max = max - 1
    test += line / un
}
// chart.circle(30 + y, test)
chart.circle(y, test)
dataT.push({ d : Math.round(test) + "," + Math.round(y) +","+Math.round(d) +","+f})
x = 0; //30
y += ys
},


// pointesGas: function() {

//     ctx.fillStyle = "#0b95d3"
//     y = 60
//     height = h-30
//     line = 30
//     start = 0;//30
//     for (data of dataGas) {
//         this.pointsGas(data, dataGas, 'Gas:')
//     }

//     ctx.fillStyle = "#00000F" 

//     ctx.stroke()
// },
// pointsGas: function(d, dX, f){
//     // max = Math.max(...dX),
//      // test = 30;
//     // max = 1000; //test
//     // let A = [ dataX, datal1, datal2, datal3];
//     // let maxArray = A.map(a => Math.max.apply(null, a));
//     // max = Math.max(...dataGas),
//     let datag = [];
//     for (datagas of dataGas){
//         datag.push(datagas[1]);
//     }
//     max = getMinMaxUn(datag)[1];
//     test = 30;

// while (max > d[1]) {
//     max = max - 1
//     test += line / un
// }
// // chart.circle(30 + y, test)
// chart.circle(y, test)
// dataT.push({ d : Math.round(test) + "," + Math.round(y) +","+Math.round(d) +","+f})
// x = 0; //30
// y += ys
// },

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
        // if (dataY.length > 50){
        //     ctx.fillText(ydata*6, y +6*ys ,h-10); 
        //     y += ys*6;
        // }else
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
// dataGas: function() {
//     y = 60
//     x = 30

//     // let A = [ dataX, datal1, datal2, datal3];
//     // let maxArray = A.map(a => Math.max.apply(null, a));
//     // n = Math.max(...maxArray)
//     let datag = [];
//     for (datagas of dataGas){
//         datag.push(datagas[1]);
//     }
//     n = Math.max(...datag)
//     n = Math.ceil(n / 10) * 10;

//     for(ydata of dataY){
//         ctx.font = "12px Arial";
//         if (dataY.length > 300){
//             ctx.fillText(ydata*60, y +60*ys -ys ,h-10); 
//             y += ys*60;
//         }else
//         if (dataY.length > 140){
//             ctx.fillText(ydata*20, y +20*ys -ys ,h-10); 
//             y += ys*20;
//         }else
//         if (dataY.length > 50){
//             ctx.fillText(ydata*10, y +10*ys -ys ,h-10); 
//             y += ys*10;
//         }else
//         // if (dataY.length > 50){
//         //     ctx.fillText(ydata*6, y +6*ys ,h-10); 
//         //     y += ys*6;
//         // }else
//         if (dataY.length > 20){
//             ctx.fillText(ydata*5, y +5*ys - ys ,h-10); 
//             y += ys*5;
//         }else 
//         if (dataY.length > 10){
//             ctx.fillText(ydata*2, y +2*ys - ys ,h-10); 
//             y += ys*2;
//         }else{
//         ctx.fillText(ydata, y,h-10);
//         y += ys;
//         }
        
//     }
//     while(x < h-30){
//         ctx.font = "11px Arial";
//         ctx.fillText(n, 0,x+5);
//         n = n -un
//         x += 30
//     }
    
// },

circle: function(x,y) {
    ctx.beginPath();
    ctx.arc(x,y,4, 0, 2 * Math.PI);
    ctx.fill()
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

