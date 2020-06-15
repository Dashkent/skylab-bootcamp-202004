require('gym-commons/polyfills/string')
require('gym-commons/polyfills/number')
const { mongoose, models: { Price } } = require('gym-data')
const { errors: { UnexistenceError } } = require('gym-commons')
const { ObjectId } = mongoose


module.exports = (productId, num) => {
    String.validate.notVoid(productId)
    if (num !== undefined) {
        Number.validate.integer(num)
        Number.validate.positive(num)
    }

    return (async () => {
   
        let prices = await Price.find({ product: ObjectId(productId) }).sort({ date: -1 }).lean()

        if (!prices.length) throw new UnexistenceError('price not found')

        if (num) {
            prices = prices.slice(0, num)
        }

        for (let i in prices) {
            delete prices[i].__v
        }

        return prices
    })()
}