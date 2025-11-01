/**
 * AudioMeters Component
 * Premiere Pro-style audio level meters
 */
export const AudioMeters = () => {
  return (
    <div className="h-full w-16 bg-studio-panel border-l border-border flex flex-col">
      {/* Header */}
      <div className="h-8 px-2 flex items-center justify-center border-b border-border/30 shrink-0">
        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Audio</span>
      </div>
      
      {/* Meter Channels */}
      <div className="flex-1 flex items-stretch gap-2 p-2">
        {/* Left Channel */}
        <div className="flex-1 flex flex-col">
          <span className="text-[8px] text-muted-foreground mb-1 text-center">L</span>
          <div className="flex-1 bg-studio-timeline rounded-sm flex flex-col-reverse p-0.5 gap-[1px]">
            {[...Array(40)].map((_, i) => (
              <div 
                key={i} 
                className={`h-full w-full ${
                  i < 18 ? 'bg-emerald-500/80' : 
                  i < 35 ? 'bg-amber-500/40' : 
                  'bg-red-500/40'
                }`}
              />
            ))}
          </div>
          <span className="text-[7px] text-muted-foreground/60 mt-1 text-center">-60</span>
        </div>
        
        {/* Right Channel */}
        <div className="flex-1 flex flex-col">
          <span className="text-[8px] text-muted-foreground mb-1 text-center">R</span>
          <div className="flex-1 bg-studio-timeline rounded-sm flex flex-col-reverse p-0.5 gap-[1px]">
            {[...Array(40)].map((_, i) => (
              <div 
                key={i} 
                className={`h-full w-full ${
                  i < 20 ? 'bg-emerald-500/80' : 
                  i < 35 ? 'bg-amber-500/40' : 
                  'bg-red-500/40'
                }`}
              />
            ))}
          </div>
          <span className="text-[7px] text-muted-foreground/60 mt-1 text-center">-60</span>
        </div>
      </div>
      
      {/* Peak indicators */}
      <div className="h-6 px-2 border-t border-border/30 flex items-center justify-center shrink-0">
        <span className="text-[8px] font-mono text-muted-foreground">-12 dB</span>
      </div>
    </div>
  );
};
