/// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

/// @title The contract for buying and selling items on a market
contract VikreyAuction {
    address payable public beneficiary;
    address payable public winner;
    uint256 listing_id;
    uint256 public biddingEnd;
    uint256 public revealEnd;
    uint256 public highestBid;
    uint256 public secondHighestBid;
    bool public ended;

    struct Bid {
        bytes32 bidHash;
        uint256 deposit;
    }

    mapping(address => Bid) public bids;
    mapping(address => bool) public bidAlready;
    mapping(address => uint256) pendingReturns;

    event AuctionEnded(address winner, uint256 secondHighestBid);
    event BidForItem(address bidder, uint256 deposit);
    event ValidBidRevealed(address bidder, uint256 value);
    event InvalidBidRevealed(address bidder, uint256 value);
    event BidderWithdrawn(address bidder, uint256 value);

    // error TooEarly(uint256 time);
    // error TooLate(uint256 time);
    // error AuctionAlreadyEnded();
    // error AlreadyBid(address bidder);

    modifier beforeTime(uint256 time) {
        // if (block.timestamp >= time) {
        //     revert TooLate(time);
        // }
        require(block.timestamp < time, "Too Late");
        _;
    }
    modifier afterTime(uint256 time) {
        require(block.timestamp > time, "Too Early");
        _;
    }
    modifier newBidder() {
        require(!bidAlready[msg.sender], "Bidder Already placed their bid");
        _;
    }
    modifier validBidder() {
        require(msg.sender != beneficiary, "Beneficiary cannot bid");
        _;
    }

    constructor(
        uint256 _listing_id,
        uint256 bidding_time,
        uint256 reveal_time,
        address payable _beneficiary
    ) public {
        listing_id = _listing_id;
        biddingEnd = block.timestamp + bidding_time;
        revealEnd = biddingEnd + reveal_time;
        beneficiary = _beneficiary;
    }

    function bid(bytes32 bid_hash)
        public
        payable
        beforeTime(biddingEnd)
        newBidder
        validBidder
    {
        bids[msg.sender] = Bid(bid_hash, msg.value);
        bidAlready[msg.sender] = true;
        emit BidForItem(msg.sender, msg.value);
    }

    function validReveal(
        address bidder,
        uint256 value,
        string memory secret
    ) internal returns (bool isValid) {
        if (
            bids[bidder].bidHash == keccak256(abi.encodePacked(value, secret))
        ) {
            return true;
        }
        return false;
    }

    function placeBid(address payable bidder, uint256 value)
        internal
        returns (bool success)
    {
        if (value <= highestBid) {
            return false;
        }
        if (winner == address(0)) {
            highestBid = value;
            secondHighestBid = value;
        } else {
            pendingReturns[winner] += secondHighestBid;
            secondHighestBid = highestBid;
            highestBid = value;
        }
        winner = bidder;
        return true;
    }

    function reveal(uint256 value, string memory secret)
        public
        afterTime(biddingEnd)
        beforeTime(revealEnd)
    {
        require(bidAlready[msg.sender], "This person is not a bidder");
        if (validReveal(msg.sender, value, secret)) {
            emit ValidBidRevealed(msg.sender, value);
            address payable payable_sender = msg.sender;
            if (bids[msg.sender].deposit >= value) {
                if (placeBid(payable_sender, value)) {
                    payable_sender.transfer(
                        bids[msg.sender].deposit - secondHighestBid
                    );
                } else {
                    payable_sender.transfer(bids[msg.sender].deposit);
                }
            } else {
                emit InvalidBidRevealed(msg.sender, value);
                payable_sender.transfer(bids[msg.sender].deposit);
            }
        }
    }

    function withdraw() public {
        emit BidderWithdrawn(msg.sender, pendingReturns[msg.sender]);
        if (pendingReturns[msg.sender] > 0) {
            pendingReturns[msg.sender] = 0;
            address payable payable_sender = msg.sender;
            payable_sender.transfer(pendingReturns[msg.sender]);
        }
    }

    function endAuction() public afterTime(revealEnd) {
        // if (ended) {
        //     revert AuctionAlreadyEnded();
        // }
        require(!ended, "Auction has Already Ended");
        emit AuctionEnded(winner, secondHighestBid);
        ended = true;
        beneficiary.transfer(secondHighestBid);
    }
}
