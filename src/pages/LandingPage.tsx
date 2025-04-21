import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, FileText, CreditCard, Calendar } from 'lucide-react';
import prumaIcon from '../assets/images/pruma-icon.svg';
import prumaLogo from '../assets/images/pruma-logo.svg';
import dashboardScreenshot from '../assets/images/dashboard-screenshot.jpg';

const LandingPage = () => {
  return (
    <div className="absolute inset-0 overflow-auto" style={{ height: 'auto', minHeight: '100%' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src={prumaIcon} alt="Pruma Icon" className="h-6 w-6 text-[#C49A22] mr-2" />
            <span className="text-2xl font-bold text-[#C49A22]">Pruma</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login"
              className="px-4 py-2 text-[#C49A22] font-medium hover:text-[#A37F1C] transition duration-150"
            >
              Entrar
            </Link>
            <Link 
              to="/signup"
              className="px-4 py-2 bg-[#C49A22] text-white font-medium rounded-md hover:bg-[#A37F1C] transition duration-150"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-gradient-to-b from-[#FCF8EE] to-white">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  Simplifique a gestão dos seus Prestadores PJ
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Onboarding, pagamentos e notas fiscais em um único lugar. Economize tempo e evite dores de cabeça com a plataforma mais completa do mercado.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link 
                    to="/signup"
                    className="px-8 py-4 bg-[#C49A22] text-white text-lg font-medium rounded-md hover:bg-[#A37F1C] transition duration-150 flex items-center justify-center"
                  >
                    Comece Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 mt-12 md:mt-0">
                <div 
                  className="w-full h-auto overflow-hidden bg-white border-2 border-[#C49A22] rounded-lg shadow-xl transform md:scale-110"
                >
                  <img src={dashboardScreenshot} alt="Pruma Dashboard" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo o que você precisa para gerenciar seus PJs</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Nossa plataforma foi desenvolvida pensando nas necessidades de empresas que trabalham com prestadores de serviço PJ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-[#FCF8EE] p-8 rounded-lg shadow-sm border border-[#FCF8EE]">
                <Users className="h-12 w-12 text-[#C49A22] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Onboarding Simplificado</h3>
                <p className="text-gray-600">
                  Adicione novos prestadores em minutos, com um processo digital e sem burocracia. Envie convites por email e permita que eles completem seus dados.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#FCF8EE] p-8 rounded-lg shadow-sm border border-[#FCF8EE]">
                <FileText className="h-12 w-12 text-[#C49A22] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Notas Fiscais</h3>
                <p className="text-gray-600">
                  Receba, organize e armazene notas fiscais dos seus prestadores. Acompanhe facilmente o status de cada documento fiscal.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#FCF8EE] p-8 rounded-lg shadow-sm border border-[#FCF8EE]">
                <CreditCard className="h-12 w-12 text-[#C49A22] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pagamentos Simplificados</h3>
                <p className="text-gray-600">
                  Gerencie pagamentos individuais ou em lote. Gere arquivos CSV prontos para upload no seu Internet Banking, economizando tempo e minimizando erros.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#FCF8EE] p-8 rounded-lg shadow-sm border border-[#FCF8EE]">
                <Calendar className="h-12 w-12 text-[#C49A22] mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Controle de Contratos</h3>
                <p className="text-gray-600">
                  Armazene contratos digitais, configure prazos e receba alertas de renovação. Mantenha tudo organizado e acessível.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-16 bg-[#C49A22]">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Pronto para simplificar a gestão dos seus PJs?</h2>
            <p className="text-xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
              Inicie sua jornada hoje mesmo e experimente como é fácil gerenciar prestadores de serviço com a Pruma.
            </p>
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-[#C49A22] text-lg font-medium rounded-md hover:bg-[#FCF8EE] transition duration-150 inline-flex items-center"
            >
              Criar Minha Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#FCF8EE] text-gray-800 py-12">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img src={prumaIcon} alt="Pruma" className="h-6 w-6 text-[#C49A22] mr-2" />
                <h3 className="text-lg font-bold text-[#C49A22]">Pruma</h3>
              </div>
              <p className="text-gray-600">
                A solução completa para gestão de prestadores de serviço PJ.
              </p>
            </div>
            <div className="mt-12 pt-8 text-center text-gray-600 border-t border-gray-200">
              <p>&copy; {new Date().getFullYear()} Pruma. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage; 