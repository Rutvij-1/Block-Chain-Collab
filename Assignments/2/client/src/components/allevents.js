import React, { Component } from 'react'
import { Table, Button, InputGroup } from 'react-bootstrap';

class AllEvents extends Component {
  constructor(props) {
    super(props)
    this.state = {
       logs:[]
    }
    
  }
  componentDidMount = async () => {
    try {
        console.log(this.props.logs);
      this.setState({
          logs:localStorage.getItem("event")
      });
    } catch (error) {
      alert(`Loading error...`);
    }
  };

    render() {
		return (
			<>
            <h2>All events logs:</h2>
            <br/>
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <p>
                hello
            {this.state.logs}
            </p>
        </div>
      </>
    );
  }
}

export default AllEvents;