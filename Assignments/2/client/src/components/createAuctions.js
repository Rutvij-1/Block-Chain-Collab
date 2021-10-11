import React, { Component } from 'react'
import { Button, InputGroup } from 'react-bootstrap';

class CreateAuctions extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="form-group">
        <form onSubmit={this.props.handleSubmit}>
          <h2>Create auction</h2>
          <div className="mb-3">
            <label className="form-label">Item Name</label>
            <input type="item_name" className="form-control" id="item_name" required onChange={this.props.handleChange} placeholder="Book" />
          </div>
          <div className="mb-3">
            <label className="form-label">Item description</label>
            <input type="item_description" className="form-control" id="item_description" required onChange={this.props.handleChange} placeholder="Harry Potter" />
          </div>
          <div className="mb-3">
            <label className="form-label">Bidding Deadline</label>
            <input type="datetime-local" className="form-control" id="bidding_deadline" required onChange={this.props.handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Reveal Deadline</label>
            <input type="datetime-local" className="form-control" id="reveal_deadline" required onChange={this.props.handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Auction Type</label>
            <select className="form-select" id="auctionType" placeholder="Select Auction Type" required onChange={this.props.handleChange}>
              <option value="Select Type" disabled="disabled" selected>Select Type</option>
              <option value="Blind Auction">Blind Auction</option>
              <option value="Vickrey Auction">Vickrey Auction</option>
              <option value="Average Price Auction">Average Price Auction</option>
            </select>
          </div>
          <br />
          <Button type="submit">Create Auction</Button>
        </form>
      </div>
    );
  }
}
export default CreateAuctions;