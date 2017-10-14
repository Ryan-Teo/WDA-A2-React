import React, { Component } from 'react';
import { apiurl } from '../../helper/constants';
import { Table, Row, Col, Jumbotron, Button } from 'react-bootstrap';
import firebase from 'firebase';
import Modal from 'react-modal';

const divAtten = {
    background: 'orange',
    width: '50%',
    height: '100%',
    marginLeft: '25%',
    borderRadius: '5px'
};

const divNoAtten = {
    background: 'grey',
    width: '50%',
    height: '100%',
    marginLeft: '25%',
    borderRadius: '5px'
};

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

class Helpdesk extends Component {
    state = {
        tickets: [],
        selectedTicket: null,
        techUsers: [],
        selectedTech: null,
        modalIsOpen: false
    };

    /* Once component has mounted, fetch from API + firebase */
    componentDidMount() {
        /* Fetch all tickets and check which tickets have
            an assigned tech
         */
        fetch(apiurl + '/api/inquiryCRUD/list')
            .then((response) => response.json())
            .then((responseJson) => {
                const pendingTickets = [];
                for(const ele in responseJson) {
                    firebase.database().ref('ticket/'+responseJson[ele].id).on('value', (snapshot) => {
                        if(snapshot.val() === null || responseJson[ele].esc_requested === 1) {
                            pendingTickets.push(responseJson[ele]);
                            console.log('Ticket Added');
                        }
                        /* Force the view to re-render (async problem) */
                        this.forceUpdate();
                    })
                }
                return pendingTickets;
            })
            .then((penTickets) => {
                this.setState({
                    tickets: penTickets
                });
                console.log("Pending tickets", this.state.tickets);
            })

        /* Creates a firebase listener which will automatically
            update the list of tech users every time a new tech
            registers into the system
         */
        const users = firebase.database().ref('user/')
        users.on('value', (snapshot) => {
            const tempTech = [];
            for(const ele in snapshot.val()) {
                if(snapshot.val()[ele].type === 'tech') {
                    tempTech.push(snapshot.val()[ele]);
                }
            }
            this.setState({
                techUsers: tempTech
            });

        })
    }

    /* Toggle the ticket dialog */
    ticketDetailsClick = (ticket) => {
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

    /* Update the selected tech from dropdown box */
    handleTechChange = (e) => {
        this.setState({
            selectedTech: e.target.value
        });
    }

    /* Click assign button */
    assignTicketToTech = () => {
        if(this.state.selectedTech === null) {
            return;
        }

        /* Add assigned ticket+tech into database*/
        const data = {};
        data['ticket/' + this.state.selectedTicket.id] = {
            ticket_id: this.state.selectedTicket.id,
            user_id: this.state.selectedTech, // stored Tech ID
        };
        firebase.database().ref().update(data)
        alert('Tech successfully assigned to ticket!');
        window.location.reload();
    }

    setEscalation = (bool) => {

    }



    /*Render page*/
    render () {
        const vm = this
        const { selectedTicket, tickets, techUsers } = this.state
        console.log("Tech users: ", techUsers);
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <h1>Pending Tickets</h1>
                        {
                            tickets.length < 1 && (
                                <p className="alert alert-info">There are no tickets to display.</p>
                            )
                        }
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th className ="text-center">ID</th>
                                <th>OS</th>
                                <th>Issue</th>
                                <th>Status</th>
                                <th className ="text-center">Priority</th>
                                <th className ="text-center">Escalation</th>
                                <th className ="text-center">Requires Attention</th>
                                <th className ="text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                tickets.map((inquiry, i) => (
                                <tr key={i}>
                                    <td className ="text-center">{inquiry.id}</td>
                                    <td>{inquiry.os}</td>
                                    <td>{inquiry.software_issue}</td>
                                    <td>{inquiry.status}</td>
                                    <td className ="text-center"> {(inquiry.priority === null) ? "-NA-" : inquiry.priority} </td>
                                    <td className ="text-center"> {inquiry.level} </td>
                                    <td className ="text-center">
                                        <div style= {(inquiry.esc_requested === 1) ? divAtten : divNoAtten} > {(inquiry.esc_requested === 1) ? 'Yes' : 'No'} </div>
                                       </td>
                                    <td className ="text-center">
                                        <Button bsStyle={vm.state.selectedTicket !== null && vm.state.selectedTicket.id === inquiry.id ? 'success' : 'info'} onClick={() => vm.ticketDetailsClick(inquiry)}>More Details</Button>
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
                        <div className="row">
                            <Jumbotron style={{padding: 10, borderRadius: '5px'}}>
                                <Button block bsStyle="danger" onClick={this.closeModal}>Close Dialog</Button>
                                <table className="ticketData table-striped">
                                    <thead>
                                        <tr>
                                            <th colSpan={3} >
                                                <h3 className="text-uppercase">Inquiry Details</h3>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <b>User's Name: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.user_name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>User's email: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.user_email}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Ticket ID: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>OS: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.os}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Issue: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.software_issue}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Status: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.status}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Description: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.description}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Comment: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.comment}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Priority: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {(selectedTicket.priority === null) ? "-NA-" : selectedTicket.priority}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <b>Escalation Level: </b>
                                            </td>
                                            <td colSpan={2}>
                                                {selectedTicket.level}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                {selectedTicket.esc_requested === 1 && (
                                    <div>
                                        <hr/>
                                        <h2>Escalation Request</h2>
                                        <button bsStyle="success">Grant</button>
                                        <button bsStyle="fail">Decline</button>
                                    </div>
                                )}
                                {techUsers.length > 0 && (
                                    <div>
                                        <hr/>
                                        <h3 className="text-uppercase">Assign to tech</h3>
                                        <select className="form-control" onChange={this.handleTechChange} defaultValue="-1">
                                            <option value="-1" defaultValue disabled>Select a tech user</option>
                                            {techUsers.map((user, i) => (
                                                <option key={i} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>

                                        <div className="clearfix"><br/>
                                            <Button className="pull-right" bsStyle="success" onClick={this.assignTicketToTech}>Assign</Button>
                                        </div>
                                    </div>
                                )
                                }
                            </Jumbotron>
                        </div>
                    )}
                </Modal>
            </div>

        );
    }
}


export default Helpdesk;