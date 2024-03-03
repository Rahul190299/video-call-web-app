import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from './componants/Landing';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}>  
        </Route>
        
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
