// /// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// /// @title The contract for buying and selling items on a market
// contract Market {
//     uint256 current_listing_id = 0;
//     uint256 public activelistings = 0;

//     struct Bid {
//         bytes32 bidHash;
//         uint256 bidAmount;
//     }
//     /// @notice structure for each listings
//     /// @dev uint is the unique listing id
//     /// @dev seller stores the seller address
//     /// @dev buyer stores the buyer address
//     /// @dev price is the price of the item
//     /// @dev item_name is the name of the item
//     /// @dev item_description has the description of the item

//     struct listings {
//         uint256 listing_id;
//         address payable seller;
//         address payable buyer;
//         uint256 price;
//         string item_name;
//         string item_description;
//         bool sold_or_withdrawn;
//         bool buyer_alloted;
//         Bid bids;
//         uint256 highestBid;
//         uint256 secondHighestBid;
//         address highestBidder;
//         address beneficiary;
//         uint256 auctionStart;
//         uint256 biddingEnd;
//         uint256 revealEnd;
//         bool ended;
//         State state;
//     }

//     /// @dev this event is emitted when a listing is created
//     event ListingCreated(
//         uint256 indexed listing_id,
//         address seller,
//         uint256 price,
//         string item_name,
//         string item_description
//     );
//     /// @dev this event is for when listing is modified ,item sold or withdrawn
//     event ListingChanged(address indexed seller, uint256 indexed index);
//     /// @dev this event is for when item purchase is requested by buyer
//     event PurchaseRequested(
//         listings list,
//         address indexed buyer,
//         string pub_key
//     );
//     /// @dev this event is for when seller confirms item purchase by buyer
//     event encryptedKey(uint256 indexed listing_id, string H);
//     /// @dev event emitted when the a item is bought and both the seller and buyer gets the money/item
//     event PurchaseComplete(listings list);
//     /// @dev this event is for when transaction is aborted
//     event Aborted();

//     /// @dev this event is for when listing is modified ,item sold or withdrawn
//     event AuctionStarted(address winner, uint256 highestBid);
//     /// @dev this event is for when listing is modified ,item sold or withdrawn
//     event AuctionEnded(address winner, uint256 highestBid);

//     /// @dev create a listing for all possible listing id and make it private
//     mapping(uint256 => listings) private Listings;

//     /// @dev State variables for the items listed. By default, it is Created
//     enum State {
//         Created,
//         Active,
//         Sold,
//         Delivered,
//         Inactive
//     }
//     State public state;

//     /// @notice Check whether a given condition is true
//     /// @param _condition condition statement to verify.
//     modifier condition(bool _condition) {
//         require(_condition);
//         _;
//     }

//     /// @notice Seller cannot be buyer of the same item
//     /// @param listing_id Id of the listing.
//     modifier ValidBuyer(uint256 listing_id) {
//         require(Listings[listing_id].seller != msg.sender, "Invalid Buyer");
//         _;
//     }

//     /// @notice Buyer cannot be seller of the same item
//     /// @param listing_id Id of the listing.
//     modifier ValidSeller(uint256 listing_id) {
//         require(Listings[listing_id].buyer != msg.sender, "Invalid Seller");
//         _;
//     }

//     /// @notice Check that an item is available
//     /// @param listing_id Id of the listing.
//     modifier CheckState(uint256 listing_id) {
//         require(
//             !Listings[listing_id].sold_or_withdrawn,
//             "Item has already been bought / withdrawn"
//         );
//         _;
//     }

//     /// @notice Item in use should be a valid listing
//     /// @param listing_id Id of the listing.
//     modifier ValidListing(uint256 listing_id) {
//         require(
//             listing_id < current_listing_id && listing_id >= 0,
//             "Invalid Listing Id"
//         );
//         _;
//     }

//     modifier onlyBefore(uint256 _time) {
//         require(block.timestamp < _time);
//         _;
//     }
//     modifier onlyAfter(uint256 _time) {
//         require(block.timestamp > _time);
//         _;
//     }

//     /// @notice Check that the string meets the required criteria
//     /// @param str The item string.
//     modifier ValidString(string memory str) {
//         require(
//             bytes(str).length <= 50,
//             "String Length is 50 characters maximum"
//         );
//         _;
//     }

//     /// @notice returns balance of account
//     /// @param account Address of the account.
//     function getAccountBalance(address account)
//         public
//         view
//         returns (uint256 accountBalance)
//     {
//         accountBalance = account.balance;
//     }

