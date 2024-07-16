# node-bridge
A Node.js script to manage Cloudflare tunnels
for multiple hostnames on a single server.


# Setup
1. Clone this repo
2. Install dependencies using `npm install`
3. Install `cloudflared` on your system
4. Login using `cloudflared tunnel login` and choose any zone you own
5. Setup [`config.json`](#Config)


# Config
The config file is located in the root folder
and is named `config.json`, it has following options:

## Api Key
* Name: `api_key`
* Required: yes
* Description: Cloudflare API key

## Email
* Name: `email`
* Required: yes
* Description: Cloudflare account Email

## Binary
* Name: `binary`
* Required: no
* Description: custom path to the cloudflared binary

## Protocol
* Name: `protocol`
* Required: no
* Description: [cloudflared tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/tunnel-run-parameters/#protocol)


# Tunnel
This script will automatically create a tunnel,
configure it and the records for all hostnames and run it.
It uses my old project [`namae`](https://github.com/gXLg/namae)
to generate a unique funny name for the tunnel.


# Servers
You can add servers in the `servers/` directory.
Each server will need to have a config file
`node-brigde.json` with following data:
```
{
  "record": <HOSTNAME TO USE>,
  "run": <COMMAND TO RUN YOUR SERVER>,
  "stop": <COMMAND TO STOP THE SERVER>,
  "plugins": <PLUGINS TO APPLY ON STARTUP>
}
```

## Record
The record is a hostname, including domains and subdomains.
For example you can use `example.org`, `another.example.com`, etc.
The script will automatically install a CNAME record on that
hostname if you own the domain.

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
  "stop": ["screen", "-S", "python-screen", "-X", "stuff", "^C"]
}
```

## Plugins
Plugins can simplify writing your `run` and `stop` commands.
Plugins are specified as an array and applied in the same order
as they were listed in the config.

Each plugin receives the current configuration and modifies it,
the final configuration is used for starting and stopping the server.

Plugins modify only `run` and `stop` configs, but can also use
`record` for internal processing.

### Shell
Shell plugin takes `run` as a string and returns `["sh", "-c", run]`,
therefore simplifying the process of writing the `run` command.

Example:
```
{
  "run": "python -m http.server -d . --bind 127.0.0.1 {port}",
  "plugins": ["shell"]
}
```

If your OS does not provide `sh`, you can not use this plugin.

### Screen
Screen plugin wraps your `run` command into a detached `screen`
with the name `node-bridge (<record>)`.
It additionally specifies the `stop` command, which will send
`Ctrl-C` to this screen. Useful together with the `shell` plugin.

Example:
```
{
  "record": "example.com",
  "run": "npx nodemon -w index.js . {port}",
  "plugins": ["shell", "screen"]
}
```
This will result in the config:
```
{
  "record": "example.com",
  "run": ["screen", "-dmS", "node-bridge (example.com)", "--", "sh", "-c", "npx nodemon -w index.js . {port}"],
  "stop": ["screen", "-S", "node-bridge (example.com)", "-X", "stuff", "^C"]
}
```

In order to use this plugin, external tool `screen` must be installed.

### Nodemon
Uses default run config for `nodemon`:
```
{
  "plugins": ["nodemon"]
}
```
This will result in:
```
{
  "run": ["npx", "nodemon", "-w", "index.js", ".", "{port}"]
}
```

In order to use this plugin, external node package `nodemon` must be installed.

## Processes
Any process run from the script may produce output on stdout or stderr.
This output is not captured, and if any errors occur, there will be no sign
about it. Before running `node-bridge`, please make sure, that all the
run and stop commands are actually working. If you want to see the output,
you might want to redirect it to somewhere else, for example, using the `screen` plugin
or the `tee` command.


# Running
Run the setup using `node .`

To exit, press `Ctrl+C`
