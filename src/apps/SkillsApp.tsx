import React from 'react';
import { useTelemetryStore } from '../store/telemetryStore';

export const SkillsApp: React.FC = () => {
  const { radarSkills: radarSkillsData, categorizedSkills } = useTelemetryStore();
  // Compute block-style progress bar
  const renderMeter = (value: number) => {
    const totalBlocks = 12;
    const filledBlocks = Math.round((value / 100) * totalBlocks);
    return '[' + '■'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks) + ']';
  };

  // Center SVG coordinates for 5 skills axes:
  // Subject order: AI/ML (0), Full-Stack (1), DSA (2), System Design (3), Research (4)
  const cx = 100;
  const cy = 100;
  const maxRadius = 70;

  const getCoordinates = (index: number, value: number) => {
    const angleRad = (Math.PI / 180) * (-90 + index * 72);
    const radius = (value / 100) * maxRadius;
    const x = cx + radius * Math.cos(angleRad);
    const y = cy + radius * Math.sin(angleRad);
    return { x, y };
  };

  // Background Pentagons (concentric grids)
  const pentagonGrids = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, gridIdx) => {
    const points = Array.from({ length: 5 }).map((_, i) => {
      const p = getCoordinates(i, scale * 100);
      return `${p.x},${p.y}`;
    }).join(' ');
    return <polygon key={gridIdx} points={points} fill="none" stroke="#008000" strokeWidth="0.75" strokeOpacity="0.4" />;
  });

  // Radar skill polygon
  const skillPoints = radarSkillsData.map((d, i) => getCoordinates(i, d.value));
  const skillPolygonPath = skillPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Labels positioning (enlarged labels)
  const labels = radarSkillsData.map((d, i) => {
    const p = getCoordinates(i, 116);
    let anchor = 'middle';
    if (i === 1 || i === 2) anchor = 'start';
    if (i === 3 || i === 4) anchor = 'end';
    return (
      <text
        key={i}
        x={p.x}
        y={p.y + 4}
        fill="#00ff00"
        fontSize="12"
        fontWeight="bold"
        textAnchor={anchor}
        className="font-pixel"
      >
        {d.subject}
      </text>
    );
  });

  return (
    <div className="w-full h-full bg-[#000000] text-[#00ff00] p-4 font-pixel select-none overflow-y-auto leading-relaxed border border-[#008000]/30">
      
      {/* Title Bar Details */}
      <div className="w-full flex justify-between items-center text-xs uppercase border-b border-[#008000]/30 pb-2 mb-4">
        <span>SYS // RADAR_TELEMETRY</span>
        <span className="animate-pulse">STATUS: ACTIVE</span>
      </div>

      {/* TOP SECTION: Radar scope + metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        
        {/* CENTER COLUMN: SVG Radar Graph */}
        <div className="flex flex-col items-center justify-center bg-[#050508] border border-[#008000]/30 p-2 relative h-[250px]">
          <span className="absolute top-1 left-2 text-[10px] opacity-40">TELEMETRY SCOPE</span>
          
          <svg className="w-full h-full max-w-[230px] max-h-[230px]" viewBox="0 0 200 200">
            {/* Draw concentric pentagons */}
            {pentagonGrids}

            {/* Draw spokes */}
            {Array.from({ length: 5 }).map((_, i) => {
              const outer = getCoordinates(i, 100);
              return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#008000" strokeWidth="0.75" strokeOpacity="0.3" />;
            })}

            {/* Draw filled skill polygon */}
            <polygon
              points={skillPolygonPath}
              fill="rgba(0, 255, 0, 0.15)"
              stroke="#00ff00"
              strokeWidth="2"
            />

            {/* Draw skill vertex dots */}
            {skillPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#00ff00" strokeWidth="2" />
            ))}

            {/* Labels */}
            {labels}
          </svg>
        </div>

        {/* RIGHT COLUMN: Skill Progress list */}
        <div className="flex flex-col gap-3 h-full justify-center">
          <span className="text-sm font-bold border-b border-[#008000]/40 pb-1 uppercase select-none">
            Core Target Metrics
          </span>

          <div className="flex flex-col gap-3">
            {radarSkillsData.map((skill) => (
              <div key={skill.subject} className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[13px] font-bold">
                  <span>{skill.subject}</span>
                  <span>{skill.value}%</span>
                </div>
                <span className="text-sm tracking-wider">{renderMeter(skill.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Full Categorized Skills Index */}
      <div className="mt-4 border-t border-[#008000]/30 pt-4">
        <span className="text-sm font-bold uppercase block mb-4 tracking-wider select-none text-center">
          --- CATEGORIZED TECHNICAL SYSTEM INDEX ---
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorizedSkills.map((group) => (
            <div 
              key={group.category} 
              className="bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black p-3 shadow-md"
            >
              {/* Category Header (Win95 blue bar) */}
              <h3 className="text-sm font-bold bg-[#000080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black mb-3 select-none uppercase tracking-wider">
                {group.category}
              </h3>

              {/* Skills grid of micro-bevel button blocks */}
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <div
                    key={skill}
                    className="text-xs px-2 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black font-pixel font-bold shadow-sm select-text hover:bg-[#e0e0e0] transition-colors"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SkillsApp;
