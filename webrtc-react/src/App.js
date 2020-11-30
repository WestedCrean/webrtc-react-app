import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Home from './Home'
import Broadcast from './Broadcast'

function App() {
  return (
    <div>
      <h1>Welcome to kurwa</h1>
      <Home/>
    </div>
    
  );
}

export default App;
