import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { Room } from "./components/Room";
import { Navbar } from "./components/Navbar";
// import { Loading } from "./components/Loading";
function App() {
  return (
    <>
      <BrowserRouter>
        {/* <Loading/> */}
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/room/:id" element={<Room/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
