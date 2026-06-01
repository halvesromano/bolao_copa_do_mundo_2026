import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Team {
  id: number;
  nome: string;
  sigla: string;
  bandeira_svg?: string;
}

interface MatchCardProps {
  id: number;
  timeCasa: Team;
  timeFora: Team;
  dataHora: string;
  fase: string;
  grupoLabel?: string;
  golCasa?: number | null;
  golFora?: number | null;
  encerrado?: boolean;
  realGolCasa?: number | null;
  realGolFora?: number | null;
  pontos?: number | null;
  onPalpiteSubmit?: (matchId: number, golCasa: number, golFora: number) => void;
  onGolChange?: (matchId: number, golCasa: number | "", golFora: number | "") => void;
}

export function MatchCard({
  id,
  timeCasa,
  timeFora,
  dataHora,
  fase,
  grupoLabel,
  golCasa: initialGolCasa = null,
  golFora: initialGolFora = null,
  encerrado = false,
  realGolCasa = null,
  realGolFora = null,
  pontos = null,
  onPalpiteSubmit,
  onGolChange,
}: MatchCardProps) {
  const [golCasa, setGolCasa] = React.useState<number | "">(initialGolCasa ?? "");
  const [golFora, setGolFora] = React.useState<number | "">(initialGolFora ?? "");
  const isLocked = new Date(dataHora).getTime() - new Date().getTime() <= 60 * 60 * 1000;

  const handleGolCasaChange = (value: number | "") => {
    if (value !== "" && value < 0) {
      alert("Não é permitido placar negativo.");
      return;
    }
    setGolCasa(value);
    onGolChange?.(id, value, golFora);
  };

  const handleGolForaChange = (value: number | "") => {
    if (value !== "" && value < 0) {
      alert("Não é permitido placar negativo.");
      return;
    }
    setGolFora(value);
    onGolChange?.(id, golCasa, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (golCasa !== "" && golFora !== "" && onPalpiteSubmit) {
      onPalpiteSubmit(id, Number(golCasa), Number(golFora));
    }
  };

  return (
    <Card className="overflow-hidden bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl rounded-2xl">
      <CardHeader className="p-4 pb-2 border-b border-white/5 bg-black/40 text-center relative">
        {pontos !== null && pontos !== undefined && (
          <span className="absolute top-2 left-3 text-[10px] font-bold text-white bg-wc-cyan/20 border border-wc-cyan/30 px-2 py-0.5 rounded-full">
            {pontos} pts
          </span>
        )}
        {grupoLabel && (
          <span className="absolute top-2 right-3 text-[10px] font-bold text-black bg-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {grupoLabel}
          </span>
        )}
        <span className="text-xs font-semibold text-wc-cyan uppercase tracking-wider">{fase}</span>
        <span className="text-xs text-slate-400 block mt-1">
          {format(new Date(dataHora), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </span>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex items-center justify-between gap-4">
          {/* Time Casa */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div 
              className="w-16 h-12 rounded shadow-sm bg-slate-800 flex items-center justify-center text-2xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: timeCasa.bandeira_svg || "🇧🇷" }}
            />
            <span className="font-bold text-slate-200 text-sm">{timeCasa.sigla}</span>
          </div>

          {/* Placar e Inputs */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="20"
                value={golCasa}
                onChange={(e) => handleGolCasaChange(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isLocked || encerrado}
                className="w-14 h-14 text-center text-xl font-bold bg-black/40 border-white/10 focus:border-wc-cyan focus:ring-wc-cyan rounded-xl"
              />
              <span className="text-slate-500 font-bold text-xl">X</span>
              <Input
                type="number"
                min="0"
                max="20"
                value={golFora}
                onChange={(e) => handleGolForaChange(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={isLocked || encerrado}
                className="w-14 h-14 text-center text-xl font-bold bg-black/40 border-white/10 focus:border-wc-cyan focus:ring-wc-cyan rounded-xl"
              />
            </div>
            {encerrado && realGolCasa !== null && realGolFora !== null && (
              <span className="text-[10px] text-wc-cyan font-semibold uppercase tracking-widest mt-1">
                Final: {realGolCasa} x {realGolFora}
              </span>
            )}
          </div>

          {/* Time Fora */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div 
              className="w-16 h-12 rounded shadow-sm bg-slate-800 flex items-center justify-center text-2xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: timeFora.bandeira_svg || "🇦🇷" }}
            />
            <span className="font-bold text-slate-200 text-sm">{timeFora.sigla}</span>
          </div>
        </form>
      </CardContent>

      <CardFooter className="p-4 pt-2 bg-black/40 flex justify-center">
        {isLocked ? (
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1">
            🔒 Palpites Encerrados
          </div>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={golCasa === "" || golFora === ""}
            className="w-full bg-wc-red hover:bg-wc-darkred text-white font-bold rounded-xl transition-all"
          >
            Salvar Palpite
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
