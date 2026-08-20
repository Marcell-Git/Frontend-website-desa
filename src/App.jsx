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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
