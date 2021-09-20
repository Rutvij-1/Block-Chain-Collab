/// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Market {
    uint256 current_listing_id = 0;
    uint256 public activelistings = 0;
    
    /// structure for each listings
    /// @dev uint is the unique listing id
    /// @dev seller stores the seller address
    /// @dev buyer stores the buyer address
    /// @dev price is the price of the item
    /// @dev item_name is the name of the item
    /// @dev item_description has the description of the item

    struct listings {
        uint256 listing_id;
        address payable seller;
        address payable buyer;
        uint256 price;
        string item_name;
        string item_description;
        bool sold_or_withdrawn;
        bool buyer_alloted;
        State state;
    }

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
    /// @dev this event is for when transaction is aborted
    event Aborted();

    /// @dev create a listing for all possible listing id and make it private
    mapping(uint256 => listings) private Listings;

    /// State variables for the items listed. By default, it is Created
    enum State {
        Created,
        Active,
        Sold,
        Delivered,
        Inactive
    }
    State public state;

    /// @dev Get the account balance of an address
    /// @param account address of the account
    /// @return an uint balance of the account
    function getAccountBalance(address account) external view returns(uint256 accountBalance)
    {
        accountBalance = account.balance;
        return accountBalance;
    }

    /// Check whether a given condition is true
    /// @param _condition condition statement to verify.
    modifier condition(bool _condition) {
        require(_condition);
        _;
    }

    /// Seller cannot be buyer of the same item
    /// @param listing_id Id of the listing.
    modifier ValidBuyer(uint256 listing_id) {
        require(Listings[listing_id].seller != msg.sender, "Invalid Buyer");
        _;
    }

    /// Buyer cannot be seller of the same item
    /// @param listing_id Id of the listing.
    modifier ValidSeller(uint256 listing_id) {
        require(Listings[listing_id].buyer != msg.sender, "Invalid Seller");
        _;
    }
  
    /// Insufficient balance cannot be used for transfer
    /// @param listing_id Id of the listing.
    modifier SufficientBalance(uint256 listing_id) {
        uint256 balance = getAccountBalance(msg.sender);
        require(balance >= msg.value, "Insuficient Balance for transaction");
        _;
    }
    
    /// Already sold/inactive item cannot be bought
    /// @param listing_id Id of the listing.
    modifier CheckState(uint256 listing_id) {
        require(
            !Listings[listing_id].sold_or_withdrawn,
            "Item has already been bought / withdrawn"
        );
        _;
    }
    
    /// Item in use should be a valid listing
    /// @param listing_id Id of the listing.
    modifier ValidListing(uint256 listing_id) {
        require(
            listing_id < current_listing_id && listing_id >= 0,
            "Invalid Listing Id"
        );
        _;
    }

    /// Create a listing for sale in the market place
    /// @param price price of the item
    /// @param item_name name of the item
    /// @param item_description is the description of the item
    function createListings(
        uint256 price,
        string calldata item_name,
        string calldata item_description
    ) external payable condition(price > 0) {
        uint256 listing_id = current_listing_id;
        current_listing_id += 1;
        activelistings += 1;

        Listings[listing_id] = listings(
            listing_id,
            msg.sender,
            address(0),
            price,
            item_name,
            item_description,
            false,
            false,
            State.Active
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

    /* Get all the active listings items in the market */
    /// @return a list of active listings
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

    /// Request from buyer to seller for item's purchase
    /// the contract emits a event to let the seller know that an buyer has been found
    /// @param listing_id is the id of the item buyer is interested in
    function requestBuy(uint256 listing_id) external payable 
    ValidBuyer(listing_id)
    ValidListing(listing_id)
    CheckState(listing_id)
    SufficientBalance(listing_id)
    {
        /// Check whether item has a buyer already
        require(
            !Listings[listing_id].buyer_alloted,
            "the item already has a buyer,in midst of transaction"
        );
        /// Check whether you have provided 2 times the selling price,for security purposes
        require(
            msg.value == 2 * Listings[listing_id].price,
            "The required deposit for the purchase not given "
        );

        /// Let the seller know you have found a buyer
        Listings[listing_id].buyer = msg.sender;
        Listings[listing_id].buyer_alloted = true;
        emit PurchaseRequested(Listings[listing_id], msg.sender);
    }

    /// Sale of item from seller's side
    /// Transaction from the seller 
    /// @param listing_id is the id of the item being sold_
    /// @param H is the hashed key for the item string (Hashed using the public key of the buyer off-chain)
    function sellItem(uint256 listing_id, string calldata  H) external payable 
    ValidListing(listing_id)
    ValidSeller(listing_id)
    CheckState(listing_id)
    {
        /// Check the security deposits
        require(
            msg.value == 2 * Listings[listing_id].price,
            "You have not paid the security deposit"
        );
        Listings[listing_id].state = State.Sold;
        // Listings[listing_id].sold_or_withdrawn = true; 

        emit encryptedKey(listing_id, H);
    }

    /// Confirmation from buyer on receiving item
    /// the buyer confirms to get the refund of the money owed.(price)
    /// the seller gets his amount + price (3 * price)
    /// @dev the listing id is the item being exchanged
    function confirmDelivery(uint256 listing_id)
        external
        payable
        ValidListing(listing_id)
        ValidBuyer(listing_id)
        CheckState(listing_id)
    {
        /// Refund the seller
        Listings[listing_id].sold_or_withdrawn = true;
        Listings[listing_id].seller.transfer(3 * Listings[listing_id].price);
        /// Refund the buyer
        Listings[listing_id].buyer.transfer(Listings[listing_id].price);
        activelistings -= 1;
        Listings[listing_id].state = State.Delivered;
        emit ListingChanged(Listings[listing_id].seller, listing_id);
        emit PurchaseComplete(Listings[listing_id]);
    }

    /// Abort the purchase and reclaim the ether.
    function abort(uint256 listing_id) public CheckState(listing_id) {
        emit Aborted();
        Listings[listing_id].state = State.Inactive;
        activelistings-=1;
        Listings[listing_id].seller.transfer(address(this).balance);
    }
}
