import React, { useState, useEffect } from "react";
import { SleepData } from "../src/entities/SleepData";
import { AlertTriangle, Info, TrendingUp, Activity } from "lucide-react";

import RiskGauge from "../Components/risks/RiskGauge";
import RiskEducation from "../Components/risks/RiskEducation";
import RiskTrends from "../Components/risks/RiskTrends";

export default function Risks() {
  const [recentData, setRecentData] = useState([]);
  const [currentRisks, setCurrentRisks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    setIsLoading(true);
    try {
      const data = await SleepData.list('-date', 14);
      setRecentData(data);
      calculateCurrentRisks(data);
    } catch (error) {
      console.error("Error loading risk data:", error);
    }
    setIsLoading(false);
  };

  const calculateCurrentRisks = (data) => {
    if (!data || data.length === 0) return;

    const recent = data.slice(0, 7); // Last 7 days
    
    // Sleep Apnea Risk Calculation
    const highApneaRisk = recent.filter(d => d.apnea_risk === 'high').length;
    const apneaRiskPercentage = Math.min(100, (highApneaRisk / recent.length) * 100 + 
      (recent.reduce((sum, d) => sum + (d.fragmentation_events || 0), 0) / recent.length) * 2);

    // Snoring Severity Risk
    const avgSnoring = recent.reduce((sum, d) => sum + (d.snoring_intensity || 0), 0) / recent.length;
    const snoringRiskPercentage = Math.min(100, (avgSnoring / 60) * 100); // Assuming 60dB is high risk

    // Sleep Fragmentation Risk
    const avgFragmentation = recent.reduce((sum, d) => sum + (d.fragmentation_events || 0), 0) / recent.length;
    const fragmentationRiskPercentage = Math.min(100, (avgFragmentation / 10) * 100); // 10+ events/hr is high risk

    // Overall Sleep Quality Risk (inverse of sleep score)
    const avgScore = recent.reduce((sum, d) => sum + (d.sleep_score || 0), 0) / recent.length;
    const qualityRiskPercentage = Math.max(0, 100 - avgScore);

    setCurrentRisks({
      apnea: Math.round(apneaRiskPercentage),
      snoring: Math.round(snoringRiskPercentage),
      fragmentation: Math.round(fragmentationRiskPercentage),
      quality: Math.round(qualityRiskPercentage)
    });
  };

  const getRiskLevel = (percentage) => {
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  const riskCards = [
    {
      key: 'apnea',
      title: 'Sleep Apnea Risk',
      description: 'Probability of sleep-disordered breathing',
      icon: AlertTriangle,
      percentage: currentRisks.apnea || 0,
      factors: ['High fragmentation events', 'Snoring intensity', 'Sleep position patterns']
    },
    {
      key: 'snoring',
      title: 'Severe Snoring Risk',
      description: 'Likelihood of disruptive snoring episodes',
      icon: Activity,
      percentage: currentRisks.snoring || 0,
      factors: ['Sound intensity levels', 'Sleep position', 'Airway obstruction indicators']
    },
    {
      key: 'fragmentation',
      title: 'Sleep Fragmentation',
      description: 'Risk of interrupted sleep cycles',
      icon: TrendingUp,
      percentage: currentRisks.fragmentation || 0,
      factors: ['Micro-awakening frequency', 'REM disruption', 'Deep sleep consistency']
    },
    {
      key: 'quality',
      title: 'Poor Sleep Quality',
      description: 'Overall sleep health deterioration risk',
      icon: Info,
      percentage: currentRisks.quality || 0,
      factors: ['Sleep score trends', 'Recovery patterns', 'Consistency metrics']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2 flex items-center gap-3 justify-center md:justify-start">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
            Sleep Health Risks
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor potential sleep disorders and health indicators
          </p>
        </div>

        {/* Overall Risk Summary */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Risk Assessment Overview</h2>
            <p className="text-slate-400">Based on your sleep data from the past 7 days</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {riskCards.map((risk) => {
              const level = getRiskLevel(risk.percentage);
              return (
                <div key={risk.key} className="text-center">
                  <div className={`text-2xl font-bold ${getRiskColor(level)} mb-1`}>
                    {risk.percentage}%
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    {risk.title.split(' ')[0]} {risk.title.split(' ')[1]}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    level === 'high' ? 'bg-rose-500/20 text-rose-400' :
                    level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {level.toUpperCase()} RISK
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Details Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {riskCards.map((risk) => (
            <RiskGauge
              key={risk.key}
              risk={risk}
              level={getRiskLevel(risk.percentage)}
              onLearnMore={() => setSelectedRisk(risk)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Risk Trends */}
        <RiskTrends 
          data={recentData}
          isLoading={isLoading}
        />

        {/* Educational Modal */}
        {selectedRisk && (
          <RiskEducation
            risk={selectedRisk}
            level={getRiskLevel(selectedRisk.percentage)}
            onClose={() => setSelectedRisk(null)}
          />
        )}

        {/* Disclaimer */}
        <div className="glass-card rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-400 font-medium mb-1">Medical Disclaimer</p>
              <p className="text-slate-300">
                These risk assessments are based on sleep tracking data and should not replace professional medical advice. 
                Consult with a healthcare provider or sleep specialist for proper diagnosis and treatment of sleep disorders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}