/*
    An example of interaction with an InfluxDB database using ArduinoHttpClient
*/

#include <ArduinoHttpClient.h>
#include <Arduino_ConnectionHandler.h>
#include <WiFiNINA.h>

constexpr auto deviceName { "RP2040" };

#include "arduino_secrets.h"

// Add secrets on arduino_secrets.h or build the sketch with the arduino-cli using
// --build-property 'compiler.cpp.extra_flags=-DSECRET_SSID="Your WiFi Name" -DSECRET_PASS="Your WiFi Password"'
WiFiConnectionHandler connMan(SECRET_SSID, SECRET_PASS);

// RECOMMENDED: generate a dedicated API token from the InfluxDB CLI or Dashboard
// InfluxDB v2 server or cloud API token (Use: InfluxDB UI -> Data -> API Tokens -> <select token>)
// Add the token to arduino_secrets.h or add/use the extra_flags
// -DSECRET_SSID="Your InfluxDB API Token"
constexpr auto InfluxDB_Token { INFLUXDB_TOKEN };

// Get Org and Bucket from your setup
// InfluxDB v2 organization id (Use: InfluxDB UI -> User -> About -> Common Ids )
constexpr auto InfluxDB_Org { "arduino" };

// InfluxDB v2 bucket name (Use: InfluxDB UI ->  Data -> Buckets)
constexpr auto InfluxDB_Bucket { "x8-iot" };

// Get the public-facing IP address of the InfluxDB server
constexpr auto influxDbAddress { "192.168.1.111" };
constexpr auto influxDbPort { 8086u };

WiFiClient tcpClient;
HttpClient httpClient(tcpClient, influxDbAddress, influxDbPort);

auto postNow { 0ul };
constexpr auto postInterval { 1ul * 1000 };

void setup()
{
    Serial.begin(115200);

    for (const auto timeout = millis() + 2500; !Serial && millis() < timeout; delay(250))
        ;

    connMan.addCallback(NetworkConnectionEvent::CONNECTED, onNetworkConnect);
    connMan.addCallback(NetworkConnectionEvent::DISCONNECTED, onNetworkDisconnect);
    connMan.addCallback(NetworkConnectionEvent::ERROR, onNetworkError);

}

void loop()
{
    const auto status = connMan.check();

    if (status == NetworkConnectionState::CONNECTED && millis() > postNow) {
        writePoint();
        postNow = millis() + postInterval;
    }
}

void writePoint()
{
    // Refer to https://docs.influxdata.com/influxdb/v2.1/write-data/developer-tools/api/
    // and https://docs.influxdata.com/influxdb/v2.1/api/#operation/PostWrite
    // for further documentation
    
    constexpr auto InfluxDB_WritePath { "/api/v2/write" };

    const auto timestamp = WiFi.getTime();
    if (timestamp == 0)
        return;

    Serial.print("[Writing Point] - ");

    String queryString;
    queryString += "?org=";
    queryString += InfluxDB_Org;
    queryString += "&bucket=";
    queryString += InfluxDB_Bucket;
    queryString += "&precision=s"; // 1 second precision

    String fullPath;
    fullPath += InfluxDB_WritePath;
    fullPath += queryString;

    // Serial.println(fullPath);

    // String buffer for Line Protocol data
    // Docs: https://docs.influxdata.com/influxdb/v2.1/reference/syntax/line-protocol/
    String postData;

    // Measurement (Required)
    postData += "wifi_status";

    // Tags (Optional)
    postData += ",device=";
    postData += deviceName;
    postData += ",SSID=";
    postData += WiFi.SSID();

    // Fields and Values (Required)
    postData += " ";
    postData += "rssi=";
    postData += WiFi.RSSI();
    postData += "i";

    // Timestamp (Optional)
    postData += " ";
    postData += timestamp;

    Serial.print(postData);

    httpClient.beginRequest();
    httpClient.post(fullPath);

    httpClient.sendHeader("Content-Length", postData.length());
    httpClient.sendHeader("Content-Type", "text/plain; charset=utf-8");
    httpClient.sendHeader("Accept", "application/json");

    String authHeader = "Token ";
    authHeader += InfluxDB_Token;
    httpClient.sendHeader("Authorization", authHeader);

    httpClient.beginBody();
    httpClient.print(postData);
    httpClient.endRequest();

    const auto statusCode = httpClient.responseStatusCode();
    const auto response = httpClient.responseBody();

    Serial.print(" - [Status: ");
    Serial.print(statusCode);
    Serial.println("]");
    if (response.length() > 0) {
        Serial.print("Response: ");
        Serial.println(response);
    }

    httpClient.stop();
}

void onNetworkConnect()
{
    Serial.println(">>>> CONNECTED to network");
}

void onNetworkDisconnect()
{
    Serial.println(">>>> DISCONNECTED from network");
}

void onNetworkError()
{
    Serial.println(">>>> ERROR");
}
