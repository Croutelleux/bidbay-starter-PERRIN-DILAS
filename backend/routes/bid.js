import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.delete('/api/bids/:bidId', authMiddleware, async (req, res) => {
  const bid = await Bid.findByPk(req.params.bidId, {
    attributes: ['id', 'bidderId'],
  })

  if (!bid) return res.status(404).json({error: 'Bid not found'})

  if (bid.bidderId != req.user.id && !req.user.admin) return res.status(403).json({error: 'User not granted'})

  await Bid.destroy({ where: { id: req.params.bidId } })

  res.status(204).json({})
})

router.post('/api/products/:productId/bids', authMiddleware, async (req, res) => {
  const bid = req.body

  const product = await Product.findByPk(req.params.productId)

  if (!product) return res.status(404).json({error: 'Product not found'})

  try {
    const savedBid = await Bid.create({
      ...bid,
      productId: req.params.productId,
      bidderId: req.user.id
    }, {
      returning: ['id']
    })

    const returnedSavedBid = await Bid.findByPk(savedBid.id, {
      attributes: ['id', 'productId', 'price', 'date', 'bidderId']
    })

    res.status(201).json(returnedSavedBid);
  } catch (e) {
    res.status(400).json({ error: "Invalid or missing fields", details: getDetails(e) })
  }
})

export default router
