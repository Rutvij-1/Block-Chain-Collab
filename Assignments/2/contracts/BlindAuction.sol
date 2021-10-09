/// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;


/// @title The contract for buying and selling items on a market
contract BlindAuction {

    // Important Structures
    
    ///@dev stores the blinded bid
    ///@param bidHash stores the bid hashed using the public pub_key
    ///@param deposit stores the deposited amount
    struct Bid {
        bytes32 bidHash;
        uint256 deposit;
    }

    /// @dev structure for each Auction item
    /// @param auction_id unique id for the items
    /// @param beneficiary the seller
    /// @param biddingEnd time the bidding end
    /// @param revealEnd time when reveal period is over
    /// @param ended shows the auction ended
    /// @param item_name shows name of the item
    /// @param item_description description of the item
    /// @param bids stores the list of bids indexed by address
    /// @param sold bool to denote whether the item is sold or not
    /// @param highestBidder address of the highest bidder
    /// @param highestBid value of the highest bid
    /// @param pendingReturns the value to return to each bidder
    /// @param bidded the boolean to track which addresses have bidded.
    struct auctions {
        uint256 auction_id;
        address payable beneficiary;
        uint256 biddingEnd;
        uint256 revealEnd;
        bool ended;
        string item_name;
        string item_description;
        
        bool sold; 
        address payable highestBidder;
        uint256 highestBid;

        mapping(address => Bid) bids;
    // Allowed withdrawals of previous bids
        mapping(address => uint) pendingReturns;
        mapping(address => bool) bidded;


    }


    /// @dev structure for each display active Auction Listings 
    /// @param auction_id unique id for the items
    /// @param biddingEnd time the bidding end
    /// @param revealEnd time when reveal period is over
    /// @param ended shows the auction ended
    /// @param item_name shows name of the item
    /// @param item_description description of the item
    
    
    struct auction_listings {
        uint256 auction_id;
        //address payable beneficiary;
        uint256 biddingEnd;
        uint256 revealEnd;
        bool ended;
        string item_name;
        string item_description;
        
        //bool sold; 
        //address highestBidder;
        //uint highestBid;

        //mapping(address => Bid) bids;
    // Allowed withdrawals of previous bids
        //mapping(address => uint) pendingReturns;


    }


    // Errors that describe failures.

    /// The function has been called too early.
    /// Try again at `time`.
    //error TooEarly(uint time);
    /// The function has been called too late.
    /// It cannot be called after `time`.
    //error TooLate(uint time);
    /// The function auctionEnd has already been called.
    //error AuctionEndAlreadyCalled();


    /// EVENTS

    /// @dev this event is for when auction item is for when item for auction is listed
    /// @param Auction_id id of the auction 
    /// @param item_name  name of the item to be Auction
    /// @param item_description  description of the item to be auctioned
    event AuctionStarted(uint256 Auction_id,string item_name,string item_description);

    /// @dev this event to annouce auction started
    /// @param Auction_id is the id of the auction 
    /// @param highestBidder is the address of the highest Bidder
    /// @param highestBid is the value of the winning bid
    event AuctionEnded(uint256 Auction_id,address highestBidder,uint256 highestBid);



    ///@dev when an item goes unsold at the end of the auction
    ///@param auction_id is the id of the auction
    event ItemUnsold(uint256 auction_id);

    /// @dev this event to annouce bidding started
    /// @param Auction_id is the id of the auction 
    /// @param bidding_end is the time when bidding period ends
    event BiddingStarted(uint256 Auction_id,uint256 bidding_end);

     /// @dev this event to annouce bidding period ended
    /// @param Auction_id is the id of the auction 
    event BiddingPeriodEnded(uint256 Auction_id);

     /// @dev announcement of a new 
     /// @param bidder address of the bidder
    event BidMade(address bidder);

    ///@dev announcement to start revealing bids
    /// @param Auction_id id of the auction item
    /// @param reveal_end is the time when revealing period ends
    event RevealPeriodStarted(uint256 Auction_id,uint256 reveal_end);

    ///@dev annouce to end revealing period
    /// @param Auction_id id of the auction
    event RevealPeriodEnded(uint256 Auction_id);

    ///@dev announce winner
    /// @param Auction_id is the id of the auction
    /// @param winner is the address of the winner
    event WinnerChosen(uint256 Auction_id,address winner);

    ///@dev bid revealed 
    ///@param Auction_id is the id of the auction
    ///@param bidder is the address of the revealer
    ///@param success refers to whether the bid is succesfully revealed and refund done
    event BidRevealed(uint256 Auction_id,address bidder,bool success);

    ///@dev event to notify withdrawal of bids  
    ///@param auction_id is the id of the auction
    ///@param bidder is the address of the revealer
    ///@param bid_value  refers to whether the bid is succesfully revealed and refund done
    event BidderWithdrawn(uint256 auction_id,address bidder,uint256 bid_value);

    /// @dev create a lists of all auctions
    mapping(uint256 => auctions) private Auctions;

        // variables for managing auctions
    uint256 current_auction_id = 0;
    uint256 activeauctions = 0;


    //MODIFIERS

    /// @notice Check whether a given condition is true
    /// @param _condition condition statement to verify.
    modifier condition(bool _condition) {
        require(_condition);
        _;
    }


    modifier onlyBefore(uint256 _time) {
        require(block.timestamp < _time);
        _;
    }
    modifier onlyAfter(uint256 _time) {
        require(block.timestamp > _time);
        _;
    }


    modifier validBidder(uint256 auction_id) {
        require(msg.sender != Auctions[auction_id].beneficiary, "Beneficiary cannot bid");
        _;
    } modifier newBidder(uint256 auction_id) {
        require(!Auctions[auction_id].bidded[msg.sender], "Bidder Already placed their bid");
        _;
    }

    modifier alreadyBidder(uint256 auction_id) {
        require(Auctions[auction_id].bidded[msg.sender], "Didn't place a bet,no point in revealing the bid");
        _;
    }
    

    modifier onlyBeneficiary(uint256 auction_id){
        require(Auctions[auction_id].beneficiary == msg.sender, "Only Beneficiary can end the auction");
        _;
    }
       modifier auctionActive(uint256 auction_id){
        require(Auctions[auction_id].ended == false, "Auction already ended");
        _;
    }
    





    //functions


    /// @notice returns balance of account
    /// @param account Address of the account.
    function getAccountBalance(address account)
        public
        view
        returns (uint256 accountBalance)
    {
        accountBalance = account.balance;
    }



    /// @dev function to list the auction of a new item 
    /// @param item_name name of the item
    /// @param item_description is the description of the item
    /// @param bidding_time how long the bidding will go
    /// @param reveal_time how long the reveal will go 
    function auctionItem(
        string calldata item_name,
        string calldata item_description,
        uint256 bidding_time,
        uint256 reveal_time) external payable {
            uint256 auction_id = current_auction_id;
            current_auction_id += 1;
            activeauctions += 1;
            uint256 bidding_end = block.timestamp + bidding_time;
            uint256 reveal_end = bidding_end + reveal_time;

            Auctions[auction_id] = auctions(
                auction_id,
                msg.sender,
                bidding_end,
                reveal_end,
                false,
                item_name,
                item_description,
                false,
                address(0),
                0       
            );
        emit AuctionStarted(auction_id,item_name,item_description);
        emit BiddingStarted(auction_id, bidding_end);


        }
    
    
    // function to to get a list of all active auctions
    /// @notice Get all the active auction listings items in the market
    /// @return a list of active auction listings
    function getactiveauctions() external view returns (auction_listings[] memory) {
        uint256 currentIndex = 0;
        auction_listings[] memory active_auctions = new auction_listings[](activeauctions);
        for (uint256 i = 0; i < current_auction_id; i++){
            if(Auctions[i].ended == false){
                auctions storage currentauction = Auctions[i];
                active_auctions[currentIndex] = auction_listings(
                    currentauction.auction_id,
                    currentauction.biddingEnd,
                    currentauction.revealEnd,
                    currentauction.ended,
                    currentauction.item_name,
                    currentauction.item_description
                );
            }
            currentIndex += 1;
        }
        return active_auctions;

    }

    // function that can be used to bid in an auction
    /// @param blindedBid is the hashed version of bid 
    /// @param auction_id is the id of the auction
    function bid(bytes32 blindedBid,uint256 auction_id)

        external
        payable
        onlyBefore(Auctions[auction_id].biddingEnd)
        validBidder(auction_id)
        newBidder(auction_id)
    {
        Auctions[auction_id].bids[msg.sender] = Bid(
            blindedBid,
            msg.value

        );
        emit BidMade(msg.sender);

    }

    /// @dev Reveal your blinded bids. You will get a refund for all
    /// @dev correctly blinded invalid bids and for all bids except for
    /// @dev the totally highest.
    /// @param value value of the bid
    /// @param fake not sure what fake is for 
    /// @param secret again not sure 
    /// @param auction_id id of the auction
    function reveal(
        uint256 value,
        bool fake,
        bytes32 secret,
        uint256 auction_id
    )
        external
        payable 
        onlyAfter(Auctions[auction_id].biddingEnd)
        onlyBefore(Auctions[auction_id].revealEnd)
        alreadyBidder(auction_id)
    {
        

        uint256 refund = 0 ;
        bool success = false;
            //get the bid placed by the user 
            Bid storage bidToCheck = Auctions[auction_id].bids[msg.sender];

            // improper revealing 
            if (bidToCheck.bidHash != keccak256(abi.encodePacked(value, fake, secret))) {
                // Bid was not actually revealed.
                // Do not refund deposit.
            
            }
            else
            {
            refund += bidToCheck.deposit;
            if (!fake && bidToCheck.deposit >= value) {
                if (placeBid(auction_id,msg.sender, value))
                    refund -= value;
            }
            }
            // Make it impossible for the sender to re-claim
            // the same deposit.
            bidToCheck.bidHash = bytes32(0);
        
        msg.sender.transfer(refund);
        emit BidRevealed(auction_id,msg.sender,success);
    }

    

     // This is an "internal" function which means that it
    // can only be called from the contract itself (or from
    // derived contracts).
    ///@dev the function is used accept bids by the owner
    ///@param auction_id is the id of the auction 
    ///@param bidder is the address of the bidder
    ///@param value is the value of the bid
    function placeBid(uint256 auction_id,address payable bidder, uint value) internal
            returns (bool success)
    {
        if (value <= Auctions[auction_id].highestBid) {
            return false;
        }
        if (Auctions[auction_id].highestBidder != address(0)) {
            // Refund the previously highest bidder.
            Auctions[auction_id].pendingReturns[Auctions[auction_id].highestBidder] += Auctions[auction_id].highestBid;
        }
        Auctions[auction_id].highestBid = value;
        Auctions[auction_id].highestBidder = bidder;
        return true;
    }


    ///@dev function to withdraw overbid/non-winning bids
    ///@param auction_id is the id of the Auction
    function withdraw(uint256 auction_id) 
    external
     {
        emit BidderWithdrawn(auction_id,msg.sender, Auctions[auction_id].pendingReturns[msg.sender]);
        if (Auctions[auction_id].pendingReturns[msg.sender] > 0) {
            uint256 value = Auctions[auction_id].pendingReturns[msg.sender];
            Auctions[auction_id].pendingReturns[msg.sender] = 0;
            address payable payable_sender = msg.sender;
            payable_sender.transfer(value);
        }
    }


    ///@dev End the auction and send the highest bid to the beneficiary
    ///@param auction_id is the id of the auction
    ///@notice only beneficiary of the auction can call the function
    function auctionEnd(uint256 auction_id)
        external
        onlyAfter(Auctions[auction_id].revealEnd)
        onlyBeneficiary(auction_id)
        auctionActive(auction_id)
    {
       // if (Auctions[auction_id].ended) revert AuctionEndAlreadyCalled();
         if(Auctions[auction_id].highestBid == 0 && Auctions[auction_id].highestBidder == address(0)){
            emit ItemUnsold(auction_id);
            emit AuctionEnded(auction_id,address(0),0);
            Auctions[auction_id].ended = true;
        }
        else{
        emit AuctionEnded(auction_id,Auctions[auction_id].highestBidder, Auctions[auction_id].highestBid);
        Auctions[auction_id].ended = true;
        Auctions[auction_id].sold = true ;
        Auctions[auction_id].beneficiary.transfer(Auctions[auction_id].highestBid);
        emit WinnerChosen(auction_id,Auctions[auction_id].highestBidder);
        }
    }


    }



    
        
