

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

const BACKEND_URL = 'http://192.168.2.2:3000';

var clientio = require('socket.io-client')(BACKEND_URL);
var client    = clientio.connect(BACKEND_URL);


var

client.on('connect', function(){

    console.log('connected to backend');

    client.on('backend:configuration', function(data) {

    });
});

//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

// inititialize sensors
var soilSensorD = new mraa.Gpio(7);
soilSensorD.dir(mraa.DIR_IN);
var waterSensorA = new mraa.Aio(0);
var waterLevel = waterSensorA.read();
var waterLevelNormalized = 0;
var soilSensorA = new mraa.Aio(1);
var moisture = soilSensorA.read();
var moistureNormalized = 0;

//initialize actors
var relayD = new mraa.Gpio(8);
relayD.dir(mraa.DIR_OUT);


periodicActivity(); //call the periodicActivity function

function periodicActivity()
{
    //relayD.write(1);
    myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
    ledState = !ledState; //invert the ledState

    readSensorValues();
    printSerial();
    checkToWater();

    setTimeout(periodicActivity,1000); //milliseconds
}

function checkToWater()
{
    if (moisture > 600 && waterLevel > 220) {
        relayD.write(0);
        console.log('moisture > 600 && waterLevel < 1000  -> ON');
    } else {
        relayD.write(1);
    }
}

function readSensorValues()
{
    readSoilMoisture();
    readWaterLevel();
    clientEmit()
}

function readSoilMoisture()
{
    moisture = soilSensorA.read();
}

function readWaterLevel()
{
    waterLevel = waterSensorA.read();
}

function clientEmit()
{
    waterLevelNormalized = Math.round(0.15 * waterLevel);
    moistureNormalized = Math.round(1 * moisture);
    client.emit('sensor:waterlevel', {value: waterLevelNormalized});
    client.emit('sensor:moisture', {value: moistureNormalized});
    console.log('round water = ' + waterLevelNormalized);
}

function printSerial()
{
    console.log('moisture = ' + moisture);
    console.log('water level = ' + waterLevel);
}