//     /// @notice Create a listing for sale in the market place
//     /// @param price Price of the item listed.
//     /// @param item_name Name of item listed
//     /// @param item_description Description of item.
//     function createListings(
//         uint256 price,
//         string calldata item_name,
//         string calldata item_description
//     ) external payable condition(price > 0) {
//         uint256 listing_id = current_listing_id;
//         current_listing_id += 1;
//         activelistings += 1;

//         Listings[listing_id] = listings(
//             listing_id,
//             msg.sender,
//             address(0),
//             price,
//             item_name,
//             item_description,
//             false,
//             false,
//             State.Active
//         );
//         /// @dev emit the update
//         emit ListingCreated(
//             listing_id,
//             msg.sender,
//             price,
//             item_name,
//             item_description
//         );
//         emit ListingChanged(msg.sender, activelistings);
//     }

//     /// @notice Get all the active listings items in the market
//     /// @return a list of active listings
//     function fetchactivelistings() external view returns (listings[] memory) {
//         uint256 currentIndex = 0;

//         listings[] memory active_list = new listings[](activelistings);
//         for (uint256 i = 0; i < current_listing_id; i++) {
//             /// @dev only consider listings which are unsold/not withdrawn
//             if (Listings[i].sold_or_withdrawn == false) {
//                 listings storage currentlisting = Listings[i];
//                 active_list[currentIndex] = currentlisting;
//                 currentIndex += 1;
//             }
//         }
//         return active_list;
//     }

//     /// @notice Request from buyer to seller for item's purchase
//     /// @dev the contract emits a event to let the seller know that an buyer has been found
//     /// @param listing_id is the id of the item buyer is interested in
//     function requestBuy(uint256 listing_id, string calldata pubkey)
//         external
//         payable
//         ValidBuyer(listing_id)
//         ValidListing(listing_id)
//         CheckState(listing_id)
//     {
//         /// Check whether item has a buyer already
//         require(
//             !Listings[listing_id].buyer_alloted,
//             "the item already has a buyer,in midst of transaction"
//         );

//         /// Check sufficient balance for transfer
//         require(
//             msg.sender.balance >= Listings[listing_id].price,
//             "Insuficient Balance for transaction"
//         );

//         /// Check whether you have provided 2 times the selling price,for security purposes
//         require(
//             msg.value == 2 * Listings[listing_id].price,
//             "The required deposit for the purchase not given "
//         );

//         /// Let the seller know you have found a buyer
//         Listings[listing_id].buyer = msg.sender;
//         Listings[listing_id].buyer_alloted = true;
//         emit PurchaseRequested(Listings[listing_id], msg.sender, pubkey);
//     }

//     /// @notice Sale of item from seller's side
//     /// @dev Transaction from the seller
//     /// @dev listing id is the id of the item being sold_
//     /// @dev H is the unique string for the item
//     function sellItem(uint256 listing_id, string calldata H)
//         external
//         payable
//         ValidListing(listing_id)
//         /// ValidString(H)
//         ValidSeller(listing_id)
//         CheckState(listing_id)
//     {
//         /// Check the security deposits
//         require(
//             msg.value == 2 * Listings[listing_id].price,
//             "You have not paid the security deposit"
//         );
//         Listings[listing_id].state = State.Sold;
//         /// Listings[listing_id].sold_or_withdrawn = true;

//         emit encryptedKey(listing_id, H);
//     }

//     /// @notice Confirmation from buyer on receiving item
//     /// @dev the buyer confirms to get the refund of the money owed.(price)
//     /// @dev the seller gets his amount + price (3 * price)
//     /// @param listing_id the listing id is the item being exchanged
//     function confirmDelivery(uint256 listing_id)
//         external
//         payable
//         ValidListing(listing_id)
//         ValidBuyer(listing_id)
//         CheckState(listing_id)
//     {
//         /// Refund the seller
//         Listings[listing_id].sold_or_withdrawn = true;
//         Listings[listing_id].seller.transfer(3 * Listings[listing_id].price);
//         /// Refund the buyer
//         Listings[listing_id].buyer.transfer(Listings[listing_id].price);
//         activelistings -= 1;
//         Listings[listing_id].state = State.Delivered;
//         emit ListingChanged(Listings[listing_id].seller, listing_id);
//         emit PurchaseComplete(Listings[listing_id]);
//     }

//     /// @notice Abort the purchase and reclaim the ether.
//     function abort(uint256 listing_id) public CheckState(listing_id) {
//         emit Aborted();
//         Listings[listing_id].state = State.Inactive;
//         activelistings -= 1;
//         Listings[listing_id].seller.transfer(address(this).balance);
//     }
// }
