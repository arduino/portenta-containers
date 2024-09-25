#include <RPC.h>
#include <SerialRPC.h>
#include <Wire.h>

void setup()
{
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.println("BME680 test on M4");
    Wire.begin();

    Serial.println("Trying to find sensor...");
    
    //RPC.bind("status", []{ return bme.sensorID() == 0x60; });
    RPC.bind("temperature", []{ return 100; });
    RPC.bind("humidity", []{ return 200; });
    RPC.bind("pressure", []{ return 300; });
    RPC.bind("gas", []{ return 400; });
    RPC.bind("altitude", []{ return 500; });

    Serial.println("Starting");
    spettacolino();
}

void loop()
{
  Serial.print("Temperature = ");
  Serial.print(100);
  Serial.println(" *C");

  Serial.print("Pressure = ");
  Serial.print(200);
  Serial.println(" hPa");

  Serial.print("Humidity = ");
  Serial.print(300);
  Serial.println(" %");

  Serial.print("Gas = ");
  Serial.print(400);
  Serial.println(" KOhms");

  Serial.print("Approx. Altitude = ");
  Serial.print(500);
  Serial.println(" m");

  Serial.println();

  delay(1000);
}

void spettacolino() {
  for(i=0; i<6; i++) {
    digitalWrite(LED_BUILTIN, LOW);
    delay(800);
    digitalWrite(LED_BUILTIN, HIGH);
    delay(200);
  }
  digitalWrite(LED_BUILTIN, LOW);
}
