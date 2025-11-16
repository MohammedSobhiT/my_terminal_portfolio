

export default function footer() {
    const timestamp = new Date().toLocaleString();
    const formattedTimestamp = timestamp.replace(/\//g, '-');

  return (
       <div className="bg-black flex   justify-between items-center w-full p-4 gap-3 sm:gap-0">
      <div className="right">
        <p className="text-green-500 text-xs sm:text-sm font-semibold">
          Sobhi@portfolio:~$
        </p>
        
      </div>
      <div className="left text-green-500 text-xs sm:text-sm ">
        
        
        {formattedTimestamp}
      </div>
    </div>
  )
}
