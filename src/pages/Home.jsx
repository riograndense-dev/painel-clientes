import {Link} from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold text-gray-800">Bem-vindo ao painel dos clientes</h1>
      <p className="text-xl text-gray-600">Acompanhe informações sobre seus pedidos e faturas de forma prática e eficiente.</p>
      <Link to="/login" className="mt-4 text-blue-500 hover:underline">Fazer login</Link>
    </div>
  );
}