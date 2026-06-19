# MLB Total Runs Screening Tool - Development Roadmap

## MVP Final Scope (Version 1.0)

**Version 1.0 focuses on ranking today's games and suggesting the best 2-leg and 3-leg Over combinations.**

Includes:
- Unified scoring engine with four threshold outputs
- Three UI screens: Dashboard, Matchup Analysis, Multi-Builder
- Copy-to-clipboard parlay export

Excludes:
- Sportsbook odds estimation
- User accounts and history
- Live game score tracking
- Parlay confirmation screen
- Correlation calculations
- Advanced filtering

## Project Phases

### Phase 1: Foundation & Data Integration (Weeks 1-4)
**Goal**: Establish project structure and integrate with data sources

#### Milestones
- [ ] Set up project repository and development environment
- [ ] Select and integrate MLB data source
- [ ] Implement data fetching and caching mechanisms
- [ ] Create database schema for game and player data
- [ ] Build basic data validation and error handling

#### Deliverables
- Project infrastructure (CI/CD, testing framework)
- Data integration module
- Initial database setup

---

### Phase 2: Unified Scoring Engine (Weeks 5-7) - MVP Version 1.0
**Goal**: Build single unified run-production scoring engine with four threshold outputs

#### Milestones
- [ ] Implement unified scoring formula (45/20/15/10/10 weighted components)
- [ ] Build data calculation module for all input factors
- [ ] Create historical backtesting framework
- [ ] Establish empirical calibration curves for threshold conversion
- [ ] Test scoring accuracy against past seasons

#### Deliverables
- Unified scoring engine with single formula
- Backtesting results and calibration curves
- Four threshold probability outputs per game
- Accuracy metrics for MVP validation

#### Version 1.1+ Enhancement (Post-MVP)
- **Threshold-Specific Models**: After real-world validation, evaluate whether adding threshold-specific weight adjustments (Version 1.1) or separate models (Version 2.0) would improve accuracy
- Decision point: If individual thresholds show significantly different error rates, migrate to Version 1.1 with selective weight adjustments
- If accuracy is strong across all thresholds, maintain unified engine architecture for simplicity

---

### Phase 3: User Interface & MVP Release (Weeks 8-10)
**Goal**: Create functional UI for viewing games and thresholds, then release MVP

#### Milestones
- [ ] Design minimal UI layout for MVP
- [ ] Implement game schedule display with scores
- [ ] Show four threshold probabilities per game (Over 5.5, 6.5, 7.5, 8.5)
- [ ] Add game ranking and filtering by threshold
- [ ] Create multi-leg parlay suggestion view
- [ ] Deploy MVP to production or local deployment

#### Deliverables
- Functional web dashboard showing ranked games
- Four threshold scores per game
- Daily game rankings and updates
- **MVP Release**: Working tool for Over screening

---

### Phase 4: Post-MVP Validation & Enhancement (Weeks 11-14)
**Goal**: Validate accuracy and plan next version

#### Milestones
- [ ] Track real-world Over hit rates across all thresholds
- [ ] Compare actual results vs. predicted probabilities
- [ ] Analyze error patterns by threshold and game type
- [ ] Gather user feedback on usability and accuracy
- [ ] Decide: Maintain unified engine or migrate to Version 1.1+
- [ ] Plan threshold-specific optimizations if needed

#### Deliverables
- Accuracy report (actual vs. predicted)
- Error analysis by threshold
- Recommendations for Version 1.1 improvements

---

### Phase 5: Launch & Enhancement (Week 17+)
**Goal**: Deploy to production and plan future enhancements

#### Milestones
- [ ] Deploy to production environment
- [ ] Set up monitoring and alerting
- [ ] Create user documentation
- [ ] Plan advanced features

#### Future Enhancement Ideas
- Advanced machine learning models
- Real-time notifications for betting opportunities
- Mobile application
- Integration with betting platforms
- Multi-sport expansion
- User accounts and prediction history tracking

---

## MVP Milestone

**MVP Release Target**: Week 10 (end of Phase 3)

MVP includes:
- Data integration with MLB-StatsAPI
- Unified scoring engine with four threshold outputs
- Web dashboard with ranked games
- Real-time game updates and daily scoring
- Multi-leg parlay suggestions

---

## Version 1.1 / Version 2.0 Decision Point

After MVP validation (Phase 4), team will decide:

**Option A: Stay with Unified Engine (v1.0 Maintenance)**
- Continue unified engine if accuracy is strong across all thresholds
- Minimal maintenance, simple codebase

**Option B: Migrate to Version 1.1 (Threshold-Specific Weights)**
- Add threshold-specific weight adjustments if errors vary by threshold
- Keep single-engine architecture with tuned weights
- Effort: 1-2 weeks

**Option C: Migrate to Version 2.0 (Separate Models)**
- Build separate models per threshold if weights insufficient
- Only if factor importance fundamentally differs by threshold
- Effort: 3-4 weeks, deferred to later release

---

## Timeline Summary

Phase 1: Foundation - 4 weeks
Phase 2: Unified Scoring - 3 weeks
Phase 3: UI & MVP - 3 weeks
Phase 4: Post-MVP Validation - 4 weeks
Phase 5: Enhancement - Ongoing

**MVP Target: Week 10** with unified scoring engine
**Version Decision: Week 14** based on validation data
