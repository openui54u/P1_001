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




// {ip}/api
// P1
//{"product_type":"HWE-P1","product_name":"P1 meter","serial":"3c39e72ea574","firmware_version":"3.02","api_version":"v1"}

// Socket
// {"product_type":"HWE-SKT","product_name":"Energy Socket","serial":"<serial>","firmware_version":"3.02","api_version":"v1"}

// Kwh meter
// {"product_type":"SDM230-wifi","product_name":"KWh meter","serial":"<serial>","firmware_version":"2.11","api_version":"v1"}

// Watermeter
// {"product_type":"HWE-WTR","product_name":"Watermeter","serial":"<serial>","firmware_version":"1.17","api_version":"v1"}

//{ip}/api/v1/data
// P1

// Energy socket:
// {"wifi_ssid":"xxxxx","wifi_strength":54,"total_power_import_t1_kwh":12.345,"total_power_export_t1_kwh":456.789,"active_power_w":0.987,"active_power_l1_w":0.901}

// Kwh meter:
// {"wifi_ssid":"xxxx","wifi_strength":98,"total_power_import_t1_kwh":12.345,"total_power_export_t1_kwh":3456.789,"active_power_w":6.543,"active_power_l1_w":5.432}

// Watermeter:
// {"wifi_ssid":"xxxxx ","wifi_strength":72,"total_liter_m3":21.012,"active_liter_lpm":0}




var ip = {};
// var ip_W1;

let c = {};
let h = 0;
let w = 0;
let Ctx  = {};          // Electr Canvas 
let CtxG = {};          // Gas    Canvas
let dataX  = [],        // X-axis
    dataXG = [],
    dataL_Total  = [],  // Y-axis total
    datal1 = [],        // Phase 1
    datal2 = [],        // Phase 2
    datal3 = [];        // Phase 3
let dataGas = [],       // Gas Every call
    dataGasPoint = [];  // Gas Every Unique Measurement
var un = 0;             // Unit : Value per 30 pixels 
let xs = 0;
let dataT = [];
let button_stop = true; // is stopped so start is showing
let tabE = {};
let tabG = {};
var zoomStatus = false;
var sliderPercentage = 1; // [factor = percentage/100]
var sliderPoints = 10;
let debug = false;

var MMU = []; // Minimum Maximum Unit 0 = elec 1 = gas
var tabIndexCanvas = 0; // canvas index
var tabIndeX_dataT = 0; // tab index of E or G

// var sliderPoints = 10;

const max_seconds = 60*60*24 //1500;
let e_start = {};
let e_stop  = {};
let e_scan  = {};
let _string = `<tr><th>Time (hh:mm:ss/dd-mm-yy)</th><th>Gas (m3)</th><th>DeltaSum(liter)</th><th>Delta (liter)</th><th>min.</th><th>Flow (liter/min )</th></tr> `; // Gas string accumulated
let min = 0,
    max = 0;
    let _s = 0;
    let _e = 0;
    let _index = 0;
    let _length = 0;

    var gVar = {
        s: 0,
        e: 0,
        zoomStatus: false,

      get zoom(){
        if(s== undefined){
            s = 0
        }
        if(e==undefined){
            e = dataX.length||0;
        }
        if(zoomStatus == undefined){
            zoomStatus = false
        }
        return {s,e, zoomStatus};
      },
      set zoom(o){
        s = o.s;
        e = o.e;
        zoomStatus = o.zoomStatus;
      }
    }

//let _k = $('#TimeGasM3') ;
// let _k = object('#TimeGasM3') ;
var _k;

let iteration = 0;

