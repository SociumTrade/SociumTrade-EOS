#include <eosiolib/eosio.hpp>
#include <eosiolib/time.hpp>
#include <string>
#include <eosiolib/print.hpp>
#include <stdio.h>
#include <eosiolib/asset.hpp>

/**
This is crowdsale contract. Before using this contract need to deploy token contract.
After deploying of a token contract for example: 'eosio.token' and crowdsale contract for example: 'crowdsale' need  to grand eosio.code permissions to crowdsale:"
>cleos set account permission eosio.token active '{"threshold": 1, "keys":[{"key":"<PUBLIC_KEY>", "weight":1}], "accounts":[{"permission":{"actor":"crowdsale","
"permission":"eosio.code"},"weight":1}], "waits":[] }' owner -p eosio.token "


*** Create action fill the contract with price matrix and start and end date timeline where
     * @param user (required) - account name who will be authorised to use this contract method
     * @param token_contract (required) - account name of a token contract.
     * @param maximum_supply (required) - maximum supply is maximum supply value and symbol of a new token.
     * @param price_time_values_string (required) - a string of time:price values separated by space, where time in seconds from 1970
        and rate Number of token units a buyer gets per cent.
        The rate is the conversion between cent and the smallest and indivisible
        token unit. So, if you are using a rate of 1 with a SYS token
        with 4 decimals called SYS, 1 cent will give you 1 unit, or 0.0001 SYS.
        for example "1538491727:1 1538501726:2 1538511726:3 1538521726:4"
        End Time of a contract is the last time value of matrix table.
     * @param startTime (required) - uint32 value in seconds from 1970 when contract should be started.

    For example create 10000 maximum supply tokens TOK:
    >cleos push action crowdsale create '["crowdsale","eosio.token", "10000.0000 TOK", "1538832850:4 1548832849:3.5 1558832849:3 1568832849:2.5",1538832849]' -p  crowdsale@active


*** Mint action issue token to another account
    *  @param user (required) - account name who will be authorised to use this token contract  and will be billed for this action.
    *  @param to (required) - account name whom token will be issued.
    *  @param price_amount (required) - an asset where price in cents is passed. Can't be fractional.

    For example issue tokens for 10000 cents to bob account:
    >cleos push action crowdsale mint '["crowdsale","bob", "10000 CEN"]' -p crowdsale@active");

*/


using namespace eosio;
using namespace std;


//Parse string of time:price values separated by space, where time in seconds from 1970 to map
std::map<int, int> mappify2(std::string const& s)
{
    std::map<int, int> m;

    std::string::size_type key_pos = 0;
    std::string::size_type key_end;
    std::string::size_type val_pos;
    std::string::size_type val_end;

    while((key_end = s.find(':', key_pos)) != std::string::npos)
    {
        if((val_pos = s.find_first_not_of(": ", key_end)) == std::string::npos)
            break;

        val_end = s.find(' ', val_pos);
        m.emplace(stoi(s.substr(key_pos, key_end - key_pos)), stoi(s.substr(val_pos, val_end - val_pos)));

        key_pos = val_end;
        if(key_pos != std::string::npos)
            ++key_pos;
    }

    return m;
}


class crowdsale : public contract {
public:
    using contract::contract;

    crowdsale(account_name self) : contract(self){}


    /**
    *  Create method fill the contract with price matrix and start and end date timeline
    *  @param user (required) - account name who will be authorised to use this contract method
     * @param token_contract (required) - account name of a token contract who will pay for issue of a token
     * @param maximum_supply (required) - maximum supply is maximum supply value and symbol of a new token
    *  @param price_time_values_string (required) - a string of time:price values separated by space, where time in seconds from 1970
     * and rate Number of token units a buyer gets per cent
     * The rate is the conversion between cent and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a SYS token
     * with 4 decimals called SYS, 1 cent will give you 1 unit, or 0.0001 SYS.
     *  for example "1538491727:1 1538501726:2 1538511726:3 1538521726:4"
     *  End Time of a contract is the last time value of matrix table.
    *  @param startTime (required) - uint32 value in seconds from 1970 when contract should be started
    **/

