#include <RPC.h>
#include <SerialRPC.h>
#include <Wire.h>

#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>

Adafruit_BME280 bme;

void setup()
{
    pinMode(PA_12, INPUT);

    // RPC.begin();

    Serial.begin(115200);

    Serial.println("BME280 test on M4");
    Wire.begin();

    for (auto status = bme.begin(); !status; delay(250)) {
        Serial.println("Could not find a valid BME280 sensor, check wiring, address, sensor ID!");
        Serial.print("SensorID was: 0x");
        Serial.println(bme.sensorID(), 16);
    }


    RPC.bind("status", []{ return bme.sensorID() == 0x60; });
    RPC.bind("temperature", []{ return bme.readTemperature(); });
    RPC.bind("humidity", []{ return bme.readHumidity(); });
    RPC.bind("pressure", []{ return bme.readPressure() / 100.0F; });

    Serial.println("Starting");
}

void loop()
{
    delay(10);
}
