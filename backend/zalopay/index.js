const fs = require("fs")
const NodeRSA = require("node-rsa")
const CryptoJS = require("crypto-js")
const moment = require("moment")

const Ngrok = require("../utils/ngrok")
const config = require("../config.json")
const Crypto = require("./Crypto")
const { default: axios } = require("axios")
const OrderRepository = require("../repository/OrderRepository")

const publicKey = fs.readFileSync("publickey.pem", "utf-8")
const rsa = new NodeRSA(publicKey, {
  encryptionScheme: "pkcs1",
})

let uid = Date.now()

class ZaloPay {
  constructor() {
    const self = this
    Ngrok.GetPublicURL().then((publicURL) => {
      self.publicURL = publicURL
    })
  }

  VerifyCallback(data, requestMac) {
    const result = {}
    const mac = CryptoJS.HmacSHA256(data, config.key2).toString()
    console.log({ data, requestMac })
    if (requestMac !== mac) {
      result.returncode = -1
      result.returnmessage = "mac not match"
    } else {
      result.returncode = 1
      result.returnmessage = "success"
    }

    return result
  }

  GenTransID() {
    return `${moment().format("YYMMDD")}_${config.appid}_${++uid}`
  }

  NewOrder({ amount, description }) {
    const self = this
    console.log(self.publicURL + "/callback")
    return {
      amount,
      description,
      appid: config.appid,
      appuser: "Demo",
      embeddata: JSON.stringify({
        forward_callback: self.publicURL + "/callback",
        description,
      }),
      item: JSON.stringify([{ name: "Demo item", amount }]),
      apptime: Date.now(),
      apptransid: this.GenTransID(),
    }
  }

  async InvokeCallback(order) {
    const { forward_callback } = JSON.parse(order.embeddata)
    const res = await axios.post(forward_callback, order)

    OrderRepository.SaveOrder(order)
    return res
  }

  async CreateOrder(params = {}) {
    const self = this
    const order = this.NewOrder(params)
    order.mac = Crypto.Mac.CreateOrder(order)

    const { data: result } = await axios.post(config.api.createorder, null, {
      params: order,
    })
    await self.InvokeCallback(order)

    result.apptransid = order.apptransid
    return result
  }

  Gateway(params = {}) {
    const order = this.NewOrder(params)
    order.mac = Crypto.Mac.CreateOrder(order)

    const orderJSON = JSON.stringify(order)
    const b64Order = Buffer.from(orderJSON).toString("base64")
    return config.api.gateway + encodeURIComponent(b64Order)
  }

  async QuickPay(params = {}) {
    const order = this.NewOrder(params)
    order.userip = "127.0.0.1"
    order.paymentcode = rsa.encrypt(params.paymentcodeRaw, "base64")
    order.mac = Crypto.Mac.QuickPay(order, params.paymentcodeRaw)

    const { data: result } = await axios.post(config.api.quickpay, null, {
      params: order,
    })

    result.apptransid = order.apptransid
    return result
  }

  async GetOrderStatus(apptransid = "") {
    const params = {
      appid: config.appid,
      apptransid,
    }
    params.mac = Crypto.Mac.GetOrderStatus(params)

    const { data: result } = await axios.post(config.api.getorderstatus, null, {
      params,
    })

    return result
  }

  async Refund({ zptransid, amount, description }) {
    const refundReq = {
      appid: config.appid,
      amount,
      zptransid,
      description,
      timestamp: Date.now(),
      mrefundid: this.GenTransID(),
    }

    refundReq.mac = Crypto.Mac.Refund(refundReq)

    const { data: result } = await axios.post(config.api.refund, null, {
      params: refundReq,
    })
    result.mrefundid = refundReq.mrefundid

    return result
  }

  async GetRefundStatus(mrefundid) {
    const params = {
      appid: config.appid,
      mrefundid,
      timestamp: Date.now(),
    }

    params.mac = Crypto.Mac.GetRefundStatus(params)

    const { data: result } = await axios.post(
      config.api.getrefundstatus,
      null,
      {
        params,
      }
    )

    return result
  }

  async GetBankList() {
    const params = {
      appid: config.appid,
      reqtime: Date.now(),
    }

    params.mac = Crypto.Mac.GetBankList(params)

    const { data: result } = await axios.post(config.api.getbanklist, null, {
      params,
    })

    return result
  }
}

module.exports = new ZaloPay()
