import './App.css'
import Terminal  from './components/terminal'
import ThreeCard from './components/ThreeCard'
import Header from './components/header'
import Footer from './components/footer'
function App() {
  // Store the initial window dimensions
const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;


window.addEventListener('resize', function() {
  if (window.innerWidth !== initialWidth || window.innerHeight !== initialHeight) {
    location.reload();
  }
});

  return (
    <div className='flex flex-col h-screen'>
    <Header/>
    <div className="grid grid-cols-1 lg:grid-cols-7 overflow-hidden flex-1 bg-[#060606]">
      <div className="hidden lg:col-span-3 lg:block border-t border-b lg:border-r border-green-500">
        <ThreeCard/>
      </div>
      <div className="col-span-1 lg:col-span-4 border-t  border-b lg:border lg:border-r-transparent border-green-500 h-full xl:h-auto bg-black">
        <Terminal />
      </div>
    </div>
    <Footer/>
    </div>
  )
}

export default App