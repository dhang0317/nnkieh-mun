  function renderVotingView() {
    // Render roll call grid if rollcall tab is active
    if (state.currentTab === 'rollcall') {
      renderRollCallGrid();
    }
    // Render resolution vote grid if vote tab is active
    if (state.currentTab === 'vote') {
      renderResolutionVoteGrid();
    }
  }

  function renderRollCallGrid() {
    const grid = document.getElementById('grid-rollcall-delegates');
    grid.innerHTML = '';
    const t = I18N[state.language] || I18N.en;

    state.selectedCountries.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 shadow-sm';
      
      const isPresent = c.attendance === 'present';
      const isPv = c.attendance === 'pv';
      const isAbsent = c.attendance === 'absent';
      const isUncalled = !c.attendance || c.attendance === 'uncalled';

      let rightContent = '';

      if (isUncalled) {
        // 出席缺席大小要一樣，不用英文，透亮半透明色彩
        rightContent = `
          <div class="rollcall-btn-container flex items-center space-x-2 shrink-0">
            <button type="button" class="btn-rollcall-present flex-1 rounded-xl font-black text-center transition cursor-pointer" style="border: 1.5px solid #10b981 !important; color: #10b981 !important; background-color: rgba(16, 185, 129, 0.15) !important;">
              出席
            </button>
            <button type="button" class="btn-rollcall-absent flex-1 rounded-xl font-black text-center transition cursor-pointer" style="border: 1.5px solid #ef4444 !important; color: #ef4444 !important; background-color: rgba(239, 68, 68, 0.15) !important;">
              缺席
            </button>
          </div>
        `;
      } else if (isPresent) {
        // 點「出席」：「缺席」按鈕徹底消失，「出席」按鈕自動擴展並佔據大小 2，呈現為：✓ 出席 (點擊切換 PV)
        rightContent = `
          <div class="rollcall-btn-container shrink-0 flex justify-end">
            <button type="button" class="btn-rollcall-expanded btn-rollcall-status-present w-full rounded-xl font-black text-center transition cursor-pointer" style="background-color: rgba(16, 185, 129, 0.28) !important; background: rgba(16, 185, 129, 0.28) !important; color: #10b981 !important; border: 2px solid #10b981 !important;">
              ✓ 出席 (點擊切換 PV)
            </button>
          </div>
        `;
      } else if (isPv) {
        // 再點一下切換為 ✓✓ P & Voting (點擊取消)
        rightContent = `
          <div class="rollcall-btn-container shrink-0 flex justify-end">
            <button type="button" class="btn-rollcall-expanded btn-rollcall-status-pv w-full rounded-xl font-black text-center transition cursor-pointer" style="background-color: rgba(245, 158, 11, 0.28) !important; background: rgba(245, 158, 11, 0.28) !important; color: #f59e0b !important; border: 2px solid #f59e0b !important;">
              ✓✓ P & Voting (點擊取消)
            </button>
          </div>
        `;
      } else if (isAbsent) {
        // 點「缺席」：「出席」按鈕徹底消失，「缺席」按鈕自動擴展至大小 2，呈現為：✕ 缺席 (點擊取消)
        rightContent = `
          <div class="rollcall-btn-container shrink-0 flex justify-end">
            <button type="button" class="btn-rollcall-expanded btn-rollcall-status-absent w-full rounded-xl font-black text-center transition cursor-pointer" style="background-color: rgba(239, 68, 68, 0.28) !important; background: rgba(239, 68, 68, 0.28) !important; color: #ef4444 !important; border: 2px solid #ef4444 !important;">
              ✕ 缺席 (點擊取消)
            </button>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="flex items-center space-x-3.5 min-w-0 flex-1">
          <img src="${getFlagUrl(c)}" class="rollcall-flag object-cover rounded-md shadow-sm border border-slate-700/30 shrink-0">
          <div class="min-w-0">
            <div class="country-name-text font-black text-slate-800 leading-snug truncate">${getCountryDisplayName(c)}</div>
            <div class="rollcall-power-text text-slate-400 font-medium">${c.powerStatus === 'veto' ? t.vetoPower : (c.powerStatus === 'observer' ? t.observer : '')}</div>
          </div>
        </div>
        ${rightContent}
      `;

      // Event bindings
      const btnPresent = card.querySelector('.btn-rollcall-present');
      const btnAbsent = card.querySelector('.btn-rollcall-absent');
      const btnExpanded = card.querySelector('.btn-rollcall-expanded');

      if (btnPresent) {
        btnPresent.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.isViewerMode) return;
          c.attendance = 'present'; // 點擊變成大小為 2 的出席按鈕
          saveToLocalStorage(true);
          renderAll();
        });
      }

      if (btnAbsent) {
        btnAbsent.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.isViewerMode) return;
          c.attendance = 'absent'; // 點擊變成大小為 2 的缺席按鈕
          saveToLocalStorage(true);
          renderAll();
        });
      }

      if (btnExpanded) {
        btnExpanded.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.isViewerMode) return;
          if (c.attendance === 'present') {
            c.attendance = 'pv'; // 出席再點一下是 PV
          } else if (c.attendance === 'pv') {
            c.attendance = 'uncalled'; // PV 再點一下重設回未點名（變回 1:1 兩按鈕）
          } else if (c.attendance === 'absent') {
            c.attendance = 'uncalled'; // 缺席再點一下重設回未點名（變回 1:1 兩按鈕）
          }
          saveToLocalStorage(true);
          renderAll();
        });
      }

      grid.appendChild(card);
    });
  }

  function renderResolutionVoteGrid() {
    const btnR1 = document.getElementById('vote-stage-r1');
    const btnR2 = document.getElementById('vote-stage-r2');
    const btnRights = document.getElementById('vote-stage-rights');
    const pRights = document.getElementById('panel-rights-speeches');
    const pBallots = document.getElementById('panel-ballots-container');

    [btnR1, btnR2, btnRights].forEach(b => b.className = 'px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200');
    
    if (state.voteStage === 'r1') {
      btnR1.className = 'px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shadow-sm';
      pRights.classList.add('hidden');
      pBallots.classList.remove('hidden');
    } else if (state.voteStage === 'r2') {
      btnR2.className = 'px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shadow-sm';
      pRights.classList.add('hidden');
      pBallots.classList.remove('hidden');
    } else {
      btnRights.className = 'px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shadow-sm';
      pRights.classList.remove('hidden');
      pBallots.classList.add('hidden');
    }

    const scoreboard = document.getElementById('voting-scoreboard');
    const detailsCard = document.getElementById('card-voting-details');
    const headerRow = document.getElementById('voting-header-row');
    const t = I18N[state.language] || I18N.en;
    if (state.showResults) {
      if (scoreboard) {
        scoreboard.style.display = '';
        scoreboard.classList.remove('opacity-0', 'pointer-events-none');
      }
      if (detailsCard) {
        detailsCard.classList.remove('py-3.5', 'space-y-0');
        detailsCard.classList.add('p-6', 'space-y-4');
      }
      if (headerRow) {
        headerRow.classList.remove('border-b-0', 'pb-0');
        headerRow.classList.add('border-b', 'pb-4');
      }
      document.getElementById('btn-toggle-results').textContent = t.hideResults;
    } else {
      if (scoreboard) {
        scoreboard.style.display = 'none';
        scoreboard.classList.add('opacity-0', 'pointer-events-none');
      }
      if (detailsCard) {
        detailsCard.classList.remove('p-6', 'space-y-4');
        detailsCard.classList.add('py-3.5', 'px-6', 'space-y-0');
      }
      if (headerRow) {
        headerRow.classList.remove('border-b', 'pb-4');
        headerRow.classList.add('border-b-0', 'pb-0');
      }
      document.getElementById('btn-toggle-results').textContent = t.showResults;
    }

    const favorCount = state.selectedCountries.filter(c => c.vote === 'favor').length;
    const againstCount = state.selectedCountries.filter(c => c.vote === 'against').length;
    const abstainCount = state.selectedCountries.filter(c => c.vote === 'abstain').length;

    document.getElementById('vote-count-favor').textContent = favorCount;
    document.getElementById('vote-count-against').textContent = againstCount;
    document.getElementById('vote-count-abstain').textContent = abstainCount;

    const titleElem = document.getElementById('vote-resolution-title');
    if (titleElem) {
      titleElem.textContent = state.voteResolutionTitle || 'Draft Resolution 1.1';
    }

    const threshElem = document.getElementById('select-vote-threshold');
    if (threshElem) {
      threshElem.value = state.voteThreshold || 'simple';
    }

    const eligibleVoters = state.selectedCountries.filter(c => c.powerStatus !== 'observer' && (c.attendance === 'present' || c.attendance === 'pv'));
    const votedCount = eligibleVoters.filter(c => c.vote === 'favor' || c.vote === 'against' || c.vote === 'abstain').length;
    const remainingToVote = eligibleVoters.length - votedCount;

    const stats = computeStats();

    const vetoNations = state.selectedCountries.filter(c => c.powerStatus === 'veto' && c.vote === 'against');
    const vetoBanner = document.getElementById('veto-alert-banner');
    if (vetoNations.length > 0) {
      vetoBanner.classList.remove('hidden');
      document.getElementById('veto-countries-list').textContent = vetoNations.map(c => getCountryDisplayName(c)).join(', ');
    } else {
      vetoBanner.classList.add('hidden');
    }

    const verdictElem = document.getElementById('vote-verdict');
    const totalVotesCast = favorCount + againstCount + abstainCount;

    if (totalVotesCast === 0) {
      verdictElem.textContent = t.pending;
      verdictElem.className = 'text-lg font-black text-slate-500 mt-2';
    } else if (vetoNations.length > 0) {
      verdictElem.textContent = t.vetoed;
      verdictElem.className = 'text-lg font-black text-rose-600 mt-2';
    } else if (state.voteThreshold === 'unsc9') {
      const requiredThreshold = 9;
      if (favorCount >= requiredThreshold) {
        verdictElem.textContent = t.passed;
        verdictElem.className = 'text-lg font-black text-emerald-600 mt-2';
      } else if (favorCount + remainingToVote < requiredThreshold) {
        verdictElem.textContent = t.failed;
        verdictElem.className = 'text-lg font-black text-rose-600 mt-2';
      } else {
        verdictElem.textContent = t.inProgress;
        verdictElem.className = 'text-lg font-black text-amber-500 mt-2';
      }
    } else if (state.voteThreshold === 'twothirds') {
      if (remainingToVote > 0) {
        // Still votes remaining
        verdictElem.textContent = t.inProgress;
        verdictElem.className = 'text-lg font-black text-amber-500 mt-2';
      } else {
        // All eligible members have voted: MUN 2/3 requires favor >= 2/3 of (favor + against)
        const substantiveTotal = favorCount + againstCount;
        const required = substantiveTotal > 0 ? Math.ceil((substantiveTotal * 2) / 3) : 1;
        if (favorCount > 0 && favorCount >= required) {
          verdictElem.textContent = t.passed;
          verdictElem.className = 'text-lg font-black text-emerald-600 mt-2';
        } else {
          verdictElem.textContent = t.failed;
          verdictElem.className = 'text-lg font-black text-rose-600 mt-2';
        }
      }
    } else {
      // Simple majority (簡單多數決)
      // Standard MUN rule: "Members present and voting" means favor or against.
      // Resolution passes if Favor > Against.
      if (remainingToVote > 0) {
        // If remaining delegates cannot possibly change favor > against even if all vote against:
        // However, while voting is actively taking place, show in-progress unless complete.
        if (favorCount > againstCount + remainingToVote) {
          verdictElem.textContent = t.passed;
          verdictElem.className = 'text-lg font-black text-emerald-600 mt-2';
        } else if (favorCount + remainingToVote <= againstCount) {
          verdictElem.textContent = t.failed;
          verdictElem.className = 'text-lg font-black text-rose-600 mt-2';
        } else {
          verdictElem.textContent = t.inProgress;
          verdictElem.className = 'text-lg font-black text-amber-500 mt-2';
        }
      } else {
        // Voting complete
        if (favorCount > againstCount) {
          verdictElem.textContent = t.passed;
          verdictElem.className = 'text-lg font-black text-emerald-600 mt-2';
        } else {
          verdictElem.textContent = t.failed;
          verdictElem.className = 'text-lg font-black text-rose-600 mt-2';
        }
      }
    }

    const rightsContainer = document.getElementById('list-rights-speeches');
    rightsContainer.innerHTML = '';
    const rightsDelegations = state.selectedCountries.filter(c => c.hasRights);
    if (rightsDelegations.length === 0) {
      rightsContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">${t.noRightsInRound}</div>`;
    } else {
      rightsDelegations.forEach(c => {
        const item = document.createElement('div');
        item.className = 'py-3 flex items-center justify-between';
        item.innerHTML = `
          <div class="flex items-center space-x-3">
            <img src="${getFlagUrl(c)}" class="w-6 h-4 object-cover rounded shadow-sm">
            <div>
              <span class="text-xs font-bold text-slate-800">${getCountryDisplayName(c)}</span>
              <span class="text-[10px] text-primary font-bold block">${t.voting}: ${c.vote.toUpperCase()}</span>
            </div>
          </div>
          <button class="px-3 py-1 bg-secondary text-white rounded-lg text-xs font-semibold hover:bg-cyan-600">${t.giveFloor60s}</button>
        `;
        item.querySelector('button').addEventListener('click', () => {
          state.singleSpeaker = c;
          state.singleTimeRemaining = 60;
          switchTab('singleSpeaker');
        });
        rightsContainer.appendChild(item);
      });
    }

    const grid = document.getElementById('grid-substantive-ballots');
    grid.innerHTML = '';

    let visibleCountries = state.selectedCountries;
    if (state.voteStage === 'r2') {
      visibleCountries = state.selectedCountries.filter(c => c.vote === 'pass');
      if (visibleCountries.length === 0) {
        grid.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-400">${t.noPassInRound1}</div>`;
        return;
      }
    }

    visibleCountries.forEach(c => {
      const isObserver = c.powerStatus === 'observer';
      const isAbsent = c.attendance === 'absent';
      const isUncalled = c.attendance === 'uncalled' || !c.attendance;
      const canAbstain = c.attendance !== 'pv';

      const card = document.createElement('div');
      card.className = 'p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm';

      const statusText = isObserver 
        ? t.observer 
        : (c.attendance === 'pv' 
            ? t.pv 
            : (c.attendance === 'present' 
                ? t.present 
                : (c.attendance === 'absent' ? t.absent : (t.uncalled || '未點名'))));

      card.innerHTML = `
        <div class="flex items-center space-x-3.5 min-w-0 flex-1">
          <img src="${getFlagUrl(c)}" class="w-9 h-6 sm:w-11 sm:h-7 object-cover rounded-md shadow-sm border border-slate-700/30 shrink-0">
          <div class="min-w-0">
            <div class="country-name-text text-base sm:text-lg lg:text-xl font-black text-slate-800 leading-snug truncate">${getCountryDisplayName(c)}</div>
            <div class="text-xs text-slate-400 font-medium">${statusText}</div>
          </div>
        </div>
        ${
          isObserver || isAbsent || isUncalled
          ? `<span class="text-xs text-slate-400 italic">${isObserver ? t.observer : (isAbsent ? t.absent : (t.uncalled || '未點名'))}</span>`
          : `
            <div class="flex items-center space-x-1">
              <button data-vote="favor" class="btn-vote-choice px-2 py-1 rounded text-xs font-bold ${c.vote === 'favor' && !c.hasRights ? 'vote-favor' : 'border'}">${t.yes}</button>
              <button data-vote="favor-rights" class="btn-vote-choice px-1.5 py-1 rounded text-[10px] font-bold ${c.vote === 'favor' && c.hasRights ? 'vote-favor' : 'border'}" title="In Favor with Rights">+R</button>
              
              <button data-vote="against" class="btn-vote-choice px-2 py-1 rounded text-xs font-bold ${c.vote === 'against' && !c.hasRights ? 'vote-against' : 'border'}">${t.no}</button>
              <button data-vote="against-rights" class="btn-vote-choice px-1.5 py-1 rounded text-[10px] font-bold ${c.vote === 'against' && c.hasRights ? 'vote-against' : 'border'}" title="Against with Rights">+R</button>

              ${canAbstain ? `<button data-vote="abstain" class="btn-vote-choice px-2 py-1 rounded text-xs font-bold ${c.vote === 'abstain' ? 'vote-abstain' : 'border'}">${t.abs}</button>` : ''}
              
              ${state.voteStage === 'r1' ? `<button data-vote="pass" class="btn-vote-choice px-2 py-1 rounded text-xs font-bold ${c.vote === 'pass' ? 'vote-pass' : 'border'}">${t.pass}</button>` : ''}
            </div>
          `
        }
      `;

      card.querySelectorAll('.btn-vote-choice').forEach(btn => {
        btn.addEventListener('click', () => {
          if (state.isViewerMode) return;
          const action = btn.getAttribute('data-vote');
          if (action === 'favor-rights') {
            c.vote = 'favor';
            c.hasRights = true;
          } else if (action === 'against-rights') {
            c.vote = 'against';
            c.hasRights = true;
          } else {
            c.vote = action;
            c.hasRights = false;
          }
          saveToLocalStorage(true, true);
          renderAll();
        });
      });

      grid.appendChild(card);
    });
  }
