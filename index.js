

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion());
var BACKEND_URL = 'http://192.168.2.4:3000';

var clientio = require('socket.io-client')(BACKEND_URL);
var client    = clientio.connect(BACKEND_URL);

var configMoisture = 69;
var configuration = {
    moisture: 50
};

client.on('connect', function(){

    console.log('                connected to backend');

    client.on('backend:configuration', function(data) {
        console.log('               ' + data.moisture);
        configuration.moisture = data.moisture;
        configMoisture = data.moisture;
        myOnboardLed.write(ledState?1:0);
        ledState = !ledState; //invert the ledState
    });

});

// initialize OnBoard LED
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

// initialize sensors
var waterSensorA = new mraa.Aio(0);
var waterLevel = waterSensorA.read();
var soilSensorA = new mraa.Aio(1);
var moisture = soilSensorA.read();

//initialize actors
var relayD = new mraa.Gpio(8);
relayD.dir(mraa.DIR_OUT);


periodicActivity(); //call the periodicActivity function

function periodicActivity()
{
    readSensorValues();
    printSerial();
    checkToWater();

    setTimeout(periodicActivity,500); //milliseconds
}

function checkToWater()
{
    //moisture      trocken 0 -> 100 nass
    //waterLevel    leer    0 -> 100 voll
    if (moisture < configMoisture && waterLevel > 10) {
        relayD.write(0);
        console.log('               start watering -> ON');
    } else {
        relayD.write(1);
    }
}

function readSensorValues()
{
    moisture = 100 - Math.round((soilSensorA.read() - 250) / 4.5);
    if (moisture > 100) 
        moisture = 100;
    waterLevel = Math.round(waterSensorA.read() / 7);
    if (waterLevel > 100)
        waterLevel = 100;
    clientEmit();
}

function clientEmit()
{
    client.emit('sensor:waterlevel', {value: waterLevel});
    client.emit('sensor:moisture', {value: moisture});
}

function printSerial()
{
    console.log('water level = ' + waterLevel);
    console.log('moisture = ' + moisture);
    console.log('configMoisture = ' + configMoisture);
    console.log('');
}