function Init(){


var slider = document.getElementById("myRange");
var sliderP = document.getElementById("myPoints");

var sliderTableSwitch = document.getElementById("tableSwitch_GAS");


// var output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

    document.getElementById("pointsValue").innerHTML = sliderPoints;

//  Update the current slider value (each time you drag the slider handle)

// sliderTableSwitch.oninput = function(){
//     console.log(this);
// }

slider.oninput = function() {

    sliderPercentage =  Number( this.value / 100 );

    let _se = set_s_e(sliderPoints, sliderPercentage);
    _s = _se.s; 
    _e = _se.e;
    // gVar.zoom = {s:_s, e:_e, zoomStatus:zoomStatus}
    // if(!zoomStatus){
        // _e = dataX.length;
        // document.getElementById("rangeValue").innerHTML = dataX.length;
    // }else{

        document.getElementById("rangeValue").innerHTML  = _e 
        document.getElementById("rangeValue_from").innerHTML  = _s;
        document.getElementById("pointsValue").innerHTML = sliderPoints;
            
// }

    if(button_stop){
    Ctx.clearRect(0, 0, w, h);
    CtxG.clearRect(0,0,wg,hg);
    drawLine()
    };
}

sliderP.oninput = function() {

    sliderPoints = Math.floor( Math.exp( Number( this.value  ) ) );

    let _se = set_s_e(sliderPoints, sliderPercentage);
    _s = _se.s; 
    _e = _se.e;
    // gVar.zoom = {s:_s, e:_e, zoomStatus:zoomStatus}

    document.getElementById("rangeValue").innerHTML  = _e 
    document.getElementById("rangeValue_from").innerHTML  = _s;
    document.getElementById("pointsValue").innerHTML = sliderPoints;
   
    if(button_stop){
        Ctx.clearRect(0, 0, w, h);
        CtxG.clearRect(0,0,wg,hg);
        drawLine()
    };

}


    _s = 0;
    _e = 0;
    zoomStatus = false;
    gVar.zoom = {s:_s, e:_e, zoomStatus: zoomStatus};

        if(e_start && e_start.style){
        e_start.style.opacity = 1 };
        if(e_stop && e_stop.style){
        e_stop.style.opacity = 0 };
        if(e_scan && e_scan.style){
            e_scan.style.opacity = 1 };

        iteration = 0;
        dataX = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        dataL_Total = [0,100];
        un = Math.round((Math.max(...dataL_Total)-Math.min(...dataL_Total))/10)
        xs = (w-80)/dataX.length; // steps on horizontal axis
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


function set_s_e(sliderPoints, sliderPercentage){

    // Set end point
    // if(zoomStatus){
    let _e = Math.floor(sliderPercentage * dataX.length);
    if(_e < 10){ _e = 10};
    // if(_e >= sliderPoints){ _e = dataX.length};
    // }else{
    // _e = dataX.length;
    // }

    // Set Start
    // if(zoomStatus){
    let _s = _e - sliderPoints;
    if(_s < 0 || _s==undefined){_s = 0}
    // }else{
    // _s = 0;
    // }

    // if(_s < 0 || _s==undefined){_s = 0};

    // if(sliderPoints >= dataX.length){ 
        // sliderPoints = dataX.length; 
        //console.log("sliderPoints correct to dataX length")
        // document.getElementById("pointsValue").innerHTML = sliderPoints;
    // };
//  if (_e > dataX.length){_e = dataX.length};


    // if(zoomStatus){
        
        // if (sliderPoints <= dataX.length){
        //     _length = sliderPoints;
        //     // _e = dataX.length;
        //     _s = _e - _length;
        //     if (_s<0){s=0; _e = sliderPoints};
        // }else{
        //     _length = dataX.length;
        //     _s = 0;
        //     _e = _length;
        // }

    // }else{
    //     if (_s<0){s=0; _e = dataX.length};
    // }

    // document.getElementById("rangeValue").innerHTML = _e;
    // gVar.zoom = {_s, _e, zoomStatus}
    gVar.zoom = {s:_s, e:_e, zoomStatus:zoomStatus}

    if(debug){console.log(_s, _e, sliderPoints, sliderPercentage)};

    return {s:_s, e:_e}
}


function tableSwitch_GAS(){
    let _checkBox = document.getElementById("tableSwitch_GAS").checked;
    if(debug){console.log( _checkBox )};
    let _container_GAS = document.getElementById("table_GAS");
    if(_checkBox && _container_GAS){
// Show table GAS
_container_GAS.style.display = "block";
    }else{
// Hide table GAS
_container_GAS.style.display = "none";
    }

}
window.onload = function() {


     e_start = document.getElementById('Start');
     e_stop  = document.getElementById('Stop');
     e_scan  = document.getElementById('Scan');

     if(e_start){
        e_start.style.opacity = 1 };

     if(e_stop){
        e_stop.style.opacity = 0 };

        if(e_scan && e_scan.style){
            e_scan.style.opacity = 1 };   

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

      //  sliderPoints = Math.floor( ( c.width / 30 ) ) - 2;
        //   sliderPoints = sliderPoints || Math.floor( ( c.width / 30 ) ) - 2;
        //   sliderPoints = sliderPoints;

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
            tabIndexCanvas = e.currentTarget.attributes[4].nodeValue; // 1  2
         _index = 0;
  
        _s = gVar.zoom.s 
        _e = gVar.zoom.e;
        zoomStatus = gVar.zoom.zoomStatus;

        if (_e == -1 || isNaN(_e)){
            _s = 0;
            _e = dataX.length ;
            if(debug){console.log('correction')};
        }
        gVar.zoom = {s:_s,e:_e, zoomStatus:zoomStatus};     
        
//   T has 4* the amount of data in
  for(let data of dataT){
        // for (let ix = _s; ix < (_e * 4); ix++) { 
            // const data = dataT[ix];
        
        for (const [key, value] of Object.entries(data)) {
            let dataG = value.split(","),
            lx = Number(e.offsetX), // - 10,
            ly = Number(e.offsetY), // - c.height + 25,
            dx = Number(dataG[1]), // x axis
            dy = Number(dataG[0]); // y axis

           let _delta = Math.floor(Number(dataG[4])/ 3);
           
           if (_delta < 10){ _delta = 10};
              
            if ( ( lx > dx - _delta && lx < dx + _delta  )  && ( ly > dy - _delta && ly < dy + _delta  ) ){
               
                if ( _ID == 'E' && dataG[3] != 'Gas'){
                  
                        tabE.innerHTML     = dataG[3] + ':' + dataG[2]    // $('draw-canvas-data-set')
                        tabE.style.opacity = "1"                      // $('draw-canvas-data-set') 
                        tabE.style.left    = e.layerX + "px"            // $('draw-canvas-data-set') 
                        tabE.style.top     = e.layerY + "px"             // $('draw-canvas-data-set') 
                       if(debug){ console.log(_index, Number(dataG[7])) };
                       tabIndeX_dataT = Number(dataG[7]);



                    }else if ( _ID == 'G' && dataG[3] == 'Gas'){

                        tabG.innerHTML     = dataG[3] + ':' + dataG[2]   //$('draw-canvas-data-setG')
                        tabG.style.opacity = "1"                     //$('draw-canvas-data-setG')
                        tabG.style.left    = e.layerX + "px"           //$('draw-canvas-data-setG')
                        tabG.style.top     = e.layerY + "px"            //$('draw-canvas-data-setG')
      
                    }

                }
                else{ 
                   // not found...
                //    zoomStatus = false;
                 }
                lx = lx -1
                dx = dx -1

        }
        _index++;
    }



}

    Init();
    document.getElementById('IP_P1').value = '192.168.2.*';
};

