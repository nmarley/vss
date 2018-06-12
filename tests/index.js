const tape = require('tape')
const vss = require('../')
const bls = require('bls-lib')

bls.onModuleInit(() => {
  tape('tests', (t) => {
    bls.init()
    
    const threshold = 4
    const numOfPlayers = 7
    const setup = vss.createShare(bls, numOfPlayers, threshold)

    setup.shares.forEach(share => {
      const verified = vss.verifyShare(bls, share, setup.verifcationVector)
      t.true(verified, 'should verify share')
      console.log("Share id", share.id, ":", Buffer.from(share.sk).toString('hex'))
    })

    var secret = vss.recoverSecret(bls, setup.shares.slice(0, threshold))
    console.log("Secret : ", Buffer.from(secret).toString('hex'))

    t.deepEqual(secret, setup.secret, 'should recover the secret')
    
    
    const renewal = vss.renewShare(bls, setup.shares, threshold, setup.verifcationVector)
    
    renewal.shares.forEach(share => {
      const verified = vss.verifyShare(bls, share, renewal.verifcationVector)
      t.true(verified, 'should verify new share')
      console.log("New share id", share.id, ":", Buffer.from(share.sk).toString('hex'))
    })
    
    var secret = vss.recoverSecret(bls, renewal.shares.slice(0, threshold+1))
    console.log("Secret : ", Buffer.from(secret).toString('hex'))
    
    t.deepEqual(setup.secret, secret, 'secret should not change after share renewal')
    
    t.end()
  })
})
