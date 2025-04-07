import { Calendar, Car, Clock, DollarSign, Fuel, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const RentalCard = ({ rental }) => {
  const { theme } = useSelector((state) => state.theme);
  const { car } = rental;
  console.log(rental)

  return (
    // <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
    //   <img src={car.image} alt="Luxury Car" class="w-full h-48 object-cover" />
    //   <div class="p-6">
    //     <h3 class="text-xl font-semibold mb-2">
    //       Total Bill : ${rental.totalBill}
    //     </h3>
    //     <p class="text-gray-600 mb-4">
    //       {rental.dropDate} to {rental.pickupDate}
    //     </p>
    //     <div class="flex justify-between items-center">
    //       <span class="text-emerald-500 font-bold">$500/day</span>
    //       <Link
    //         to={`/car/${car._id}`}
    //         class="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors"
    //       >
    //         View
    //       </Link>
    //     </div>
    //   </div>
    // </div>
    <div className={`rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Image Section with Gradient Overlay */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        <img
          src={car?.image}
          alt={car?.name}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <h3 className="text-2xl font-bold">{car?.company} {car?.name}</h3>
          <div className="flex items-center mt-2 space-x-3">
            <span className="flex items-center">
              <Car className="w-4 h-4 mr-1" />
              {car?.category.toUpperCase()}
            </span>
            <span className="flex items-center">
              <Fuel className="w-4 h-4 mr-1" />
              {car?.fuelType}
            </span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-4">
        {/* Rental Period */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span>Pickup:</span>
            <span className="font-semibold">{rental?.pickupDate}</span>
          </div>
          <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <Clock className="w-5 h-5 text-emerald-500" />
            <span>Return:</span>
            <span className="font-semibold">{rental?.dropDate}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className={`flex items-center justify-between border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} pt-4`}>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{rental?.totalBill}</span>
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>total</span>
          </div>
          <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <MapPin className="w-4 h-4" />
            <span>{car?.registration}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/rental/${car?._id}`}
          className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 group"
        >
          <span>View Details</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default RentalCard;
