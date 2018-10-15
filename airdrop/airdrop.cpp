#include<string>
#include<math.h>
#include<eosiolib/eosio.hpp>
#include<eosiolib/crypto.h>
#include <eosiolib/asset.hpp>

/**
This is airdrop contract. Before using this contract need to deploy token contract.
After deploying of a token contract for example: 'eosio.token' and airdrop contract for example: 'airdrop' need  to grand eosio.code permissions to airdrop:"
>cleos set account permission eosio.token active '{"threshold": 1, "keys":[{"key":"<PUBLIC_KEY>", "weight":1}], "accounts":[{"permission":{"actor":"airdrop","
"permission":"eosio.code"},"weight":1}], "waits":[] }' owner -p eosio.token "


*** Init action fill the contract with token contract info  end time where initialisation shouldb be ended
     * @param owner (required) - account name who will be authorised to use this contract
     * @param token_contract (required) - account name of a token contract.
     * @param end_init_airdrop_time (required) - timeline where additiong of new values-table will be ended, so no more codes will be added to airdrop contract

    For example init of the contract:
    >cleos push action airdrop init '["airdrop","eosio.token",1538832849]' -p  airdrop@active


*** Add action add keys and values that may be used to claim token further
    *  @param owner (required) - account name who  authorised to use this  contract  and will be billed for this action.
    *  @param key (required) - key string of new key.
    *  @param tokens_value (required) - an asset listed amount of tokens and their symbol. For example "10 TOK"

    For example add new code for 10 TOK tokens :
    >cleos push action airdrop add '["airdrop","ypkIcEAEBQFQ", "10 TOK"]' -p airdrop@active

*** Claim action is using for  claiming token further by key
    *  @param to (required) - account name whome tokes will be transfered to.
    *  @param key (required) - key string of a key.

    For example add new code for 10 TOK tokens :
    >cleos push action airdrop claim '["bob","ypkIcEAEBQFQ"]' -p bob@active

*/


using namespace eosio;
using namespace std;


class airdrop : public contract {
public:
    using contract::contract;

    airdrop(account_name self) : contract(self){}

    [[eosio::action]]
    void init( account_name owner, account_name token_contract,  uint32_t end_init_airdrop_time) {


        require_auth(owner);

        eosio_assert( is_account( token_contract ), "token_contract account does not exist");


        if (end_init_airdrop_time<=0 ||  end_init_airdrop_time<now()) {
            eosio_assert(0, "End airdrop time entered incorrect. Please check");}

        //Check if token already exists
        params_type params_table{_self, _self};
        auto existing = params_table.find( _self );
        eosio_assert( existing == params_table.end(), "Contract  already initialized " );

        //Init contract with passed parameters
        params_table.emplace(_self, [&]( params& element ) {
            element.token_contract = token_contract;
            element.end_airdrop_config_time = end_init_airdrop_time;
            element.owner = owner;

        });
    }


    [[eosio::action]]
    void add(account_name owner, string key, asset &tokens_value) {

        require_auth(owner);

        auto sym = tokens_value.symbol;
        eosio_assert( sym.is_valid(), "Invalid symbol name" );
        eosio_assert( tokens_value.is_valid(), "Invalid value");
        eosio_assert( tokens_value.amount > 0, "Value must be positive");


        //Check if contract already initialized
        params_type params_table{_self, _self};
        auto existing = params_table.find( _self );
        eosio_assert( existing != params_table.end(), "Contract is not initialized " );

        const  auto &params = params_table.get(_self);

        if (params.end_airdrop_config_time<now())
        {
            eosio_assert(0, "Airdrop configuration time ended");
        }

        if (owner!=params.owner)
        {
            eosio_assert(0, "Owner who init contract differs from current user");
        }

        //initialise hash-values table
        keys_type hash_matrix(_self, _self);
        checksum256 result;
        sha256(&key[0], key.size(), &result);

        const uint64_t *p64 = reinterpret_cast<const uint64_t *>(&result);
        auto itr = hash_matrix.find(*p64);
        eosio_assert( itr == hash_matrix.end() , "Key already added" );

        hash_matrix.emplace(_self, [&]( keys& element ) {
            element.token_value = tokens_value;
            element.hash = *p64;
            element.claimed = 0;
        });


    }


    [[eosio::action]]
    void claim(account_name to, string code_string) {

        require_auth(to);

        //Check if contract initialized already exists
        params_type params_table{_self, _self};
        auto existing = params_table.find( _self );
        eosio_assert( existing != params_table.end(), "Contract is not initialized " );

        const  auto &params = params_table.get(_self);

        checksum256 result;
        sha256(&code_string[0], code_string.size(), &result);

        keys_type hash_matrix(_self, _self);

        const uint64_t *p64 = reinterpret_cast<const uint64_t *>(&result);


        keys element = hash_matrix.get(*p64);
        if (element.claimed == 1)
        eosio_assert(0, "Already claimed token by this code" );

        //make issue action to token contract
        action(
                permission_level{ params.token_contract, N(active)},
                params.token_contract, N(issue),
                std::make_tuple(to, element.token_value, std::string("claim"))
        ).send();

        //Mark this key-value pair as claimed to prevent second time claim by this code
        auto itr = hash_matrix.find(*p64);
        if (itr != hash_matrix.end()) {
            hash_matrix.modify(itr, _self, [&](auto &s) {
                s.claimed = 1;
            });
        }
    }





    //structure to store airdrop hashes, values and status
    struct [[eosio::table]] keys {

        asset token_value;
        uint64_t hash;
        uint16_t claimed;

        uint64_t primary_key()const { return hash; }
    };

    typedef eosio::multi_index<N(keys), keys> keys_type;

    //structure to store contract info
    struct [[eosio::table]] params {
        account_name owner;
        uint64_t end_airdrop_config_time;
        account_name token_contract;


        uint64_t primary_key()const { return owner; }
    };

    typedef eosio::multi_index<N(params), params> params_type;


};



EOSIO_ABI( airdrop, (init)(claim)(add))
