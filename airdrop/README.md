# Airdrop contract. 

## Installation

Before using this contract need to deploy token contract. 

After deploying of a token contract for example: `eosio.token` and crowdsale contract for example: `crowdsale` need  to grand eosio.code permissions to `crowdsale`:
`cleos set account permission eosio.token active '{"threshold": 1, "keys":[{"key":"<PUBLIC_KEY>", "weight":1}],`
`"accounts":[{"permission":{"actor":"crowdsale","permission":"eosio.code"},"weight":1}], "waits":[] }' owner -p eosio.token`
After deploying of a token contract for example: `eosio.token` and airdrop contract for example: `airdrop` need  to grand eosio.code permissions to `airdrop`:
`cleos set account permission eosio.token active '{"threshold": 1, "keys":[{"key":"<PUBLIC_KEY>", "weight":1}],`
`"accounts":[{"permission":{"actor":"airdrop","permission":"eosio.code"},"weight":1}], "waits":[] }' owner -p eosio.token `

## Methods


 ### Init 
 Init action fill the contract with token contract info  end time where initialisation shouldb be ended
- param  `owner` (required) - account name who will be authorised to use this contract
- param  `token_contract` (required) - account name of a token contract.
- param  `end_init_airdrop_time` (required) - timeline where additiong of new values-table will be ended, so no more codes will be added to airdrop contract
 
 For example init of the contract:
  `cleos push action airdrop init '["airdrop","eosio.token",1538832849]' -p  airdrop@active `
  
  ### Add
  Add action add keys and values that may be used to claim token further
- param `owner` (required) - account name who  authorised to use this  contract  and will be billed for this action.
- param `key` (required) - key string of new key.
- param `tokens_value` (required) - an asset listed amount of tokens and their symbol. For example "10.0000 TOK"
  
  For example add new code for 10.0000 TOK tokens :
  `cleos push action airdrop add '["airdrop","ypkIcEAEBQFQ", "10.0000 TOK"]' -p airdrop@active`

### Claim
Claim action is using for  claiming token further by key
- param `to` (required) - account name whome tokes will be transfered to.
- param `key` (required) - key string of a key.

For example add new code for 10 TOK tokens :
`cleos push action airdrop claim '["bob","ypkIcEAEBQFQ"]' -p bob@active`


### Automated Test Suite  
`npm run test` or `yarn test`
