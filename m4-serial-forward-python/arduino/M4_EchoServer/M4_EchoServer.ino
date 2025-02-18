#include <RPC.h>
#include <SerialRPC.h>

void setup()
{
    Serial.begin(115200);

    delay(2500);

    Serial.println("Welcome to the X8 Echo Server");

    Serial.println("Starting");
}

int i = 0;

void loop()
{
    if (millis() % 1000 == 0) {
        Serial.println("loop");
        delay(2);
    }

    String str = "";
    while (Serial.available()) {
        str += (char)Serial.read();
    }

    if (str.startsWith("status")) {
        digitalWrite(LED_BUILTIN, HIGH);
        delay(250);
        digitalWrite(LED_BUILTIN, LOW);
    }

    if (str.startsWith("echo")) {
        RPC.send("echo", "test");
    }
}
