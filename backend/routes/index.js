const router = require("express-promise-router")()
const ZaloPay = require("../zalopay")
const OrderRepository = require("../repository/OrderRepository")

router.post("/createorder", async (req, res) => {
  const { ordertype } = req.query

  switch (ordertype) {
    case "gateway":
      res.send(await ZaloPay.Gateway(req.body))
    case "quickpay":
      res.send(await ZaloPay.QuickPay(req.body))

    default:
      res.send(await ZaloPay.CreateOrder(req.body))
  }
})

router.post('/refund', async (req, res) => {
    res.send(await ZaloPay.Refund(req.body))
})

router.get('/getrefundstatus', async (req, res) => {
    const { mrefundid } = req.query

    res.send(await ZaloPay.GetRefundStatus(mrefundid))
})

router.get('/getbanklist', async (req, res) => {
    res.send(await ZaloPay.GetBankList())
})

router.get('/gethistory', async (req, res) => {
    let { page } = req.query
    page = Number(page)
    page = isNaN(page) ? 1 : page

    res.send(await OrderRepository.Paginate(page))
})

module.exports = router