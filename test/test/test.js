//{"msg": "succeeded", "keys": {"active_key": {"public": "EOS8Wad21GehxJjGdB4Ky1WD6NAmcEAE5iKNTPazSRre7aVCQA2N4",
// "private": "5JzLb9C8U7jELU4SnBSyJkHL1uDbExVene4qgCKVWNNKc18h1ZL"},
// "owner_key":
// {"public": "EOS76siLLqee3rBNCsfaTFTTARYmRUwSzDmGn4Sh7DAFpoqWzaKFU",
// "private": "5JYeuPECyHG6NJV5hytK4crvZSbrcEPVVpbfsUKEiqngowPzVKh"}}, "account": "cobowalletaa"}

//{"msg": "succeeded", "keys": {"active_key":
// {"public": "EOS8EX1rnJHXumsezPdELXcVcEDdVQ6M1dhVwvVMcHnHhK8cAyuRn",
// "private": "5KCjCJT56Pd5YJrGqFTygJXcro9kTHMGPCF5SNGDRaNKJQGqTYj"},
// "owner_key": {"public": "EOS6bfPWqSFbq3vn6156fLXNCFZf8wFn6AkviLzPjKaJYqFrpG8YV",
// "private": "5KfsoPJVLWwZGtPY1FPxUGndj4C3C5jpxBvonRoAPxWzyw1NVG6"}}, "account": "cobowalletac"}

//{"msg": "succeeded", "keys": {"active_key":
// {"public": "EOS7tj2TGMZmbH9gCtMYw8bwBgU9CwCNMb7zvyCKVsPNejQp8K279",
// "private": "5Ki3yLY4GZBbXDNx9pGcqmvSfWr9qvENEzb5xM35Fqqqd9RXXCy"},
// "owner_key": {"public": "EOS6e27oMHkytUNMfX7orgPj8M9Jo4J3Fphj4mkecfBZxNpB1X4hW",
// "private": "5HrxHZT4hEB7HquXDmDVHzgHDKaMmYJ7q1C5ivLJ9NjV4AuS8oL"}}, "account": "cobowalletad"}

//{"msg": "succeeded", "keys": {"active_key":
// {"public": "EOS6H4QAnrTDGbU7AuVo5vjafpWWoabDDimfW46Y4gwziR8wdjVGR",
// "private": "5JQ9uoafAUDf6v3uC2tma1LmpuoTArM1vcWrJGJ1KoUKZHf5jg1"},
// "owner_key": {"public": "EOS8EqQ2mQ3GXHwUg9ypEmHM9k5fUyrefmoFbCBV5bynm1d3btXMF",
// "private": "5K5idEY3VDbU2twXq94HZrmp9cUcNCZ9au19kXzKcM75Mthg9ys"}}, "account": "cobowalletae"}

//{"msg": "succeeded", "keys": {"active_key":
// {"public": "EOS83XDUG7oohCfL2YrxLGXkAvJ69JcE9WiHBxZPB2HBadHvZ9ZmY",
// "private": "5Khd7c7jjQqTXTDFwVePTHAC328X7J7P6ktuf44EwRdECDKHdCH"},
// "owner_key": {"public": "EOS69QrG4PDuuCW6qroDv92RWTNctWtbno26kYDutRePpBiTUxNsE",
// "private": "5KWeiLDz5RW3ScBV3VJUGvRFE3n2Q8CQm897SQLZryD1HTpsUKD"}}, "account": "cobowalletaf"}


//{"msg": "succeeded", "keys": {"active_key":
// {"public": "EOS5VmywSSg6zgdQiwPTc3RGGqHxVRuQ3zfzJmfkBqNcffcZrsoCx",
// "private": "5KULKaEiwFaTdgcZYWNvbw6u7xdh5TUh3YjpXfrZczYxVE7z5fU"},
// "owner_key": {"public": "EOS7FpDKHUKeKobW33b8XZrGwgdVHaRRxHA4LMq6GdUKtTV2k5dLM",
// "private": "5KDGgitEXy4hpFFgFdDMSayPGUUed6xdKej9hH8uLXaKwnXs4ME"}}, "account": "test11111112"}

//{"msg": "succeeded", "keys": {"active_key":
// {"public": "EOS5qNS5GrvUsFRahe4e8FHagajKTcfeXKvSZBtrRztx7e1yn5oRT",
// "private": "5JoCTxXaYyWWnnyRNYDk2x12kg1WNrHnhBYYN9MPp34LvRFQJza"},
// "owner_key": {"public": "EOS8mQNV8BVSGy4JtPN2294h7D7djaULShyFAKjoeL7Nx5kx2C2Eg",
// "private": "5KdtnuLWwT7WUkrC4WcsSnkGnFxbEgSzgf1uWgt1mFiR6WVnWwF"}}, "account": "test11111113"}

