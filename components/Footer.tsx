export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
          {/* Address */}
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-map-marker-alt"></i>
            <p>1831 E Apache Blvd, Tempe, AZ 85281</p>
          </div>

          {/* Divider - hidden on mobile */}
          <div className="hidden md:block w-px h-6 bg-gray-700"></div>

          {/* Phone */}
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-phone"></i>
            <p>+1 (480) 589-7445</p>
          </div>

          {/* Divider - hidden on mobile */}
          <div className="hidden md:block w-px h-6 bg-gray-700"></div>

          {/* Email */}
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-envelope"></i>
            <p>agrawal.akash@asu.edu</p>
          </div>
        </div>

        {/* Copyright - centered on mobile */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>© 2025 Akash Agrawal. All rights reserved.</p>
        </div>
      </div>

      {/* Font Awesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
      />
    </footer>
  )
}
