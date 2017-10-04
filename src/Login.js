import React from 'react';
import { Link } from 'react-router-dom';


class Login extends React.Component {
    render() {
        return (
            <div>
                <h1>Login</h1>
                <form>
                    <input type="text" placeholder="Name" />
                    <input type="password" placeholder="Password" />
                </form>
                <Link to="/">Back to Home</Link>
            </div>
        );
    }
}

export default Login;
