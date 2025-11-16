export default function Header() {
  return (
    <div className="bg-black flex sm:flex- flex-col-reverse sm:flex-row justify-between sm:items-start items-center w-full p-4 gap-3 sm:gap-0">
      <div className="right">
        <h1 className="text-green-500 text-2xl sm:text-3xl font-semibold">
          Mohammed Sobhi
        </h1>
        <p className="text-gray-400 text-sm sm:text-md text-center sm:text-left">Software Engineer</p>
      </div>
      <div className="left text-green-500 text-xs sm:text-sm">
        <a href="https://github.com/MohammedSobhiT" target="_blank" rel="noopener noreferrer" className="border-b border-green-500 pb-1 sm:pb-2 hover:text-green-400 transition-colors">
          github &#8599;
        </a>
      </div>
    </div>
  );
}