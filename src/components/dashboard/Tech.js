import React, { Component } from 'react';
import { apiurl } from "../../helper/constants";
import firebase from 'firebase';
import { Table, Row, Col, Jumbotron, Button } from 'react-bootstrap';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Modal from 'react-modal';
import draftToHtml from 'draftjs-to-html';

//Centering button in div
const centreButton = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
        left                  : '20%',
        right                 : '20%',
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
        editorState: EditorState.createEmpty(),
        statusState: {},
        modalIsOpen: false
    }


    componentDidMount() {
        /* Fetch all tickets and check which tickets have
            been assigned to this tech user
         */
        fetch(apiurl + '/api/inquiryCRUD/list')
            .then((response) => response.json())
            .then((responseJson) => {
                const myTickets = [];
                for (const ele in responseJson) {
                    firebase.database().ref('ticket/' + responseJson[ele].id).on('value', (snapshot) => {
                        if (snapshot.val() !== null && snapshot.val().user_id === this.props.user.uid) {
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

    afterOpenModal = () => {
        // references are now sync'd and can be accessed.
        // this.subtitle.style.color = '#f00';
    }

    /* Close button for dialog */
    closeModal = () => {
        this.setState({
            modalIsOpen: false,
            selectedTicket: null
        });
    }

    /* Update selectedTicket state */
    ticketDetailsClick = (ticket) => {
        const {selectedTicket} = this.state;
        this.setState({
            selectedTicket: (selectedTicket !== null && selectedTicket.id === ticket.id ? null : ticket),
            modalIsOpen: true //open up modal screen
        });
    }

    // Handle change on select tag on changing status value
    handleStatusOptionChange = (e) => {
        this.setState({statusState: e.target.value});
    }

    // Handle change on editor
    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
    }

    //Post to API url in laravel side
    handleSubmit = (e) => {
        // var formData = JSON.stringify((e).serializeArray());
        // console.log("Sumbit: ", formData);
        const {selectedTicket, editorState, statusState} = this.state;
        var id = selectedTicket.id;

        fetch(apiurl + "/api/inquiryCRUD/" + id + "/update",
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "status": statusState,
                    "comment": draftToHtml(convertToRaw(editorState.getCurrentContent())),
                    "priority": selectedTicket.priority,
                    "level": selectedTicket.level,
                    "esc_requested": false,
                    "is_closed": selectedTicket.is_closed,
                }),
            })
            .then((response) => {
                console.log(response);
            })
            .then(() => {
                alert('Ticekt Updated!');
                window.location.reload();
            })
        e.preventDefault();
        // convertToRaw(editorState.getCurrentContent());
    }

    closeTicket = () => {
        const {selectedTicket} = this.state;
        var id = selectedTicket.id;

        fetch(apiurl + '/api/inquiryCRUD/' + id + '/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "status": selectedTicket.status,
                "comment": selectedTicket.comment,
                "priority": selectedTicket.priority,
                "level": selectedTicket.level, //Escalation level stays the same
                "esc_requested": selectedTicket.esc_requested, //Reset request
                "is_closed": true,
            })
        })
            .then(() => {
                firebase.database().ref('ticket/' + id).remove((error) => {
                    console.log("Error : ", error); //Log any errors
                    console.log('Ticket removed'); //Log unassignment
                    /* Force the view to re-render (async problem) */
                    this.forceUpdate();
                })
            })
            .then((response) => {
                console.log(response);
            })
            .then(() => {
                alert('Ticket Closed!');
                window.location.reload();
            })
    }

    requestEscalation = () => {

        const {selectedTicket} = this.state;
        var id = selectedTicket.id;

        fetch(apiurl + '/api/inquiryCRUD/' + id + '/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "status": selectedTicket.status,
                "comment": selectedTicket.comment,
                "priority": selectedTicket.priority,
                "level": selectedTicket.level, //Escalation level stays the same
                "esc_requested": true, //Reset request
                "is_closed": selectedTicket.is_closed,
            })
        })
        .then((response) => {
            console.log(response);
        })
        .then(() => {
            alert('Escalation Requested!');
            window.location.reload();
        })
    }

    /* render page */
    render () {
        const vm = this
        const { tickets, selectedTicket,editorState } = this.state
        return(
            <div>
                <Row>
                    <Col md={12}>
                        <h1> My Tickets </h1>
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
                                        <td className ="text-center">
                                            <Button bsStyle={vm.state.selectedTicket !== null && vm.state.selectedTicket.id === inquiry.id ? 'success' : 'info'} onClick={ () => vm.ticketDetailsClick(inquiry)}>Edit</Button>
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
                            <Button block bsStyle="success" onClick={this.closeModal}>close</Button>

                            {/* selectedTicket details */}
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
                                    <td colSpan={2} dangerouslySetInnerHTML={{__html: selectedTicket.comment}} />
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

                            {
                                // render form to add comment to ticket
                                <form onSubmit={this.handleSubmit}>

                                    <Editor
                                        editorState={editorState}
                                        wrapperClassName="wrapper-class"
                                        editorClassName="editor-class"
                                        toolbarClassName="toolbar-class"
                                        onEditorStateChange={this.onEditorStateChange}
                                    />

                                    {/*  edit selectedTicket status  */}

                                    <h3>Ticket Status</h3>
                                    <select onChange={this.handleStatusOptionChange} defaultValue=
                                        {
                                            (selectedTicket.status === "pending") ? "pending" :
                                                (selectedTicket.status === "resolved") ? "resolved" :
                                                    (selectedTicket.status === "unresolved") ? "unresolved" :
                                                        (selectedTicket.status === "undefined") ? "undefined" : "ERROR"
                                        }

                                    >
                                        <option value="pending" disabled>Pending</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="unresolved">Unresolved</option>
                                        <option value="undefined">In Progress</option>
                                    </select>
                                    <div className="clearfix"><br/>
                                        <Button className="DraftEditor-alignCenter" bsStyle="success" type="submit" value="Submit">Update</Button>
                                    </div>
                                </form>
                            }
                            <div style={centreButton}>
                                {(selectedTicket.status === "unresolved" || selectedTicket.status === "resolved") && (
                                    <Button id="closeTicket" className="col-md-2" bsSize="large" bsStyle="warning large" onClick={this.closeTicket}>Close Enquiry</Button>
                                )}
                                {(selectedTicket.status === "unresolved" || selectedTicket.status === "in progress" || selectedTicket.status === "pending") && (
                                    <Button id="closeTicket" className="col-md-2" bsSize="large" bsStyle="danger" onClick={this.requestEscalation}>Request escalation</Button>
                                )}
                            </div>
                        </Jumbotron>
                    )}
                </Modal>
            </div>
        );
    }
}

export default Tech;


