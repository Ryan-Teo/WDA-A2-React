import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Login from './Login';


class Routes extends React.Component {
    render() {
        return (
            <div>
                {/* <Switch> will use only the first matching 'path' it finds, so our home route (the '/') isn't rendered as well as the Login component */}
                <Switch>
                    <Route path="/login" component={Login} />
                    {/* The 'exact' prop here makes sure that
            a) the Home component is only rendered when the URL is '/' and not '/abc' (note the '/' at the start of both URLs)
            b) our Not Found route can be discovered by React Router */}
                    <Route exact path="/" component={Home} />
                    {/* A 'Not Found' route should be placed as the last child of your <Switch> */}
                    <Route component={() => <p>Not Found</p>} />
                </Switch>
            </div>
        );
    }
}

export default Routes;
