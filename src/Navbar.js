import React from 'react';
import { Link } from 'react-router-dom';


class Navbar extends React.Component {
    render() {
        return (
            <nav>
                <div>
                    <i onClick={this.props.onToggleSidebar}>=</i>
                    <Link to="/">
                        <p>My App</p>
                    </Link>
                </div>

                <div>
                    <Link to="/login">Login</Link>
                    <Link to="/">Home</Link>
                </div>
            </nav>
        );
    }
}

export default Navbar;
