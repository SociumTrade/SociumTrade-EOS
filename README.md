# Сrowdsale contract. 

## Installation

Before using this contract need to deploy token contract. 

After deploying of a token contract for example: 'eosio.token' and crowdsale contract for example: 'crowdsale' need  to grand eosio.code permissions to crowdsale:
`cleos set account permission eosio.token active '{"threshold": 1, "keys":[{"key":"<PUBLIC_KEY>", "weight":1}],
"accounts":[{"permission":{"actor":"crowdsale","permission":"eosio.code"},"weight":1}], "waits":[] }' owner -p eosio.token`

## Methods

### Create 
Create action fill the contract with price matrix and start and end date timeline where
     * param `user` (required) - account name who will be authorised to use this contract method
     * param `token_contract` (required) - account name of a token contract.
     * param `maximum_supply` (required) - maximum supply is maximum supply value and symbol of a new token.
     * param `price_time_values_string` (required) - a string of time:price values separated by space, where time in seconds from 1970
        and rate Number of token units a buyer gets per cent.
        The rate is the conversion between cent and the smallest and indivisible
        token unit. So, if you are using a rate of 1 with a SYS token
        with 4 decimals called SYS, 1 cent will give you 1 unit, or 0.0001 SYS.
        for example `1538832850:4 1548832849:3.5 1558832849:3 1568832849:2.5`
        End Time of a contract is the last time value of matrix table.
     * param `startTime` (required) - uint32 value in seconds from 1970 when contract should be started.

For example create 10000 maximum supply tokens TOK:
`cleos push action crowdsale create '["crowdsale","eosio.token", "10000.0000 TOK", "1538832850:4 1548832849:3.5 1558832849:3 1568832849:2.5",1538832849]'
 -p  crowdsale@active`

### Mint
Mint action issue token to another account
    *  param `user` (required) - account name who will be authorised to use this token contract  and will be billed for this action.
    *  param `to` (required) - account name whom token will be issued.
    *  param `price_amount` (required) - an asset where price in cents is passed. Can't be fractional.

    For example issue tokens for 10000 cents to bob account:
    `cleos push action crowdsale mint '["crowdsale","bob", "10000 CEN"]' -p crowdsale@active`
