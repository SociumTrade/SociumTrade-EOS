#include <eosiolib/eosio.hpp>
#include <eosiolib/time.hpp>
#include <string>
#include <eosiolib/print.hpp>
#include <stdio.h>
#include <ctime>
#include <eosiolib/asset.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <boost/date_time/posix_time/posix_time_io.hpp>

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
     * @param token_contract (required) - account name of a token contract
     * @param maximum_supply (required) - maximum supply is maximum supply value and symbol of a new token
    *  @param price_time_values_string (required) - a string of time:price values separated by space, where time in seconds from 1970
     * and rate Number of token units a buyer gets per cent
     * The rate is the conversion between cent and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a SYS token
     * with 4 decimals called SYS, 1 cent will give you 1 unit, or 0.0001 SYS.
     *  for example "1538491727:1 1538501726:2 1538511726:3 1538521726:4"
    *  @param startTime (required) - uint32 value in seconds from 1970 when contract should be started
    *  @param endTime (required) - uint32 value in seconds from 1970 when contract should be ended
    **/

    [[eosio::action]]
    void create( account_name user, account_name token_contract, asset &maximum_supply, string price_time_values_string, uint32_t startTime, uint32_t endTime) {

        //check if this user authorised to run this method
        require_auth(user);

        eosio_assert( is_account( token_contract ), "token_contract account does not exist");

        auto sym = maximum_supply.symbol;
        eosio_assert( sym.is_valid(), "Invalid symbol name 1" );
        eosio_assert( maximum_supply.is_valid(), "Invalid supply");
        eosio_assert( maximum_supply.amount > 0, "Max-supply must be positive");


        //terminate if start and end time of the contract are incorrect
        if (startTime<=0 || endTime <=0 || startTime>endTime || endTime<now()) {
            eosio_assert(0, "Start time or End time entered incorrect. Please check");}

        //parse price matrix string into map
        std::map<int,int > matrix_map = mappify2(price_time_values_string);

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

        print("1 : Contract account: ",name{user}," Current contract:",name{_self}, " Token account:", name{token_contract}, " Maximum supply:", maximum_supply, " Start Time:", startTime, " End time: ",endTime );

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
    *  @param price_amount (required) - an asset where price in money is passed and symbol of token
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
        uint32_t last_value =1316134911;
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

        if (last_value == 1316134911)
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

    /**
     *  rate Number of token units a buyer gets per cent
     * The rate is the conversion between cent and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a EOS token
     * with 4 decimals called SYS, 1 cent will give you 1 unit, or 0.0001 SYS.
     **/
    [[eosio::action]]
    void currentprice(){

        //get price matrix table from blockhain
        price_matrix current_price_matrix(_self, _self );
        auto existing_price = current_price_matrix.begin();
        eosio_assert( existing_price != current_price_matrix.end(), "Price matrix or contract doesn't set" );

        //get current price value for token based on price matrix and current time
        uint32_t last_value =1316134911;
        uint32_t current_time = now();
        for(const pricetime& p : current_price_matrix)
        {
            if (current_time<p.end_time) {
                break;
            }
            last_value = p.euro_cent_price;
        }

        if (last_value == 1316134911) {
            eosio_assert(0, "Check if contract started or already ended");
        } else {
            print("Currently you get ",last_value," tokens per 1 EUR cent");
        }


    }

    /**
    * Output the token being sold.
    **/
    [[eosio::action]]
    void tokensold(){

        //Check if token already exists
        params_type params_table{_self, _self};
        auto existing_params = params_table.find( _self );
        eosio_assert( existing_params != params_table.end(), "Token  or contract doesn't set" );

        const  auto &params = params_table.get(_self);

        print("Total amount of token being sold is: ",params.token_sold, "\n");
    }

    /**
    * Output cents raised.
    **/
    [[eosio::action]]
    void centsraised(){

        //Check if token already exists
        params_type params_table{_self, _self};
        auto existing_params = params_table.find( _self );
        eosio_assert( existing_params != params_table.end(), "Token  or contract doesn't set \n" );

        const  auto &params = params_table.get(_self);

        print("Total amount of cents raised is: ",params.cents_raised, "\n");

    }

    /**
      * Output price table.
      **/
    [[eosio::action]]
    void showprices(){

        //initialise price matrix table
        price_matrix current_price_matrix(_self, _self);

        //check if matrix  exist and created for the contract
        auto itr = current_price_matrix.begin();
        eosio_assert(itr != current_price_matrix.end(), "Matrix or contract is not created\n");

        print("Price matrix of the contract ",name{_self}," is:\n");
        //put price matrix values into the blockchain table
        for (const auto &pricevalue :current_price_matrix)
        {
            print("End time: ",pricevalue.end_time," coefficient: ",pricevalue.euro_cent_price,"\n");
        }

    }

    /**
    * Output mint tokens table with addresses and amount.
    **/
    [[eosio::action]]
    void showmintdata(){

        mintdata_type mint_matrix(_self, _self);

        //check if matrix  exist and created for the contract
        auto itr = mint_matrix.find(_self);
        eosio_assert(itr == mint_matrix.end(), "Transactions never made  or contract is not created\n");

        for(const mintdata& p : mint_matrix)
        {

            print("Account: ",name{p.holder_account}," balance: ",p.token_amount, "\n");
        }

    }

    /**
    * Show token balance of specific account.
    *  @param user (required) - account name to show balance
    **/
    [[eosio::action]]
    void showbalance(account_name user){

        mintdata_type mint_matrix(_self, _self);

        //check if matrix  exist and created for the contract
        const auto &mintdata = mint_matrix.find(user);
        eosio_assert(mintdata != mint_matrix.end(), "Transactions to this user never made  or contract is not created\n");

        print("Account: ",name{mintdata->holder_account}," balance: ",mintdata->token_amount);

    }

    /**
    * Output contract timeline
    **/
    [[eosio::action]]
    void showtimeline(){

        //Check if token already exists
        params_type params_table{_self, _self};
        auto existing_params = params_table.find( _self );
        eosio_assert( existing_params != params_table.end(), "Token  or contract doesn't set \n" );

        const  auto &params = params_table.get(_self);

        uint32_t current_time = now();



        if (params.start_contract_time<current_time) {

            print("Contract started at: ", params.start_contract_time);
        } else
        {
            print("Contract will start at: ", params.start_contract_time);
        }

         print(" and ends at: ", params.end_contract_time);

    }

    /**
    * Help of a contract
    **/
    [[eosio::action]]
    void help(){


        print("Manual should be printed here");
    }


#warning Erase method only for testing purposes, NOT DEPLOY!!! REMOVE it for production, so contract will not be compromised;
    [[eosio::action]]
    void erase(account_name user){
        require_auth(user);
        price_matrix current_price_matrix(_self, user );
        auto iterator = current_price_matrix.cbegin();
        while (iterator!=current_price_matrix.cend())
        {
            current_price_matrix.erase(iterator);
            iterator = current_price_matrix.cbegin();
        }

        params_type current_params(_self, _self );
        auto existing_params = current_params.find( _self );
        current_params.erase(existing_params);
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


    std::string epoch_time_to_sting(const uint64_t &time)
    {

    }





};

EOSIO_ABI( crowdsale, (create)(mint)(currentprice)(tokensold)(centsraised)(showprices)(showtimeline)(showmintdata)(erase)(help)(showbalance))
