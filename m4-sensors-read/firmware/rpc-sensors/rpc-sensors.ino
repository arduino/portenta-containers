#include <RPC.h>
#include <SerialRPC.h>

/*
  Tested with arduino-91.4 and mbed portenta 4.1.5.
  This is a fake BME680 sensor example over rpc.
  We implement several rpc stubs which will answer with the same (fixed)
  data over and over. It works great as a real use-case for sensor acquisition
  from M4 over RPC protocol on the Portenta-X8 without the need to actually wire the
  sensors over I2C.
*/

void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.begin(115200);
  //while (!Serial){};
  Serial.println("Fake BME680 test on M4");
  RPC.begin();
  Serial.println("Registering rpc calls...");
  RPC.bind("temperature", []{ return 100; });
  RPC.bind("humidity", []{ return 200; });
  RPC.bind("pressure", []{ return 300; });
  RPC.bind("gas", []{ return 400; });
  RPC.bind("altitude", []{ return 500; });
  /*if (RPC.cpu_id() == CM7_CPUID) {
    // Introduce a brief delay to allow the M4 sufficient time
    // to bind remote functions before invoking them.
    delay(100);
  }*/
  spettacolino();
  Serial.println("Finished Init");
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
  for(int i=0; i<6; i++) {
    digitalWrite(LED_BUILTIN, LOW);
    delay(800);
    digitalWrite(LED_BUILTIN, HIGH);
    delay(200);
  }
  digitalWrite(LED_BUILTIN, LOW);
}
