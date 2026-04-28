import { Link } from 'react-router-dom';
import { ArrowRight, Star, Flame, MapPin, Clock, Sparkles, ChefHat, Truck } from 'lucide-react';
import PublicHeader from '../components/PublicHeader.jsx';
import Footer from '../components/Footer.jsx';
import { PLACEHOLDER_IMAGE, BRANCHES } from '../lib/supabase.js';

const advantages = [
  {
    icon: Flame,
    title: 'Varian Inovatif',
    desc: 'Mentai creamy yang di-torch sampai aroma smoky, plus saus Tar-Tar premium yang jarang ada di Pekanbaru.',
  },
  {
    icon: Sparkles,
    title: 'Harga Inklusif',
    desc: 'Mulai Rp25.000 sampai Rp155.000 per porsi — pas untuk jajan sore, sharing, sampai acara keluarga.',
  },
  {
    icon: MapPin,
    title: '5 Cabang Strategis',
    desc: 'Tersebar di Rumbai, Paus, Durian, Panam, dan Marpoyan — selalu ada Alsaba di dekatmu.',
  },
];

const steps = [
  { n: '01', title: 'Pilih Varian', icon: ChefHat, desc: 'Buka halaman Produk, pilih dari 20 varian Mentai & Tar-Tar favorit.' },
  { n: '02', title: 'Isi Form Pesan', icon: Sparkles, desc: 'Isi nama, no HP, alamat/cabang ambil, dan metode pembayaran.' },
  { n: '03', title: 'Tinggal Tunggu', icon: Truck, desc: 'Pesananmu masuk ke dapur cabang. Datang & ambil tanpa antre.', highlight: true },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pt-4 pb-8">
      <PublicHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 mt-10 md:mt-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="pill bg-primary-50 text-primary-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              UMKM Favorit Pekanbaru
            </span>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-gray-900">
              Dimsum <span className="italic text-primary-500">Mentai</span> &amp;{' '}
              <span className="italic text-primary-500">Tar-Tar</span> Khas Alsaba.
            </h1>
            <p className="mt-6 text-gray-600 max-w-md leading-relaxed">
              Dimsum premium dengan saus mentai creamy dan tar-tar gurih, di-torch
              sampai smoky. Dibuat fresh setiap sore di lima cabang Pekanbaru.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/produk" className="btn-primary">
                Lihat Menu <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pesan" className="btn-ghost">Pesan Sekarang</Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-500" /> Buka 16.00 — habis
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" /> 5 cabang Pekanbaru
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[5/4] rounded-3xl bg-gradient-to-br from-primary-100 via-primary-50 to-amber-50 overflow-hidden shadow-card">
              <img
                src={PLACEHOLDER_IMAGE.mentai}
                alt="Dimsum Mentai signature"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-6 md:left-10 bg-white rounded-2xl shadow-card p-3 pr-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 grid place-items-center text-white">
                <Star className="w-5 h-5" fill="currentColor" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating Pelanggan</p>
                <p className="text-sm font-semibold">4.9 / 5 — &ldquo;mentainya nggak pelit!&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG ALSABA */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 mt-24">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-500 font-semibold">
              Tentang Kami
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 leading-tight">
              UMKM kuliner Pekanbaru dengan dimsum
              <span className="italic text-primary-500"> mentai</span> &amp;
              <span className="italic text-primary-500"> tar-tar</span> kekinian.
            </h2>
          </div>
          <div className="text-gray-600 leading-relaxed space-y-4">
            <p>
              Dimsum Alsaba lahir dari kecintaan pada cita rasa dimsum tradisional
              yang dipadu dengan inovasi modern. Setiap dimsum kami diproduksi
              di dapur pusat sebagai produk frozen, lalu didistribusikan ke
              setiap cabang untuk di-finishing fresh: dikukus, dikasih topping,
              dan di-torch saat dipesan.
            </p>
            <p>
              Harga inklusif Rp25.000 – Rp155.000 menjangkau pelajar, mahasiswa,
              pekerja kantor, sampai keluarga. Buka setiap sore mengikuti jam
              pulang sekolah dan kerja.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {advantages.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-primary-50 grid place-items-center mb-4">
                <Icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CARA PESAN */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 mt-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">3 Langkah Pesan</h2>
          <p className="text-gray-500 mt-2">Cepat, transparan, dan tanpa antre.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ n, title, icon: Icon, desc, highlight }) => (
            <div key={n} className="card p-8 text-center">
              <div
                className={`mx-auto w-14 h-14 rounded-full grid place-items-center font-bold text-sm mb-4 ${
                  highlight ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-500'
                }`}
              >
                {n}
              </div>
              <Icon className="mx-auto w-6 h-6 text-primary-500 mb-3" />
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CABANG */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 mt-24">
        <div className="rounded-3xl bg-primary-800 text-white overflow-hidden">
          <div className="grid md:grid-cols-2 gap-10 items-center p-8 md:p-14">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-200 font-semibold mb-3">
                Lokasi
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Lima cabang siap antar
                <br />
                <span className="italic text-primary-300">umami</span> ke piringmu.
              </h2>
              <p className="mt-5 text-primary-100 text-sm leading-relaxed max-w-md">
                Pilih cabang terdekat saat checkout — pesananmu langsung masuk ke
                dapur cabang yang dipilih.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {BRANCHES.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-2xl bg-primary-900/50 border border-primary-700 p-4"
                >
                  <MapPin className="w-4 h-4 text-primary-300 mt-0.5 shrink-0" />
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