async function wrapper(){
    console.log('start');
    await waitInterval( meter, 999);
    // await waitInterval( meterW, 999);
    console.log(iteration);
    button_stop = true;
    console.log('finish');
};
async function wrapperW(){
    console.log('start W');
    // await waitInterval( meter, 999);
    await waitInterval( meterW, 999);
    console.log(iteration);
    button_stop = true;
    console.log('finish W');
};

function toggleZoom(){
    zoomStatus = gVar.zoom.zoomStatus;
    zoomStatus = !zoomStatus;
    zoomStatus = gVar.zoom.zoomStatus;

    let _buttonZoom = document.getElementById("Zoom");
    if(zoomStatus){
    _buttonZoom.style.backgroundColor = "lightblue";
    }else{
        _buttonZoom.style.backgroundColor = "white";
    }

    if (gVar.zoom == undefined || gVar.zoom.s == undefined || gVar.zoom.e == 0){
        if (sliderPercentage == undefined || sliderPercentage == 0){
            sliderPercentage = 1
        }
            _e =  Math.floor( dataX.length * sliderPercentage ) ;
            if(_e < 10){ _e = 10};
            // document.getElementById("rangeValue").innerHTML = _e;
            _s = _e - sliderPoints; //10
            if (_s< 0){
                _s = 0;          
    }
    gVar.zoom = {s: _s, e: _e, zoomStatus: zoomStatus};
    }



    if(button_stop){
        Ctx.clearRect(0, 0, w, h);
        CtxG.clearRect(0,0,wg,hg);
        drawLine()};

}

function getMinMaxUn(AA){

        min = 0,
        max = 0;
        let _A = [];

        // zoomStatus = gVar.zoom.zoomStatus;

        if(zoomStatus){
        _s = gVar.zoom.s;
        _e = gVar.zoom.e;
        // // document.getElementById("rangeValue").innerHTML = _e;
        }else{
         _s = 0;
         _e = dataX.length;
        // //  if(sliderPercentage == 1){
        //     // document.getElementById("rangeValue").innerHTML = _e 
        // // }
        }
        // document.getElementById("rangeValue").innerHTML = _e 
        
        // zoomStatus
        if (zoomStatus && AA[0] != null ){
            //  _s = tabIndeX_dataT - 5;
            // if (_s<0){_s=0}
            //  _e = tabIndeX_dataT + 5;
            if (_e > AA[0].length){
                _e = AA[0].length
                _s = AA[0].length - 10
            }
            // if (_s==0){_e = tabIndeX_dataT + 10}
            if (_s<0){_s=0 ; _e = _s + sliderPoints}  //+10
            if (_e > AA[0].length){
                _e = AA[0].length;
            }
            _A[0] = []; _A[1] = []; _A[2] = []; _A[3] = [];
            if (AA[0] != null && AA[0] != undefined && AA[0].length > 1){
            _A[0] = AA[0].slice(_s,_e);
            _A[1] = AA[1].slice(_s,_e);
            _A[2] = AA[2].slice(_s,_e);
            _A[3] = AA[3].slice(_s,_e);
            }else{
                _A = AA;
            }
        }else{
            _s = 0;
            if(AA[0]){
            _e = AA[0].length }else{
                //  _e = -1
                }
            _A = AA;
        }

        // gVar.zoom = {s:_s, e:_e, zoomStatus:zoomStatus};


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

        if ( (max-min) > 10){  //10
            min = _A[0] * 0.999;
            max = _A[0] * 1.001;
        }else{
            min = 0;
            max = _A[0] * 1.01;//+ 10;
        }

}
// Unit multiple of 1, 10, 2, 20, 5, 50, 100, 200, 500 etc
        un = (max - min) / 10;
        un = un * 1.22; // give a little more space

    // Units of 100,150, 200 and such
    if ( un >= 1000){
        max = Math.ceil(max / 5000) * 5000;
        min = Math.floor(min / 5000) * 5000;
        un = Math.round(un / 500 ) * 500;          
    // Units of 10, 15, 20 etc
    }else
    if ( un >= 100){
        max = Math.ceil(max / 500) * 500;
        min = Math.floor(min / 500) * 500;
        un = Math.round(un / 50 ) * 50;
    // Units of 10, 15, 20 etc
    }else 
    if ( un >= 10){
        max = Math.ceil(max / 50) * 50;
        min = Math.floor(min / 50) * 50;
        un = Math.round(un / 10) * 10;
    // Units of 1 2 5    
    }else 
    if ( un >= 1){     
      max = Math.ceil( max / 10) * 10;
      min = Math.floor( min / 10) * 10;
      un = (Math.round( un / 1) ) * 1;
    // Units of 0.1 0.2 0.5
    }else 
    if ( un >= 0){      
        max = Math.ceil( max * 1) / 1;
        min = Math.floor( min * 1) / 1;
        un = (Math.round( un * 10) ) / 10;
    }
    
