import { APIs, getJSON, postJSON } from "./common"

export class ZaloPay {
  static ListenCallback(apptransid, cb) {
    const ws = new WebSocket(APIs.SUBSCRIBE + "?apptransid=" + apptransid)

    ws.onopen = (e) => {
      console.log("ws opened", apptransid)
    }
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      console.log("ws onmessage", e, e.data)
      cb(data)
    }
    ws.onclose = (e) => {
      console.log("ws onclose", e)
    }
  }

  static Pay(url, params = {}, done) {
    return postJSON(url, params, done, () => {
      alert("Thanh toan that bai")
    })
  }

  static QRPay(params, done) {
    ZaloPay.Pay(APIs.QR, params, done)
  }

  static Gateway(params, done) {
    ZaloPay.Pay(APIs.GATEWAY, params, done)
  }

  static QuickPay(params, done) {
    ZaloPay.Pay(APIs.QUICKPAY, params, done)
  }

  static GetBankList(done) {
    return getJSON(
      APIs.GETBANKLIST,
      (data) => {
        const { banks } = data
        const bankList = []

        for (let id in banks) {
          const bankListOfId = banks[id]

          for (let bank of bankListOfId) {
            bankList.push(bank)
          }
        }

        done(bankList)
      },
      () => {
        alert("Thanh toan that bai")
      }
    )
  }
}
