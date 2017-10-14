import React, { Component } from 'react';
import { apiurl } from "../../helper/constants";
import firebase from 'firebase';
import { Editor } from 'react-draft-wysiwyg';
import { Table, Row, Col, Jumbotron, Button } from 'react-bootstrap';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Modal from 'react-modal';

const customStyles = {
    overlay : {
        position          : 'fixed',
        top               : '0%',
        left              : '0%',
        right             : '0%',
        bottom            : '0%',
        backgroundColor   : 'rgba(255, 255, 255, 0.5)'
    },
    content : {
        top                   : '10%',
        left                  : '30%',
        right                 : '30%',
        bottom                : '10%',
        marginRight           : '0%',
        transform             : 'translate(0%, 0%)',
        background            : 'rgba(255, 255, 255, 0)',
        border                : '0px',
    }
};


class Tech extends Component {
    state = {
        tickets: [],
        selectedTicket: null,
        commentValue:null,
        priority:null,
        status:null,
        modalIsOpen: false
    }


    componentDidMount()
    {
        /* Fetch all tickets and check which tickets have
            been assigned to this tech user
         */
        fetch(apiurl + '/api/inquiryCRUD/list')
            .then((response) => response.json())
            .then((responseJson) => {
                const myTickets = [];
                for(const ele in responseJson) {
                    firebase.database().ref('ticket/'+responseJson[ele].id).on('value', (snapshot) => {
                        if(snapshot.val() !== null && snapshot.val().user_id === this.props.user.uid) {
                            myTickets.push(responseJson[ele]);

                            /* Force the view to re-render (async problem) */
                            this.forceUpdate();
                        }
                    })
                }
                return myTickets;
            })
            .then((tickets) => {
                this.setState({
                    tickets: tickets
                });
            })
    }


    /* Update selectedTicket state */
    ticketUpdateClick = (ticket) => {
        const { selectedTicket } = this.state;
        this.setState({
            selectedTicket: (selectedTicket !== null && selectedTicket.id === ticket.id ? null : ticket),
            modalIsOpen: true //open up modal screen
        });
    }

    afterOpenModal =()=> {
        // references are now sync'd and can be accessed.
        // this.subtitle.style.color = '#f00';
    }

    /* Close button for dialog */
    closeModal =()=> {
        this.setState({
            modalIsOpen: false,
            selectedTicket: null
        });
    }


    // Handle change on radio button on changing priority value
    handlePriorityOptionChange = (e) => {
        this.setState({ priority: e.target.value });
    }

    // Handle change on select tag on changing status value
    handleStatusOptionChange = (e) => {
        this.setState({ status: e.target.value });
    }

    // Handle change on editor
    onEditorStateChange = (e) => {
        this.setState({ commentValue: e.target.value });
    }

    //Post to API url in laravel side
    updateTicket()
    {
        var priority = this.state.priority;
        var status = this.state.status;
        var comment = this.state.commentValue;

        fetch(apiurl + '/api/inquiryCRUD'+ this.state.selectedTicket.id +'/update',
            {
                method: 'POST',
                mode: 'CORS',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    priority: priority,
                    status: status,
                    comment: comment
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status === "SUCCESS") {
                    alert("Successfully updated ticket!")
                    // this.getProducts();
                } else {
                    alert("Could not update ticket.")
                }
            })
            .then(this.setState({view: "list"}))
    }

    handleSubmit = (e) => {
        this.updateTicket();
        e.preventDefault();
    }


    /* render page */
    render () {
        const vm = this;
        const { tickets, selectedTicket } = this.state;

        return(
            <div>
                <Row>
                    <h1> My Tickets </h1>

                    {/* if toggled, change the column layout */}

                    <Col md={(selectedTicket !== null ? 7 : 12)}>
                        {
                            // checking if tickets are assigned
                            tickets.length < 1 && (
                                <p className="alert alert-info">You have not been assigned to any tickets.</p>
                            )
                        }
                        {/* table header */}
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Issue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                //list all tickets into table
                                tickets.map((inquiry, i) => (
                                    <tr key={i}>
                                        <td>{inquiry.id}</td>
                                        <td>{inquiry.user_name}</td>
                                        <td>{inquiry.software_issue}</td>
                                        <td>{inquiry.status}</td>
                                        {/* each row has an update button and when a ticket is selected, update selectedTicket state */}
                                        <td>
                                            <Button bsStyle={vm.state.selectedTicket !== null && vm.state.selectedTicket.id === inquiry.id ? 'success' : 'info'} onClick={() => vm.ticketUpdateClick(inquiry)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    {selectedTicket !== null && (
                        <Jumbotron style={{padding: 10}}>

                            {/* button to close dialog */}
                            <Button block bsStyle="success" onClick={this.closeModal}>Close Dialog</Button>

                            {/* selectedTicket details */}
                            <h3 className="text-uppercase">Ticket Details</h3>
                            <p><b>ID: </b>{selectedTicket.id}</p>
                            <p><b>Title: </b><br/>{selectedTicket.title}</p>
                            <p><b>Comment: </b><br/>{selectedTicket.comment}</p>
                            <p><b>priority: </b><br/>{selectedTicket.comment}</p>
                            <p><b>level: </b><br/>{selectedTicket.comment}</p>

                            {
                                // render form to add comment to ticket
                                <form onSubmit={this.handleSubmit}>
                                    <div className ="container">
                                        <Editor
                                            editorState={this.state.commentValue}
                                            toolbarClassName="toolbarClassName"
                                            wrapperClassName="wrapperClassName"
                                            editorClassName="editorClassName"
                                            onEditorStateChange={this.onEditorStateChange}
                                            value = {this.state.commentValue}
                                        />

                                        {/*  edit selectedTicket status  */}
                                        <label>
                                            Ticket Status:
                                            <select value={this.state.status} onChange={this.handleStatusOptionChange} defaultValue disabled>
                                                <option value="resolved">Resolved</option>
                                                <option value="unresolved">Unresolved</option>
                                            </select>
                                        </label>

                                        {/* update selectedTicket priority through radio button */}
                                        <label>
                                            Ticket Priority:
                                            <div className="radio">
                                                <label>
                                                    <input type="radio"
                                                           value="low"
                                                           checked={this.state.priority === 'low'}
                                                           onChange={this.handlePriorityOptionChange} />
                                                    />
                                                    Low
                                                </label>
                                            </div>

                                            <div className="radio">
                                                <label>
                                                    <input type="radio"
                                                           value="medium"
                                                           checked={this.state.priority === 'low'}
                                                           onChange={this.handlePriorityOptionChange} />
                                                    />
                                                    Medium
                                                </label>
                                            </div>

                                            <div className="radio">
                                                <label>
                                                    <input type="radio"
                                                           value="high"
                                                           checked={this.state.priority === 'low'}
                                                           onChange={this.handlePriorityOptionChange} />
                                                    />
                                                    High
                                                </label>
                                            </div>
                                        </label>

                                    </div>

                                    <div className="clearfix"><br/>
                                        <Button className="pull-right" typebsStyle="success" type="submit" value="Submit">Update</Button>
                                    </div>
                                </form>
                            }
                        </Jumbotron>
                    )}
                </Modal>
            </div>
        );
    }
}

export default Tech;