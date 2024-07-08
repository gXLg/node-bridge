# node-bridge
A Node.js script to manage Cloudflare tunnels for multiple domains on a single server.

# Setup

1. Clone this repo
2. Install dependencies using `npm install`
3. Install `cloudflared` on your system
4. Login using `cloudflared tunnel login` and choose any zone you own
5. Create `cloudflare.json` with following data:
```
{
  "api_key": <CLOUDFLARE API KEY>,
  "email": <CLOUDFLARE ACCOUNT EMAIL>
}
```
# Servers

You can add servers in the `servers/` directory.
Each server will need to have a config file
`node-brigde.json` with following data:
```
{
  "record": <DNS RECORD TO USE>,
  "run": <COMMAND TO RUN YOUR SERVER>,
  "stop": <COMMAND TO STOP THE SERVER>
}
```

## Record

The record is a DNS, including domains and subdomains.
For example you can use `example.org`, `another.example.com`, etc.

## Run

The command should be an array of arguments.
Since `node-bridge` automatically assigns ports starting at `18000`,
you will have to implement your server to run on
a port specified in the argumnents.
The pattern `{port}` will be replaced with the
port, `node-bridge` picks our for your server.

Example:
```
{
  "run": ["python", "-m", "http.server", "-d", ".", "--bind", "127.0.0.1", "{port}"]
}
```

## Stop

The command should be an array of arguments.
The pattern `{pid}` will be replaced with the
process ID of the server's job.
If `stop` is not specified or is `null`, `SIGINT`
will be sent directly to the server's job.

Example:
```
{
  "stop": ["screen", "-S", "{pid}", "-X", "stuff", "^D"]
}
```


# Running

Run the setup using `node .`

To exit, press `Ctrl+C`
