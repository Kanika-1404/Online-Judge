import './App.css'
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {

  return (
    <>
      <div className="bg-[#e0d0f4]">
        <Navbar />
        <h1 className="text-2xl font-bold">Hello Online Judge!</h1>
        <Footer />
      </div>
    </>
  )
}

export default App
