import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import KKList from './pages/KK/KKList.jsx'
import KKForm from './pages/KK/KKForm.jsx'
import KKDetail from './pages/KK/KKDetail.jsx'
import AnggotaList from './pages/Anggota/AnggotaList.jsx'
import AnggotaForm from './pages/Anggota/AnggotaForm.jsx'
import AnggotaMove from './pages/Anggota/AnggotaMove.jsx'
import KasList from './pages/Keuangan/KasList.jsx'
import KasForm from './pages/Keuangan/KasForm.jsx'
import JenisIuranList from './pages/Keuangan/JenisIuranList.jsx'
import JenisIuranForm from './pages/Keuangan/JenisIuranForm.jsx'
import IuranList from './pages/Keuangan/IuranList.jsx'
import IuranForm from './pages/Keuangan/IuranForm.jsx'
import KategoriPengeluaranList from './pages/Keuangan/KategoriPengeluaranList.jsx'
import KategoriPengeluaranForm from './pages/Keuangan/KategoriPengeluaranForm.jsx'
import PengeluaranList from './pages/Keuangan/PengeluaranList.jsx'
import PengeluaranForm from './pages/Keuangan/PengeluaranForm.jsx'
import PengumumanList from './pages/Pengumuman/PengumumanList.jsx'
import PengumumanForm from './pages/Pengumuman/PengumumanForm.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/kartu-keluarga" element={<KKList />} />
        <Route path="/kartu-keluarga/baru" element={<KKForm />} />
        <Route path="/kartu-keluarga/:id" element={<KKDetail />} />
        <Route path="/kartu-keluarga/:id/edit" element={<KKForm />} />
        <Route path="/anggota" element={<AnggotaList />} />
        <Route path="/anggota/baru" element={<AnggotaForm />} />
        <Route path="/anggota/:id/edit" element={<AnggotaForm />} />
        <Route path="/anggota/:id/pindah" element={<AnggotaMove />} />
        <Route path="/kas" element={<KasList />} />
        <Route path="/kas/baru" element={<KasForm />} />
        <Route path="/kas/:id/edit" element={<KasForm />} />
        <Route path="/jenis-iuran" element={<JenisIuranList />} />
        <Route path="/jenis-iuran/baru" element={<JenisIuranForm />} />
        <Route path="/jenis-iuran/:id/edit" element={<JenisIuranForm />} />
        <Route path="/iuran" element={<IuranList />} />
        <Route path="/iuran/baru" element={<IuranForm />} />
        <Route path="/iuran/:id/edit" element={<IuranForm />} />
        <Route path="/kategori-pengeluaran" element={<KategoriPengeluaranList />} />
        <Route path="/kategori-pengeluaran/baru" element={<KategoriPengeluaranForm />} />
        <Route path="/kategori-pengeluaran/:id/edit" element={<KategoriPengeluaranForm />} />
        <Route path="/pengeluaran" element={<PengeluaranList />} />
        <Route path="/pengeluaran/baru" element={<PengeluaranForm />} />
        <Route path="/pengeluaran/:id/edit" element={<PengeluaranForm />} />
        <Route path="/pengumuman" element={<PengumumanList />} />
        <Route path="/pengumuman/baru" element={<PengumumanForm />} />
        <Route path="/pengumuman/:id/edit" element={<PengumumanForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
