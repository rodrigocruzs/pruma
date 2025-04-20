import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, FileText, CreditCard, Calendar } from 'lucide-react';

const LandingPage = () => {
  // Force scroll to top when landing page loads and enable scrolling
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div className="w-full overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Folha PJ</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login"
              className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 transition duration-150"
            >
              Entrar
            </Link>
            <Link 
              to="/signup"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-150"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-b from-gray-50 to-gray-100">
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
                    className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 transition duration-150 flex items-center justify-center"
                  >
                    Comece Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 mt-12 md:mt-0">
                <img 
                  src="https://via.placeholder.com/600x400?text=Folha+PJ" 
                  alt="Folha PJ Dashboard" 
                  className="w-full h-auto rounded-lg shadow-xl"
                />
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Onboarding Simplificado</h3>
                <p className="text-gray-600">
                  Adicione novos prestadores em minutos, com um processo digital e sem burocracia. Envie convites por email e permita que eles completem seus dados.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <FileText className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Notas Fiscais</h3>
                <p className="text-gray-600">
                  Receba, organize e armazene notas fiscais dos seus prestadores. Acompanhe facilmente o status de cada documento fiscal.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <CreditCard className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pagamentos Simplificados</h3>
                <p className="text-gray-600">
                  Gerencie pagamentos individuais ou em lote. Registre PIX e outras formas de pagamento com facilidade e segurança.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <Calendar className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Controle de Contratos</h3>
                <p className="text-gray-600">
                  Armazene contratos digitais, configure prazos e receba alertas de renovação. Mantenha tudo organizado e acessível.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <CheckCircle className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Offboarding Seguro</h3>
                <p className="text-gray-600">
                  Encerre a relação com prestadores de forma organizada, garantindo que todos os documentos e pendências sejam finalizados.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-medium">
                  Novo
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Relatórios e Insights</h3>
                <p className="text-gray-600">
                  Obtenha relatórios detalhados sobre custos, pagamentos e desempenho. Tome decisões baseadas em dados concretos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos clientes dizem</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Empresas de todos os tamanhos confiam na Folha PJ para gerenciar seus prestadores
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Ana Silva</h4>
                    <p className="text-gray-600">CFO, TechBrasil</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "A Folha PJ tornou o gerenciamento dos nossos 50+ prestadores muito mais eficiente. Economizamos pelo menos 15 horas por semana no departamento financeiro."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Carlos Mendes</h4>
                    <p className="text-gray-600">CEO, Startup Inovação</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Como uma startup em crescimento, precisávamos de um sistema que crescesse conosco. A Folha PJ nos ajudou a escalar de 5 para 30 PJs sem precisar contratar mais pessoas para o administrativo."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Patrícia Santos</h4>
                    <p className="text-gray-600">Gerente de RH, Construção Forte</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "A gestão de contratos e o controle de pagamentos nunca foi tão organizada. A plataforma é intuitiva e o suporte ao cliente é excepcional."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Pronto para simplificar a gestão dos seus PJs?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Inicie sua jornada hoje mesmo e experimente como é fácil gerenciar prestadores de serviço com a Folha PJ.
            </p>
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-md hover:bg-blue-50 transition duration-150 inline-flex items-center"
            >
              Criar Minha Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Folha PJ</h3>
                <p className="text-gray-400">
                  A solução completa para gestão de prestadores de serviço PJ.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Produto</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Clientes</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Novidades</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Empresa</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Termos de Uso</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacidade</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Folha PJ. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 