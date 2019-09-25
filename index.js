"use strict"
const line = require("@line/bot-sdk")
const express = require("express")
const config = require("./config.json")
const client = new line.Client(config)

async function handleEvent(event) {
  switch (event.type) {
    case "beacon":
      const dm = `${Buffer.from(event.beacon.dm || "", "hex").toString("utf8")}`
      const beaconText = `${event.beacon.type} beacon hwid : ${
        event.beacon.hwid
        } with device message = ${dm}`
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: beaconText
      })

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`)
  }
}

const app = express()
const port = Number(config.port) || 5555


app.post("/webhook", line.middleware(config), (req, res) => {
  console.log('request')
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end()
  }
  Promise.all(
    req.body.events.map(event => {
      console.log("event", event)
      if (event.source.userId === "Udeadbeefdeadbeefdeadbeefdeadbeef") {
        return
      }
      return handleEvent(event)
    })
  )
    .then(() => res.end())
    .catch(err => {
      console.error(err)
      res.status(500).end()
    })
})

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