if (debug){console.log(min,max,un)};

    return [min,max,un]

}

function drawLine(){

    // Electric
    if (dataL_Total.length != 0){

        if (zoomStatus){
        _s =  gVar.zoom.s;
        _e =  gVar.zoom.e; 
        zoomStatus = gVar.zoom.zoomStatus;
        }else{
            _s = 0
            _e = dataX.length
        }
     
        _length = _e - _s ;

    let A = [ dataL_Total.slice(_s,_e), datal1.slice(_s,_e), datal2.slice(_s,_e), datal3.slice(_s,_e)];           // Combine all arrays
    MMU[0] = getMinMaxUn(A);
    min = MMU[0][0];
    max = MMU[0][1];
    un  = MMU[0][2];  

    // ys = (w-40)/dataX.length;
    //    xs = (w-80)/dataX.length;
       // if(zoomStatus){
        xs = (w-80)/_length;
        // }


        // if(!zoomStatus){
            // _s = 0 ;
            // _e = dataX.length;
    //    }else{ 
            // _s = gVar.zoom.s
            // _e = gVar.zoom.e
    //    };
        //  let A = [ dataL_Total, datal1, datal2, datal3];
        // MMU[0] = getMinMaxUn(A);

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


    // if(!zoomStatus){
        _s = 0 ;
        _e = dataX.length;
//    }else{ 
        // _s = gVar.zoom.s
        // _e = gVar.zoom.e
//    };

        MMU[1] = getMinMaxUn(datag);
        min = MMU[1][0];
        max = MMU[1][1];
        un  = MMU[1][2];  // 1/10 of the axis
  
        xs = (w-80)/dataXG.length; // Every points distance on x-axis
        chart.setCtx(CtxG);
        chart.chartLine()
        chart.digram()
        chart.dataGas();
        chart.drawG();
        chart.pointesGas();
    }

    return true;
}

async function tryIP(_ip){
    let url = 'http://' + _ip + '/api'; // '/api/v1/data';
    // http://192.168.2.4/api   {"product_type":"HWE-P1","product_name":"P1 meter",

    const promise1 = new Promise( (resolve,reject) =>{
        if(debug){ console.log(url) };

            fetch(url)
                 .then( async function(response){
                     if (response.ok){
                        
                        let _json = await response.json();
                        // _json.then
                        if (_json.product_type == "HWE-P1"){
                            ip.P1 = _ip;
                            if(debug){console.log(ip.P1)};
                            if(debug){console.log('Found HWE-P1', url, ip.P1)};
                            document.getElementById('IP_P1').value = ip.P1;
                            resolve
                        }
                        if (_json.product_type == "HWE-WTR"){
                            ip.WTR = _ip;
                            if(debug){console.log(ip.WTR)};
                            if(debug){console.log('Found HWE-WTR', url, ip.WTR)};
                            document.getElementById('IP_WTR').value = ip.WTR;
                            resolve
                        }

                            reject
                        }else{
                                // alert("HTTP-Error: " + response.status);
                             reject
                        }
                //     console.log(response);
                return response.json()
                })
                .catch((err) => {
                    // console.log(err);
                })
    })
    const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100));

    try { 
    await Promise.race([promise1, promise2]);
    } catch (e) {
    // time out or func failed
    if(debug){console.log(url, 'failed')};
    }
    // ERR_CONNECTION_TIMED_OUT
}
function scanIP(){

    // Currently only a scan on last .* part of ip4
    ip.P1  = document.getElementById('IP_P1').value; 
    ip.WTR = document.getElementById('IP_WTR').value; 
    if (ip.P1 != '' && ip.P1.split('.')[3].includes('*')){
        // Scan network on last
        // console.log(ip)
        let _ip = ip.P1;
       // .1 up to .255 scan the ip range
            for (var ii = 1; ii < 256; ii++)  {  
                let _ipArray = _ip.split('.')
                _ipArray[3] = ii;
                _ip = _ipArray[0] + '.' + _ipArray[1] + '.' + _ipArray[2] + '.' + _ipArray[3]; 
                if(debug){console.log(_ip)};
                 tryIP(_ip) ;

            }

    }
}

function setHoverText(){

        // Turn off hover text
        let _hover = document.getElementsByClassName('tooltip')[0];
        if(_hover){
        if(!button_stop){
            _hover.style.display = 'none';
        }else{
            _hover.style.display = 'inline-block';
        }
    }

}
function fill_data_random(){

let _i        = 600 ; // amount of data points to make
let _interval = 1   ; // Every int seconds timemark

set_s_e(sliderPoints,sliderPercentage);

document.getElementById("rangeValue").innerHTML = _i;

gVar.zoom = {s:1,e:_i, zoomStatus};
dataX = [];
for ( let iii = 1; iii < _i ; iii++ ){
    dataX.push(iii); // Math.floor(i/_interval));
    // dataXG.push(Math.floor(i/(_interval*5)));
    let ran1 = Math.random();
    let ran2 = Math.random();
    let ran3 = Math.random();
    let _l1 = Math.floor(ran1 * 400);
    let _l2 = Math.floor(ran2 * 400);
    let _l3 = Math.floor(ran3 * 400);
    let _tot = _l1 + _l2 + _l3;
    datal1.push(_l1);
    datal2.push(_l2);
    datal3.push(_l3);
    dataL_Total.push(_tot);
}
    // dataX = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];  // x-axis :) 
    dataXG = [1,2,3,4,5,6,7,8,9,10]; // x-axis :) 

    // dataL_Total = [1000,10010,1001,980,1023,899,455,1200,300,10,232,432,244,666]; // y-axis values Totals
    // datal1 = [151,242,353,264,115,36,645,374,493,2,55,3,77,55];
    // datal2 = [12,14,15,33,22,44,77,22,33,34,33,55,22,33,44];
    // datal3 = [34,866,333,700,600,345,333,1111,233,1,2,3,4,5];

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


}

