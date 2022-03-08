from(bucket: "x8-iot")
  |> range(start: -5m)
  |> filter(fn: (r) => r["_measurement"] == "wifi_status")
  |> filter(fn: (r) => r["_field"] == "rssi")
  |> group(columns: ["device"])
  |> aggregateWindow(every: 5s, fn: last, createEmpty: false)
  |> yield(name: "mean")