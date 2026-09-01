import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, MapPin as MapPinFilled } from 'lucide-react';
import { CheckoutStepper } from '../components/layout/CheckoutStepper';
import { Input, TextArea } from '../components/ui/Input';
import { Combobox } from '../components/ui/Combobox';
import { Maps } from '../components/ui/Maps';
import { useToast } from '../context/ToastContext';
import { fetchWilayah } from '../lib/wilayah';

const ADDRESS_CACHE_COOKIE = 'perfu.me:address_cache';
const CACHE_MAX_AGE = 60 * 60 * 24 * 120; // 120 days

function setAddressCache(data) {
  try {
    const v = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${ADDRESS_CACHE_COOKIE}=${v}; max-age=${CACHE_MAX_AGE}; path=/; SameSite=Lax`;
  } catch {}
}

function getAddressCache() {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + ADDRESS_CACHE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    if (!m) return null;
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

export function AddressPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName:'', phone:'', email:'', province:'', city:'', district:'', village:'', postalCode:'', street:'', detail:'' });
  const [provinceObj, setProvinceObj] = useState(null);
  const [cityObj, setCityObj] = useState(null);
  const [districtObj, setDistrictObj] = useState(null);
  const [villageObj, setVillageObj] = useState(null);
  const [errors, setErrors] = useState({});
  const [mapPin, setMapPin] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [hasRestoredCache, setHasRestoredCache] = useState(false);

  // Fetch provinces on mount (RAM cached, no abort needed for initial)
  useEffect(() => {
    setLoadingProvinces(true);
    fetchWilayah('/provinces.json')
      .then(setProvinces)
      .catch(() => toast.error('Gagal memuat provinsi'))
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Restore address cache (cookies) — only wilayah + street/detail, not nama/WA/email
  useEffect(() => {
    if (hasRestoredCache) return;
    const cached = getAddressCache();
    if (!cached) {
      setHasRestoredCache(true);
      return;
    }
    setHasRestoredCache(true);
    const prov = cached.province ? { code: cached.province, name: cached.province_name || cached.province } : null;
    const city = cached.city ? { code: cached.city, name: cached.city_name || cached.city } : null;
    const dist = cached.district ? { code: cached.district, name: cached.district_name || cached.district } : null;
    const vill = cached.village ? { code: cached.village, name: cached.village_name || cached.village } : null;
    if (prov) setProvinceObj(prov);
    if (city) setCityObj(city);
    if (dist) setDistrictObj(dist);
    if (vill) setVillageObj(vill);
    setForm((prev) => ({
      ...prev,
      province: cached.province || prev.province,
      city: cached.city || prev.city,
      district: cached.district || prev.district,
      village: cached.village || prev.village,
      street: cached.street || prev.street,
      detail: cached.detail || prev.detail,
    }));
  }, [hasRestoredCache]);

  // Persist address cache to cookies — only 6 fields per spec (no nama/WA/email)
  useEffect(() => {
    if (!hasRestoredCache) return;
    const payload = {
      province: provinceObj?.code || form.province || '',
      province_name: provinceObj?.name || '',
      city: cityObj?.code || form.city || '',
      city_name: cityObj?.name || '',
      district: districtObj?.code || form.district || '',
      district_name: districtObj?.name || '',
      village: villageObj?.code || form.village || '',
      village_name: villageObj?.name || '',
      street: form.street || '',
      detail: form.detail || '',
    };
    const hasAny = payload.province || payload.city || payload.district || payload.village || payload.street || payload.detail;
    if (!hasAny) return;
    setAddressCache(payload);
  }, [provinceObj, cityObj, districtObj, villageObj, form.street, form.detail, hasRestoredCache]);

  // Fetch regencies when province changes (RAM cached)
  useEffect(() => {
    if (!provinceObj?.code) { setRegencies([]); return; }
    setLoadingRegencies(true);
    setRegencies([]);
    fetchWilayah(`/regencies/${provinceObj.code}.json`)
      .then(setRegencies)
      .catch(() => toast.error('Gagal memuat kota/kabupaten'))
      .finally(() => setLoadingRegencies(false));
  }, [provinceObj?.code]);

  // Fetch districts when city changes (RAM cached)
  useEffect(() => {
    if (!cityObj?.code) { setDistricts([]); return; }
    setLoadingDistricts(true);
    setDistricts([]);
    fetchWilayah(`/districts/${cityObj.code}.json`)
      .then(setDistricts)
      .catch(() => toast.error('Gagal memuat kecamatan'))
      .finally(() => setLoadingDistricts(false));
  }, [cityObj?.code]);

  // Fetch villages when district changes (RAM cached)
  useEffect(() => {
    if (!districtObj?.code) { setVillages([]); return; }
    setLoadingVillages(true);
    setVillages([]);
    fetchWilayah(`/villages/${districtObj.code}.json`)
      .then(setVillages)
      .catch(() => toast.error('Gagal memuat kelurahan/desa'))
      .finally(() => setLoadingVillages(false));
  }, [districtObj?.code]);

  function validate() {
    const e={};
    if (!form.fullName || form.fullName.trim().length <3) e.fullName='Nama minimal 3 karakter.';
    if (!form.phone || !/^0[0-9]{7,14}$/.test(form.phone.trim())) e.phone='Nomor HP tidak valid.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email='Email tidak valid.';
    if (!form.province) e.province='Pilih provinsi.';
    if (!form.city) e.city='Pilih kota/kabupaten.';
    if (!form.district) e.district='Pilih kecamatan.';
    if (!form.village) e.village='Pilih kelurahan/desa.';
    if (!form.postalCode) e.postalCode='Kode pos wajib diisi.';
    else if (!/^[0-9]{5}$/.test(form.postalCode.trim())) e.postalCode='Kode pos harus 5 digit angka.';
    if (!form.street || form.street.trim().length <5) e.street='Alamat minimal 5 karakter.';
    setErrors(e);
    return Object.keys(e).length===0;
  }

  function locateMe(){
    if(!navigator.geolocation) { toast.error('Geolocation tidak didukung'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos)=> { setMapPin({ lat:pos.coords.latitude, lng:pos.coords.longitude }); setLocating(false); toast.success('Lokasi ditemukan'); }, ()=> { setLocating(false); toast.error('Gagal mendapatkan lokasi'); });
  }

  function handlePostalCodeChange(e) {
    // hanya angka, tanpa minus, koma, huruf
    const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
    setForm({...form, postalCode: digits});
  }

  function handlePostalCodeKeyDown(e) {
    // cegah karakter tidak diinginkan langsung di keyboard
    if (['-', '+', ',', '.', 'e', 'E'].includes(e.key)) e.preventDefault();
  }

  function submit(e){
    e.preventDefault();
    if(!validate()) { setShowErrorBanner(true); return; }
    setShowErrorBanner(false);
    const payload = {
      ...form,
      province_name: provinceObj?.name || '',
      city_name: cityObj?.name || '',
      district_name: districtObj?.name || '',
      village_name: villageObj?.name || '',
      lat: mapPin?.lat || null,
      lng: mapPin?.lng || null
    };
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
                placeholder={loadingProvinces ? 'Memuat...' : 'Pilih provinsi'}
                value={provinceObj}
                onSelect={(p)=> {
                  setProvinceObj(p);
                  setCityObj(null); setDistrictObj(null); setVillageObj(null);
                  setForm({...form, province:p.code, city:'', district:'', village:''});
                }}
                options={provinces}
                error={errors.province}
                disabled={loadingProvinces}
              />
              <Combobox
                label="Kota / Kabupaten"
                placeholder={!form.province ? 'Pilih provinsi dulu' : loadingRegencies ? 'Memuat...' : 'Pilih kota'}
                value={cityObj}
                onSelect={(k)=> {
                  setCityObj(k);
                  setDistrictObj(null); setVillageObj(null);
                  setForm({...form, city:k.code, district:'', village:''});
                }}
                options={regencies}
                error={errors.city}
                disabled={!form.province || loadingRegencies}
              />
              <Combobox
                label="Kecamatan"
                placeholder={!form.city ? 'Pilih kota dulu' : loadingDistricts ? 'Memuat...' : 'Pilih kecamatan'}
                value={districtObj}
                onSelect={(d)=> {
                  setDistrictObj(d);
                  setVillageObj(null);
                  setForm({...form, district:d.code, village:''});
                }}
                options={districts}
                error={errors.district}
                disabled={!form.city || loadingDistricts}
              />
              <Combobox
                label="Kelurahan / Desa"
                placeholder={!form.district ? 'Pilih kecamatan dulu' : loadingVillages ? 'Memuat...' : 'Pilih kelurahan'}
                value={villageObj}
                onSelect={(v)=> { setVillageObj(v); setForm({...form, village:v.code}); }}
                options={villages}
                error={errors.village}
                disabled={!form.district || loadingVillages}
              />
              <Input
                label="Kode Pos"
                placeholder="12345"
                value={form.postalCode}
                onChange={handlePostalCodeChange}
                onKeyDown={handlePostalCodeKeyDown}
                error={errors.postalCode}
                maxLength={5}
                inputMode="numeric"
                pattern="[0-9]*"
                type="text"
              />
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
              <Maps province={provinceObj} city={cityObj} district={districtObj} village={villageObj} pin={mapPin} setPin={setMapPin} locating={locating} />
              {mapPin && (
                <div className="flex items-center gap-2">
                  <p className="font-sans text-[12px] text-[#555]">Lat: {mapPin.lat.toFixed(5)}, Lng: {mapPin.lng.toFixed(5)}</p>
                  <button type="button" onClick={() => setMapPin(null)} className="font-sans text-[10px] text-[#888] hover:text-[#111] underline cursor-pointer border-none bg-transparent">Hapus pin</button>
                </div>
              )}
              <p className="font-sans text-[11px] leading-relaxed text-[#888]">Tidak perlu terlalu akurat. Cukup letakkan pin di sekitar lokasi pengiriman; pin ini opsional dan dapat dilewati.</p>
            </div>

            <button type="submit" className="w-full px-6 py-3 bg-[#111] text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans cursor-pointer border-none hover:bg-[#333] transition-colors duration-200">Lanjut ke Review</button>
          </form>
        </div>
      </div>
    </main>
  );
}