function run(){

    button_stop = false;

    setHoverText();
    

    ip.P1  = document.getElementById('IP_P1').value; 
    ip.WTR = document.getElementById('IP_WTR').value; 

    if (ip.WTR != '' && !ip.WTR.includes('*')){
        wrapperW() ;
    }

        if (ip.P1 != '' && !ip.P1.includes('*')){
            document.getElementById('test').innerHTML = '';
        Init(); 

        if(e_start){
            e_start.style.opacity = 0 }; // hide Start
        if(e_stop){
            e_stop.style.opacity = 1 };  // Show Stop
        if(e_scan && e_scan.style){
            e_scan.style.opacity = 0 }; // hide Scan

        dataX = []; 
        dataXG = [];    
        dataL_Total = [];  
        datal1 = [];  
        datal2 = [];  
        datal3 = [];  
        dataT = []; // All entries of all graphs
        dataGas = [];
        dataGasPoint = [];
        iteration = 1;       
        wrapper() ;
        
    }else{

        document.getElementById('test').innerHTML = 'TESTDATA';
        // fake numbers insert
        fill_data_random();
       
        iteration = 1;       
        Ctx.clearRect(0, 0, w, h);
        CtxG.clearRect(0,0,wg,hg);
        drawLine();
        button_stop = true;
        writeNumbers_E( {
            'active_power_w': dataL_Total[dataL_Total.length-1],
            'active_power_l1_w': datal1[dataL_Total.length-1],
            'active_power_l2_w': datal2[dataL_Total.length-1],
            'active_power_l3_w': datal3[dataL_Total.length-1],
            'total_gas_m3': dataGasPoint[dataGasPoint.length-1],
            'total_power_export_t1_kwh' : 1234,
            'total_power_export_t2_kwh' : 0123,
            'total_power_import_t1_kwh' : 987,
            'total_power_import_t2_kwh' : 321
        }   )


    }
}

function stop(){
    button_stop = true;

    setHoverText();

    if(e_start){
        e_start.style.opacity = 1 }; // Show Start
     if(e_stop){
        e_stop.style.opacity = 0 }; // Hide Stop
    if(e_scan && e_scan.style){
        e_scan.style.opacity = 1 }; // Show Scan

}



