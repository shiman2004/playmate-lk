import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="font-display text-[160px] leading-none text-primary-500/10 mb-0 select-none">404</div>
        <div className="-mt-8 mb-6">
          <h1 className="font-display text-5xl text-white mb-3">PAGE NOT FOUND</h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Looks like this page is out of bounds. Let's get you back to the court.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/venues" className="btn-secondary">Browse Venues</Link>
        </div>
      </div>
    </div>
  )
}
