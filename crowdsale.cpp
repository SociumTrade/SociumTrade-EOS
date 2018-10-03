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



     [[eosio::action]]
      void hi( account_name user ) {
         print( "Hello, ", name{user} );
      }


    [[eosio::action]]
      void create( account_name user, string price_time_values_string, uint32_t startTime, uint32_t endTime) {

        require_auth(user);

        if (startTime<=0 || endTime <=0 || startTime>endTime) {
            eosio_assert(0, "Start time or End time entered incorrect. Please check");}
        start_time{_self,_self}.set(starttime{startTime},user);
        end_time{_self,_self}.set(endtime{endTime},user);

        price_matrix current_price_matrix(_self, user);

        auto itr = current_price_matrix.find(user);
        eosio_assert(itr == current_price_matrix.end(), "Matrix already exist");

        std::map<int,int > matrix_map = mappify2(price_time_values_string);

        for (const auto &pair :matrix_map)
        {

            if ((uint32_t)pair.first <= startTime || (uint32_t)pair.first > endTime)
            {
                eosio_assert(0, "Price Matrix value is not in the range of Start time and End time of a contract. Please check");
            }


        };


            for (const auto &pair :matrix_map)
            {

                current_price_matrix.emplace(user, [&]( auto& element )
                {
                    element.end_time = (uint64_t)pair.first;
                    element.euro_cent_price = (uint32_t)pair.second;

                });

            }




    }

    [[eosio::action]]
    void mint(account_name user, account_name to, asset &price_amount){
        require_auth(user);

        eosio_assert( price_amount.is_valid(), "invalid quantity" );
        eosio_assert( price_amount.amount > 0, "must withdraw positive quantity" );

        price_matrix current_price_matrix(_self, user );

//eosio_assert(time_contract{_self,_self}.exists(),"time of contract is not set");

        bool stop = 0;
        uint32_t last_value =1316134911;
        uint32_t start_contract_time = start_time{_self,_self}.get().start_contract_time;
        uint32_t end_contract_time = end_time{_self,_self}.get().end_contract_time;
        auto iterator = current_price_matrix.cbegin();
        uint32_t current_time = now();
        eosio::print("1 last_value: ",last_value," current_time: ",current_time, " end contract time: ", end_contract_time, " start contract time: ", start_contract_time);
     //   eosio_assert(static_cast<uint32_t>(end_contract_time < current_time), "Contract ended");
     //   eosio_assert(static_cast<uint32_t>(start_contract_time > current_time), "Contract not started yet");

        for(const pricetime& p : current_price_matrix)
        {
            if (current_time<p.end_time) {
                eosio::print("\nbreak current time: ",current_time, " encd time:",p.end_time,"\n");
                break;
            }
          last_value = p.euro_cent_price;

        }

eosio::print("2 last_value: ",last_value," current_time: ",current_time, " end contract time: ", end_contract_time, " start contract time: ", start_contract_time );
        eosio::print("3 amount to transfer: ",price_amount, " last value: ",last_value,"  ",name{_self}, " to ",name {user}, " bla ",name{to});
        action(
                permission_level{ user, N(active)},
                N(eosio.sm), N(issue),
                std::make_tuple(to, asset(price_amount.amount/last_value,price_amount.symbol), std::string("mint"))
        ).send();

//        price_matrix current_price_matrix(_self, user );
//        auto iterator = current_price_matrix.cbegin();
//        while (iterator!=current_price_matrix.cend())
//        {
//            current_price_matrix.erase(iterator);
//            iterator = current_price_matrix.cbegin();
//        }

    }


    //only for testing purposes.
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

    struct [[eosio::table]] pricetime
    {
        uint64_t end_time;
        uint32_t euro_cent_price;


        uint64_t primary_key() const { return end_time; }
    };

    typedef eosio::multi_index< N(pricetime), pricetime> price_matrix;

private:
    struct starttime {
        uint32_t start_contract_time;

        uint32_t primary_key() const { return start_contract_time; }
        EOSLIB_SERIALIZE(starttime, (start_contract_time))
    };

    typedef singleton<N(starttime), starttime> start_time;


    struct endtime {
        uint32_t end_contract_time;

        uint32_t primary_key() const { return end_contract_time; }
        EOSLIB_SERIALIZE(endtime, (end_contract_time))
    };

    typedef singleton<N(endtime), endtime> end_time;

};

EOSIO_ABI( crowdsale, (hi)(create)(erase)(mint))
