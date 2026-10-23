import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  badge,
  to,
  gradient = 'from-indigo-500 to-indigo-600',
  btnText = 'Get Started',
}) => {
  return (
    <div className="relative group bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* Decorative gradient blur backdrop on hover */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50/60 rounded-full blur-2xl group-hover:bg-indigo-100/70 transition-colors pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-5">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/80">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <Link
        to={to}
        className="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 hover:shadow-md"
      >
        <span>{btnText}</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default FeatureCard;
