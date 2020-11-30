import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Home from './Home'
import Broadcast from './Broadcast'

function App() {
  return (

    <div>
      <Router>
        <h1>Pandemino</h1>

        <div>
          <nav>
            <ul>
              <li>
                <Link to="/watch">Oglądaj</Link>
              </li>
              <li>
                <Link to="/broadcast">Puszczaj</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/broadcast">
              <Broadcast />
            </Route>
            <Route path="/watch">
              <Home />
            </Route>
            <Route path="/">
              <Redirect to="/watch" />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>

  );
}

export default App;
