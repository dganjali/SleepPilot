import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import { ExternalLink, Heart, Brain, Shield } from "lucide-react";

export default function RiskEducation({ risk, level, onClose }) {
  const getRiskInfo = () => {
    const info = {
      apnea: {
        title: "Sleep Apnea",
        description: "A serious sleep disorder where breathing repeatedly stops and starts during sleep.",
        symptoms: [
          "Loud snoring",
          "Episodes of stopped breathing",
          "Gasping or choking during sleep",
          "Morning headaches",
          "Excessive daytime sleepiness"
        ],
        consequences: [
          "Increased risk of heart disease",
          "High blood pressure",
          "Type 2 diabetes",
          "Liver problems",
          "Complications with medications"
        ],
        recommendations: [
          "Maintain a healthy weight",
          "Sleep on your side",
          "Avoid alcohol before bedtime",
          "Keep nasal passages clear",
          "Consider CPAP therapy if diagnosed"
        ]
      },
      snoring: {
        title: "Severe Snoring",
        description: "Loud, frequent snoring that can disrupt sleep quality for both the snorer and their partner.",
        symptoms: [
          "Loud, persistent snoring",
          "Restless sleep",
          "Morning sore throat",
          "Daytime fatigue",
          "Partner complaints"
        ],
        consequences: [
          "Poor sleep quality",
          "Relationship strain",
          "Increased accident risk",
          "Potential progression to sleep apnea",
          "Cardiovascular stress"
        ],
        recommendations: [
          "Sleep on your side",
          "Use nasal strips or dilators",
          "Maintain optimal humidity",
          "Avoid alcohol before bed",
          "Consider anti-snoring devices"
        ]
      },
      fragmentation: {
        title: "Sleep Fragmentation",
        description: "Frequent interruptions to sleep cycles that prevent restorative deep sleep.",
        symptoms: [
          "Frequent awakening",
          "Difficulty staying asleep",
          "Unrefreshing sleep",
          "Daytime sleepiness",
          "Poor concentration"
        ],
        consequences: [
          "Impaired cognitive function",
          "Weakened immune system",
          "Mood disorders",
          "Increased inflammation",
          "Poor physical recovery"
        ],
        recommendations: [
          "Optimize sleep environment",
          "Reduce screen time before bed",
          "Practice relaxation techniques",
          "Maintain consistent sleep schedule",
          "Address underlying stress"
        ]
      },
      quality: {
        title: "Poor Sleep Quality",
        description: "Overall deterioration in sleep health affecting physical and mental well-being.",
        symptoms: [
          "Non-restorative sleep",
          "Frequent tiredness",
          "Mood changes",
          "Reduced productivity",
          "Physical fatigue"
        ],
        consequences: [
          "Compromised immune function",
          "Weight gain",
          "Mental health issues",
          "Reduced life expectancy",
          "Increased disease risk"
        ],
        recommendations: [
          "Establish consistent sleep routine",
          "Create optimal sleep environment",
          "Limit caffeine and alcohol",
          "Exercise regularly",
          "Manage stress effectively"
        ]
      }
    };

    return info[risk.key] || info.quality;
  };

  const riskInfo = getRiskInfo();

  const getRiskColor = () => {
    switch (level) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-slate-100">
            <risk.icon className={`w-6 h-6 ${getRiskColor()}`} />
            Understanding {riskInfo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-slate-300">
          {/* Description */}
          <div>
            <p className="leading-relaxed">{riskInfo.description}</p>
            <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-sm ${
              level === 'high' ? 'bg-rose-500/20 text-rose-400' :
              level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              <span className="font-medium">Your Risk Level: {level.toUpperCase()}</span>
              <span className="font-bold">({risk.percentage}%)</span>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <Brain className="w-5 h-5 text-indigo-400" />
              Common Symptoms
            </h3>
            <ul className="space-y-2">
              {riskInfo.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Health Consequences */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <Heart className="w-5 h-5 text-rose-400" />
              Health Risks
            </h3>
            <ul className="space-y-2">
              {riskInfo.consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <Shield className="w-5 h-5 text-emerald-400" />
              Improvement Strategies
            </h3>
            <ul className="space-y-2">
              {riskInfo.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700">
            <h4 className="font-semibold text-slate-100 mb-2">Next Steps</h4>
            <div className="text-sm space-y-2">
              {level === 'high' && (
                <p className="text-amber-300">
                  <strong>High Risk:</strong> Consider consulting with a sleep specialist or healthcare provider for professional evaluation and treatment options.
                </p>
              )}
              {level === 'medium' && (
                <p className="text-amber-300">
                  <strong>Moderate Risk:</strong> Implement lifestyle changes and monitor your progress. Consider professional consultation if symptoms persist.
                </p>
              )}
              {level === 'low' && (
                <p className="text-emerald-300">
                  <strong>Low Risk:</strong> Continue maintaining good sleep hygiene and monitor for any changes in your sleep patterns.
                </p>
              )}
            </div>
          </div>

          {/* Professional Help */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => window.open('https://www.sleepfoundation.org/sleep-disorders', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}