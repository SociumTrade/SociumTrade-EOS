

/** Library initialisation */
const Eos = require('eosjs');
const fetch = require('node-fetch');// node only; not needed in browsers
const EosJsError = require('eosjs/dist/eosjs-rpcerror.js');
const assert = require('chai').assert;
const { TextDecoder, TextEncoder } = require('text-encoding');
const config = require('../config.js');









const signatureProvider = new Eos.SignatureProvider([config.defaultPrivateKey]);



/** Initialiasation of EOS RPC */

const rpc = new Eos.Rpc.JsonRpc(config.nodeURL, { fetch });

const api = new Eos.Api({ rpc, signatureProvider, textDecoder: new TextDecoder, textEncoder: new TextEncoder });



describe('Check airdrop contract  method init', function() {

    it ('requires a non-null token account', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "init",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.smartContractAccount,
                        token_contract: "",
                        end_init_airdrop_time: "1538832849"
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

    it ('requires a correct time', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "init",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.smartContractAccount,
                        token_contract: config.tokenAccount,
                        end_init_airdrop_time: "1398832849"
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
                    name: "init",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: "",
                        token_contract: config.tokenAccount,
                        end_init_airdrop_time: "1608832849"
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

    it ('not correct authority', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "init",
                    authorization: [{
                        actor: "eosio",
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.smartContractAccount,
                        token_contract: config.tokenAccount,
                        end_init_airdrop_time: "1608832849"
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
                    name: "init",
                    authorization: [{
                        actor: config.testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.testAccount,
                        token_contract: config.tokenAccount,
                        end_init_airdrop_time: "1608832849"
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


describe('Check contract method add', function() {

    it ('method should work success to add new key and value', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "add",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.smartContractAccount,
                        key: config.testKey1,
                        tokens_value: "10 "+config.tokenSymbol,

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


    it ('cant add the same key again', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "add",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.smartContractAccount,
                        key: config.testKey1,
                        tokens_value: "10 "+config.tokenSymbol,

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


    it ('only owner account should be able to run this method', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "add",
                    authorization: [{
                        actor: config.testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        owner: config.testAccount,
                        key: config.testKey1,
                        tokens_value: "10",

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




describe('Check contract method claim', function() {

    it ('method should work success to claim tokens', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "claim",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        to: config.smartContractAccount,
                        code_string: config.testKey1,

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

    it ('cant claim the same token two times', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "claim",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        to: config.smartContractAccount,
                        code_string: config.testKey1,

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

    it ('cant claim if token is not in the list', async () => {
        try {
            const trx = await api.transact({
                actions: [{
                    account: config.smartContractAccount,
                    name: "claim",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        to: config.smartContractAccount,
                        code_string: config.testKey2,

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
                    name: "claim",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        to: config.testAccount,
                        code_string: config.testKey1,

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
                    name: "claim",
                    authorization: [{
                        actor: config.smartContractAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        to: config.testAccount,
                        code_string: config.testKey1,

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
                    name: "claim",
                    authorization: [{
                        actor: config.testAccount,
                        permission: "active"
                    }
                    ],
                    data: {
                        to: config.testAccount,
                        code_string: config.testKey1,

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

