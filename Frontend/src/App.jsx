import './App.css'
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {

  return (
    <>
      <div className=" min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow p-4">
          <h1 className="text-2xl font-bold">Hello Online Judge!</h1>
        </div>
        <Footer />
      </div>
    </>
  )
}

export default App
