import React from 'react';
import { Link, NavLink, Route } from 'react-router-dom';


class Sidebar extends React.Component {
    render() {
        return (
            <aside className={this.props.open ? 'open' : 'closed'}>
                {/* If the sidebar is showing, render a backdrop behind the sidebar to close it if user clicks off sidebar. */}
                <div className="backdrop" onClick={this.props.onToggleSidebar} />

                <div>
                    <p onClick={this.props.onToggleSidebar}>Close sidebar</p>

                    <ul>
                        <li>
                            {/* <NavLink> applies a special class name when it's the active route */}
                            <NavLink exact onClick={this.props.onToggleSidebar} to="/">Home</NavLink>
                        </li>

                        <li>
                            <NavLink onClick={this.props.onToggleSidebar} to="/login">Login</NavLink>
                        </li>

                        {/* An example to show that we can render things only on specific routes. */}
                        <Route path="/login" render={() => (
                            <li>
                                <Link onClick={this.props.onToggleSidebar} to="/register">Register</Link>
                            </li>
                        )} />
                    </ul>
                </div>
            </aside>
        );
    }
}

export default Sidebar;
