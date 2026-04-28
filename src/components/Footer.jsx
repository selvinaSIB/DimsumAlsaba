export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 md:px-8 py-10 mt-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-gray-200 pt-8">
        <div>
          <p className="text-sm font-semibold text-gray-900">Dimsum Alsaba</p>
          <p className="text-xs text-gray-500 mt-1">
            © {new Date().getFullYear()} Dimsum Alsaba — Pekanbaru. Buka sore sampai habis.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <li><a href="#" className="hover:text-primary-500">Instagram</a></li>
          <li><a href="#" className="hover:text-primary-500">TikTok</a></li>
          <li><a href="https://wa.me/" className="hover:text-primary-500">WhatsApp</a></li>
        </ul>
      </div>
    </footer>
  );
}
