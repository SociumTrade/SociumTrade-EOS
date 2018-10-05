#include <eosiolib/eosio.hpp>
#include <eosiolib/time.hpp>
#include <string>
#include <eosiolib/print.hpp>
#include <stdio.h>
#include <time.h>
#include <eosiolib/asset.hpp>
#include <eosiolib/singleton.hpp>


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


    static  constexpr const char* token_contract_string = "crowdtoken11";

    /**
    *  Create method fill the contract with price matrix and start and end date timeline
    *  @param user (required) - account name who will be authorised to use this contract method
    *  @param price_time_values_string (required) - a string of time:price values separated by space, where time in seconds from 1970 to map
     *  for example "1538491727:1 1538501726:2 1538511726:3 1538521726:4"
    *  @param startTime (required) - uint32 value in seconds from 1970 when contract should be started
    *  @param endTime (required) - uint32 value in seconds from 1970 when contract should be ended
    */

    [[eosio::action]]
    void create( account_name user, string price_time_values_string, uint32_t startTime, uint32_t endTime) {

        //check if this user authorised to run this method
        require_auth(user);

        //terminate if start and end time of the contract are incorrect
        if (startTime<=0 || endTime <=0 || startTime>endTime) {
            eosio_assert(0, "Start time or End time entered incorrect. Please check");}

        //save start and end time of the contract into blockchain
        start_time{_self,_self}.set(starttime{startTime},user);
        end_time{_self,_self}.set(endtime{endTime},user);

        //initialise price matrix table
        price_matrix current_price_matrix(_self, user);

        //check if matrix already exist and creaated for thi contract and terminate method
        auto itr = current_price_matrix.find(user);
        eosio_assert(itr == current_price_matrix.end(), "Matrix already exist");

        //parse price matrix string into map
        std::map<int,int > matrix_map = mappify2(price_time_values_string);

        //check if time values entered in price matrix are in the range of the start and end time of the contract
        for (const auto &pair :matrix_map)
        {
            if ((uint32_t)pair.first <= startTime || (uint32_t)pair.first > endTime) {
                eosio_assert(0, "Price Matrix value is not in the range of Start time and End time of a contract. Please check");
            }
        };


        //put price matrix values into the blockchain table
        for (const auto &pair :matrix_map)
        {
            current_price_matrix.emplace(user, [&]( auto& element ) {
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
    */
    [[eosio::action]]
    void mint(account_name user, account_name to, asset &price_amount){

        //check if this user authorised to run this method
        require_auth(user);

        //check if price_amount entered correctly
        eosio_assert( price_amount.is_valid(), "invalid quantity" );
        eosio_assert( price_amount.amount > 0, "must withdraw positive quantity" );

        //get price matrix table from blockhain
        price_matrix current_price_matrix(_self, user );

        //get current price value for token based on price matrix and current time
        uint32_t last_value =1316134911;
        uint32_t start_contract_time = start_time{_self,_self}.get().start_contract_time;
        uint32_t end_contract_time = end_time{_self,_self}.get().end_contract_time;
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
        
        //make issue action to token contract
        action(
                permission_level{ user, N(active)},
                user, N(issue),
                std::make_tuple(to, asset(price_amount.amount/last_value,price_amount.symbol), std::string("mint"))
        ).send();


    }


 //   Only for testing purposes. Uncomment to be able to remove price matrix table from blockhain
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

    //structure to store start  time of a contract to blockchain
    struct starttime {
        uint32_t start_contract_time;

        uint32_t primary_key() const { return start_contract_time; }
        EOSLIB_SERIALIZE(starttime, (start_contract_time))
    };

    typedef singleton<N(starttime), starttime> start_time;

    //structure to store  end time of a contract to blockchain
    struct endtime {
        uint32_t end_contract_time;

        uint32_t primary_key() const { return end_contract_time; }
        EOSLIB_SERIALIZE(endtime, (end_contract_time))
    };

    typedef singleton<N(endtime), endtime> end_time;

};

EOSIO_ABI( crowdsale, (create)(erase)(mint))
