import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, MapPin as MapPinFilled } from 'lucide-react';
import { CheckoutStepper } from '../components/layout/CheckoutStepper';
import { Input, TextArea } from '../components/ui/Input';
import { Combobox } from '../components/form/Combobox';
import { useToast } from '../context/ToastContext';

const provinsiData = [
  { code: '11', name: 'Aceh' }, { code: '12', name: 'Sumatera Utara' }, { code: '13', name: 'Sumatera Barat' }, { code: '14', name: 'Riau' }, { code: '15', name: 'Jambi' },
  { code: '16', name: 'Sumatera Selatan' }, { code: '17', name: 'Bengkulu' }, { code: '18', name: 'Lampung' }, { code: '19', name: 'Kep. Bangka Belitung' }, { code: '21', name: 'Kep. Riau' },
  { code: '31', name: 'DKI Jakarta' }, { code: '32', name: 'Jawa Barat' }, { code: '33', name: 'Jawa Tengah' }, { code: '34', name: 'DI Yogyakarta' }, { code: '35', name: 'Jawa Timur' },
  { code: '36', name: 'Banten' }, { code: '51', name: 'Bali' }, { code: '52', name: 'Nusa Tenggara Barat' }, { code: '53', name: 'Nusa Tenggara Timur' },
  { code: '61', name: 'Kalimantan Barat' }, { code: '62', name: 'Kalimantan Tengah' }, { code: '63', name: 'Kalimantan Selatan' }, { code: '64', name: 'Kalimantan Timur' }, { code: '65', name: 'Kalimantan Utara' },
  { code: '71', name: 'Sulawesi Utara' }, { code: '72', name: 'Sulawesi Tengah' }, { code: '73', name: 'Sulawesi Selatan' }, { code: '74', name: 'Sulawesi Tenggara' }, { code: '75', name: 'Gorontalo' }, { code: '76', name: 'Sulawesi Barat' },
  { code: '81', name: 'Maluku' }, { code: '82', name: 'Maluku Utara' }, { code: '91', name: 'Papua Barat' }, { code: '94', name: 'Papua' },
];
const kotaByProvinsi = {
  '31': [ { code: '3171', name: 'Kota Jakarta Selatan' }, { code: '3172', name: 'Kota Jakarta Timur' }, { code: '3173', name: 'Kota Jakarta Pusat' }, { code: '3174', name: 'Kota Jakarta Barat' }, { code: '3175', name: 'Kota Jakarta Utara' }, ],
  '32': [ { code: '3201', name: 'Kab. Bogor' }, { code: '3202', name: 'Kab. Sukabumi' }, { code: '3203', name: 'Kab. Cianjur' }, { code: '3271', name: 'Kota Bogor' }, { code: '3273', name: 'Kota Bandung' }, { code: '3276', name: 'Kota Depok' }, { code: '3277', name: 'Kota Bekasi' }, ],
  '33': [ { code: '3301', name: 'Kab. Cilacap' }, { code: '3302', name: 'Kab. Banyumas' }, { code: '3374', name: 'Kota Semarang' }, { code: '3375', name: 'Kota Salatiga' }, ],
  '35': [ { code: '3501', name: 'Kab. Pacitan' }, { code: '3578', name: 'Kota Surabaya' }, { code: '3573', name: 'Kota Malang' }, ],
  '36': [ { code: '3601', name: 'Kab. Pandeglang' }, { code: '3671', name: 'Kota Tangerang' }, { code: '3674', name: 'Kota Tangerang Selatan' }, ],
  '51': [ { code: '5101', name: 'Kab. Jembrana' }, { code: '5171', name: 'Kota Denpasar' }, ],
};

