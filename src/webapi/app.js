import express from 'express'
import { createWriteStream } from 'node:fs'
import rateLimit from 'express-rate-limit'

const output = createWriteStream('src/webapi/output.ndjson')

const limiter = rateLimit({
  windowMs: 1000, // 1 sec
  max: 10, // Limit each IP to 10 requests per `window` (here, per second)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express()
app.use(express.json())
app.use(limiter)

app.post('/', async (req, res) => {
  console.log('req.body', req.body)
  output.write(JSON.stringify(req.body) + "\n")
  return res.send('ok!!')
})

export default app