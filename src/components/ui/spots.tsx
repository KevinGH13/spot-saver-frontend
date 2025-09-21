export default function Spots() {
  return (
    <div className="w-full py-4 px-8 text-black flex flex-row justify-between items-center shadow-md fixed top-0 left-0 bg-white z-50 mt-16">
      <nav className="flex flex-row gap-4">
        <div className="">
          <a href="#" className="text-sm/6 font-semibold text-black">All</a>
        </div>
        <div className="">
          <a href="#" className="text-sm/6 font-semibold text-black">Restaurants</a>
        </div>
        <div className="">
          <a href="#" className="text-sm/6 font-semibold text-black">Coffee Shops</a>
        </div>
        <div className="">
          <a href="#" className="text-sm/6 font-semibold text-black">Lodge</a>
        </div>
      </nav>
    </div>
  )
}