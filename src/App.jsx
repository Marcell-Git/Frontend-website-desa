import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import PublicLayout from './components/PublicLayout.jsx'
import DocumentTitle from './components/DocumentTitle.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/LandingPage/Home.jsx'
import PengumumanPublik from './pages/LandingPage/PengumumanPublik.jsx'
import DetailPengumumanPublik from './pages/LandingPage/DetailPengumumanPublik.jsx'
import LaporanPublik from './pages/LandingPage/LaporanPublik.jsx'
import FormPengaduanPublik from './pages/LandingPage/FormPengaduanPublik.jsx'
import Kontak from './pages/LandingPage/Kontak.jsx'
import VisiMisi from './pages/LandingPage/VisiMisi.jsx'
import BeritaKegiatanPublik from './pages/LandingPage/BeritaKegiatanPublik.jsx'
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
import PengaduanList from './pages/Pengaduan/PengaduanList.jsx'
import PengaduanDetail from './pages/Pengaduan/PengaduanDetail.jsx'
import AnakKosList from './pages/AnakKos/AnakKosList.jsx'
import AnakKosForm from './pages/AnakKos/AnakKosForm.jsx'
import AuditLogList from './pages/AuditLog/AuditLogList.jsx'
import AuditLogDetail from './pages/AuditLog/AuditLogDetail.jsx'
import BackupList from './pages/Backup/BackupList.jsx'
import LaporanPage from './pages/Laporan/LaporanPage.jsx'
import UserList from './pages/UserManagement/UserList.jsx'
import UserForm from './pages/UserManagement/UserForm.jsx'
import RoleList from './pages/RoleManagement/RoleList.jsx'
import RoleForm from './pages/RoleManagement/RoleForm.jsx'
import RoleDetail from './pages/RoleManagement/RoleDetail.jsx'
import SettingsPage from './pages/Settings/SettingsPage.jsx'

export default function App() {
  return (
    <>
      <DocumentTitle />
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pengumuman" element={<PengumumanPublik />} />
        <Route path="/pengumuman/:id" element={<DetailPengumumanPublik />} />
        <Route path="/laporan" element={<LaporanPublik />} />
        <Route path="/pengaduan" element={<FormPengaduanPublik />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/visi-misi" element={<VisiMisi />} />
        <Route path="/berita-kegiatan" element={<BeritaKegiatanPublik />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
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
        <Route path="/anak-kos" element={<AnakKosList />} />
        <Route path="/anak-kos/baru" element={<AnakKosForm />} />
        <Route path="/anak-kos/:id/edit" element={<AnakKosForm />} />
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
        <Route path="/kelola-pengumuman" element={<PengumumanList />} />
        <Route path="/kelola-pengumuman/baru" element={<PengumumanForm />} />
        <Route path="/kelola-pengumuman/:id/edit" element={<PengumumanForm />} />
        <Route path="/kelola-pengaduan" element={<PengaduanList />} />
        <Route path="/kelola-pengaduan/:id" element={<PengaduanDetail />} />
        <Route path="/kelola-laporan" element={<LaporanPage />} />
        <Route path="/audit-log" element={<AuditLogList />} />
        <Route path="/audit-log/:id" element={<AuditLogDetail />} />
        <Route path="/backup-database" element={<BackupList />} />
        <Route path="/user-management" element={<UserList />} />
        <Route path="/user-management/baru" element={<UserForm />} />
        <Route path="/user-management/:id/edit" element={<UserForm />} />
        <Route path="/role-management" element={<RoleList />} />
        <Route path="/role-management/baru" element={<RoleForm />} />
        <Route path="/role-management/:id" element={<RoleDetail />} />
        <Route path="/role-management/:id/edit" element={<RoleForm />} />
        <Route path="/pengaturan" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
