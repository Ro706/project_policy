
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './component/Navbar';
import AnimatedRoutes from './component/AnimatedRoutes';

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;