//{"msg": "succeeded", "keys":
// {"active_key": {"public": "EOS5JHwbMsjk1fQEFcRGtwiCkCEzHGtQoRrVWVyMHpJ7ipv3PRmT5",
// "private": "5K5msHkbDCESWP1zMuLrt2EwQUNCrnL4nmoptHwtFpRvPgHRikQ"},
// "owner_key": {"public": "EOS6hHznn4M6RDQsi2H6RLMvztbEd12bYtDwzCiijkpU2QmGZEfqk",
// "private": "5KhMH2jn13qPPTVH8pJYUcGpqMRZ1fo1ZxENPD8VnyMps4hozLQ"}}, "account": "test11111114"}


const assert = require('assert')
const bip39 = require('bip39')
const Eos = require('eosjs')
const HDNode = require('@cobo/eos');
const mnemonic = 'cobo wallet is awesome'
const seed = bip39.mnemonicToSeedHex(mnemonic)

const randomName = () => {
    const name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '')
    return 'a' + name + '111222333444'.substring(0, 11 - name.length) // always 12 in length
}

describe('EOS HDNode', function () {
    it('Can import from seed and get EOS address', () => {
        const node = HDNode.fromMasterSeed(seed)
        assert.equal(node.getPublicKey(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
    })

    it('Can generate new mnemonic and import', () => {
        const myMnemonic = HDNode.generateMnemonic()
        const node = HDNode.fromMnemonic(myMnemonic)
        assert(node.getPublicKey())
    })

    it('Can import from base58 string', () => {
        const node = HDNode.fromExtendedKey('xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
        assert.equal(node.getPublicKey(), 'EOS4w7FYzzeYJ7oz6XD5exo9ARpQdGoBZhPPjv5ywyrF5PioHtthX')
    })

    it('Can import from private key', () => {
        const node = HDNode.fromPrivateKey('5JEz3RE92t35seYNWzrBhXvE22LkFCSJPWqi1icoxoXH9ZPqMVj')
        assert.equal(node.getPublicKey(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')
        assert.throws(() => node.derivePath('123'), Error)
        assert.throws(() => node.getPublicExtendedKey(), Error)
    })

    it('Can derive to child nodes and get EOS address', () => {
        const parentNode = HDNode.fromMasterSeed(seed)
        const node1 = parentNode.derivePath("m/44'/194'/0'/0/0")
        assert.equal(node1.getPublicKey(), 'EOS8Q6s4WGcswUdot8UntNA2G4PVnUha5MyE1CDwZSX76FWc1xQEs')

        const node2 = parentNode.deriveChild(0)
        assert.equal(node2.getPublicKey(), 'EOS5PHB3qTNS2mTeQN1Zo5MeRzvSchws7kkpq9TYwYk3mZACv5JzZ')
    })

    it('Can get private key from a node', () => {
        const node = HDNode.fromMasterSeed(seed).derivePath("m/44'/194'/0'/0/0")
        assert.equal(node.getPrivateKey(), '5JEz3RE92t35seYNWzrBhXvE22LkFCSJPWqi1icoxoXH9ZPqMVj')
    })

    it('Can get public extended key and private extended key', () => {
        const node = HDNode.fromMasterSeed(seed)
        assert.equal(node.getPrivateExtendedKey(), 'xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
        assert.equal(node.getPublicExtendedKey(), 'xpub661MyMwAqRbcEbMQxKcSkJWLhMEGYArY7xa8Qo3hUjRQGUoNXM9PPf1YgT9CCwi8MNvRLW91thbtChgu6eP5qcUeg3x2QLQGfFfC5LqM5dt')
    })

    it('Can generate and sign transaction', async () => {
        const node = HDNode.fromMasterSeed(seed)
        const trx = await node.generateTransaction({
            from: 'eosio',
            to: 'cobowallet',
            amount: 100000,
            memo: 'cobo wallet is awesome',
            refBlockNum: 1,
            refBlockPrefix: 452435776
        })
        assert.equal(trx.transaction.signatures.length, 1, 'expecting 1 signature')

        const trx2 = await node.generateTransaction({
            from: 'eosio',
            to: 'cobowallet',
            amount: 100000,
            memo: 'cobo wallet is awesome',
            refBlockNum: 1,
            refBlockPrefix: 452435776,
            symbol: 'CUR',
            expiration: 120
        })
        assert.equal(trx2.transaction.signatures.length, 1, 'expecting 1 signature')
    })

})


describe('With cryptokylin testnet, real blockchain methods', () => {

    let refBlockNum, refBlockPrefix, provider, node, node_second
    before(async () => {
        provider = Eos({
            httpEndpoint: 'https://api.kylin-testnet.eospacex.com',
            chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
            debug: false,
            verbose: true
        });
        const latestBlock = await provider.getInfo({})
        refBlockNum = (latestBlock.head_block_num - 3) & 0xFFFF
        const blockInfo = await provider.getBlock(latestBlock.head_block_num - 3)
        refBlockPrefix = blockInfo.ref_block_prefix
        node = HDNode.fromPrivateKey(
            '5JzLb9C8U7jELU4SnBSyJkHL1uDbExVene4qgCKVWNNKc18h1ZL',
            '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'
        );

        node_second = HDNode.fromPrivateKey(
            '5KCjCJT56Pd5YJrGqFTygJXcro9kTHMGPCF5SNGDRaNKJQGqTYj',
            '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'
        )
    })


    it('Can create account use a pubkey', async () => {
        const accountName = randomName()
        const {transaction} = await node.registerAccount({
            refBlockNum,
            refBlockPrefix,
            accountName,
            activeKey: 'EOS8Wad21GehxJjGdB4Ky1WD6NAmcEAE5iKNTPazSRre7aVCQA2N4',
            creator: 'cobowalletaa'
        })
        console.log('Created account, name is: ', accountName)
        const res = await provider.pushTransaction(transaction)
        return res
    })

    it('Can create msig account using permissions',async () => {
        provider.contract('eosio.msig').then(account => {
            account.propose({
                "proposer":"cobowalletaf",
                "proposal_name":"wdrw_id",
                "requested":[
                    {"actor":"cobowalletad","permission":"active"},
                    {"actor":"cobowalletae","permission":"active"}
                ],
                "trx": {
                    "expiration": "2018-12-11T15:28:57",
                    "ref_block_num": 0,
                    "ref_block_prefix": 0,
                    "max_net_usage_words": 0,
                    "max_cpu_usage_ms": 0,
                    "delay_sec": 0,
                    "context_free_actions": [],
                    "actions": [{
                        "account": "eosio.token",
                        "name": "transfer",
                        "authorization": [{
                            "actor": "cobowalletaf",
                            "permission": "active"
                        }
                        ],
                        "data": {
                            "from": "cobowalletaf",
                            "to": "cobowalletae",
                            "quantity": "25.0000 SYS",
                            "memo": "Pay partner11111 some money"
                        },
                        "hex_data": "b04c56311a4e0f45a04c56311a4e0f4590d003000000000004535953000000001b50617920706172746e6572313131313120736f6d65206d6f6e6579"
                    }
                    ],
                    "transaction_extensions": []
                }})
        })

        return 1;
    })

    /*
    it('Can import from private key and transfer', async () => {
        const rawTx = await node.generateTransaction({
            from: 'cobowalletaa',
            to: 'cobowalletab',
            amount: 10000,
            memo: 'cobo wallet is awesome',
            refBlockNum,
            refBlockPrefix
        })
        const {transaction} = rawTx
        const res = await provider.pushTransaction(transaction)
        return res
    })

    it('Can delegate bandwidth', async () => {
        const rawTx = await node.delegate({
            from: 'cobowalletaa',
            to: 'cobowalletaa',
            cpuAmount: 10000,
            netAmount: 10000,
            refBlockNum,
            refBlockPrefix
        })
        const {transaction} = rawTx
        const res = await provider.pushTransaction(transaction)
        return res
    })

    it('Can undelegate bandwidth', async () => {
        const rawTx = await node.undelegate({
            from: 'cobowalletaa',
            to: 'cobowalletaa',
            cpuAmount: 10000,
            netAmount: 10000,
            refBlockNum,
            refBlockPrefix
        })
        const {transaction} = rawTx
        const res = await provider.pushTransaction(transaction)
        return res
    })

    it('Can vote producer', async () => {
        const rawTx = await node.vote({
            from: 'cobowalletaa',
            producers: ['cobowalletab'],
            refBlockNum,
            refBlockPrefix
        })
        const {transaction} = rawTx
        const res = await provider.pushTransaction(transaction)
        return res
    })

    it('Can bid name', async () => {
        const rawTx = await node.bidname({
            bidder: 'cobowalletaa',
            name: randomName().substr(0, 10),
            amount: 10000,
            refBlockNum,
            refBlockPrefix
        })
        const {transaction} = rawTx
        const res = await provider.pushTransaction(transaction)
        return res
    })

    it('Can buy ram and sell ram', async () => {
        const buyRamTx = await node.buyram({
            payer: 'cobowalletaa',
            receiver: 'cobowalletaa',
            bytes: 1024,
            refBlockNum,
            refBlockPrefix
        })
        const sellRamTx = await node.sellram({
            account: 'cobowalletaa',
            bytes: 500,
            refBlockNum,
            refBlockPrefix
        })
        const buyRes = await provider.pushTransaction(buyRamTx.transaction)
        const sellRes = await provider.pushTransaction(sellRamTx.transaction)
        return {buyRes, sellRes}
    })

    it('Can sign and transfer EOS tokens', async () => {
        const rawTx = await node.generateTransaction({
            from: 'cobowalletaa',
            to: 'cobowalletab',
            amount: 10000,
            memo: 'cobo wallet is awesome',
            symbol: 'JUNGLE',
            refBlockNum,
            refBlockPrefix
        })
        const {transaction} = rawTx
        const res = await provider.pushTransaction(transaction)
        return res
    })
    */
})


