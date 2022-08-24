/* 
  Sketch to transport analog values for testing purposes. Sensor can be attached and
  modified accordingly to transport data to Linux layer. This is to be used as a reference sketch
  and can be adapted to required design specification on communicating M4 to Linux layer on
  Portenta X8.
*/

#include <RPC.h>
#include <SerialRPC.h>

const long interval = 1000;
unsigned long previousMillis = 0;

void setup(){
    pinMode(PA_12, INPUT);
    //RPC.begin();

    Serial.begin(115200);
    while (!Serial) {}

    Serial.println("M4 Layer - Multi Protocol Gateway");
    
    RPC.bind("Data_0", []{ return analogRead(A0); });
    RPC.bind("Data_1", []{ return analogRead(A1); });

    Serial.println("Service Begin");
}

void loop(){
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    //record random value from A0 and A1
    Serial.println(analogRead(A0));
    Serial.println(analogRead(A1));

  }
}
