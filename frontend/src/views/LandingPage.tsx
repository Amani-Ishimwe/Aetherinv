import React, { useState } from 'react';
import {
  Package,
  Zap,
  BarChart3,
  Lock,
  Users,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Package,
      title: 'Unified Inventory Tracking',
      description: 'Manage products, variants, barcodes, and QR codes from a single dashboard with real-time stock visibility.',
    },
    {
      icon: Zap,
      title: 'Automated Operations',
      description: 'Automate stock tracking, warehouse transfers, purchase orders, and inventory audits with minimal manual effort.',
    },
    {
      icon: BarChart3,
      title: 'Powerful Analytics',
      description: 'Generate comprehensive reports on inventory value, sales performance, and business profitability.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Secure role-based permissions ensure team members only access functions relevant to their responsibilities.',
    },
    {
      icon: AlertCircle,
      title: 'Smart Notifications',
      description: 'Get automated alerts for low stock, new orders, deliveries, and discrepancies via email, SMS, and in-app.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance controls protect your sensitive inventory and financial data.',
    },
  ];

  const benefits = [
    {
      title: 'Reduce Stock Shortages',
      description: 'Real-time visibility eliminates surprises and keeps your operations running smoothly.',
    },
    {
      title: 'Cut Operational Costs',
      description: 'Automate repetitive tasks and optimize warehouse workflows without expanding your team.',
    },
    {
      title: 'Increase Accuracy',
      description: 'Minimize human error with automated tracking, audits, and discrepancy detection.',
    },
    {
      title: 'Improve Decision Making',
      description: 'Use data-driven insights to make smarter business decisions across purchasing, sales, and inventory.',
    },
    {
      title: 'Streamline Supplier Management',
      description: 'Manage purchase orders, deliveries, and payments from a centralized hub.',
    },
    {
      title: '24/7 Multi-Warehouse Control',
      description: 'Track inventory across multiple locations, branches, and warehouses in real-time.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Operations Manager at TechSupply Co.',
      text: 'Aetherinv cut our inventory discrepancies by 85% in the first month. The automated notifications alone saved us thousands.',
      initials: 'SM',
    },
    {
      name: 'James Chen',
      role: 'Founder at Fashion Plus Retail',
      text: 'We went from spreadsheets to a professional inventory system. Best decision we made for scaling our business.',
      initials: 'JC',
    },
    {
      name: 'Maria Gonzalez',
      role: 'Supply Chain Director at Global Logistics',
      text: 'The multi-warehouse capability and real-time tracking have transformed how we operate across our 15 locations.',
      initials: 'MG',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$299',
      period: '/month',
      description: 'Perfect for small businesses managing single or dual warehouses',
      features: [
        'Up to 5,000 products',
        '1 warehouse location',
        'Basic inventory tracking',
        'Standard reports',
        'Email support',
        '3 team members',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$799',
      period: '/month',
      description: 'Ideal for growing businesses with multiple locations',
      features: [
        'Unlimited products',
        'Up to 5 warehouse locations',
        'Advanced automation',
        'Custom reports & analytics',
        'Email & chat support',
        'Unlimited team members',
        'Role-based permissions',
        'API access',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations with complex requirements',
      features: [
        'Unlimited everything',
        'Unlimited warehouse locations',
        'White-label options',
        'Advanced integrations',
        '24/7 dedicated support',
        'Custom workflows',
        'Advanced security features',
        'SLA guarantee',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-orange-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-blue-900">Aetherinv</span>
            </div>

            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-900 transition">
                Features
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-900 transition">
                Benefits
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-900 transition">
                Pricing
              </a>
            </div>

            
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={onLogin}
                className="px-6 py-2 text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition"
              >
                Sign In
              </button>
              <button 
                onClick={onRegister}
                className="px-6 py-2 bg-gradient-to-r from-blue-900 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transition"
              >
                Start Free Trial
              </button>
            </div>

            
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100">
              <a href="#features" className="block py-2 text-gray-700 hover:text-blue-900">
                Features
              </a>
              <a href="#benefits" className="block py-2 text-gray-700 hover:text-blue-900">
                Benefits
              </a>
              <a href="#pricing" className="block py-2 text-gray-700 hover:text-blue-900">
                Pricing
              </a>
              <button 
                onClick={onRegister}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-900 to-orange-500 text-white font-medium rounded-lg"
              >
                Start Free Trial
              </button>
            </div>
          )}
        </div>
      </nav>

      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                ✨ The Complete Inventory Solution
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-blue-900 mb-6 leading-tight">
                Master Your Inventory with Precision
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Centralize your supply chain, automate operations, and unlock real-time visibility across all warehouses, suppliers, and sales channels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onRegister}
                  className="px-8 py-4 bg-gradient-to-r from-blue-900 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl transition flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                <button className="px-8 py-4 border-2 border-blue-900 text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition">
                  Watch Demo
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-blue-900 to-orange-500 rounded-3xl p-1 h-full">
                  <div className="bg-white rounded-3xl h-full flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-16 h-16 text-blue-900 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Everything You Need to Control Your Inventory
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features built for modern inventory management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Seamless Integration in 3 Steps
            </h2>
            <p className="text-xl text-blue-100">
              Get up and running in minutes, not months
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Your Data',
                description: 'Import your products, inventory, and supplier information. We handle the heavy lifting.',
              },
              {
                step: '02',
                title: 'Set Permissions',
                description: 'Define roles for your team members. Everyone gets access to what they need.',
              },
              {
                step: '03',
                title: 'Start Automating',
                description: 'Enable automated notifications, reports, and workflows. Watch efficiency soar.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-blue-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Real Results for Real Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See the measurable impact Aetherinv delivers
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Trusted by Growing Businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers achieve with Aetherinv
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden transition ${
                  plan.highlighted
                    ? 'ring-2 ring-orange-500 shadow-xl transform md:scale-105'
                    : 'border border-gray-200'
                } ${plan.highlighted ? 'bg-blue-900' : 'bg-white'}`}
              >
                {plan.highlighted && (
                  <div className="bg-orange-500 text-white text-center py-2 font-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className={`p-8 ${plan.highlighted ? 'text-white' : ''}`}>
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-orange-300' : 'text-blue-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}>
                    {plan.description}
                  </p>
                  <div className="mt-6 mb-8">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-blue-900'}`}>
                      {plan.price}
                    </span>
                    <span className={plan.highlighted ? 'text-blue-200' : 'text-gray-600'}>
                      {' '}{plan.period}
                    </span>
                  </div>
                  <button
                    onClick={onRegister}
                    className={`w-full py-3 font-bold rounded-lg transition mb-8 ${
                      plan.highlighted
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-blue-900 text-white hover:bg-blue-800'
                    }`}
                  >
                    Get Started
                  </button>
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-orange-300' : 'text-orange-500'}`} />
                        <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-orange-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of businesses that have already streamlined their operations with Aetherinv.
          </p>
          <button 
            onClick={onRegister}
            className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:shadow-xl transition flex items-center justify-center gap-2 group mx-auto"
          >
            Start Your Free Trial Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
          <p className="text-sm text-blue-200 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      
      <footer className="bg-blue-900 text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">Aetherinv</span>
            </div>
            <p className="text-blue-200 text-sm">The complete inventory management solution for modern businesses.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-800 pt-8">
          <p className="text-center text-sm text-blue-200">
            © 2024 Aetherinv. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };
export default LandingPage;
