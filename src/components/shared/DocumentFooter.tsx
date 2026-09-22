import React from "react";
import { getSystemLogo } from "../../lib/logoService";

interface DocumentFooterProps {
  className?: string;
}

export function DocumentFooter({ className = "" }: DocumentFooterProps) {
  return (
    <div
      className={`mt-auto pt-1.5 border-t-[3px] border-[#800000] flex justify-between items-center text-[8pt] text-slate-900 font-serif ${className}`}
      style={{ borderTopColor: "#800000" }}
    >
      <div className="leading-tight text-left">
        <div>
          Bairro Catondo, Campus Principal de Catondo. Caixa Postal nº 146
        </div>
        <div>
          Tel: +258 252-82336, Fax: +258 252-82338, email:{" "}
          <a
            href="mailto:secretariado@ispsongo.ac.mz"
            className="text-blue-600 underline font-normal hover:text-blue-800"
          >
            secretariado@ispsongo.ac.mz
          </a>
          . Página oficial:{" "}
          <a
            href="https://www.ispsongo.ac.mz"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline font-normal hover:text-blue-800"
          >
            www.ispsongo.ac.mz
          </a>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        <div className="flex items-center justify-center bg-transparent">
          <img
            src={getSystemLogo() || "/sigep-logo.svg"}
            alt="Logotipo"
            className="h-7 w-auto object-contain filter drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}

export default DocumentFooter;
