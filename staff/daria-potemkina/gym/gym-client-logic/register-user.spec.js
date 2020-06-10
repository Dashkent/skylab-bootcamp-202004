require('dotenv').config()

const { env: { MONGODB_URL_TEST } } = process

const registerUser = require('./register-user')
const { random } = Math
const { expect } = require('chai')
require('gym-commons/polyfills/json')
const { mongo } = require('gym-data')
const bcrypt = require('bcryptjs')
require('gym-commons/ponyfills/xhr')

describe('logic - register user', () => {
    let users

    before(() => mongo.connect(MONGODB_URL_TEST)
        .then(connection => {
            users = connection.db().collection('users')
        }))

    let name, surname, email, password

    beforeEach(() =>
        users.deleteMany()
            .then(() => {
                name = `name-${random()}`
                surname = `surname-${random()}`
                email = `e-${random()}@mail.com`
                password = `password-${random()}`
            })
    )

    it('should succeed on valid data', () =>
        registerUser(name, surname, email, password)
            .then(() => users.find().toArray())
            .then(users => {
                expect(users.length).to.equal(1)

                const [user] = users

                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)

                return bcrypt.compare(password, user.password)
            })
            .then(match => expect(match).to.be.true)
    )

    describe('when user already exists', () => {
        beforeEach(() => users.insertOne({ name, surname, email, password }))

        it('should fail on trying to register an existing user', () =>
            registerUser(name, surname, email, password)
                .then(() => { throw new Error('should not reach this point') })
                .catch(error => {
                    expect(error).to.exist

                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`user with e-mail ${email} already exists`)
                })
        )
    })

    afterEach(() => users.deleteMany())

    after(mongo.disconnect)
})