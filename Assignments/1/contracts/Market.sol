// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Market {
    uint256 current_listing_id = 0;
    uint256 public activelistings = 0;

    // structure for each listings
    /// @dev uint is the unique listing id
    /// @dev seller stores the seller address
    /// @dev price is the price of the item
    /// @dev item_name is the name of the item
    /// @dev item_description has the description of the item
    /// @dev sold indicates whether the item is already sold or not

    struct listings {
        uint256 listing_id;
        address payable seller;
        uint256 price;
        string item_name;
        string item_description;
        bool sold_or_withdrawn;
        bool buyer_alloted;
        address payable buyer;
        //address owner
    }

    // structure for each sale
    /// @dev uint is the unique listing id of the item
    /// @dev seller stores the seller address
    /// @dev buyer stores the buyer address
    /// @dev secret_key is the unique string authorising the sale

    // struct sales {
    //     uint256 listing_id;
    //     address payable seller;
    //     address payable buyer;
    //     string secret_key;
    // }

    /// @dev this event is emitted when a listing is created
    event ListingCreated(
        uint256 indexed listing_id,
        address seller,
        uint256 price,
        string item_name,
        string item_description
    );
    /// @dev this event is for when listing is modified ,item sold or withdrawn
    event ListingChanged(address indexed seller, uint256 indexed index);
    /// @dev this event is for when item purchase is requested by buyer
    event PurchaseRequested(listings list, address indexed buyer);
    /// @dev this event is for when seller confirms item purchase by buyer
    /// @dev the hash of the item string is added the block chain from where the buyer can retrieve and decrypt
    event encryptedKey(uint256 indexed listing_id, string H);
    /// event emitted when the a item is bought and both the seller and buyer gets the money/item
    event PurchaseComplete(listings list);

    /// @dev this event is emitted when a sale is initiated
    // event SaleCreated(
    //     uint256 indexed listing_id,
    //     address indexed seller,
    //     address indexed buyer
    // );

    // create a listing for all possible listing id and make it private
    mapping(uint256 => listings) private Listings;

    // create a listing for all possible listing id and make it private
    // mapping(uint256 => sales) private Sales;

    // function randomKeyGenerator() pure returns (string) {
    //     return string(keccak256(abi.encodePacked(now)));
    // }

    //create a listing for sale in the market place
    function createListings(
        uint256 price,
        string calldata item_name,
        string calldata item_description
    ) external payable {
        require(price > 0, "Price cannot be 0 wei");

        uint256 listing_id = current_listing_id;
        current_listing_id += 1;
        activelistings += 1;

        Listings[listing_id] = listings(
            listing_id,
            msg.sender,
            price,
            item_name,
            item_description,
            false, 
            false,
            address(0)
        );
        // emit the update
        emit ListingCreated(
            listing_id,
            msg.sender,
            price,
            item_name,
            item_description
        );
        emit ListingChanged(msg.sender, activelistings);
    }

    /* Returns all unsold/unwithdrawn market items */
    ///@dev returns a list of active listings
    function fetchactivelistings() external view returns (listings[] memory) {
        uint256 currentIndex = 0;

        listings[] memory active_list = new listings[](activelistings);
        for (uint256 i = 0; i < current_listing_id; i++) {
            // only consider listings which are unsold/not withdrawn
            if (Listings[i].sold_or_withdrawn == false) {
                listings storage currentlisting = Listings[i];
                active_list[currentIndex] = currentlisting;
                currentIndex += 1;
            }
        }
        return active_list;
    }

    //request from buyer to seller for item's purchase
    // the contract emits a event to let the seller know that an buyer has been found
    /// @dev listing id is the id of the item buyer is interested in
    function requestBuy(uint256 listing_id) external payable {
        require(
            listing_id < current_listing_id && listing_id >= 0,
            "Listing id is invalid"
        ); // Check for valid listing id
        require(
            !Listings[listing_id].sold_or_withdrawn,
            "The item has already been bought"
        ); // Check if the item is still available
        require(
          !Listings[listing_id].buyer_alloted,
          "the item already has a buyer,in midst of transaction"
        ); // Check whether item has a buyer already
        require(
          msg.value == 2*Listings[listing_id].price,
          "The required deposit for the purchase not given "
        );// check whether you have provided 2 times the selling price,for security purposes
        require(
          msg.sender != Listings[listing_id].seller,
          "You cant buy your own items "
        );
        //Check that the seller is not the buyer

        // let the seller know you have found a buyer
        Listings[listing_id].buyer = msg.sender;
        Listings[listing_id].buyer_alloted = true;
        emit PurchaseRequested(Listings[listing_id], msg.sender);
    }

    //Sale of item from seller's side
    // transaction from the seller 
    /// @dev listing id is the id of the item being sold_
    /// @dev H is the hashed key for the item string (Hashed using the public key of the buyer off-chain)
    function sellItem(uint256 listing_id,string calldata  H) external payable {
        require(
            listing_id < current_listing_id && listing_id >= 0,
            "Listing id is invalid"
        ); // Check for valid listing id
        require(
            !Listings[listing_id].sold_or_withdrawn,
            "The item has already been bought"
        ); // Check if the item is still available
        require(
          msg.sender == Listings[listing_id].seller,
          "This is not your listing you cant sell this "
        );
        // check whether the caller is the seller
        require(
          msg.value = 2*Listings[listing_id].price,
          "You have not paid the security deposit"
        );
        // Check the security deposits
        //Listings[listing_id].sold_or_withdrawn = true;

        emit encryptedKey(listing_id, H);
    }

    //Confirmation from buyer on receiving item
    // the buyer confirms to get the refund of the money owed.(price)
    // the seller gets his amount + price (3 * price)
    /// @dev the listing id is the item being exchanged
    function confirmDelivery(uint256 listing_id) external payable {
    require(
            listing_id < current_listing_id && listing_id >= 0,
            "Listing id is invalid"
        ); // Check for valid listing id
        require(
            !Listings[listing_id].sold_or_withdrawn,
            "The item has already been bought"
        ); // Check if the item is still available
        require(
          msg.sender == Listings[listing_id].buyer,
          "You are not the buyer for this item "
        );
        // check whether buyer is the messenger
        //refund the seller
        Listings[listing_id].sold_or_withdrawn = true;
        Listings[listing_id].seller.transfer(3*Listings[listing_id].price);
        // refund the buyer
        Listings[listing_id].buyer.transfer(Listings[listing_id].price);
        emit PurchaseComplete(Listings[listing_id]);


    }
}