    [[eosio::action]]
    void create( account_name user, account_name token_contract, asset &maximum_supply, string price_time_values_string, uint32_t startTime) {

        //check if this user authorised to run this method
        require_auth(user);

        eosio_assert( is_account( token_contract ), "token_contract account does not exist");

        auto sym = maximum_supply.symbol;
        eosio_assert( sym.is_valid(), "Invalid symbol name 1" );
        eosio_assert( maximum_supply.is_valid(), "Invalid supply");
        eosio_assert( maximum_supply.amount > 0, "Max-supply must be positive");

        //parse price matrix string into map
        std::map<int,int > matrix_map = mappify2(price_time_values_string);

        uint32_t endTime = 0;
        if(matrix_map.empty()) {
            eosio_assert(0, "Matrix set incorrectly");
        }
        else{
            endTime =  (uint32_t)(--matrix_map.end())->first;
        }


        //terminate if start and end time of the contract are incorrect
        if (startTime<=0 || endTime <=0 || startTime>endTime || endTime<now()) {
            eosio_assert(0, "Start time or End time entered incorrect. Please check");}


        //check if time values entered in price matrix are in the range of the start and end time of the contract
        for (const auto &pair :matrix_map)
        {
            if ((uint32_t)pair.first <= startTime || (uint32_t)pair.first > endTime) {
                eosio_assert(0, "Price Matrix value is not in the range of Start time and End time of a contract. Please check");
            }
        };

        //Check if token already exists
        params_type params_table{_self, _self};
        auto existing = params_table.find( _self );
        eosio_assert( existing == params_table.end(), "Token  already exists" );


        //make issue action to token contract to create new token
        action(
                permission_level{ token_contract, N(active)},
                token_contract, N(create),
                std::make_tuple(token_contract, maximum_supply)
        ).send();

        //save new token and contract params in a blockchain
        params_table.emplace(_self, [&]( auto& s){
            s.owner = _self;
            s.token_sold  = asset(0,maximum_supply.symbol);
            s.cents_raised  = 0;
            s.start_contract_time = startTime;
            s.end_contract_time = endTime;
            s.max_supply = maximum_supply;
            s.token_contract = token_contract;
        });

        //initialise price matrix table
        price_matrix current_price_matrix(_self, user);

        //check if matrix already exist and created for the contract
        auto itr = current_price_matrix.find(_self);
        eosio_assert(itr == current_price_matrix.end(), "Matrix already exist");


        //put price matrix values into the blockchain table
        for (const auto &pair :matrix_map)
        {
            current_price_matrix.emplace(_self, [&]( auto& element ) {
                element.end_time = (uint64_t)pair.first;
                element.euro_cent_price = (uint32_t)pair.second;
            });
        }

    }


    /**
    *  Mint method issue token to another account
    *  @param user (required) - account name who will be authorised to use this token contract  and will be billed for this action
    *  @param to (required) - account name whom token will be issued
    *  @param price_amount (required) - an asset where price in cents is passed. Can't be fractional
     *  for example "10000.0000 SYS"
    **/
    [[eosio::action]]
    void mint(account_name user, account_name to, asset &price_amount){

        //check if this user authorised to run this method
        require_auth(user);

        //check if price_amount entered correctly
        eosio_assert( price_amount.is_valid(), "invalid quantity" );
        eosio_assert( price_amount.amount > 0, "must withdraw positive quantity" );


        if( price_amount.symbol.precision() > 0 )
            eosio_assert(0, "Price value can't be fractional");


        //get price matrix table from blockhain
        price_matrix current_price_matrix(_self, _self );
        auto existing_price = current_price_matrix.begin();
        eosio_assert( existing_price != current_price_matrix.end(), "Price matrix or contract doesn't set" );

        //Check if token already exists
        params_type params_table{_self, _self};
        auto existing_params = params_table.find( _self );
        eosio_assert( existing_params != params_table.end(), "Token  or contract doesn't set" );

        const  auto &params = params_table.get(_self);


        //get current price value for token based on price matrix and current time
        uint32_t last_value =0;
        uint32_t start_contract_time = params.start_contract_time;
        uint32_t end_contract_time = params.end_contract_time;
        uint32_t current_time = now();
        for(const pricetime& p : current_price_matrix)
        {
            if (current_time<p.end_time) {
                break;
            }
            last_value = p.euro_cent_price;
        }

        if (last_value == 0)
            eosio_assert(0,"Check if contract started or already ended" );

        if (params.token_sold.amount+price_amount.amount/last_value>params.max_supply.amount)
            eosio_assert(0, "Can't issue more then maximum supply of tokens");

        //make issue action to token contract
        action(
                permission_level{ params.token_contract, N(active)},
                params.token_contract, N(issue),
                std::make_tuple(to, asset(price_amount.amount/last_value,params.max_supply.symbol), std::string("mint"))
        ).send();

        mintdata_type mint_matrix(_self, _self);

        //check if account already in minted users or add new account there
        const auto itr = mint_matrix.find(to);
        if (itr == mint_matrix.end())
        {

            mint_matrix.emplace(_self, [&]( auto& s){
                s.holder_account = to;
                s.token_amount = asset(price_amount.amount/last_value,params.max_supply.symbol);

            });
        } else{
            mint_matrix.modify(itr, _self, [&]( auto& s){
                s.token_amount +=asset(price_amount.amount/last_value,params.max_supply.symbol);
            });
        }
        params_table.modify(existing_params, _self, [&]( auto& s){
            s.token_sold+=asset(price_amount.amount/last_value,params.max_supply.symbol);
            s.cents_raised+=price_amount.amount;

        });

    }



private:

    //structure to store one element of a price matrix
    struct [[eosio::table]] pricetime
    {
        uint64_t end_time;
        uint32_t euro_cent_price;



        uint64_t primary_key() const { return end_time; }
    };

    typedef eosio::multi_index< N(pricetime), pricetime> price_matrix;


    //structure to store all mint transactions
    struct [[eosio::table]] mintdata
    {
        account_name holder_account;
        asset token_amount;



        uint64_t primary_key() const { return holder_account; }
    };

    typedef eosio::multi_index< N(mintdata), mintdata> mintdata_type;


    //structure to store balance of tokens, cents raised, start contract time and end contract  time of a contract to blockchain
    struct [[eosio::table]] params {
        account_name owner;
        asset token_sold;
        uint64_t cents_raised;
        uint64_t start_contract_time;
        uint64_t end_contract_time;
        asset max_supply;
        account_name token_contract;


        uint64_t primary_key()const { return owner; }
    };

    typedef eosio::multi_index<N(params), params> params_type;


};

EOSIO_ABI( crowdsale, (create)(mint))
