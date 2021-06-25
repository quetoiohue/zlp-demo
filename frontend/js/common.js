export const HOST = "http://localhost:4000"

export const APIs = {
  QR: HOST + "/api/createorder?ordertype=createorder",
  GATEWAY: HOST + "/api/createorder?ordertype=gateway",
  QUICKPAY: HOST + "/api/createorder?ordertype=quickpay",
  GETBANKLIST: HOST + "/api/getbanklist",
  GETORDERSTATUS: HOST + "/api/getorderstatus",
  GETREFUNDSTATUS: HOST + "/api/getrefundstatus",
  REFUND: HOST + "/api/refund",
  GETHISTORY: HOST + "/api/gethistory",
  SUBSCRIBE: HOST.replace("http", "ws") + "/subscribe",
}

export const postJSON = (url, data = {}, done, fail) => {
  return $.post(url, data)
    .done((res) => done(res))
    .fail((error) => alert("Payment fail", error))
}

export const getJSON = (url, done, fail) => {
  return $.get(url)
    .done((res) => done(res))
    .fail((error) => alert("Request fail", error))
}
