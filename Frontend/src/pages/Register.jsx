import '../App.css'
import RegisterForm from '../components/RegisterForm';
import Footer from '../components/Footer';

function Register() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <RegisterForm />
        <Footer />
      </div>
    </div>
  )
}

export default Register
