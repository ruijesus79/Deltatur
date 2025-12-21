import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
  hideText?: boolean;
}

// URL Oficial do Logotipo Deltatur (Verde)
const OFFICIAL_LOGO_URL = "https://deltatur.pt/wp-content/uploads/2025/05/Logo-DT-scaled-1.png";

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "", 
  variant = 'full',
}) => {
  const isWhite = variant === 'white';
  const isIcon = variant === 'icon';

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <img 
        src={OFFICIAL_LOGO_URL} 
        alt="Deltatur" 
        // Se a imagem falhar, não mostramos nada (conforme pedido "esses e mais nenhuns")
        // O filtro 'brightness-0 invert' transforma o logo verde no logo branco exato.
        className={`
            object-contain transition-all duration-700
            ${isWhite ? 'brightness-0 invert opacity-100 drop-shadow-2xl' : ''} 
            ${isIcon ? 'h-10 w-auto' : 'h-52 md:h-80 w-auto'} 
        `}
      />
    </div>
  );
};