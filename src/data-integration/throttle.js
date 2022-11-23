import { Transform } from 'node:stream'
export default class ThrottleRequest extends Transform {
  #requestPerSecond = 0
  #internalCounter = 0

  constructor({
    objectMode,
    requestPerSecond
  }) {
    super({
      objectMode
    })

    this.#requestPerSecond = requestPerSecond
  }

  _transform(chunk, enc, callback) {
    this.#internalCounter++

    if (!(this.#internalCounter >= this.#requestPerSecond)) {
      return callback(null, chunk)
    }

    setTimeout(() => {
      this.#internalCounter = 0
      return callback(null, chunk)
    }, 1000)

  }
}