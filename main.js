// Author: Edwin Glaser
// --------  Only for private usage -----------
// Date Nov. 2022
// HomeWizard P1 

// active_power_l1_w : 
// active_power_l2_w : 
// active_power_l3_w : 
// active_power_w : 
// gas_timestamp : 
// meter_model: "ISKRA 2M550T-1013"
// smr_version: 50
// total_gas_m3: 
// total_power_export_t1_kwh: 
// total_power_export_t2_kwh: 
// total_power_import_t1_kwh : 
// total_power_import_t2_kwh : 
// wifi_ssid : "..."
// wifi_strength : 100

document.getElementById('IP').value = ' 192.168.2.45';

var ip ;

async function wrapper(){
    console.log('start');
    await waitInterval( meter, 1000);
    // await waitInterval(second, 1000);
    console.log('finish');
};

function run(){
    ip = document.getElementById('IP').value; 
        if (ip != ''){
        wrapper() }
    }



async function meter(i){
    let url = 'http://' + ip + '/api/v1/data';
    let response = await fetch(url);

    if (response.ok) { // if HTTP-status is 200-299
      // get the response body (the method explained below)
      let json = await response.json();

    // wifi_ssid :  WifiSSID
    document.getElementById('WifiSSID').innerHTML = json.wifi_ssid;
    // wifi_strength : 
    document.getElementById('WifiStrength').innerHTML = json.wifi_strength;

      //meter_model
      document.getElementById('P1').innerHTML = json.active_power_l1_w;
      if(json.active_power_l2_w){
      document.getElementById('P2').innerHTML = json.active_power_l2_w} else{
        document.getElementById('P2').innerHTML = '';
      }
      if(json.active_power_l3_w){
      document.getElementById('P3').innerHTML = json.active_power_l3_w }else{
        document.getElementById('P3').innerHTML = '';
      };
      document.getElementById('PT').innerHTML = json.active_power_w;

  

    // total_power_export_t1_kwh:  
    document.getElementById('ET1').innerHTML = json.total_power_export_t1_kwh;
    // total_power_export_t2_kwh: 
    document.getElementById('ET2').innerHTML = json.total_power_export_t2_kwh;
    // total_power_import_t1_kwh : 
    document.getElementById('IT1').innerHTML = json.total_power_import_t1_kwh;
    // total_power_import_t2_kwh :
    document.getElementById('IT2').innerHTML = json.total_power_import_t2_kwh;

    //gas_timestamp GTS
    if(json.gas_timestamp){
    var date = new Date(json.gas_timestamp);

    // console.log(date.getTime())
    // console.log(date)
    let time = date.getTime();

    document.getElementById('GTS').innerHTML = date; //time;
    //total_gas_m3 G0
    document.getElementById('G0').innerHTML = json.total_gas_m3;
    }

    return i == 60;

    } else {
      alert("HTTP-Error: " + response.status);
    }

}


async function waitInterval(callback, ms) {
    return new Promise(resolve => {
        let iteration = 0;
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


