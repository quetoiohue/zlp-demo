import QRCode from "qrcode"
import { ZaloPay } from "./zalopay"

const $amount = $("#amount")
const $description = $("#description")
const $paymentcode = $("#paymentcode")
const $payForm = $("#pay-form")
const $qrcontainer = $("#qrcontainer")
const $qrcode = document.querySelector("#qrcode")
const $web2appLink = $("#web2app-link")
const $loading = $("#loading")
const $bankcode = $("#bankcode")

function hideQRCode() {
  $qrcontainer.addClass("d-none")
}

function showQRCode(data) {
  $qrcontainer.removeClass("d-none")
  QRCode.toCanvas($qrcode, data)
}

function showLoading() {
  $loading.removeClass("d-none")
}

function hideLoading() {
  $loading.addClass("d-none")
}

;(function fetchBankList() {
  ZaloPay.GetBankList((bankList) => {
    bankList.forEach((bank) => {
      $bankcode.append(`
        <option value=${bank.bankcode}>${bank.name}</option>
      `)
    })
  })
})()

$payForm.submit(function (event) {
  event.preventDefault()

  if (+$amount.val() < 1000) {
    alert("The amount must be greater than 1000")
    return false
  }

  const params = {
    amount: $amount.val(),
    description: $description.val(),
  }
  const activeTab = $(".tab-pane.fade.active.show").attr("id")

  switch (activeTab) {
    case "gateway":
      params.bankcode = $bankcode.val()
      ZaloPay.Gateway(params, function (data) {
        const anchor = document.createElement("a")
        anchor.href = data
        anchor.click()
      })
      break
    case "quickpay":
      params.paymentcodeRaw = $paymentcode.val() // ex: aoSCLACtsQM5g5blVNLgEBBBIz8KNg+Pz0LbcdhX8AoQR TWGEH/BrbHG8rIkNo3JIpOc7U7na0CZQ+HU8Zwhgw==

      showLoading()
      ZaloPay.QuickPay(params, function (data) {
        alert("Thanh toan thanh cong")
        ZaloPay.ListenCallback(data.apptransid, hideLoading)
      })
      break
    default:
      ZaloPay.QRPay(params, function (data) {
        showQRCode(data.orderurl)
        $web2appLink.attr("href", data.orderurl)
        ZaloPay.ListenCallback(data.apptransid)
      })
      break
  }
})
