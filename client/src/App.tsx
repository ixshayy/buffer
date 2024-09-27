import './App.scss'
import Lobby from './lobby/Lobby'
import { Routes, Route } from "react-router-dom";
import Room from './room/Room';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:id" element={<Room />} />
      <Route path="*" element={<></>} />
    </Routes>

  )
}

export default App
