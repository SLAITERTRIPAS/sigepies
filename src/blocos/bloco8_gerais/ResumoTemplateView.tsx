import React, { useState } from "react";
import { 
  Printer, ArrowLeft, Image as ImageIcon, Mail, Globe, MapPin, Phone, Upload, X
} from "lucide-react";
import { motion } from "motion/react";
import { printElementById } from "../../lib/printUtils";
import { getSystemLogo } from "../../lib/logoService";

const ResumoTemplateView = ({ onBack }: { onBack: () => void }) => {
  const [logoIsps, setLogoIsps] = useState<string | null>(null);
  const [logoSigep, setLogoSigep] = useState<string | null>(getSystemLogo() || "/sigep-logo.svg");
  const [partnerLogos, setPartnerLogos] = useState<(string | null)>([null, null, null]);

  const handlePrint = () => {
    printElementById("poster-template-print-area", "SIGEP - Poster Jornadas Cientificas", "portrait", "A4");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartnerUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...partnerLogos];
        updated[index] = reader.result as string;
        setPartnerLogos(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between print:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Sistema
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-[#050b38] text-white rounded-xl font-black hover:bg-[#0d1b54] transition-all shadow-xl shadow-blue-900/20 text-xs uppercase tracking-widest cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Exportar Póster (A4/PDF)
          </button>
        </div>

        {/* Poster Container */}
        <div 
          id="poster-template-print-area" 
          className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] mx-auto border border-slate-200 print:border-0 print:shadow-none overflow-hidden relative"
          style={{ width: "100%", maxWidth: "900px", minHeight: "1200px" }}
        >
          {/* Top Institutional Color Accents */}
          <div className="flex w-full h-3">
            <div className="flex-1 bg-[#050b38]" />
            <div className="flex-1 bg-[#FFB800]" />
            <div className="flex-1 bg-[#0d1b54]" />
            <div className="flex-1 bg-red-600" />
          </div>

          <div className="p-12 space-y-10">
            {/* Header Logos & Event */}
            <header className="flex items-center justify-between gap-8 pb-6 border-b-2 border-slate-100">
              {/* ISPS Logo Upload / Display */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <label className="cursor-pointer block">
                    <div className="w-[72px] h-[72px] bg-[#050b38] rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden border-2 border-dashed border-[#FFB800] shadow-md">
                      {logoIsps ? (
                        <img src={logoIsps} alt="ISPS" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-xl text-[#FFB800]">ISPS</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoIsps)} />
                  </label>
                  {logoIsps && (
                    <button onClick={() => setLogoIsps(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 print:hidden">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="h-12 w-px bg-slate-200" />
                
                <div className="flex flex-col">
                  <span className="text-[28px] font-black tracking-tighter text-[#050b38] flex items-baseline gap-2">
                    7<span className="text-xl uppercase italic text-[#FFB800]">as</span> 
                    <span className="bg-[#050b38] text-white px-2 py-0.5 rounded ml-1">Jornadas</span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Científicas Estudantis</span>
                </div>
              </div>

              {/* SIGEP Logo Upload / Display */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <label className="cursor-pointer block">
                    <div className="w-[72px] h-[72px] bg-[#0d1b54] rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden border-2 border-dashed border-[#FFB800] shadow-md">
                      {logoSigep ? (
                        <img src={logoSigep} alt="SIGEP" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-sm text-[#FFB800]">SIGEP</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoSigep)} />
                  </label>
                  {logoSigep && (
                    <button onClick={() => setLogoSigep(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 print:hidden">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* Eixo Temático */}
            <div className="text-center">
              <span className="text-sm font-black text-[#050b38] uppercase tracking-widest border-x-4 border-[#FFB800] px-6 py-1 bg-slate-50 rounded">
                Eixo temático: Governação Digital e Sistemas de Informação
              </span>
            </div>

            {/* Title Section */}
            <div className="text-center space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl font-black text-[#050b38] leading-[1.1] uppercase tracking-tighter">
                O IMPACTO DO SIGEP NA MODERNIZAÇÃO DA GESTÃO ACADÉMICA E ORÇAMENTAL EM MOÇAMBIQUE
              </h1>
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-800">Franzissi Tripalonga Vicente (FTV / Slaiter Tripas)¹</p>
                <div className="flex flex-col text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>¹Autor & Proprietário do SIGEP - Franzissi Tripalonga Vicente (FTV), e-mail: slaitertripas@gmail.com</span>
                  <span>²Um Sistema para Gestão de Instituições de Ensino Superior</span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Column Left (6/12) */}
              <div className="col-span-6 space-y-10 text-justify">
                {/* INTRODUÇÃO */}
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-2">INTRODUÇÃO</h2>
                  <p className="text-[12px] leading-relaxed text-slate-700">
                    O SIGEP (Sistema Integrado de Gestão de Processos) surge como resposta à necessidade de digitalização da administração pública moçambicana. O projeto foca na integração de fluxos orçamentais SISTAFE com a gestão de recursos humanos e patrimoniais, reduzindo drasticamente a latência de processos e garantindo integridade referencial absoluta.
                  </p>
                </section>

                {/* MATERIAIS E MÉTODOS */}
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-2">MATERIAIS E MÉTODOS</h2>
                  <p className="text-[12px] leading-relaxed text-slate-700">
                    A metodologia baseia-se numa arquitetura orientada a grafos acíclicos dirigidos (DAG), implementada com React 18 e Firestore. Foram analisados fluxos de 16 instituições piloto para modelar heurísticas de alocação orçamentária do PESOE, garantindo que cada transação cumpra os requisitos legais de cabimento e liquidação.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-2">
                    <div className="w-full h-40 bg-white border border-slate-200 rounded flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <ImageIcon size={64} />
                      </div>
                      <div className="grid grid-cols-4 gap-2 w-full px-4 items-end">
                        <div className="bg-[#050b38] h-16 w-full rounded-t-sm" />
                        <div className="bg-[#FFB800] h-24 w-full rounded-t-sm" />
                        <div className="bg-[#0d1b54] h-20 w-full rounded-t-sm" />
                        <div className="bg-blue-600 h-28 w-full rounded-t-sm" />
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 italic">Figura 1 - Distribuição de cargas processuais por setor</span>
                  </div>
                </section>
              </div>

              {/* Column Right (6/12) */}
              <div className="col-span-6 space-y-10 text-justify">
                {/* RESULTADOS E DISCUSSÃO */}
                <section className="space-y-4">
                  <h2 className="text-xl font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-2">RESULTADOS E DISCUSSÃO</h2>
                  <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                    <table className="w-full text-[10px]">
                      <thead className="bg-[#050b38] text-white font-bold uppercase">
                        <tr>
                          <th className="px-2 py-2 text-left border-r border-[#0d1b54]">Indicador</th>
                          <th className="px-2 py-2 text-center border-r border-[#0d1b54]">Antes</th>
                          <th className="px-2 py-2 text-center text-[#FFB800]">SIGEP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr>
                          <td className="px-2 py-2 font-bold border-r border-slate-100">Celeridade (dias)</td>
                          <td className="px-2 py-2 text-center text-red-600 font-semibold">14.2</td>
                          <td className="px-2 py-2 text-center text-emerald-600 font-black">0.05</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 font-bold border-r border-slate-100">Erros Contábeis</td>
                          <td className="px-2 py-2 text-center text-red-600 font-semibold">12%</td>
                          <td className="px-2 py-2 text-center text-emerald-600 font-black">0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[12px] leading-relaxed text-slate-700">
                    Os dados demonstram uma redução de 94% no tempo de tramitação. A eliminação total de erros de cabimento orçamental comprova a eficácia das regras de validação em tempo real, blindando as IES contra apontamentos de auditoria.
                  </p>
                </section>

                {/* CONCLUSÃO */}
                <section className="space-y-3">
                  <h2 className="text-xl font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-2">CONCLUSÃO</h2>
                  <p className="text-[12px] leading-relaxed text-slate-700">
                    O SIGEP não é apenas uma ferramenta tecnológica, mas um catalisador de integridade institucional. A transição para o modelo sem papel assegura a sustentabilidade e a transparência radical, fundamentais para a governação moderna das instituições públicas moçambicanas.
                  </p>
                </section>

                {/* REFERÊNCIAS */}
                <section className="space-y-2">
                  <h2 className="text-xl font-black text-[#050b38] border-b-4 border-[#FFB800] inline-block pr-6 mb-2">REFERÊNCIAS</h2>
                  <div className="text-[9px] font-mono text-slate-600 space-y-1 leading-tight">
                    <p>[1] SISTAFE - Lei n.º 9/2002 de 12 de Fevereiro.</p>
                    <p>[2] Regulamento do Ensino Superior Moçambicano, 2024.</p>
                    <p>[3] Engenharia de Sistemas Reativos, SIGEP-DOC-2026.</p>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Area */}
            <footer className="pt-8 border-t-2 border-slate-100">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[11px] font-black text-[#050b38] uppercase tracking-widest mb-2">Agradecimentos</h3>
                  <p className="text-[10px] text-slate-600 italic leading-relaxed">
                    Agradecemos à Direção do ISPS e ao Ministério da Ciência e Tecnologia pelo apoio institucional e técnico durante o desenvolvimento deste sistema.
                  </p>
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-[#050b38] uppercase tracking-widest mb-2">Contactos</h3>
                  <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-700 font-bold">
                    <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#050b38]" /> slaitertripas@gmail.com</span>
                    <span className="flex items-center gap-1.5"><Globe size={12} className="text-[#050b38]" /> www.sigep.ac.mz</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#050b38]" /> Songo, Tete, MZ</span>
                    <span className="flex items-center gap-1.5"><Phone size={12} className="text-[#050b38]" /> +258 84 000 0000</span>
                  </div>
                </div>
              </div>

              {/* Partner Logos Upload */}
              <div className="mt-10 flex justify-center items-center gap-16">
                {partnerLogos.map((logo, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 relative group">
                    <label className="cursor-pointer block">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 shadow-sm">
                        {logo ? (
                          <img src={logo} alt={`Parceiro ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePartnerUpload(e, index)} />
                    </label>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Parceiro {index + 1}</span>
                    {logo && (
                      <button onClick={() => {
                        const updated = [...partnerLogos];
                        updated[index] = null;
                        setPartnerLogos(updated);
                      }} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 print:hidden">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoTemplateView;
