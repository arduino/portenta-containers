http://portenta-x8-1a38aa09dab6fad9.local:8888/lab?token=c8a0a63534c3eac9404312b99f48079ca5dca533abd2b320

```
m4_proxy_rpc = rpc.Address('m4-proxy', 5001)
client = rpc.Client(m4_proxy_rpc)
client.call('status')
```

