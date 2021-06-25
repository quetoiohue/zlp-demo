const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const expressWS = require("express-ws")
require("dotenv").config()

const sequelize = require("./provider/sequelize")
const ZaloPay = require("./zalopay")

const app = express()
const PORT = 4000

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("Welcome zlp demo")
})
app.use("/api", require("./routes"))

expressWS(app)
const hub = new Map()

app.ws("/subscribe", function (ws, req) {
  const { apptransid } = req.query
  hub.set(apptransid, ws)
  ws.on("close", () => {
    hub.delete(apptransid)
  })
})
app.post("/callback", (req, res) => {
  console.log(">>>>>>> callback", req.body)
  const { mac, ...params } = req.body
  const dataStr = JSON.stringify(params)
  const result = ZaloPay.VerifyCallback(dataStr, mac)

  if (result.returncode !== -1) {
    const data = JSON.parse(dataStr)
    const { apptransid } = data
    hub.get(apptransid).send(dataStr)
    OrderRespository.SaveOrder(data)
  }

  res.send(result)
})

app.listen(PORT, () => console.log(`Server's listening port ${PORT}...`))
