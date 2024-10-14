import React from 'react';
import InputParent from './components/InputParent';
import "../src/App.css";
import toast, { Toaster } from 'react-hot-toast';


function App() {
  return (
    <div className='app'>
      <Toaster />
      <InputParent />
    </div>
  )
}

export default App;