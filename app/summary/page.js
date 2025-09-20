"use client";
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireDemographics } from '../components/guards';
import { useJourney } from '../providers/JourneyProvider.jsx';

export default function SummaryPage() {
  useRequireDemographics();
  const router = useRouter();
  const { demographics, setSelectedAttributes } = useJourney();

  const analysisData = demographics?.raw || {};
  const { race = {}, age = {}, gender = {} } = analysisData;

  const selected = demographics?.selected || { race: null, age: null, gender: null };
  const [activeCategory, setActiveCategory] = useState('race'); // 'race' | 'age' | 'gender'

  const sortedRace = useMemo(() => Object.entries(race)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({ key, percentage: (value * 100).toFixed(2) })), [race]);

  const sortedAge = useMemo(() => Object.entries(age)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({ key, percentage: (value * 100).toFixed(2) })), [age]);

  const sortedGender = useMemo(() => Object.entries(gender)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({ key, percentage: (value * 100).toFixed(2) })), [gender]);

  const hasAnalysisData = sortedRace.length || sortedAge.length || sortedGender.length;

  const handleSelect = (category, value) => {
    setSelectedAttributes({ [category]: value });
  };

  // Top picks for absolute layout
  const topRace = sortedRace[0]?.key || '-';
  const topAge = sortedAge[0]?.key || '-';
  const topGender = sortedGender[0]?.key || '-';

  const sortedByCategory = {
    race: sortedRace,
    age: sortedAge,
    gender: sortedGender,
  };

  const rawByCategory = { race, age, gender };

  const activeList = sortedByCategory[activeCategory] || [];
  const activeTopKey = activeList[0]?.key;
  const currentKey = (selected?.[activeCategory] ?? activeTopKey) ?? '-';
  const currentPct = (() => {
    const rawMap = rawByCategory[activeCategory] || {};
    const rawVal = rawMap?.[currentKey];
    if (typeof rawVal === 'number') return Math.round(rawVal * 100);
    // If list provided as percentage strings
    const fromList = activeList.find(i => i.key === currentKey)?.percentage;
    return fromList ? Math.round(parseFloat(fromList)) : null;
  })();

  // Animated arc percentage
  const [arcPct, setArcPct] = useState(0);
  useEffect(() => {
    if (typeof currentPct === 'number') {
      // animate on mount and on change
      requestAnimationFrame(() => setArcPct(currentPct));
    } else {
      setArcPct(0);
    }
  }, [currentPct]);

  return (
    <div className="summary-canvas" aria-label="Summary layout">
      <div className="summary-subhead">A. I. Analysis</div>

      {/* Headings as per reference screenshot */}
      <div className="summary-header">
        <div className="summary-kicker">A.I. ANALYSIS</div>
        <h2 className="summary-heading">DEMOGRAPHICS</h2>
        <h3 className="summary-section-subtitle">PREDICTED RACE & AGE</h3>
      </div>

      {/* Absolute layout for large screens (1920x960 spec) */}
      {hasAnalysisData && (
        <div className="summary-absolute" aria-hidden={false}>
          {/* Main board */}
          <div className="summary-board" />
          <div className="summary-board-title">{(currentKey ?? '-').toString().replace(/_/g, ' ')}</div>
          <div className="summary-board-circle" aria-label="Selected confidence">
            <div className="summary-circle-outer" />
            <div className="summary-circle-inner" />
            {/* Animated arc ring driven by currentPct */}
            <svg className="summary-arc" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="track" cx="50" cy="50" r="45" pathLength="100" strokeDasharray="100" strokeDashoffset="0" />
              <circle
                className="progress"
                cx="50"
                cy="50"
                r="45"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - (arcPct || 0)}
              />
            </svg>
            {currentPct !== null && (
              <div className="summary-percent-wrap">
                <div className="summary-percent">
                  <span className="num">{currentPct}</span>
                  <span className="pct">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Left side mini cards */}
          <div className="summary-cards">
            <div
              className={`card card--race${activeCategory === 'race' ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={activeCategory === 'race'}
              onClick={() => { if (sortedRace.length) setActiveCategory('race'); }}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && sortedRace.length) { e.preventDefault(); setActiveCategory('race'); } }}
            >
              <div className="value">{(selected.race || topRace).toString().replace(/_/g, ' ')}</div>
              <div className="label">race</div>
            </div>
            <div
              className={`card card--age${activeCategory === 'age' ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={activeCategory === 'age'}
              onClick={() => { if (sortedAge.length) setActiveCategory('age'); }}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && sortedAge.length) { e.preventDefault(); setActiveCategory('age'); } }}
            >
              <div className="value">{(selected.age || topAge).toString()}</div>
              <div className="label">Age</div>
            </div>
            <div
              className={`card card--sex${activeCategory === 'gender' ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={activeCategory === 'gender'}
              onClick={() => { if (sortedGender.length) setActiveCategory('gender'); }}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && sortedGender.length) { e.preventDefault(); setActiveCategory('gender'); } }}
            >
              <div className="value">{(selected.gender || topGender).toString()}</div>
              <div className="label">Sex</div>
            </div>
          </div>

          {/* Right table of races */}
          <div className="summary-table" role="table" aria-label={`${activeCategory} options`}>
            <div className="head" role="rowgroup">
              <div className="title">{activeCategory}</div>
              <div className="conf">a. i. confidence</div>
            </div>
            <div className="rows" role="rowgroup">
              {(activeList).map(({ key, percentage }, idx) => {
                const pctInt = Math.round(parseFloat(percentage));
                const selectedVal = selected?.[activeCategory];
                const isSelected = (selectedVal ? selectedVal === key : idx === 0);
                return (
                  <div
                    key={key}
                    className={`summary-row${isSelected ? ' selected' : ''}`}
                    role="row"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => handleSelect(activeCategory, key)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(activeCategory, key); } }}
                  >
                    <div className="radio" aria-checked={isSelected} role="radio">
                      <div className="inner" />
                    </div>
                    <div className="name" role="cell">{key.toString().replace(/_/g, ' ')}</div>
                    <div className="val" role="cell">{pctInt} %</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instruction */}
          <div className="summary-instruction">If A.I. estimate is wrong, select the correct one.</div>
        </div>
      )}

      {/* Stacked content fallback (mobile / small screens) */}
  <div className="summary-content">
        {!hasAnalysisData ? (
          <div className="no-data-message">
            <p>No analysis data found. Please upload an image first.</p>
            <p>Go to Upload Page or take a Picture with your device</p>
          </div>
        ) : (
          <div className="demographics-results">
            {/* Race */}
            {sortedRace.length > 0 && (
              <div className="demographic-group">
                <h4 className="group-title">Race</h4>
                <div className="scores-container">
                  {sortedRace.map(({ key, percentage }) => (
                    <div
                      key={key}
                      className={`score-row ${selected.race === key ? 'selected' : ''}`}
                      onClick={() => handleSelect('race', key)}
                    >
                      <span className="score-name">{key}</span>
                      <span className="score-percent">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Age */}
            {sortedAge.length > 0 && (
              <div className="demographic-group">
                <h4 className="group-title">Age</h4>
                <div className="scores-container">
                  {sortedAge.map(({ key, percentage }) => (
                    <div
                      key={key}
                      className={`score-row ${selected.age === key ? 'selected' : ''}`}
                      onClick={() => handleSelect('age', key)}
                    >
                      <span className="score-name">{key}</span>
                      <span className="score-percent">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gender */}
            {sortedGender.length > 0 && (
              <div className="demographic-group">
                <h4 className="group-title">Gender</h4>
                <div className="scores-container">
                  {sortedGender.map(({ key, percentage }) => (
                    <div
                      key={key}
                      className={`score-row ${selected.gender === key ? 'selected' : ''}`}
                      onClick={() => handleSelect('gender', key)}
                    >
                      <span className="score-name">{key}</span>
                      <span className="score-percent">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Attributes Summary */}
        {hasAnalysisData && (
          <div className="selected-summary" style={{ marginTop: 20 }}>
            <h4>Selected Attributes</h4>
            <p><strong>Race:</strong> {selected.race || '-'}</p>
            <p><strong>Age:</strong> {selected.age || '-'}</p>
            <p><strong>Gender:</strong> {selected.gender || '-'}</p>
          </div>
        )}
      </div>

      {/* Floating navigation controls for consistency with other pages */}
      <div
        className="back-floating"
        role="button"
        aria-label="Go back"
        tabIndex={0}
        onClick={() => router.push('/select')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push('/select')}
      >
        <div className="diamond-button">
          <div className="diamond">
            <span className="diamond-arrow left" />
          </div>
        </div>
        <span>Back</span>
      </div>

      <div
        className="proceed-floating"
        role="button"
        aria-label="Go home"
        tabIndex={0}
        onClick={() => router.push('/')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push('/')}
      >
        <span>HOME</span>
        <div className="diamond-button">
          <div className="diamond">
            <span className="diamond-arrow right" />
          </div>
        </div>
      </div>
    </div>
  );
}
