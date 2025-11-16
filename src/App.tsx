import './App.css'
import Terminal  from './components/terminal'
import ThreeCard from './components/ThreeCard'
import Header from './components/header'
import Footer from './components/footer'

function App() {
  const initialWidth = window.innerWidth;
  const initialHeight = window.innerHeight;

  window.addEventListener('resize', function() {
    if (window.innerWidth !== initialWidth || window.innerHeight !== initialHeight) {
      location.reload();
    }
  });

  return (
    <div className='flex flex-col h-screen overflow-hidden'>
      <Header/>
      <div className="grid grid-cols-1 lg:grid-cols-7 flex-1 bg-[#060606] min-h-0">
        <div className="hidden col-span-2 xl:col-span-3 lg:flex flex-col border-t border-b lg:border-r border-green-500 min-h-0">
          <ThreeCard/>
        </div>
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 border-t border-b lg:border lg:border-r-transparent border-green-500 flex flex-col bg-black min-h-0">
          <Terminal />
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default App