async function meter(i){
    iteration = i;
    let url = 'http://' + ip.P1 + '/api/v1/data';
    let response = await fetch(url);

    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      let json = await response.json();

      if (isNaN(json.active_power_w))   { json.active_power_w    = 0};
      if (isNaN(json.active_power_l1_w)){ json.active_power_l1_w = 0};
      if (isNaN(json.active_power_l2_w)){ json.active_power_l2_w = 0};
      if (isNaN(json.active_power_l3_w)){ json.active_power_l3_w = 0};
      dataL_Total.push(json.active_power_w);
      datal1.push(json.active_power_l1_w);
      datal2.push(json.active_power_l2_w);
      datal3.push(json.active_power_l3_w);
      dataX.push(i);

// Write to Screen

    // Details
    // IP_P1
    document.getElementById('IP_P1_001').innerHTML      = ip.P1;                   // wifi_ssid :  WifiSSID
    document.getElementById('WifiSSID').innerHTML       = json.wifi_ssid;       // wifi_ssid :  WifiSSID
    document.getElementById('WifiStrength').innerHTML   = json.wifi_strength;   // wifi_strength : 
    document.getElementById('MM').innerHTML             = json.meter_model;     //meter_model
    document.getElementById('SV').innerHTML             = json.smr_version;     //smr_version: 
    
    // Electric
      writeNumbers_E(json);

    if(!zoomStatus){
        // Ctx.clearRect(0, 0, w, h);
        // CtxG.clearRect(0,0,wg,hg);
        // drawLine();
        
    }else{
        if(debug){console.log('pause')}

        // if(zoomStatus){
            // _e =  Math.floor( dataX.length * sliderPercentage ) ;
            // if(_e < 10){ _e = 10};
            // // document.getElementById("rangeValue").innerHTML = _e;
            // _s = _e - sliderPoints; //10
            // if (_s< 0){
            //     _s = 0;
            // }
            // Ctx.clearRect(0, 0, w, h);
            // CtxG.clearRect(0,0,wg,hg);
            // gVar.zoom = {s:_s,e:_e, zoomStatus: zoomStatus};
            // drawLine();
        // }
    }
    Ctx.clearRect(0, 0, w, h);
    CtxG.clearRect(0,0,wg,hg);
    drawLine();


        if( sliderPercentage == 1 ){
            document.getElementById("rangeValue").innerHTML = dataX.length }
    

    // Gas details
    if(json.gas_timestamp){
    
    // YYMMDDhhmmss
        let _stamp = json.gas_timestamp.toString();
        
        let hh = _stamp.substring(6,8)  ;
        let mm = _stamp.substring(8,10) ;
        let ss = _stamp.substring(10,12);

        let DD = _stamp.substring(4,6) ;
        let MM = _stamp.substring(2,4) ;
        let YY = _stamp.substring(0,2) ;
    
        let _time = hh + ':' + mm + ':' + ss;
        let _date = DD + '-' + MM + '-' + YY;

        // hh:mm:ss/YY-MM-DD
            _time = _time + '/' + _date;

        // Timestamp in seconds as number    
        // let _timestamp  = Number(ss) + Number(60*mm) + Number(3600*hh);
        let 
        // _timestamp = (new Date(Number('20'+ YY),MM,DD,hh,mm,ss,00)).getTime();
            _timestamp = (new Date('20'+ YY + '-' + MM + '-' + DD + 'T' + hh + ':' + mm + ':' + ss)).getTime();
            if(debug){console.log(  new Date(_timestamp) , _timestamp)};
            let _deltaGas   = 0;
            let _min        = 0;
            let _usage      = 0;

        // When have a first entrie...we want unique entris afterwards
  
        if (dataGasPoint.length != 0){
        // Is this entry unique now?    
        if (dataGasPoint[dataGasPoint.length-1][2]  != _timestamp || debug == true){
           // console.log(_string);
         if(debug){ console.log(hh,mm,ss,_time,_timestamp)};

         let _startGas = dataGasPoint[0][1];
         let _deltaSum = ( ( Math.floor( json.total_gas_m3 *1000) - Math.floor(_startGas * 1000) ) * 1000 ) / 1000;
 
            // String to screen
            // _string = _string + _time + ' : ' + json.total_gas_m3;
            //  _string = 'Time / Date      Gas      Delta l/min      FLow l/min. <br>';
            _string = _string + '<tr><th>' + _time + '</th>';
            // Save this unique timestamped Gas result to internal table
            //  dataGasPoint.push([_time, json.total_gas_m3, _timestamp])

            // When we have 2 or more entries saved...we can make some calculations
            if ( dataGasPoint.length > 0){
                 _deltaGas =  Math.floor( ( json.total_gas_m3*1000 -  dataGasPoint[dataGasPoint.length-1][1]*1000 ) *1000 ) / 1000;
                
                 _min    = (_timestamp - dataGasPoint[dataGasPoint.length-1][2]) /60000; // temp constant 
                 _string = _string +   '<th>' + json.total_gas_m3 +  '</th><th>' + _deltaSum + '</th><th>' + _deltaGas + '</th><th>' + Math.floor(_min*10)/10  + '</th>';

                if (_min != 0){
                 _usage = Math.round(_deltaGas * 100 / _min) / 100;
                 // console.log(dataGasPoint[dataGasPoint.length-1][2], dataGasPoint[dataGasPoint.length-2][2],_usage, _min)
                 _string = _string + '<th>'  + _usage  +  '</th>';
                }
            }
             _string = _string + '</tr>';

             dataGasPoint.push([_time, json.total_gas_m3, _timestamp, _deltaGas, _min, _usage])  
             dataXG.push(i);

            }
            dataGas.push([_time, json.total_gas_m3, _timestamp]) ; // perhaps not needed 

        }else{
            dataGas.push([_time, json.total_gas_m3, _timestamp]) ; // perhaps not needed
            dataGasPoint.push([_time, json.total_gas_m3, _timestamp, null, null, null]);
            dataXG.push(i);

            _string = _string + '<tr><th>' + _time + '<th>' + json.total_gas_m3 + '</th></tr>';
        }

        // let _string = '';
        // for (Gas of dataGas){   
        // _string = _string + Gas[0] + ' : ' + Gas[1] + '<br>';
        // }
        // document.getElementById('TimeGasM3').innerHTML = _string + '</table>';
        
        _k = object('#TimeGasM3') ;
        // console.log(_string);
        _k.innerHTML = _string ;

        //total_gas_m3 G0
    }

    // Water details
    // document.getElementById('IP_W1').innerHTML          = ip_W1;                   // wifi_ssid :  WifiSSID
    // if(json.active_liter_lpm){
    //     document.getElementById('AL').innerHTML = json.active_liter_lpm;   // active_liter_lpm	            Active water usage in liters per minute
    //     document.getElementById('TL').innerHTML = json.total_liter_m3;    // total_liter_m3	            Total water usage in cubic meters since installation
    // }else{
    //     document.getElementById('AL').innerHTML =  document.getElementById('TL').innerHTML = '';
    // }

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

async function meterW(iW){
    iterationW = iW;
    let url = 'http://' + ip.WTR + '/api/v1/data';
    let response = await fetch(url);

    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      let json = await response.json();

      dataL_Total.push(json.active_power_w);
 

    // Water details
    document.getElementById('IP_W1_001').innerHTML          = ip.WTR;                   // wifi_ssid :  WifiSSID
    if(json.active_liter_lpm){
        document.getElementById('AL').innerHTML = json.active_liter_lpm;   // active_liter_lpm	            Active water usage in liters per minute
        document.getElementById('TL').innerHTML = json.total_liter_m3;    // total_liter_m3	            Total water usage in cubic meters since installation
    }else{
        document.getElementById('AL').innerHTML =  document.getElementById('TL').innerHTML = '';
    }

    let _return = ( iW == max_seconds || button_stop );
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
  
      let deltas = delta_calc(dataL_Total);
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
    x = 60
    y = 1
    ctx.strokeStyle = "#a7a7a7"
    // Vertical lines left to right
    while(x < w){
        ctx.beginPath()
        ctx.moveTo(x,0)
        ctx.lineTo(x,h-30)
        ctx.stroke()
        x += 30
    }
    // Horizontal lines top to bottom
    while(y < h-30){
        ctx.beginPath()
        ctx.moveTo(60,y)
        ctx.lineTo(w,y)
        ctx.stroke()
        y += 30
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
    x = 60
    line = 30
    start = 0;
  
//     if(!zoomStatus){
//         _s = 0 ;
//         _e = dataX.length;
//    }else{ 
//         _s = gVar.zoom.s
//         _e = gVar.zoom.e
//    };
//      let A = [ dataL_Total, datal1, datal2, datal3];
//     MMU[0] = getMinMaxUn(A);

    // for(data of dataL_Total){
        for (let ix = _s; ix < _e; ix++) { 
            const data = dataL_Total[ix];

        y = 30; // offset
        y +=   ( ( MMU[0][1] - data ) / MMU[0][2] ) * line  ;

        ctx.lineTo(x,y)
        x += xs
    }
    ctx.stroke()
    
    chart.setStrokeStyle("#00FF00");
    ctx.lineWidth = 3
    ctx.beginPath()
    x = 60
    line = 30
    start = 0;// 30
  
    // for(data of datal1){
        for (let ix = _s; ix < _e; ix++) { 
            const data = datal1[ix];

        y = 30;
        y += ( ( MMU[0][1] - data ) / MMU[0][2] ) * line ;
        ctx.lineTo(x,y)
        x += xs
    }
    ctx.stroke()
   
    chart.setStrokeStyle("#d6d610");
    ctx.lineWidth = 3
    ctx.beginPath()
    x = 60
    line = 30
    start = 0 ;//30
    // for(data of datal2){
        for (let ix = _s; ix < _e; ix++) { 
            const data = datal2[ix];
        y = 30;
        y += ( ( MMU[0][1] - data ) / MMU[0][2] ) * line  ;   // max un
        ctx.lineTo(x,y)
        x += xs
    }
    ctx.stroke()

    chart.setStrokeStyle("#A020F0");// purple
    ctx.lineWidth = 3
    ctx.beginPath()
    x = 60
    line = 30
    start = 0 ; //30
    // for(data of datal3){
        for (let ix = _s; ix < _e; ix++) { 
            const data = datal3[ix];
        y = 30;
        y += ( ( MMU[0][1] - data ) / MMU[0][2] ) * line  ;
        ctx.lineTo(x,y)
        x += xs
    }
    ctx.stroke()
    ctx.restore()
},

drawG: function() {
    ctx.save()
    ctx.strokeStyle = "#0b95d3"  //"#03a9f4" 
    ctx.lineWidth = 3
    ctx.beginPath()
    x = 60
    line = 30;
            let datag = [];
            for (datagas of dataGasPoint){
                datag.push(datagas[5]); // datagas[1], datagas[3], 
            }

    //  MMU[1] = getMinMaxUn(datag);

    for(data of dataGasPoint){   //dataGas has second info, ...Point has unique points

        y = 30;
        // Diference between max and datapoint / unit(1/10 of height) and pixels/unit
        y +=  ( ( MMU[1][1] - data[5] ) / MMU[1][2] ) * line ;
        ctx.lineTo(x,y)
        x += xs
    }

    ctx.stroke()
    ctx.restore()
},

pointes: function() {

    // let A = [ dataL_Total, datal1, datal2, datal3];
    // MMU = getMinMaxUn(A);
    let _indexL = 0;
    ctx.fillStyle = "#0b95d3"
    x = 60
    line = 30;

//     if(!zoomStatus){
//         _s = 0 ;
//         _e = dataX.length;
//    }else{ 
//         _s = gVar.zoom.s
//         _e = gVar.zoom.e
//    };

    // for (data of dataL_Total) {
        for (let ix = _s; ix < _e; ix++) { 
            const data = dataL_Total[ix];

        this.points(data, dataL_Total, 'Tot.', _indexL);
        _indexL++;
    }

     _indexL = 0;
    ctx.fillStyle = "#00FF00" //green
    x = 60
    line = 30
    start = 30
    // for (data of datal1) {
        for (let ix = _s; ix < _e; ix++) { 
            const data = datal1[ix];

        this.points(data, datal1, 'l1', _indexL)
        _indexL++;
    }

    _indexL = 0;
    ctx.fillStyle = "#d6d610" //"#FFFF00" //yellow
    x = 60
    line = 30
    start = 30
    // for (data of datal2) {
        for (let ix = _s; ix < _e; ix++) { 
            const data = datal2[ix];
        this.points(data, datal2, 'l2', _indexL)
        _indexL++;
    }

    _indexL = 0;
    ctx.fillStyle = "#A020F0" // purple
    x = 60
    line = 30
    start = 30
    // for (data of datal3) {
        for (let ix = _s; ix < _e; ix++) { 
            const data = datal3[ix];
        this.points(data, datal3 ,'l3', _indexL)
        _indexL++;
    }
    ctx.fillStyle = "#00000F" 

    ctx.stroke()
},
points: function(d, dX, f, _indX){

y = 30;
y += (( MMU[0][1] - d ) / MMU[0][2] ) * line ;
chart.circle(x, y)
dataT.push({ d : Math.round(y) + "," + Math.round(x) +","+Math.round(d) +","+f +"," + MMU[0] + ',' + Number(_indX)})
x += xs;
},


pointesGas: function() {

    ctx.fillStyle = "#0b95d3"
    x = 60
    line = 30
    start = 30;

    // let datag = [];
    // for (datagas of dataGasPoint){
    //     datag.push(datagas[5]);
    // }
    // MMU = getMinMaxUn(datag);

    let _indexG = 0;
    for (data of dataGasPoint) {
        this.pointsGas(data[5], dataGasPoint, 'Gas', _indexG)
        _indexG++;
    }

    ctx.fillStyle = "#00000F" 

    ctx.stroke()
},
pointsGas: function(d, dX, f, _indG){

y = 30;
y += ( ( MMU[1][1] - d ) / MMU[1][2] ) * line ;
chart.circle(x, y)
dataT.push({ d : Math.round(y) + "," + Math.round(x) +","+ Math.round(d * 10)/10 +","+f + "," + MMU[1] + ',' + Number(_indG)})
x += xs ; // Every 5 minutes : should be
},

 data: function() {
    x = 60
    y = 30

    // let A = [ dataL_Total, datal1, datal2, datal3];
    // let maxArray = A.map(a => Math.max.apply(null, a));
    n = max;

    let _factor = 1;
    // let _length = dataX.length;
    //  _length = _e - _s ;
    //  console.log(_s,_e, _length);

     if (zoomStatus){
        _s =  gVar.zoom.s;
        _e =  gVar.zoom.e; 
        zoomStatus = gVar.zoom.zoomStatus;
        }else{
            _s = 0
            _e = dataX.length
        }

    _length = _e - _s ;
    if(debug){console.log(_s,_e, _length)};

    // for(xdata of dataX){
        let xi = 0;

// -------------------------------
             // Show in hours     
            if (_length > 24000){                             // 1h 2h 3h 4h 5h 6h
                    _factor = Math.floor(_length / 3600);
                    if (_factor < 3600){ _factor = 3600};
            }else 
             // Show in minutes 
            if (_length > 300){                           // 1m 2m 3m 4m 5m 6m
                _factor = Math.floor(_length / 60);
                if (_factor < 60){ _factor = 60};
            }else 
            if (_length > 20){
                 _factor = Math.floor(_length / 10);
                 if (_factor < 1){ _factor = 1};
            }else{

            }
// -------------------------------


        for (let ix = _s; ix < _e; ix++) { 
            const xdata = dataX[ix];

        ctx.font = "12px Arial";


            if ( xdata > 3600){
                if ((xi % _factor) == 0){
                    ctx.fillText(       ( Math.floor(       xdata/3600)) + ':' + 
                                leftPad(  Math.floor(     (  xdata - 3600 * ( Math.floor(xdata/3600)) /60) ), 2) + ':' +
                                leftPad(            (     (  xdata - ( 60 *   Math.floor(xdata/60)  ) ) % 60), 2 )
                                , x ,h-10) 
                                ; 
                }
            }else 
            if ( xdata > 60){

                if ((xi % _factor) == 0){
                    ctx.fillText(   ( Math.floor(           xdata/60)) + ':' + 
                                leftPad(            (     (  xdata - ( 60 * Math.floor(xdata/60)  ) ) % 60) ,2 ) 
                                , x ,h-10); 
                }

            }else{

                if ((xi % _factor) == 0){
                    ctx.fillText(xdata +'s', x ,h-10); 
                }

            }
// -------------------------------            

            if (debug){ 
                console.log(xdata, x, xs, xi, _factor)
                console.log(_factor)
            };

            x += xs;

    xi++
        
    }
    while(y < h-30){
        ctx.font = "11px Arial";
        ctx.fillText(n, 0,y+5);
        n = n -un
        y += 30
    }
    
},

dataGas: function() {
    x = 60
    y = 30
    n = max;

    for(xdata of dataXG){
        // for (let ix = _s; ix < _e; ix++) { 
        //     const xdata = dataXG[ix];

        ctx.font = "12px Arial";
        if (dataXG.length > 300){
            ctx.fillText(xdata*60, x +60*xs -xs ,h-10); 
            x += xs*60;
        }else
        if (dataXG.length > 140){
            ctx.fillText(xdata*20, x +20*xs -xs ,h-10); 
            x += xs*20;
        }else
        if (dataXG.length > 50){
            ctx.fillText(xdata*10, x +10*xs -xs ,h-10); 
            x += xs*10;
        }else
        if (dataXG.length > 20){
            ctx.fillText(xdata*5, x +5*xs - xs ,h-10); 
            x += xs*5;
        }else 
        if (dataXG.length > 10){
            ctx.fillText(xdata*2, x +2*xs - xs ,h-10); 
            x += xs*2;
        }else{
        ctx.fillText(xdata, x,h-10);
        x += xs;
        }
        
    }
    while(y < h-30){
        ctx.font = "11px Arial";
        ctx.fillText(n, 0,y+5);
        n = n -un
        n = Math.floor(n*100)/100;
        y += 30
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

function object(object){
    return document.querySelector(object);
}

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}

//  -- - - - - - - - - - - - - - - - - - - - - - - - - - - 

