# DTB Assignment 1

**Team**: Tripple
- Tathagato Roy (*2019111020*)
- Snehal Kumar (*2019101003*)
- Rutvij Menavlikar (*2019111032*)

---

## Programming Logic

---

### Making a Listing

- The method `createListings()` takes input the price, name and description of the item and it assigns it a unique id, stores the unique seller id for it and sets it's status to indicate that the item is available.
- Then it emits 2 events.
    - `ListingCreated`
    - `ListingChanged` to indicate its creation.

---

### Viewing Listings

- The method `fetchactivelistings` goes through all the listings created, stores all listings whose item's status is available and returns them.

---

### Buying an Item