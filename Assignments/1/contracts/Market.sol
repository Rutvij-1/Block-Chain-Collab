// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Market{
    

    uint256 current_id = 0 ;
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
    
    /// @dev this event is emitted when a listing is created 
    event ListingCreated (
    uint indexed listing_id,
    address seller,
    uint256 price,
    string item_name,
    string item_description
  );
    /// @dev this event is for when listing is modified ,item sold or withdrawn
    event ListingChanged(address indexed seller, uint256 indexed index);

    // create a listing for all possible listing id and make it private
    mapping(uint256 => listings) private Listings;

    //create a listing for sale in the market place
    function createListings(
        uint256 price,
        string calldata item_name,
        string calldata item_description
        ) external payable  {
    require(price > 0, "Price cannot be 0 wei");
    
    
    uint256 listing_id = current_id;
    current_id += 1;
    activelistings += 1;
  
    Listings[listing_id] =  listings(
      listing_id,
      msg.sender,
      price, 
      item_name,
      item_description,
      false
      
    );
    // emit the update
    emit ListingCreated(listing_id,msg.sender,price,item_name,item_description);
    emit ListingChanged(msg.sender, activelistings);
  }

  /* Returns all unsold/unwithdrawn market items */
  function fetchactivelistings() external view returns (listings[] memory) {
    
    uint256 currentIndex = 0;

    listings[] memory active_list = new listings[](activelistings);
    for (uint256 i = 0; i < current_id; i++) {
        // only consider listings which are unsold/not withdrawn
      if (Listings[i].sold_or_withdrawn == false)  {
        
        listings storage currentlisting = Listings[i];
        active_list[currentIndex] = currentlisting;
        currentIndex += 1;
      }
    }
    return active_list;
  }
}