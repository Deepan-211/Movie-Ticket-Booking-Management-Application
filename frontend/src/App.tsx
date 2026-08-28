import { useState, useEffect } from 'react';

// Types
interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  genre: string;
  durationMinutes: number;
  showType: string;
}

interface Show {
  id: number;
  movieId: number;
  movie?: Movie;
  theatre: string;
  location: string;
  dateTime: string;
  totalSeats: number;
  seatsAvailable: number;
  pricePerSeat: number;
}

interface BookingRequest {
  id: number;
  customerName: string;
  customerEmail: string;
  showId: number;
  show?: Show;
  numTickets: number;
  totalCost: number;
  status: string;
  confirmed: boolean;
  createdAt: string;
  resolvedAt: string | null;
  assignedQueue: string;
  rejectionReason?: string;
}

const API_URL = '/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [view, setView] = useState<'customer' | 'staff'>('customer');
  const [staffView, setStaffView] = useState<'cases' | 'catalog'>('cases');
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [queueFilter, setQueueFilter] = useState<'All' | 'PremiumShowQueue' | 'StandardShowQueue'>('All');

  // Customer Form State
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [numTickets, setNumTickets] = useState(1);
  const [bookingPendingConfirm, setBookingPendingConfirm] = useState<BookingRequest | null>(null);
  const [bookingError, setBookingError] = useState('');

  // Catalog Form State
  const [newMovie, setNewMovie] = useState({ title: '', description: '', posterUrl: '', genre: '', durationMinutes: 120, showType: 'Standard' });
  const [newShow, setNewShow] = useState({ movieId: 0, theatre: '', location: '', dateTime: '', totalSeats: 100, pricePerSeat: 200 });

  const fetchShows = async () => {
    try {
      const res = await fetch(`${API_URL}/shows`);
      const data = await res.json();
      setShows(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_URL}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShows();
    fetchMovies();
    if (view === 'staff') fetchBookings();
  }, [view]);

  // Handle Booking Submit
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShow) return;
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerEmail, showId: selectedShow.id, numTickets })
      });
      const data = await res.json();
      if (res.ok) {
        setBookingPendingConfirm(data);
        setBookingError('');
      } else {
        setBookingError(data.error);
      }
    } catch (e) {
      console.error(e);
      setBookingError('Error creating booking');
    }
  };

  // Handle Confirm Booking
  const handleConfirmBooking = async () => {
    if (!bookingPendingConfirm) return;
    try {
      await fetch(`${API_URL}/bookings/${bookingPendingConfirm.id}/confirm`, { method: 'PUT' });
      alert('Booking Confirmed! Awaiting staff approval.');
      setBookingPendingConfirm(null);
      setSelectedShow(null);
      setCustomerName('');
      setCustomerEmail('');
      setNumTickets(1);
    } catch (e) {
      console.error(e);
    }
  };

  // Staff Action
  const handleStaffAction = async (id: number, action: 'approve' | 'reject') => {
    let rejectionReason = '';
    if (action === 'reject') {
      const reason = prompt('Please enter a reason for rejecting this booking:');
      if (reason === null) return; // Cancelled
      rejectionReason = reason || 'No reason provided';
    }

    try {
      await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason })
      });
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  // Staff CRUD Actions
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      });
      fetchMovies();
      setNewMovie({ title: '', description: '', posterUrl: '', genre: '', durationMinutes: 120, showType: 'Standard' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!confirm('Are you sure? This will delete all related shows and bookings!')) return;
    try {
      await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' });
      fetchMovies();
      fetchShows();
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newShow, seatsAvailable: newShow.totalSeats })
      });
      fetchShows();
      setNewShow({ movieId: 0, theatre: '', location: '', dateTime: '', totalSeats: 100, pricePerSeat: 200 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteShow = async (id: number) => {
    if (!confirm('Are you sure? This will delete all related bookings!')) return;
    try {
      await fetch(`${API_URL}/shows/${id}`, { method: 'DELETE' });
      fetchShows();
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Modern Glowing Orbs Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[#030014] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[70vh] w-[70vw] rounded-full bg-emerald-600/15 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] h-[70vh] w-[70vw] rounded-full bg-teal-600/15 blur-[120px] animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-[20%] left-[20%] h-[60vh] w-[60vw] rounded-full bg-emerald-600/10 blur-[100px]"></div>
      </div>

      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-4">
                <span className="text-3xl font-black text-white tracking-tighter">M</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to MovieShow</h2>
              <p className="text-zinc-400">Sign in to book tickets or manage cases.</p>
            </div>
            
            {loginError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl mb-6 text-sm text-center font-medium animate-in slide-in-from-top-2">{loginError}</div>}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (username && password) {
                setIsLoggedIn(true);
                setLoginError('');
              } else {
                setLoginError('Please enter both username and password');
              }
            }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Username</label>
                <input required type="text" placeholder="Enter your username" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
                <input required type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-tranzinc-y-0.5 mt-4">
                Sign In
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <nav className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-xl font-black text-white tracking-tighter">M</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              MovieShow
            </h1>
          </div>
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-xl">
            <button 
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${view === 'customer' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => setView('customer')}
            >
              Browse
            </button>
            <button 
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${view === 'staff' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => setView('staff')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        {view === 'customer' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {!selectedShow && !bookingPendingConfirm && (
              <>
                <div className="text-center space-y-4 pt-10 pb-16">
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-xl">
                    Experience <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Cinematic Magic</span>
                  </h2>
                  <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
                    Book your premium tickets today and dive into unforgettable stories.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {shows.map(show => (
                    <div key={show.id} className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-tranzinc-y-2 cursor-pointer flex flex-col" onClick={() => setSelectedShow(show)}>
                      {/* Poster Image */}
                      <div className="relative h-72 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent z-10"></div>
                        <img src={show.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'} alt={show.movie?.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 z-20">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border ${show.movie?.showType === 'Premium' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'}`}>
                            {show.movie?.showType}
                          </span>
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="p-6 relative z-20 flex-1 flex flex-col justify-between -mt-10">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{show.movie?.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3 font-medium">
                            <span className="bg-white/10 px-2 py-0.5 rounded">{show.movie?.durationMinutes} min</span>
                            <span>{show.movie?.genre}</span>
                          </div>
                          <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                            {show.movie?.description}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-zinc-300">
                            <span className="text-emerald-400 mr-2">📍</span> {show.theatre} - {show.location}
                          </div>
                          <div className="flex items-center text-sm text-zinc-300">
                            <span className="text-emerald-400 mr-2">🕒</span> {new Date(show.dateTime).toLocaleString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                            <span className="text-sm font-medium text-zinc-400">{show.seatsAvailable} seats left</span>
                            <span className="text-2xl font-black text-white">₹{show.pricePerSeat}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedShow && !bookingPendingConfirm && (
              <div className="max-w-2xl mx-auto">
                <button onClick={() => setSelectedShow(null)} className="text-zinc-400 hover:text-white font-medium mb-8 flex items-center transition-colors group">
                  <span className="mr-2 group-hover:-tranzinc-x-1 transition-transform">←</span> Back to exploring
                </button>
                
                <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  
                  <div className="flex gap-6 mb-8">
                    <img src={selectedShow.movie?.posterUrl} alt="" className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10" />
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">{selectedShow.movie?.title}</h3>
                      <p className="text-zinc-400 mb-2">📍 {selectedShow.theatre}</p>
                      <p className="text-emerald-400 font-semibold">₹{selectedShow.pricePerSeat} per ticket</p>
                    </div>
                  </div>
                  
                  {bookingError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm flex items-center"><span className="mr-2">⚠️</span>{bookingError}</div>}
                  
                  <form onSubmit={handleBookSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                        <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-zinc-600" placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                        <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-zinc-600" placeholder="john@example.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Number of Tickets</label>
                      <input required type="number" min="1" max={selectedShow.seatsAvailable} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" value={numTickets} onChange={e => setNumTickets(parseInt(e.target.value))} />
                    </div>
                    
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5 flex justify-between items-center mt-8">
                      <span className="font-semibold text-zinc-300">Total Investment</span>
                      <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">₹{numTickets * selectedShow.pricePerSeat}</span>
                    </div>
                    
                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-tranzinc-y-0.5">
                      Request Tickets
                    </button>
                  </form>
                </div>
              </div>
            )}

            {bookingPendingConfirm && (
              <div className="max-w-md mx-auto animate-in zoom-in-95 duration-500">
                <div className="bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl ring-4 ring-teal-500/10">✨</div>
                    <h3 className="text-3xl font-bold mb-3 text-white">Review Request</h3>
                    <p className="text-zinc-400 mb-8">Your case is in the <span className="font-semibold text-teal-400 bg-teal-500/10 px-2 py-1 rounded-md">{bookingPendingConfirm.status}</span> stage.</p>
                    
                    <div className="bg-black/40 p-6 rounded-2xl text-left space-y-4 mb-8 border border-white/5">
                      <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-zinc-500">Guest</span>
                        <span className="font-medium text-white">{bookingPendingConfirm.customerName}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-zinc-500">Admissions</span>
                        <span className="font-medium text-white">{bookingPendingConfirm.numTickets}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-zinc-500">Total</span>
                        <span className="font-bold text-xl text-emerald-400">₹{bookingPendingConfirm.totalCost}</span>
                      </div>
                    </div>
                    
                    <button onClick={handleConfirmBooking} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-tranzinc-y-0.5 mb-4">
                      Confirm & Send to Staff
                    </button>
                    <button onClick={() => setBookingPendingConfirm(null)} className="w-full text-zinc-500 hover:text-white font-medium py-2 transition-colors">
                      Cancel Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'staff' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Staff Portal</h2>
                  <p className="text-zinc-400 text-sm mt-1">Manage cases and catalog</p>
                </div>
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 ml-4">
                  <button onClick={() => setStaffView('cases')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${staffView === 'cases' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}>Cases</button>
                  <button onClick={() => setStaffView('catalog')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${staffView === 'catalog' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}>Catalog</button>
                </div>
              </div>
              
              {staffView === 'cases' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-400">Work Queue:</span>
                  <div className="relative">
                    <select 
                      className="appearance-none bg-black/50 border border-white/10 rounded-lg py-2 pl-4 pr-10 text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer" 
                      value={queueFilter} 
                      onChange={e => setQueueFilter(e.target.value as any)}
                    >
                      <option value="All">Global (All)</option>
                      <option value="PremiumShowQueue">Premium Queue</option>
                      <option value="StandardShowQueue">Standard Queue</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">▼</div>
                  </div>
                </div>
              )}
            </div>
            
            {staffView === 'cases' && (
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-black/40">
                      <tr>
                        <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Requester & Details</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Assigned Queue</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Lifecycle & SLA</th>
                        <th className="px-6 py-5 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.filter(b => queueFilter === 'All' || b.assignedQueue === queueFilter).map(booking => {
                        const createdDate = new Date(booking.createdAt);
                        const now = new Date();
                        const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
                        let slaBadge = null;
                        
                        if (booking.status !== 'Resolved' && booking.status !== 'Rejected') {
                          if (hoursDiff > 48) {
                            slaBadge = <span className="ml-3 px-2.5 py-1 inline-flex text-xs font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">Deadline Missed</span>;
                          } else if (hoursDiff > 24) {
                            slaBadge = <span className="ml-3 px-2.5 py-1 inline-flex text-xs font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">Goal Missed</span>;
                          }
                        }

                        return (
                          <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="text-base font-bold text-white">{booking.customerName}</div>
                              <div className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                                <span>{booking.show?.movie?.title}</span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-emerald-400 font-medium">{booking.numTickets} tix</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-bold rounded-md border ${
                                booking.assignedQueue === 'PremiumShowQueue' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                              }`}>
                                {booking.assignedQueue}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`px-3 py-1 text-xs font-bold rounded-md border ${
                                  booking.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                  booking.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  booking.status === 'Approval' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                  'bg-zinc-800 text-zinc-400 border-white/10'
                                }`}>
                                  {booking.status}
                                </span>
                                {slaBadge}
                              </div>
                              {!booking.confirmed && booking.status !== 'Resolved' && booking.status !== 'Rejected' && (
                                <div className="text-xs text-amber-400 mt-2 font-medium flex items-center gap-1">
                                  <span>⏳</span> Pending Customer Confirmation
                                </div>
                              )}
                              {booking.status === 'Rejected' && (
                                <div className="text-xs text-rose-300 mt-2 font-medium">
                                  Reason: {booking.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                              {booking.status === 'Approval' && booking.confirmed && (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleStaffAction(booking.id, 'approve')} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    Approve
                                  </button>
                                  <button onClick={() => handleStaffAction(booking.id, 'reject')} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    Reject
                                  </button>
                                </div>
                              )}
                              {booking.status === 'Resolved' && (
                                <span className="inline-flex items-center gap-1 text-emerald-500 text-sm font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">✓ Closed Case</span>
                              )}
                              {booking.status === 'Rejected' && (
                                <span className="inline-flex items-center gap-1 text-rose-500 text-sm font-bold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">✕ Closed Case</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <div className="text-4xl mb-4 opacity-50">📭</div>
                            <div className="text-zinc-400 font-medium">No active cases in this queue.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {staffView === 'catalog' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Movies Form */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Manage Movies</h3>
                  <form onSubmit={handleAddMovie} className="space-y-4 mb-8">
                    <input required type="text" placeholder="Movie Title" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} />
                    <textarea required placeholder="Description" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} />
                    <input required type="url" placeholder="Poster URL" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newMovie.posterUrl} onChange={e => setNewMovie({...newMovie, posterUrl: e.target.value})} />
                    <div className="flex gap-4">
                      <input required type="text" placeholder="Genre" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} />
                      <input required type="number" placeholder="Duration (min)" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newMovie.durationMinutes} onChange={e => setNewMovie({...newMovie, durationMinutes: parseInt(e.target.value)})} />
                    </div>
                    <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newMovie.showType} onChange={e => setNewMovie({...newMovie, showType: e.target.value})}>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="3D">3D</option>
                    </select>
                    <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl">Add Movie</button>
                  </form>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {movies.map(movie => (
                      <div key={movie.id} className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="font-bold text-white">{movie.title}</p>
                          <p className="text-xs text-zinc-400">{movie.genre} • {movie.showType}</p>
                        </div>
                        <button onClick={() => handleDeleteMovie(movie.id)} className="text-rose-400 hover:text-rose-300 text-sm font-medium px-3 py-1 bg-rose-500/10 rounded-lg">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shows Form */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Manage Shows</h3>
                  <form onSubmit={handleAddShow} className="space-y-4 mb-8">
                    <select required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newShow.movieId} onChange={e => setNewShow({...newShow, movieId: parseInt(e.target.value)})}>
                      <option value={0} disabled>Select Movie</option>
                      {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                    <input required type="text" placeholder="Theatre (e.g. Screen 1)" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newShow.theatre} onChange={e => setNewShow({...newShow, theatre: e.target.value})} />
                    <input required type="text" placeholder="Location" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newShow.location} onChange={e => setNewShow({...newShow, location: e.target.value})} />
                    <input required type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newShow.dateTime} onChange={e => setNewShow({...newShow, dateTime: e.target.value})} />
                    <div className="flex gap-4">
                      <input required type="number" placeholder="Total Seats" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newShow.totalSeats} onChange={e => setNewShow({...newShow, totalSeats: parseInt(e.target.value)})} />
                      <input required type="number" placeholder="Price Per Seat" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={newShow.pricePerSeat} onChange={e => setNewShow({...newShow, pricePerSeat: parseInt(e.target.value)})} />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">Add Show</button>
                  </form>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {shows.map(show => (
                      <div key={show.id} className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="font-bold text-white">{show.movie?.title}</p>
                          <p className="text-xs text-zinc-400">{show.theatre} • {new Date(show.dateTime).toLocaleString([], {weekday: 'short', hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <button onClick={() => handleDeleteShow(show.id)} className="text-rose-400 hover:text-rose-300 text-sm font-medium px-3 py-1 bg-rose-500/10 rounded-lg">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
          )}
        </main>
      </>
      )}
    </div>
  );
}

export default App;
