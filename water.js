/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
A simple node.js application intended to blink the onboard LED on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.
*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console
console.log('Hallöchen, lest start our project :) ');

//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

// inititialize sensors
var soilSensorD = new mraa.Gpio(7);
soilSensorD.dir(mraa.DIR_IN);
var waterSensorA = new mraa.Aio(0);
var waterLevel = waterSensorA.read();
var soilSensorA = new mraa.Aio(1);
var soilLevel = soilSensorA.read();

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
    
    setTimeout(periodicActivity,3000); //call the indicated function after 1 second (1000 milliseconds)
}

function checkToWater()
{
    if (soilLevel > 600 && waterLevel > 220) {
        relayD.write(0);
        console.log('soilLevel > 600 && waterLevel < 1000  -> ON');
    } else {
        relayD.write(1);
    }
}

function readSensorValues()
{
    readSoilMoisture();
    readWaterLevel();
}

function readSoilMoisture()
{
    soilLevel = soilSensorA.read();
}

function readWaterLevel()
{
    waterLevel = waterSensorA.read();
}

function printSerial()
{
    console.log('soil level = ' + soilLevel);
    console.log('water level = ' + waterLevel);
}