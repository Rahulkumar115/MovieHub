'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useSession } from 'next-auth/react';

export default function SeatMatrix({ movie }: { movie: any }) {
  const { data: session } = useSession();
  const router = useRouter();

  // --- NEW: DATE & TIME STATE ---
  const [dates, setDates] = useState<{ day: string; date: number; full: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('MovieHub Grand Cinemas');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate the next 5 days for the calendar
  useEffect(() => {
    const nextDays = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        full: d.toISOString(),
      };
    });
    setDates(nextDays);
    setSelectedDate(nextDays[0].full); // Select 'Today' by default
  }, []);

  const theaters = ['MovieHub Grand Cinemas', 'Starlight IMAX Multiplex'];
  const timeSlots = ['10:30 AM', '01:15 PM', '04:45 PM', '08:30 PM', '9:30 PM', '11:30 PM'];

  const isTimeSlotPassed = (timeStr: string) => {
    if (!selectedDate) return false;

    const today = new Date();
    const selected = new Date(selectedDate);

    // If the selected date is not today, all times are available!
    if (today.toDateString() !== selected.toDateString()) {
      return false; 
    }

    // Convert '10:30 AM' into hours and minutes
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    // Compare total minutes passed in the day
    const currentTimeInMinutes = today.getHours() * 60 + today.getMinutes();
    const slotTimeInMinutes = hours * 60 + minutes;

    return slotTimeInMinutes <= currentTimeInMinutes;
  };
  
  const mockBookedSeats = ['D4', 'D5', 'E7', 'E8', 'F1', 'F2'];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const seatsPerRow = 10;
  
  const VIP_PRICE = 300; 
  const STANDARD_PRICE = 150; 

  const handleSeatClick = (seatId: string) => {
    if (!selectedTime) return alert("Please select a time slot first!");
    if (mockBookedSeats.includes(seatId)) return; 

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const row = seat.charAt(0);
      return total + (row === 'A' || row === 'B' ? VIP_PRICE : STANDARD_PRICE);
    }, 0);
  };

  const handleProceedToPayment = async () => {
    if (!session) return alert("Please sign in to book tickets!");
    if (!selectedTime) return alert("Please select a time slot!");
    if (!selectedDate) return alert("Please select a date!");
    if (selectedSeats.length === 0) return alert('Please select at least one seat!');
    
    setIsProcessing(true);
    const totalAmount = calculateTotal() + (selectedSeats.length * 30); 

    try {
      // --- THE ULTIMATE NATIVE DATE FIX ---
      const [time, modifier] = selectedTime.split(' ');
      let [hours, minutes] = time.split(':');
      let hrs = parseInt(hours, 10);
      
      if (modifier === 'PM' && hrs < 12) hrs += 12;
      if (modifier === 'AM' && hrs === 12) hrs = 0;
      
      // Let JavaScript handle the formatting safely!
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hrs, parseInt(minutes, 10), 0, 0);
      
      // This will ALWAYS generate a perfect backend-friendly string
      const validStartTime = finalDate.toISOString(); 
      // ------------------------------------

      const orderRes = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: totalAmount, 
          movieId: movie.id, 
          seats: selectedSeats,
          theaterName: selectedTheater,
          startTime: validStartTime 
        }),
      });
      
      const { orderId } = await orderRes.json();

      if (!orderId) throw new Error("Failed to generate Order ID");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: totalAmount * 100,
        currency: "INR",
        name: selectedTheater,
        description: `Tickets for ${movie.title} at ${selectedTime}`,
        order_id: orderId,
        handler: async function (response: any) {
          await fetch('/api/booking', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            }),
          });
          
          router.push('/tickets'); 
        },
        prefill: {
          name: session.user?.name || "Guest",
          email: session.user?.email || "",
        },
        theme: { color: "#f5c518" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment failed", error);
      alert("Something went wrong initializing the payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" /> 
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* LEFT SIDE: Selectors & Grid */}
        <div className="flex-1 w-full bg-[#1f1f1f] p-8 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto">
          
          {/* --- NEW: DATE & TIME SELECTOR UI --- */}
          <div className="mb-10 pb-10 border-b border-gray-800">
            {/* Dates */}
            <div className="flex gap-4 mb-6 overflow-x-auto hide-scrollbar pb-2">
              {dates.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-xl font-bold transition-colors ${
                    selectedDate === d.full ? 'bg-[#f5c518] text-black shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xs uppercase">{d.day}</span>
                  <span className="text-2xl">{d.date}</span>
                </button>
              ))}
            </div>

            {/* Theaters & Times */}
            <div className="space-y-6">
              {theaters.map((theater) => (
                <div key={theater} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
                  <h4 className="text-white font-bold mb-4">{theater}</h4>
<div className="flex flex-wrap gap-3">
                    {timeSlots.map((time) => {
                      const hasPassed = isTimeSlotPassed(time);
                      const isSelected = selectedTheater === theater && selectedTime === time;

                      return (
                        <button
                          key={`${theater}-${time}`}
                          onClick={() => {
                            setSelectedTheater(theater);
                            setSelectedTime(time);
                          }}
                          disabled={hasPassed}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                            hasPassed 
                              ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed line-through'
                              : isSelected 
                                ? 'bg-blue-600 border-blue-500 text-white' 
                                : 'bg-transparent border-gray-600 text-green-500 hover:bg-gray-800'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ---------------------------------- */}


          {/* The Screen */}
          <div className={`transition-opacity duration-500 ${!selectedTime ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="w-full flex flex-col items-center mb-12">
              <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-[#f5c518] to-transparent rounded-full opacity-50 blur-[2px]"></div>
              <div className="w-3/4 h-8 bg-gradient-to-b from-white/20 to-transparent rounded-t-full mt-2 border-t-2 border-white/30 flex items-start justify-center pt-1">
                <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">Screen This Way</span>
              </div>
            </div>

            {/* The Seats */}
            <div className="flex flex-col gap-4 min-w-[500px]">
              {rows.map((row) => (
                <div key={row} className="flex items-center justify-center gap-2 sm:gap-4">
                  <span className="text-gray-500 font-bold w-6 text-right">{row}</span>
                  <div className="flex gap-2">
                    {Array.from({ length: seatsPerRow }).map((_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isBooked = mockBookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      const isVip = row === 'A' || row === 'B';

                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(seatId)}
                          disabled={isBooked}
                          className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg rounded-b-sm transition-all duration-200 ${
                            isBooked ? 'bg-gray-800 cursor-not-allowed opacity-50' 
                              : isSelected ? 'bg-[#f5c518] scale-110' 
                              : isVip ? 'bg-blue-900/40 border border-blue-500/50 hover:bg-blue-500/40' 
                              : 'bg-gray-700 hover:bg-gray-500'
                          }`}
                        >
                          <div className={`absolute bottom-1 left-1 right-1 h-1 rounded-sm opacity-30 ${isSelected ? 'bg-black' : 'bg-white'}`}></div>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-gray-500 font-bold w-6">{row}</span>
                </div>
              ))}
            </div>
            {!selectedTime && (
              <div className="text-center mt-8 text-yellow-500 font-bold animate-pulse">
                Please select a Date and Time to unlock seats
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Booking Summary */}
        <div className="w-full lg:w-[350px] bg-[#1f1f1f] p-6 rounded-2xl border border-gray-800 shadow-xl sticky top-24">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-3">Booking Summary</h3>
          
          <div className="flex gap-4 mb-6">
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt="poster" className="w-16 rounded shadow-md" />
            <div>
              <h4 className="text-white font-bold leading-tight">{movie.title}</h4>
              <p className="text-sm text-gray-400 mt-1">English • 2D</p>
              
              {/* --- NEW: DYNAMIC SUMMARY TEXT --- */}
              <p className="text-sm text-[#f5c518] mt-1 font-semibold">
                {selectedTime ? `${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}, ${selectedTime}` : 'Select a time'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{selectedTheater}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-400">Seats</span>
              <span className="font-bold text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tickets</span>
              <span className="font-bold text-white">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fees</span>
              <span className="font-bold text-white">₹{selectedSeats.length > 0 ? selectedSeats.length * 30 : 0}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-300">Total</span>
            <span className="text-3xl font-extrabold text-[#f5c518]">
              ₹{selectedSeats.length > 0 ? calculateTotal() + (selectedSeats.length * 30) : 0}
            </span>
          </div>

          <button 
            onClick={handleProceedToPayment}
            disabled={selectedSeats.length === 0 || isProcessing || !selectedTime}
            className="w-full bg-[#f5c518] hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-extrabold py-4 rounded-xl transition-colors shadow-[0_10px_20px_rgba(245,197,24,0.2)] disabled:shadow-none text-lg flex justify-center"
          >
            {isProcessing ? 'Connecting...' : 'Proceed to Payment'}
          </button>
        </div>

      </div>
    </>
  );
}