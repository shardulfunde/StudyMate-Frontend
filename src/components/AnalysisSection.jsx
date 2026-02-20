import React from 'react';

function asList(value) {
  return Array.isArray(value) ? value : [];
}

export default function AnalysisSection({ analysis }) {
  if (!analysis) return null;

  const detailedDescription = analysis.detailed_desciption || analysis.detailed_description || '';
  const topicsToFocus = asList(analysis.topics_to_focus);
  const improvementPlan = asList(analysis.detailed_plan_to_improve);

  return (
    <section className="smtest-analysis-panel">
      <div className="smtest-analysis-header">
        <h3>Test Analysis</h3>
        <div className="smtest-analysis-pills">
          <span>{analysis.topic || 'Unknown Topic'}</span>
          <span>{analysis.difficulty || 'Unknown Difficulty'}</span>
        </div>
      </div>

      <div className="smtest-analysis-block">
        <h4>Detailed Description</h4>
        <p>{detailedDescription || 'No description available.'}</p>
      </div>

      <div className="smtest-analysis-grid">
        <div className="smtest-analysis-block">
          <h4>Topics To Focus</h4>
          <ul>
            {topicsToFocus.length === 0 && <li>No weak-topic data available.</li>}
            {topicsToFocus.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="smtest-analysis-block">
          <h4>Improvement Plan</h4>
          <ol>
            {improvementPlan.length === 0 && <li>No plan data available.</li>}
            {improvementPlan.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
