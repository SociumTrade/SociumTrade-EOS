

/** Library initialisation */
const Eos = require('eosjs');
const fetch = require('node-fetch');// node only; not needed in browsers
const BigNumber = require('bignumber.js');
const EosJsError = require('eosjs/dist/eosjs-rpcerror.js');
const assert = require('chai').assert;
const { TextDecoder, TextEncoder } = require('text-encoding');
const config = require('../config.js');









const signatureProvider = new Eos.SignatureProvider([config.defaultPrivateKey]);



/** Initialiasation of EOS RPC */

const rpc = new Eos.Rpc.JsonRpc(config.nodeURL, { fetch });

const api = new Eos.Api({ rpc, signatureProvider, textDecoder: new TextDecoder, textEncoder: new TextEncoder });



describe('Check contract  method create', function() {

    it ('requires a non-null token account', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        token_contract: "",
                        maximum_supply: "100000.0000 "+config.tokenSymbol,
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
                    account: config.smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        token_contract: config.tokenAccount,
                        maximum_supply: "0.0000 "+config.tokenSymbol,
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
                    account: config.smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: "",
                        token_contract: config.tokenAccount,
                        maximum_supply: "10000.0000 "+config.tokenSymbol,
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
                    account: config.smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: "eosio",
                        permission: "active"
                    }
                    ],
                    data: {
                        user: "eosio",
                        token_contract: config.tokenAccount,
                        maximum_supply: "10000.0000 "+config.tokenSymbol,
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
                    account: config.smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: config.testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.testAccount,
                        token_contract: config.tokenAccount,
                        maximum_supply: "10000.0000 "+config.tokenSymbol,
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
                    account: config.smartContractAccount,
                    name: "create",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        token_contract: config.tokenAccount,
                        maximum_supply: "10000.0000 "+config.tokenSymbol,
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
                    account: config.smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        to: config.testAccount,
                        price_amount: "1 "+config.tokenSymbol,

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
                    account: config.smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        to: config.testAccount,
                        price_amount: "1.000 "+config.tokenSymbol,

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
                    account: config.smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        to: "brian",
                        price_amount: "1 "+config.tokenSymbol,

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
                    account: config.smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.smartContractAccount,
                        to: config.testAccount,
                        price_amount: "1000000000000000 "+config.tokenSymbol,

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
                    account: config.smartContractAccount,
                    name: "mint",
                    authorization: [{
                        actor: config.testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        user: config.testAccount,
                        to: config.testAccount,
                        price_amount: "1 "+config.tokenSymbol,

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

