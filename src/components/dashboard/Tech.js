import React, { Component } from 'react';
import { apiurl } from "../../helper/constants";
import firebase from 'firebase';
import { Panel } from 'react-bootstrap';

class Tech extends Component {
    state = {
        tickets: []
    }

    componentDidMount() {
        /* Fetch all tickets and check which tickets have
            been assigned to this tech user
         */
        fetch(apiurl + '/api/inquiryCRUD/list')
            .then((response) => response.json())
            .then((responseJson) => {
                const myTickets = [];
                for(const ele in responseJson) {
                    firebase.database().ref('inquiryCRUD/'+responseJson[ele].id).on('value', (snapshot) => {
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

    render () {
        const { tickets } = this.state;
        return (
            <div>
                <h1>My Tickets</h1>
                {tickets.length < 1 ? (
                    <div className="alert alert-info">You have not been assigned any tickets.</div>
                )
                : tickets.map((ticket, i) => (
                    <Panel key={i} header={ticket.title}>
                        <p>{ticket.id}</p>
                        <p>{ticket.user_name}</p>
                        <p>{ticket.user_email}</p>
                        <p>{ticket.os}</p>
                        <p>{ticket.software_issue}</p>
                        <p>{ticket.description}</p>
                        <p>{ticket.status}</p>
                        <p>{ticket.comment}</p>
                    </Panel>
                ))}
            </div>
        );
    }
}

export default Tech;