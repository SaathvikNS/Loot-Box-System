import React from 'react';
import { GameEvent } from '../types/game';
import { Activity, Clock, ShieldCheck, Terminal } from 'lucide-react';

interface TransactionLogsProps {
  events: GameEvent[];
}

export const TransactionLogs: React.FC<TransactionLogsProps> = ({ events }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-sui-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-['Cinzel',serif]">
              Live Sui Move Event Stream
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {events.length} Events Captured
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Real-time on-chain events emitted using <code className="text-cyan-300 font-mono">sui::event::emit</code> during loot box interactions.
        </p>

        {events.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No events logged in this session yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 font-mono text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {evt.type}
                  </span>
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{evt.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>

                <pre className="text-slate-300 overflow-x-auto text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {JSON.stringify(evt.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
