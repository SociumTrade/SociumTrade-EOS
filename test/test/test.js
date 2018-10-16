

/** Library initialisation */
const Eos = require('eosjs');
const fetch = require('node-fetch');// node only; not needed in browsers
const BigNumber = require('bignumber.js');
const EosJsError = require('eosjs/dist/eosjs-rpcerror.js');
const assert = require('chai').assert;
const { TextDecoder, TextEncoder } = require('text-encoding');



const nodeURL = 'http://127.0.0.1:7777';
const tokenSymbol = 'AAA';
const tokenAccount = 'eosio.sm';
const smartContractAccount = 'crowd1';

const testAccount = 'testnew';


const defaultPrivateKey = "5KMK6m7jCqhxhEBnD1AVaPnLT17JfVdFPHGzLmSBC35LaHG5yNz"; // smartContract user Private key
const defaultPublicKey = "EOS8QjDxHUYcUYHJjVSKUiWXrLBm9rdVdcvWuCN6yNAkkBEt4uNBc"; // eosio user Public key

//const testUserPrivateKey = "5KMK6m7jCqhxhEBnD1AVaPnLT17JfVdFPHGzLmSBC35LaHG5yNz"; // eosio user Private key
const testUserPublicKey = "EOS6igJ7ZTv1MS9mdSynARZ5LYX5QUcBvVArvu1MamhBW31owZfEp"; // testnew user Public key

const signatureProvider = new Eos.SignatureProvider([defaultPrivateKey]);



/** Initialiasation of EOS RPC */

const rpc = new Eos.Rpc.JsonRpc(nodeURL, { fetch });

const api = new Eos.Api({ rpc, signatureProvider, textDecoder: new TextDecoder, textEncoder: new TextEncoder });


let now = new Date().getTime() / 1000;
console.dir(now);

/** Make lot's of random accounts with different permissions and keys and store them in an array*/


const randomName = () => {
    const name = String(Math.round(Math.random() * 1000000000)).replace(/[0,6-9]/g, '')
    return 'a' + name + '111222333444'.substring(0, 11 - name.length) // always 12 in length
}


const rate = new BigNumber(1);
const tokenSupply = new BigNumber('1e22');
//const expectedTokenAmount = rate.mul(value);
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

console.log(rate);
console.log(tokenSupply);
//console.log(expectedTokenAmount);


let randomUsersArray = Array();
for (let i = 0; i<10; i++)
{
    randomUsersArray.push(randomName());
}

describe('Check contract  method create', function() {

    it ('requires a non-null token account', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        token_contract: "",
                        maximum_supply: "100000.0000 "+tokenSymbol,
                        price_time_values_string:"1538832850:1 1548832849:2 1558832849:3 1568832849:4",
                        startTime: "1538832849"
                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
             if (e instanceof EosJsError.RpcError)
                 console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });

    it ('requires a non zero rate', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        token_contract: tokenAccount,
                        maximum_supply: "0.0000 "+tokenSymbol,
                        price_time_values_string:"1538832850:1 1548832849:2 1558832849:3 1568832849:4",
                        startTime: "1538832849"
                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });

    it ('requires a non null contract account', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: "",
                        token_contract: tokenAccount,
                        maximum_supply: "10000.0000 "+tokenSymbol,
                        price_time_values_string:"1538832850:1 1548832849:2 1558832849:3 1568832849:4",
                        startTime: "1538832849"
                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });

    it ('other account differ from owner cant run contract method', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: "eosio",
                        permission: "active"
                    }
                    ],
                    data: {
                        user: "eosio",
                        token_contract: tokenAccount,
                        maximum_supply: "10000.0000 "+tokenSymbol,
                        price_time_values_string:"1538832850:1 1548832849:2 1558832849:3 1568832849:4",
                        startTime: "1538832849"
                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"401");
        }
    });

    it ('other account differ from owner cant run contract method', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: testAccount,
                        token_contract: tokenAccount,
                        maximum_supply: "10000.0000 "+tokenSymbol,
                        price_time_values_string:"1538832850:1 1548832849:2 1558832849:3 1568832849:4",
                        startTime: "1538832849"
                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"401");
        }
    });




    it ('start time cant be more then end time', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        token_contract: tokenAccount,
                        maximum_supply: "10000.0000 "+tokenSymbol,
                        price_time_values_string:"1538832850:1 1548832849:2 1558832849:3 1568832849:4",
                        startTime: "1638832849"
                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });



});



describe('Check contract method mint', function() {

    it ('method should work success to transfer tokens', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        to: testAccount,
                        price_amount: "1 "+tokenSymbol,

                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });

    it ('cant be fractional number', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        to: testAccount,
                        price_amount: "1.000 "+tokenSymbol,

                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });

    it ('account to transfer should be valid', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        to: "brian",
                        price_amount: "1 "+tokenSymbol,

                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });

    it ('cant issue more then maximum supply tokens', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: smartContractAccount,
                        to: testAccount,
                        price_amount: "1000000000000000 "+tokenSymbol,

                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"500");
        }
    });


    it ('cant issue tokens if you are not an owner', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: testAccount,
                        to: testAccount,
                        price_amount: "1 "+tokenSymbol,

                    }

                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
        } catch (e) {
            console.log('\nCaught exception: ' + e);
            if (e instanceof EosJsError.RpcError)
                console.log(JSON.stringify(e.json, null, 2));
            assert.equal(e.json.code,"401");
        }
    });



});

