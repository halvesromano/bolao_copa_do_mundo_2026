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
  golCasa?: number | null;
  golFora?: number | null;
  onPalpiteSubmit?: (matchId: number, golCasa: number, golFora: number) => void;
}

export function MatchCard({
  id,
  timeCasa,
  timeFora,
  dataHora,
  fase,
  golCasa: initialGolCasa = null,
  golFora: initialGolFora = null,
  onPalpiteSubmit,
}: MatchCardProps) {
  const [golCasa, setGolCasa] = React.useState<number | "">(initialGolCasa ?? "");
  const [golFora, setGolFora] = React.useState<number | "">(initialGolFora ?? "");
  const isLocked = new Date(dataHora).getTime() - new Date().getTime() <= 60 * 60 * 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (golCasa !== "" && golFora !== "" && onPalpiteSubmit) {
      onPalpiteSubmit(id, Number(golCasa), Number(golFora));
    }
  };

  return (
    <Card className="overflow-hidden bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl rounded-2xl">
      <CardHeader className="p-4 pb-2 border-b border-white/5 bg-black/40 text-center">
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
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="20"
              value={golCasa}
              onChange={(e) => setGolCasa(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isLocked}
              className="w-14 h-14 text-center text-xl font-bold bg-black/40 border-white/10 focus:border-wc-cyan focus:ring-wc-cyan rounded-xl"
            />
            <span className="text-slate-500 font-bold text-xl">X</span>
            <Input
              type="number"
              min="0"
              max="20"
              value={golFora}
              onChange={(e) => setGolFora(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isLocked}
              className="w-14 h-14 text-center text-xl font-bold bg-black/40 border-white/10 focus:border-wc-cyan focus:ring-wc-cyan rounded-xl"
            />
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
