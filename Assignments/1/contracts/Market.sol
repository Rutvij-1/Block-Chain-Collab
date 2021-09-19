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
    event PurchaseRequested(uint256 indexed listing_id, address indexed buyer);
    /// @dev this event is for when seller confirms item purchase by buyer
    event encryptedKey(uint256 indexed listing_id, bytes32 indexed H);

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
            false
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
    function requestBuy(uint256 listing_id) external payable {
        require(
            listing_id < current_listing_id && listing_id >= 0,
            "Listing id is invalid"
        ); // Check for valid listing id
        require(
            !Listings[listing_id].sold_or_withdrawn,
            "The item has already been bought"
        ); // Check if the item is still available
        emit PurchaseRequested(listing_id, msg.sender);
    }

    //Sale of item from seller's side
    function sellItem(uint256 listing_id, bytes32 H) external payable {
        require(
            listing_id < current_listing_id && listing_id >= 0,
            "Listing id is invalid"
        ); // Check for valid listing id
        require(
            !Listings[listing_id].sold_or_withdrawn,
            "The item has already been bought"
        ); // Check if the item is still available
        Listings[listing_id].sold_or_withdrawn = true;
        emit encryptedKey(listing_id, H);
    }

    //Confirmation from buyer on receiving item
    function confirmDelivery(uint256 listing_id) external payable {}
}
