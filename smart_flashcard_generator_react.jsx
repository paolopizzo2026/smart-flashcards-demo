import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function SmartFlashcardGenerator() {
  const [tema, setTema] = useState("");
  const [materiale, setMateriale] = useState("");
  const [materia, setMateria] = useState("Generale");
  const [carte, setCarte] = useState([]);
  const [indice, setIndice] = useState(0);
  const [mostraRetro, setMostraRetro] = useState(false);
  const [conosciute, setConosciute] = useState([]);
  const [inCorso, setInCorso] = useState([]);
  const [inizio, setInizio] = useState(null);
  const [tempo, setTempo] = useState(0);

  // Carica i set salvati da localStorage
  useEffect(() => {
    const datiSalvati = localStorage.getItem("flashcardData");
    if (datiSalvati) {
      const { carte, conosciute, inCorso } = JSON.parse(datiSalvati);
      setCarte(carte || []);
      setConosciute(conosciute || []);
      setInCorso(inCorso || []);
    }
  }, []);

  // Salva automaticamente su localStorage quando cambiano le carte o il progresso
  useEffect(() => {
    if (carte.length) {
      localStorage.setItem(
        "flashcardData",
        JSON.stringify({ carte, conosciute, inCorso })
      );
    }
  }, [carte, conosciute, inCorso]);

  useEffect(() => {
    if (inizio) {
      const timer = setInterval(() => setTempo(Date.now() - inizio), 1000);
      return () => clearInterval(timer);
    }
  }, [inizio]);

  const generaCarte = () => {
    const nuovoSet = [
      { fronte: "Madrid", retro: "Capitale della Spagna" },
      { fronte: "Fotosintesi", retro: "Processo mediante cui le piante producono energia" },
      { fronte: "1789", retro: "Anno della Rivoluzione Francese" }
    ];
    setCarte(nuovoSet);
    setIndice(0);
    setMostraRetro(false);
    setConosciute([]);
    setInCorso([]);
    setInizio(Date.now());
    localStorage.setItem(
      "flashcardData",
      JSON.stringify({ carte: nuovoSet, conosciute: [], inCorso: [] })
    );
  };

  const cartaCorrente = carte[indice];
  const totaleCarte = carte.length;
  const percentuale = totaleCarte ? Math.round((conosciute.length / totaleCarte) * 100) : 0;

  const prossima = () => setIndice((i) => (i + 1) % totaleCarte);
  const precedente = () => setIndice((i) => (i - 1 + totaleCarte) % totaleCarte);
  const mescola = () => setCarte([...carte].sort(() => Math.random() - 0.5));

  const segnaConosciuta = () => {
    if (!conosciute.includes(indice)) setConosciute([...conosciute, indice]);
    prossima();
  };

  const segnaInCorso = () => {
    if (!inCorso.includes(indice)) setInCorso([...inCorso, indice]);
    prossima();
  };

  const resetProgress = () => {
    setConosciute([]);
    setInCorso([]);
    localStorage.setItem(
      "flashcardData",
      JSON.stringify({ carte, conosciute: [], inCorso: [] })
    );
  };

  const tempoStudio = new Date(tempo).toISOString().substr(11, 8);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Smart Flashcard Generator</h1>

      {!carte.length ? (
        <Card className="w-full max-w-2xl p-6">
          <CardContent className="space-y-4">
            <textarea
              className="w-full border rounded p-3"
              rows="3"
              placeholder="Inserisci l'argomento da studiare (es. verbi spagnoli, termini di biologia, date storiche)"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
            <textarea
              className="w-full border rounded p-3"
              rows="5"
              placeholder="Incolla qui il tuo materiale di studio"
              value={materiale}
              onChange={(e) => setMateriale(e.target.value)}
            />
            <select
              className="border rounded p-2 w-full"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
            >
              <option>Matematica</option>
              <option>Scienze</option>
              <option>Storia</option>
              <option>Lingua</option>
              <option>Letteratura</option>
              <option>Generale</option>
            </select>
            <Button className="w-full bg-blue-600 text-white" onClick={generaCarte}>
              Genera Flashcard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-md text-center">
          <Card className="h-64 flex items-center justify-center mb-4 cursor-pointer" onClick={() => setMostraRetro(!mostraRetro)}>
            <CardContent className="text-xl">
              {mostraRetro ? cartaCorrente?.retro : cartaCorrente?.fronte}
            </CardContent>
          </Card>
          <div className="flex justify-between mb-4">
            <Button variant="outline" onClick={precedente}>Precedente</Button>
            <Button variant="outline" onClick={mescola}>Mescola</Button>
            <Button variant="outline" onClick={prossima}>Successiva</Button>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Carta {indice + 1} di {totaleCarte}
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <Button className="bg-green-500 text-white" onClick={segnaConosciuta}>La so</Button>
            <Button className="bg-orange-500 text-white" onClick={segnaInCorso}>Da ripassare</Button>
          </div>
          <Progress value={percentuale} className="h-3 mb-2" />
          <div className="text-sm">Progresso: {percentuale}%</div>
          <div className="text-sm mt-2">Tempo di studio: {tempoStudio}</div>
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="secondary" onClick={() => setCarte(inCorso.map(i => carte[i]))}>Ripassa carte difficili</Button>
            <Button variant="destructive" onClick={() => setCarte([])}>Crea nuovo set</Button>
            <Button variant="outline" onClick={resetProgress}>Resetta progresso</Button>
          </div>
        </div>
      )}
    </div>
  );
}