export function AddressPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName:'', phone:'', email:'', province:'', city:'', district:'', village:'', postalCode:'', street:'', detail:'' });
  const [provinceObj, setProvinceObj] = useState(null);
  const [cityObj, setCityObj] = useState(null);
  const [errors, setErrors] = useState({});
  const [mapPin, setMapPin] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const kotaOptions = useMemo(() => provinceObj ? (kotaByProvinsi[provinceObj.code] || []) : [], [provinceObj]);

  function validate() {
    const e={};
    if (!form.fullName || form.fullName.trim().length <3) e.fullName='Nama minimal 3 karakter.';
    if (!form.phone || !/^0[0-9]{7,14}$/.test(form.phone.trim())) e.phone='Nomor HP tidak valid.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email='Email tidak valid.';
    if (!form.province) e.province='Pilih provinsi.';
    if (!form.city) e.city='Pilih kota.';
    if (!form.street || form.street.trim().length <5) e.street='Alamat minimal 5 karakter.';
    setErrors(e);
    return Object.keys(e).length===0;
  }

  function locateMe(){
    if(!navigator.geolocation) { toast.error('Geolocation tidak didukung'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos)=> { setMapPin({ lat:pos.coords.latitude, lng:pos.coords.longitude }); setLocating(false); toast.success('Lokasi ditemukan'); }, ()=> { setLocating(false); toast.error('Gagal mendapatkan lokasi'); });
  }

  function submit(e){
    e.preventDefault();
    if(!validate()) { setShowErrorBanner(true); return; }
    setShowErrorBanner(false);
    const payload = { ...form, province_name: provinceObj?.name || '', city_name: cityObj?.name || '', lat: mapPin?.lat || null, lng: mapPin?.lng || null };
    localStorage.setItem('perfu.me:address', JSON.stringify(payload));
    toast.success('Alamat tersimpan! Melanjutkan ke review...');
    navigate('/cart/review');
  }

  return (
    <main className="pt-[100px] max-w-[80rem] mx-auto px-8 pb-16">
      <CheckoutStepper step={2} />
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#888] font-sans">Alamat Pengiriman</h2>
            <Link to="/cart" className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] hover:text-[#111] transition-colors no-underline">
              <ArrowLeft size={13} strokeWidth={2} />
              Kembali
            </Link>
          </div>

          {showErrorBanner && <div className="mb-5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-[12px] font-sans text-red-600">Lengkapi bagian yang ditandai merah sebelum melanjutkan.</div>}

          <form className="flex flex-col gap-5" noValidate onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" placeholder="Nama penerima" required value={form.fullName} onChange={(e)=> setForm({...form, fullName:e.target.value})} error={errors.fullName} maxLength={100} />
              <Input label="Nomor WhatsApp Aktif" placeholder="08xxxxxxxxxx" required value={form.phone} onChange={(e)=> setForm({...form, phone:e.target.value})} error={errors.phone} maxLength={15} inputMode="numeric" />
            </div>
            <Input label="Email" placeholder="nama@email.com" type="email" required value={form.email} onChange={(e)=> setForm({...form, email:e.target.value})} error={errors.email} maxLength={150} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Combobox
                label="Provinsi"
                placeholder="Pilih provinsi"
                value={provinceObj}
                onSelect={(p)=> { setProvinceObj(p); setForm({...form, province:p.code, city:'', district:'', village:''}); setCityObj(null); }}
                options={provinsiData}
                error={errors.province}
              />
              <Combobox
                label="Kota / Kabupaten"
                placeholder={form.province ? 'Pilih kota' : 'Pilih provinsi dulu'}
                value={cityObj}
                onSelect={(k)=> { setCityObj(k); setForm({...form, city:k.code}); }}
                options={kotaOptions}
                error={errors.city}
                disabled={!form.province}
              />
              <Input label="Kecamatan" placeholder={form.city ? 'Pilih kecamatan' : 'Pilih kota dulu'} disabled={!form.city} value={form.district} onChange={(e)=> setForm({...form, district:e.target.value})} error={errors.district} />
              <Input label="Kelurahan / Desa" placeholder={form.district ? 'Pilih kelurahan' : 'Pilih kecamatan dulu'} disabled={!form.district} value={form.village} onChange={(e)=> setForm({...form, village:e.target.value})} error={errors.village} />
              <Input label="Kode Pos" placeholder="12345" value={form.postalCode} onChange={(e)=> setForm({...form, postalCode:e.target.value})} error={errors.postalCode} maxLength={10} inputMode="numeric" />
            </div>

            <Input label="Alamat Lengkap" placeholder="Nama jalan, nomor rumah, RT/RW" value={form.street} onChange={(e)=> setForm({...form, street:e.target.value})} error={errors.street} maxLength={255} />
            <TextArea label="Catatan Tambahan (opsional)" placeholder="Patokan, instruksi khusus, dll." rows={3} value={form.detail} onChange={(e)=> setForm({...form, detail:e.target.value})} maxLength={500} />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] block">Pin Lokasi <span className="normal-case text-[#ccc] tracking-normal">(opsional)</span></label>
                <button type="button" onClick={locateMe} className="inline-flex items-center gap-1.5 border border-[#e6e6e6] rounded-full px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors duration-200 cursor-pointer bg-white">
                  <MapPin size={13} strokeWidth={2} />
                  <span>{locating ? 'Mencari...' : 'Lokasi Saya'}</span>
                </button>
              </div>
              <div className="w-full h-[380px] rounded-lg overflow-hidden border border-black/10 relative z-0 bg-[#f0f0f0] flex flex-col items-center justify-center gap-3">
                {!mapPin ? (
                  <div className="flex flex-col items-center gap-2 text-center px-8">
                    <MapPin size={32} strokeWidth={1.5} className="text-[#bbb]" />
                    <p className="font-sans text-[12px] text-[#aaa]">Klik "Lokasi Saya" untuk menandai lokasi,<br/>atau biarkan kosong untuk melewati langkah ini.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <MapPinFilled size={32} strokeWidth={1.5} fill="currentColor" className="text-[#1a1a1a]" />
                    <p className="font-sans text-[12px] text-[#555]">Lat: {mapPin.lat.toFixed(5)}, Lng: {mapPin.lng.toFixed(5)}</p>
                    <button type="button" onClick={()=> setMapPin(null)} className="font-sans text-[10px] text-[#888] hover:text-[#111] underline cursor-pointer border-none bg-transparent">Hapus pin</button>
                  </div>
                )}
              </div>
              <p className="font-sans text-[11px] leading-relaxed text-[#888]">Tidak perlu terlalu akurat. Cukup letakkan pin di sekitar lokasi pengiriman; pin ini opsional dan dapat dilewati.</p>
            </div>

            <button type="submit" className="w-full px-6 py-3 bg-[#111] text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans cursor-pointer border-none hover:bg-[#333] transition-colors duration-200">Lanjut ke Review</button>
          </form>
        </div>
      </div>
    </main>
  );
}
