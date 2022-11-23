/*
creating 500k data..
echo "id,name,desc,age" > big.csv
for i in `seq 1 5`; do node -e "process.stdout.write('id-$i,name-$i,desc-$i,age-$i\n'.repeat(1e5))" >> big.csv;done
*/

import { createReadStream } from 'node:fs'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'
import { log, makeRequest } from './util.js'
import ThrottleRequest from './throttle.js'
import csvtojson from 'csvtojson'


const throttle = new ThrottleRequest({
  objectMode: true,
  requestPerSecond: 10
})

const dataProcessor = new Transform({
  objectMode: true,
  transform(chunk, enc, callback) {
    const now = performance.now()
    const jsonData = chunk.toString().replace(/\d/g, now)
    const data = JSON.parse(jsonData)
    data.id = randomUUID()
    return callback(null, JSON.stringify(data))
  }
})

await pipeline(
  createReadStream('src/data-integration/big.csv'),
  csvtojson(),
  dataProcessor,
  throttle,
  async function* (source) {
    let counter = 0
    for await (const data of source) {
      log(`processed ${++counter} items..`)
      const status = await makeRequest(data)
      if (status !== 200) throw new Error(`status ${status}`)
    }
  }
)