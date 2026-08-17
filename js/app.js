// app.js - Main Application Orchestrator with Single Coordinator, Image Compressor & Mosque Poster Generator
// Human-Centered WebDev: WCAG 2.2 AA Focus Trapping, Keyboard Navigation, XSS Protection & State Resilience

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
if (!window.escapeHTML) {
  window.escapeHTML = escapeHTML;
}

class BayedhaApp {
  constructor() {
    this.store = window.appStore;
    this.mapEngine = null;
    this.currentTab = 'map';
    this.mobileMapTabState = 'map';
    this.uploadedPhotoData = null;
    this.coordAfterPhotoData = null;
    this.activeNearbySpot = null;
    this.isCoordAuthenticated = false;
    this.pendingActionAfterAuth = null;
    this.lastFocusedElement = null;
    this.activeModalId = null;

    this.init();
  }

  init() {
    this.mapEngine = new window.BayedhaMap('leafletMap');
    this.updateLanguageDirection();
    this.renderAll();

    this.store.subscribe(() => {
      this.updateLanguageDirection();
      this.renderAll();
    });

    this.bindEvents();
    this.bindStructuredFormEvents();
    this.bindCoordinatorEvents();
    this.bindPosterGeneratorEvents();
    this.initBeforeAfterSliders();
  }

  updateLanguageDirection() {
    const t = this.store.getT();
    document.documentElement.setAttribute('lang', this.store.lang);
    document.documentElement.setAttribute('dir', t.dir);

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.store.lang);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (t[key]) {
        el.setAttribute('placeholder', t[key]);
      }
    });
  }

  renderAll() {
    this.renderStats();
    this.renderMapAndSidebar();
    this.renderCampaigns();
    this.renderBeforeAfter();
    this.renderPosterCampaignsList();
    if (this.isCoordAuthenticated) {
      this.renderCoordinatorDashboard();
    }
  }

  renderStats() {
    const stats = this.store.getStats();
    const elCleaned = document.getElementById('statCleaned');
    const elVolunteers = document.getElementById('statVolunteers');
    const elTrees = document.getElementById('statTrees');
    const elCampaigns = document.getElementById('statCampaigns');

    if (elCleaned) elCleaned.textContent = stats.cleanedCount;
    if (elVolunteers) elVolunteers.textContent = stats.volunteersCount;
    if (elTrees) elTrees.textContent = stats.treesCount;
    if (elCampaigns) elCampaigns.textContent = stats.campaignsCount;
  }

  renderMapAndSidebar() {
    const filteredSpots = this.store.getFilteredSpots();
    this.mapEngine.renderSpots(filteredSpots, this.store);

    const listContainer = document.getElementById('spotsListContainer');
    if (!listContainer) return;

    if (filteredSpots.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 24px 10px; color: var(--text-muted); font-size: 13px;">
          <p>لا توجد مواقع مسجلة مطابقة لهذا التصنيف / Aucun site correspondant.</p>
        </div>
      `;
      return;
    }

    const t = this.store.getT();
    listContainer.innerHTML = filteredSpots.map(spot => {
      const title = escapeHTML(this.store.getI18nText(spot.title));
      const neighbourhood = escapeHTML(this.store.getI18nText(spot.neighbourhood));
      const upvotes = Number(spot.upvotes) || 1;
      const reportedAt = escapeHTML(spot.reportedAt || '');
      const safeLat = Number(spot.lat);
      const safeLng = Number(spot.lng);
      
      let badgeHtml = '';
      if (spot.status === 'blackspot') {
        badgeHtml = `<span class="badge badge-danger">${t.legendBlackspot}</span>`;
      } else if (spot.status === 'campaign') {
        badgeHtml = `<span class="badge badge-warning">${t.legendCampaign}</span>`;
      } else {
        badgeHtml = `<span class="badge badge-success">${t.badgeResolved}</span>`;
      }

      return `
        <div class="spot-mini-card" role="button" tabindex="0" onclick="window.app.focusSpotOnMap(${safeLat}, ${safeLng})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); window.app.focusSpotOnMap(${safeLat}, ${safeLng});}">
          <div class="spot-mini-header">
            ${badgeHtml}
            <small class="text-muted" style="font-size: 11px;">${reportedAt}</small>
          </div>
          <h4 class="spot-mini-title">${title}</h4>
          <div class="spot-mini-meta">
            <span>📍 ${neighbourhood}</span>
            ${spot.status === 'blackspot' ? `<span class="spot-vote-badge">👍 ${upvotes}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  focusSpotOnMap(lat, lng) {
    this.switchTab('map');
    if (window.innerWidth <= 992) {
      this.switchMobileMapView('map');
    }
    this.mapEngine.flyToCoordinates(lat, lng, 16);
  }

  renderCampaigns() {
    const container = document.getElementById('campaignsGrid');
    if (!container) return;

    const t = this.store.getT();
    const campaigns = this.store.campaigns;

    if (campaigns.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1.5px dashed var(--border-medium);">
          <div style="font-size: 32px; margin-bottom: 10px;">📅</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--color-pine-900); margin-bottom: 6px;">
            ${this.store.lang === 'ar' ? 'لا توجد مبادرات تطوعية مبرمجة حالياً' : 'Aucune action de volontariat programmée'}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); max-width: 460px; margin: 0 auto 16px auto;">
            ${this.store.lang === 'ar' ? 'كن أول من يطلق مبادرة "تويزة" لتنظيف حي أو تشجير فضاء في بلدية البيض.' : 'Soyez le premier à programmer une opération citoyenne de nettoyage ou de reboisement.'}
          </p>
          <button class="btn btn-primary" onclick="window.app.triggerCreateCampaign(this)">
            + ${this.store.lang === 'ar' ? 'برمجة أول مبادرة تطوعية (خاص بالمنسق)' : 'Programmer une initiative'}
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = campaigns.map(camp => {
      const title = escapeHTML(this.store.getI18nText(camp.title));
      const meetingPoint = escapeHTML(this.store.getI18nText(camp.meetingPoint));
      const organizer = escapeHTML(this.store.getI18nText(camp.organizer));
      const target = escapeHTML(this.store.getI18nText(camp.target));
      const tools = this.store.getI18nArray(camp.toolsNeeded).map(escapeHTML);
      const safeId = escapeHTML(camp.id);
      const safeDate = escapeHTML(camp.date);
      const safeVolunteers = Number(camp.volunteersRegistered) || 0;
      const safeBanner = camp.banner ? encodeURI(camp.banner).replace(/"/g, '&quot;') : '';

      const joinBtnClass = camp.isUserJoined ? 'btn-outline' : 'btn-accent';
      const joinBtnText = camp.isUserJoined ? t.btnJoined : t.btnJoinCampaign;

      return `
        <div class="campaign-card" id="camp-card-${safeId}">
          <div class="camp-banner" style="background-image: url('${safeBanner}')">
            <span class="badge badge-warning">${t.legendCampaign}</span>
          </div>
          <div class="camp-body">
            <h3 class="camp-title">${title}</h3>
            
            <div class="camp-meta-list">
              <div class="camp-meta-row">
                <strong>${t.campaignDate}:</strong>
                <span>${safeDate}</span>
              </div>
              <div class="camp-meta-row">
                <strong>${t.campaignLocation}:</strong>
                <span>${meetingPoint}</span>
              </div>
              <div class="camp-meta-row">
                <strong>${t.campaignOrganizer}:</strong>
                <span>${organizer}</span>
              </div>
              <div class="camp-meta-row">
                <strong>${t.campaignTarget}:</strong>
                <span>${target}</span>
              </div>
              <div class="camp-meta-row" style="flex-direction: column; align-items: stretch;">
                <strong>${t.campaignToolsNeeded}:</strong>
                <div class="tools-tags">
                  ${tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
                </div>
              </div>
            </div>

            <div class="camp-footer">
              <div class="volunteer-count-badge">
                <svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>${safeVolunteers} ${t.campaignVolunteers}</span>
              </div>
              <button class="btn btn-sm ${joinBtnClass}" onclick="window.app.toggleJoinCampaign('${safeId}')">
                ${joinBtnText}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderBeforeAfter() {
    const container = document.getElementById('impactGrid');
    if (!container) return;

    const t = this.store.getT();
    const resolvedSpots = this.store.spots.filter(s => s.status === 'resolved');

    if (resolvedSpots.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1.5px dashed var(--border-medium);">
          <div style="font-size: 32px; margin-bottom: 10px;">🌱</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--color-pine-900); margin-bottom: 6px;">
            ${this.store.lang === 'ar' ? 'سجل الإنجازات بانتظار توثيق أول فضاء مؤهل' : 'Registre des réalisations en attente'}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); max-width: 480px; margin: 0 auto;">
            ${this.store.lang === 'ar' ? 'بمجرد أن تقوم مصالح البلدية أو لجان الأحياء بمعالجة نقطة سوداء، سيتم توثيق الوضع (قبل / بعد) هنا مباشرة.' : 'Dès qu\'un point noir est résolu par les services ou les citoyens, le résultat Avant/Après sera documenté ici.'}
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = resolvedSpots.map(spot => {
      const title = escapeHTML(this.store.getI18nText(spot.title));
      const neighbourhood = escapeHTML(this.store.getI18nText(spot.neighbourhood));
      const description = escapeHTML(this.store.getI18nText(spot.description));
      const cleanedBy = escapeHTML(this.store.getI18nText(spot.cleanedBy));
      const safeId = escapeHTML(spot.id);
      const beforePhoto = spot.beforePhoto || spot.photo ? encodeURI(spot.beforePhoto || spot.photo).replace(/"/g, '&quot;') : '';
      const afterPhoto = spot.afterPhoto ? encodeURI(spot.afterPhoto).replace(/"/g, '&quot;') : '';

      return `
        <div class="before-after-card">
          <div class="ba-slider-container" id="ba-${safeId}">
            <div class="ba-image ba-image-before" style="background-image: url('${beforePhoto}')"></div>
            <div class="ba-image ba-image-after" style="background-image: url('${afterPhoto}')"></div>
            
            <div class="ba-label ba-label-before">${this.store.lang === 'ar' ? 'الوضع السابق' : 'État Initial'}</div>
            <div class="ba-label ba-label-after">${this.store.lang === 'ar' ? 'بعد التدخل' : 'Après Réhabilitation'}</div>
            
            <div class="ba-slider-handle" tabindex="0" role="slider" aria-label="مقارنة الصورة قبل وبعد">
              <div class="ba-handle-circle">
                <svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><polyline points="8 17 3 12 8 7"/><polyline points="16 17 21 12 16 7"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
              </div>
            </div>
          </div>

          <div class="ba-content">
            <span class="badge badge-success mb-2">${t.badgeResolved}</span>
            <h3 style="font-size: 15px; font-weight: 700; margin: 6px 0;">${title}</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">${neighbourhood}</p>
            <p style="font-size: 12.5px; margin-bottom: 10px; color: var(--text-secondary);">${description}</p>
            <div style="background: var(--bg-surface-subtle); padding: 8px 12px; border-radius: var(--radius-xs); font-size: 12px; border: 1px solid var(--border-subtle);">
              <strong style="color: var(--color-pine-900);">${t.cleanedBy}</strong> ${cleanedBy}
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.initBeforeAfterSliders();
  }

  // Render & Update Mosque Printable Poster
  renderPosterCampaignsList() {
    const selectEl = document.getElementById('posterCampSelect');
    if (!selectEl) return;

    const campaigns = this.store.campaigns;
    if (campaigns.length === 0) {
      selectEl.innerHTML = `<option value="">${this.store.lang === 'ar' ? '— يرجى برمجة مبادرة أولاً لتوليد ملصقها —' : '— Aucune initiative disponible pour l\'affiche —'}</option>`;
      const elTitle = document.getElementById('posterPreviewTitle');
      const elDate = document.getElementById('posterPreviewDate');
      const elMeeting = document.getElementById('posterPreviewMeeting');
      const elOrg = document.getElementById('posterPreviewOrg');
      const elTools = document.getElementById('posterPreviewTools');

      if (elTitle) elTitle.textContent = this.store.lang === 'ar' ? 'مبادرة تطوعية لتنظيف وتشجير الحي' : 'Initiative citoyenne de salubrité et reboisement';
      if (elDate) elDate.textContent = this.store.lang === 'ar' ? 'موعد الانطلاق يحدد عبر المنصة' : 'Date à définir';
      if (elMeeting) elMeeting.textContent = this.store.lang === 'ar' ? 'ساحة المسجد أو الحي المحدد' : 'Lieu de rassemblement';
      if (elOrg) elOrg.textContent = this.store.lang === 'ar' ? 'لجنة الحي وشباب المسجد بالتنسيق مع بلدية البيض' : 'Comité de quartier & Citoyens';
      if (elTools) elTools.textContent = this.store.lang === 'ar' ? 'أكياس جمع، قفازات، مجارف' : 'Sacs, gants, pelles';
      return;
    }

    selectEl.innerHTML = campaigns.map(camp => {
      const safeId = escapeHTML(camp.id);
      const safeTitle = escapeHTML(this.store.getI18nText(camp.title));
      const safeDate = escapeHTML(camp.date);
      return `<option value="${safeId}">${safeTitle} (${safeDate})</option>`;
    }).join('');

    this.updatePosterPreview(campaigns[0].id);
  }

  updatePosterPreview(campId) {
    const camp = this.store.campaigns.find(c => c.id === campId);
    if (!camp) return;

    const elTitle = document.getElementById('posterPreviewTitle');
    const elDate = document.getElementById('posterPreviewDate');
    const elMeeting = document.getElementById('posterPreviewMeeting');
    const elOrg = document.getElementById('posterPreviewOrg');
    const elTools = document.getElementById('posterPreviewTools');

    if (elTitle) elTitle.textContent = this.store.getI18nText(camp.title);
    if (elDate) elDate.textContent = camp.date;
    if (elMeeting) elMeeting.textContent = this.store.getI18nText(camp.meetingPoint);
    if (elOrg) elOrg.textContent = this.store.getI18nText(camp.organizer);
    if (elTools) elTools.textContent = this.store.getI18nArray(camp.toolsNeeded).join('، ');
  }

  bindPosterGeneratorEvents() {
    const selectEl = document.getElementById('posterCampSelect');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        this.updatePosterPreview(e.target.value);
      });
    }

    const btnPrint = document.getElementById('btnTriggerPrintPoster');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  initBeforeAfterSliders() {
    document.querySelectorAll('.ba-slider-container').forEach(container => {
      const afterImg = container.querySelector('.ba-image-after');
      const handle = container.querySelector('.ba-slider-handle');
      let isDragging = false;

      const updateSlider = (clientX) => {
        const rect = container.getBoundingClientRect();
        let posX = clientX - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;

        const percentage = (posX / rect.width) * 100;
        
        if (document.documentElement.getAttribute('dir') === 'rtl') {
          afterImg.style.width = `${100 - percentage}%`;
        } else {
          afterImg.style.width = `${percentage}%`;
        }
        handle.style.left = `${percentage}%`;
      };

      container.addEventListener('pointerdown', (e) => {
        isDragging = true;
        container.setPointerCapture(e.pointerId);
        updateSlider(e.clientX);
      });

      container.addEventListener('pointermove', (e) => {
        if (isDragging) {
          updateSlider(e.clientX);
        }
      });

      const stopDrag = (e) => {
        if (isDragging) {
          isDragging = false;
          try { container.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      };

      container.addEventListener('pointerup', stopDrag);
      container.addEventListener('pointercancel', stopDrag);
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.nav-link, .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });

    if (tabName === 'map') {
      this.mapEngine.invalidateSize();
    }
  }

  switchMobileMapView(view) {
    this.mobileMapTabState = view;
    const mapWrapper = document.getElementById('mapWrapperBlock');
    const sidebar = document.getElementById('mapSidebarBlock');
    const btnMap = document.getElementById('btnShowMapMobile');
    const btnList = document.getElementById('btnShowListMobile');

    if (!mapWrapper || !sidebar) return;

    if (view === 'map') {
      mapWrapper.classList.remove('mobile-hidden');
      sidebar.classList.add('mobile-hidden');
      if (btnMap) btnMap.classList.add('active');
      if (btnList) btnList.classList.remove('active');
      this.mapEngine.invalidateSize();
    } else {
      mapWrapper.classList.add('mobile-hidden');
      sidebar.classList.remove('mobile-hidden');
      if (btnMap) btnMap.classList.remove('active');
      if (btnList) btnList.classList.add('active');
    }
  }

  toggleJoinCampaign(campId) {
    const isJoined = this.store.toggleJoinCampaign(campId);
    const t = this.store.getT();
    this.showToast(isJoined ? t.toastJoinSuccess : 'تم إلغاء التسجيل.');
  }

  upvoteSpot(spotId) {
    const success = this.store.upvoteSpot(spotId);
    const t = this.store.getT();
    if (success) {
      this.showToast(t.toastUpvoteSuccess);
    } else {
      this.showToast(t.btnConfirmedAlready);
    }
  }

  // Real-time proximity checking whenever coordinates are picked
  checkProximity(lat, lng) {
    const nearby = this.store.findNearbyActiveSpot(lat, lng, 85);
    const alertBox = document.getElementById('proximityAlertBox');
    const alertMsg = document.getElementById('proximityAlertMsg');
    const btnConfirm = document.getElementById('btnConfirmExistingSpot');

    if (!alertBox) return;

    if (nearby && nearby.spot) {
      this.activeNearbySpot = nearby.spot;
      alertBox.classList.add('active');
      const spotTitle = escapeHTML(this.store.getI18nText(nearby.spot.title));
      const dist = Number(nearby.distance) || 0;
      const votes = Number(nearby.spot.upvotes) || 1;

      if (this.store.lang === 'ar') {
        alertMsg.innerHTML = `يوجد بلاغ قائم بالفعل على بعد <strong>${dist} متراً</strong>: «${spotTitle}» (مؤكد من طرف <strong>${votes} مواطناً</strong>). تفادياً لتكرار البيانات، يمكنك تأكيده مباشرة لدعم معالجته.`;
      } else {
        alertMsg.innerHTML = `Un signalement actif existe déjà à <strong>${dist} mètres</strong> : «${spotTitle}» (appuyé par <strong>${votes} citoyens</strong>). Pour éviter les doublons, vous pouvez appuyer ce signalement existant.`;
      }

      if (btnConfirm) {
        btnConfirm.textContent = nearby.spot.isUserUpvoted ? `✓ ${this.store.getT().btnConfirmedAlready}` : `👍 ${this.store.getT().btnConfirmExisting}`;
      }
    } else {
      this.activeNearbySpot = null;
      alertBox.classList.remove('active');
    }
  }

  navigateToCampaign(campId) {
    this.switchTab('campaigns');
    setTimeout(() => {
      const el = document.getElementById(`camp-card-${campId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.borderColor = 'var(--color-clay-500)';
        setTimeout(() => { el.style.borderColor = ''; }, 2000);
      }
    }, 150);
  }

  triggerCreateCampaign(triggerElement) {
    if (!this.isCoordAuthenticated) {
      this.openModal('coordinatorModal', triggerElement);
      const pinError = document.getElementById('coordPinError');
      if (pinError) {
        pinError.textContent = '';
        pinError.classList.remove('active');
      }
      document.getElementById('coordPinScreen').style.display = 'block';
      document.getElementById('coordDashboardScreen').style.display = 'none';
      this.pendingActionAfterAuth = () => {
        this.openModal('newCampaignModal');
      };
      this.showToast(this.store.lang === 'ar' ? 'برمجة المبادرات مخصصة للمنسق الميداني والجمعيات المعتمدة. يرجى إدخال الرمز السري للمتابعة.' : 'La programmation est réservée au coordinateur. Veuillez saisir le code PIN.');
      setTimeout(() => {
        const pinInput = document.getElementById('coordPinInput');
        if (pinInput) pinInput.focus();
      }, 60);
    } else {
      this.openModal('newCampaignModal', triggerElement);
    }
  }

  openCreateCampaignFromSpot(spotId) {
    const spot = this.store.spots.find(s => s.id === spotId);
    if (!spot) return;

    const populateForm = () => {
      this.openModal('newCampaignModal');
      const titleField = document.getElementById('campInputTitle');
      const meetingField = document.getElementById('campInputMeeting');
      
      if (titleField) {
        titleField.value = `مبادرة تنظيف وتأهيل: ${this.store.getI18nText(spot.title)}`;
      }
      if (meetingField) {
        meetingField.value = this.store.getI18nText(spot.neighbourhood);
      }
      
      const campForm = document.getElementById('newCampaignForm');
      if (campForm) {
        campForm.dataset.lat = spot.lat;
        campForm.dataset.lng = spot.lng;
      }
    };

    if (!this.isCoordAuthenticated) {
      this.openModal('coordinatorModal');
      const pinError = document.getElementById('coordPinError');
      if (pinError) {
        pinError.textContent = '';
        pinError.classList.remove('active');
      }
      document.getElementById('coordPinScreen').style.display = 'block';
      document.getElementById('coordDashboardScreen').style.display = 'none';
      this.pendingActionAfterAuth = populateForm;
      this.showToast(this.store.lang === 'ar' ? 'برمجة المبادرات مخصصة للمنسق الميداني والجمعيات المعتمدة. يرجى إدخال الرمز السري للمتابعة.' : 'La programmation est réservée au coordinateur. Veuillez saisir le code PIN.');
      setTimeout(() => {
        const pinInput = document.getElementById('coordPinInput');
        if (pinInput) pinInput.focus();
      }, 60);
    } else {
      populateForm();
    }
  }

  showBeforeAfterModal(spotId) {
    this.switchTab('impact');
    setTimeout(() => {
      const el = document.getElementById(`ba-${spotId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }

  openModal(modalId, triggerElement) {
    this.lastFocusedElement = triggerElement || document.activeElement;
    this.activeModalId = modalId;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const alertBox = document.getElementById('proximityAlertBox');
      if (alertBox) alertBox.classList.remove('active');
      this.activeNearbySpot = null;

      // Focus management: focus the first interactive element or close button
      setTimeout(() => {
        const focusable = modal.querySelector('input:not([type="hidden"]), select, textarea, button:not(.modal-close-btn), .modal-close-btn');
        if (focusable) focusable.focus();
      }, 50);
    }
  }

  closeModal(modalId) {
    const idToClose = modalId || this.activeModalId;
    if (!idToClose) return;

    const modal = document.getElementById(idToClose);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      this.activeModalId = null;

      // Restore focus to triggering element (WCAG 2.4.3 Focus Order)
      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
        this.lastFocusedElement.focus();
      }
    }
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" style="color: #a7f3d0;"><path d="M20 6 9 17l-5-5"/></svg>
      <span>${escapeHTML(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // =========================================================
  // SINGLE COORDINATOR PORTAL LOGIC & EVENT BINDINGS
  // =========================================================
  bindCoordinatorEvents() {
    const btnOpenCoord = document.getElementById('btnOpenCoordinatorModal');
    if (btnOpenCoord) {
      btnOpenCoord.addEventListener('click', (e) => {
        this.openModal('coordinatorModal', e.currentTarget);
        const pinError = document.getElementById('coordPinError');
        if (pinError) {
          pinError.textContent = '';
          pinError.classList.remove('active');
        }

        if (!this.isCoordAuthenticated) {
          document.getElementById('coordPinScreen').style.display = 'block';
          document.getElementById('coordDashboardScreen').style.display = 'none';
          setTimeout(() => {
            const pinInput = document.getElementById('coordPinInput');
            if (pinInput) pinInput.focus();
          }, 60);
        } else {
          document.getElementById('coordPinScreen').style.display = 'none';
          document.getElementById('coordDashboardScreen').style.display = 'block';
          this.renderCoordinatorDashboard();
        }
      });
    }

    // PIN check
    const btnCheckPin = document.getElementById('btnCheckCoordPin');
    const pinInput = document.getElementById('coordPinInput');
    const pinError = document.getElementById('coordPinError');

    const verifyPin = () => {
      const pin = pinInput.value.trim();
      if (pin === '2026' || pin === '1234') {
        this.isCoordAuthenticated = true;
        if (pinError) {
          pinError.textContent = '';
          pinError.classList.remove('active');
        }

        if (typeof this.pendingActionAfterAuth === 'function') {
          const action = this.pendingActionAfterAuth;
          this.pendingActionAfterAuth = null;
          this.closeModal('coordinatorModal');
          action();
          this.showToast(this.store.lang === 'ar' ? 'تم التحقق بنجاح. يمكنك الآن برمجة المبادرة التطوعية.' : 'Authentification réussie. Vous pouvez programmer l\'initiative.');
          return;
        }

        document.getElementById('coordPinScreen').style.display = 'none';
        document.getElementById('coordDashboardScreen').style.display = 'block';
        this.renderCoordinatorDashboard();
        this.showToast(this.store.lang === 'ar' ? 'مرحباً بك في لوحة المنسق الميداني لبلدية البيض.' : 'Bienvenue dans le portail coordinateur.');
      } else {
        const errorMsg = this.store.lang === 'ar' ? 'الرمز السري غير صحيح. يرجى إعادة المحاولة.' : 'Code PIN incorrect. Veuillez réessayer.';
        if (pinError) {
          pinError.textContent = errorMsg;
          pinError.classList.remove('active');
          void pinError.offsetWidth; // Trigger reflow for shake animation
          pinError.classList.add('active');
        }
        pinInput.focus();
        pinInput.select();
      }
    };

    if (btnCheckPin) btnCheckPin.addEventListener('click', verifyPin);
    if (pinInput) {
      pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') verifyPin();
      });
    }

    // Sub-tab switcher
    document.querySelectorAll('.coord-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.coord-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.dataset.coordTab;
        document.querySelectorAll('.coord-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById(`coordPane-${targetTab}`);
        if (pane) pane.classList.add('active');

        if (targetTab === 'report') {
          this.updateMunicipalReportText();
        }
      });
    });

    // After-photo file uploader with Compression
    const afterFileInput = document.getElementById('coordAfterPhotoInput');
    const afterPhotoBox = document.getElementById('coordAfterPhotoBox');
    const afterPhotoPreview = document.getElementById('coordAfterPhotoPreview');
    const afterPhotoPrompt = document.getElementById('coordAfterPhotoPrompt');

    if (afterPhotoBox && afterFileInput) {
      afterPhotoBox.addEventListener('click', () => afterFileInput.click());
      afterPhotoBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          afterFileInput.click();
        }
      });

      afterFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            this.coordAfterPhotoData = await window.ImageCompressor.compress(file, 1200, 0.72);
            if (afterPhotoPreview) {
              afterPhotoPreview.src = this.coordAfterPhotoData;
              afterPhotoPreview.style.display = 'block';
              if (afterPhotoPrompt) afterPhotoPrompt.style.display = 'none';
            }
          } catch (err) {
            console.warn('Compression error, using standard reader:', err);
            const reader = new FileReader();
            reader.onload = (ev) => {
              this.coordAfterPhotoData = ev.target.result;
              if (afterPhotoPreview) {
                afterPhotoPreview.src = this.coordAfterPhotoData;
                afterPhotoPreview.style.display = 'block';
                if (afterPhotoPrompt) afterPhotoPrompt.style.display = 'none';
              }
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }

    // Submit Resolution Form with Loading State
    const resolveForm = document.getElementById('coordResolveForm');
    const btnSubmitResolve = document.getElementById('btnSubmitResolveForm');
    if (resolveForm) {
      resolveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const spotId = document.getElementById('resolveSpotSelect').value;
        const cleanedBy = document.getElementById('resolveCleanedBy').value.trim();

        if (!spotId) {
          this.showToast(this.store.lang === 'ar' ? 'يرجى اختيار النقطة المطلوب إغلاقها.' : 'Veuillez sélectionner le point.');
          return;
        }

        if (btnSubmitResolve) {
          btnSubmitResolve.disabled = true;
          btnSubmitResolve.setAttribute('aria-busy', 'true');
          btnSubmitResolve.innerHTML = `<span class="btn-loading-spinner"></span> ${this.store.lang === 'ar' ? 'جاري التوثيق...' : 'Validation...'}`;
        }

        setTimeout(() => {
          const success = this.store.resolveSpot(
            spotId,
            this.coordAfterPhotoData || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
            cleanedBy
          );

          if (btnSubmitResolve) {
            btnSubmitResolve.disabled = false;
            btnSubmitResolve.removeAttribute('aria-busy');
            btnSubmitResolve.innerHTML = `<span>${this.store.getT().btnSubmitResolution || 'اعتماد وتوثيق الفضاء'}</span>`;
          }

          if (success) {
            resolveForm.reset();
            this.coordAfterPhotoData = null;
            if (afterPhotoPreview) afterPhotoPreview.style.display = 'none';
            if (afterPhotoPrompt) afterPhotoPrompt.style.display = 'inline';
            this.closeModal('coordinatorModal');
            this.switchTab('impact');
            this.showToast(this.store.getT().toastSpotResolved);
          }
        }, 350);
      });
    }

    // 1-Click Copy Municipal Report
    const btnCopyReport = document.getElementById('btnCopyMunicipalReport');
    if (btnCopyReport) {
      btnCopyReport.addEventListener('click', () => {
        const textarea = document.getElementById('municipalReportTextArea');
        if (textarea) {
          textarea.select();
          navigator.clipboard.writeText(textarea.value).then(() => {
            this.showToast(this.store.getT().toastReportCopied);
          }).catch(() => {
            document.execCommand('copy');
            this.showToast(this.store.getT().toastReportCopied);
          });
        }
      });
    }
  }

  renderCoordinatorDashboard() {
    const t = this.store.getT();
    const activeBlackspots = this.store.spots.filter(s => s.status === 'blackspot');

    // Render Triage List
    const triageContainer = document.getElementById('coordSpotsList');
    if (triageContainer) {
      if (activeBlackspots.length === 0) {
        triageContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
            ${t.coordNoSpots}
          </div>
        `;
      } else {
        triageContainer.innerHTML = activeBlackspots.map(spot => {
          const title = escapeHTML(this.store.getI18nText(spot.title));
          const neighbourhood = escapeHTML(this.store.getI18nText(spot.neighbourhood));
          const safeId = escapeHTML(spot.id);
          const upvotes = Number(spot.upvotes) || 1;

          return `
            <div class="coord-spot-item">
              <div class="coord-spot-item-header">
                <strong>📍 ${neighbourhood}</strong>
                <span class="spot-vote-badge">👍 ${upvotes} ${t.upvotesCount}</span>
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin: 2px 0;">${title}</p>
              <div class="coord-spot-actions">
                <button class="btn btn-sm btn-primary" onclick="window.app.triggerCoordResolveModal('${safeId}')">
                  ✓ ${t.btnResolveSpotTrigger}
                </button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openCreateCampaignFromSpot('${safeId}')">
                  📅 برمجة حملة
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.app.coordinatorDeleteSpot('${safeId}')">
                  🗑️ ${t.btnDeleteSpot}
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Populate Resolve Select Dropdown
    const selectEl = document.getElementById('resolveSpotSelect');
    if (selectEl) {
      selectEl.innerHTML = activeBlackspots.map(spot => {
        const safeId = escapeHTML(spot.id);
        const title = escapeHTML(this.store.getI18nText(spot.title));
        const neighbourhood = escapeHTML(this.store.getI18nText(spot.neighbourhood));
        return `<option value="${safeId}">${neighbourhood} - ${title.substring(0, 50)}...</option>`;
      }).join('');
    }

    this.updateMunicipalReportText();
  }

  triggerCoordResolveModal(spotId) {
    const paneResolveBtn = document.querySelector('[data-coord-tab="resolve"]');
    if (paneResolveBtn) paneResolveBtn.click();

    const selectEl = document.getElementById('resolveSpotSelect');
    if (selectEl) selectEl.value = spotId;
  }

  coordinatorDeleteSpot(spotId) {
    if (confirm(this.store.lang === 'ar' ? 'هل أنت متأكد من حذف هذا البلاغ؟' : 'Confirmer la suppression de ce signalement ?')) {
      this.store.deleteSpot(spotId);
      this.renderCoordinatorDashboard();
      this.showToast(this.store.getT().toastSpotDeleted);
    }
  }

  updateMunicipalReportText() {
    const textarea = document.getElementById('municipalReportTextArea');
    if (textarea) {
      textarea.value = this.store.generateMunicipalReport();
    }
  }

  // Structured Reporting Form Bindings
  bindStructuredFormEvents() {
    // 1. Radio Cards for Volume (Click & Keyboard Navigation)
    const volumeCards = Array.from(document.querySelectorAll('#volumeCardsGroup .radio-card'));
    const selectVolumeCard = (card) => {
      volumeCards.forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      card.focus();
      const volInput = document.getElementById('reportVolume');
      if (volInput) volInput.value = card.dataset.volume;
    };

    volumeCards.forEach((card, index) => {
      card.addEventListener('click', () => selectVolumeCard(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          selectVolumeCard(card);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (index + 1) % volumeCards.length;
          selectVolumeCard(volumeCards[nextIndex]);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (index - 1 + volumeCards.length) % volumeCards.length;
          selectVolumeCard(volumeCards[prevIndex]);
        }
      });
    });

    // 2. Multi-select Material Chips with aria-pressed
    document.querySelectorAll('#materialsChipsGroup .chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const isSelected = chip.classList.toggle('selected');
        chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });
    });

    // 3. Accessibility Pills (Click & Keyboard Navigation)
    const accessPills = Array.from(document.querySelectorAll('#accessPillGroup .access-pill'));
    const selectAccessPill = (pill) => {
      accessPills.forEach(p => {
        p.classList.remove('selected');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('selected');
      pill.setAttribute('aria-checked', 'true');
      pill.focus();
      const accessInput = document.getElementById('reportAccess');
      if (accessInput) accessInput.value = pill.dataset.access;
    };

    accessPills.forEach((pill, index) => {
      pill.addEventListener('click', () => selectAccessPill(pill));
      pill.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          selectAccessPill(pill);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (index + 1) % accessPills.length;
          selectAccessPill(accessPills[nextIndex]);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (index - 1 + accessPills.length) % accessPills.length;
          selectAccessPill(accessPills[prevIndex]);
        }
      });
    });

    // 4. Confirm Existing Spot button click in Proximity alert
    const btnConfirmExisting = document.getElementById('btnConfirmExistingSpot');
    if (btnConfirmExisting) {
      btnConfirmExisting.addEventListener('click', () => {
        if (this.activeNearbySpot) {
          this.upvoteSpot(this.activeNearbySpot.id);
          this.closeModal('reportModal');
          this.switchTab('map');
          this.mapEngine.flyToCoordinates(this.activeNearbySpot.lat, this.activeNearbySpot.lng, 16);
        }
      });
    }

    // 5. Auto GPS Trigger in Modal
    const btnAutoGPS = document.getElementById('btnTriggerAutoGPS');
    if (btnAutoGPS) {
      btnAutoGPS.addEventListener('click', () => {
        if (!navigator.geolocation) {
          this.showToast('خاصية تحديد الموقع غير مدعومة');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            document.getElementById('reportLat').value = latitude.toFixed(6);
            document.getElementById('reportLng').value = longitude.toFixed(6);
            const statusLabel = document.getElementById('locStatusLabel');
            if (statusLabel) {
              statusLabel.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS ✓)`;
              statusLabel.parentElement.classList.add('active');
            }
            this.showToast('تم التقاط إحداثيات موقعك التلقائي بنجاح.');
            this.checkProximity(latitude, longitude);
          },
          (err) => {
            console.warn(err);
            document.getElementById('reportLat').value = '33.6835';
            document.getElementById('reportLng').value = '1.0163';
            const statusLabel = document.getElementById('locStatusLabel');
            if (statusLabel) statusLabel.textContent = 'وسط مدينة البيض (33.6835, 1.0163)';
            this.showToast('تم تحديد مركز بلدية البيض تلقائياً.');
            this.checkProximity(33.6835, 1.0163);
          }
        );
      });
    }

    // 6. Submit Structured Report with Compressed Image & Loading State
    const reportForm = document.getElementById('reportForm');
    const btnSubmitReport = document.getElementById('btnSubmitReportForm');

    if (reportForm) {
      reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const neighbourhood = document.getElementById('reportNeighbourhood').value.trim();
        const volume = document.getElementById('reportVolume').value || 'light';
        const access = document.getElementById('reportAccess').value || 'paved';
        const lat = parseFloat(document.getElementById('reportLat').value) || 33.6835;
        const lng = parseFloat(document.getElementById('reportLng').value) || 1.0163;
        const notes = document.getElementById('reportNotes').value.trim();

        const selectedMaterials = [];
        document.querySelectorAll('#materialsChipsGroup .chip-btn.selected').forEach(chip => {
          selectedMaterials.push(chip.dataset.mat);
        });

        if (!neighbourhood) {
          this.showToast(this.store.lang === 'ar' ? 'يرجى كتابة اسم الحي أو المعلم.' : 'Veuillez saisir le quartier.');
          return;
        }

        if (btnSubmitReport) {
          btnSubmitReport.disabled = true;
          btnSubmitReport.setAttribute('aria-busy', 'true');
          btnSubmitReport.innerHTML = `<span class="btn-loading-spinner"></span> ${this.store.lang === 'ar' ? 'جاري تسجيل البلاغ...' : 'Enregistrement...'}`;
        }

        let volumeTitleAr = 'حجم محدود';
        let volumeTitleFr = 'Volume limité';
        if (volume === 'medium') { volumeTitleAr = 'حجم متوسط (شاحنة 3.5T)'; volumeTitleFr = 'Volume moyen (3.5T)'; }
        if (volume === 'heavy') { volumeTitleAr = 'حجم ضخم (يستلزم جرافة وآليات)'; volumeTitleFr = 'Volume majeur (Engins lourds)'; }

        const titleAr = `تراكم نفايات (${volumeTitleAr}) - ${neighbourhood}`;
        const titleFr = `Point noir (${volumeTitleFr}) - ${neighbourhood}`;

        const descAr = `الموقع: ${neighbourhood}. نوع التدخل: ${volumeTitleAr}. المسلك: ${access === 'paved' ? 'معبد للشاحنات' : 'ضيق/وعر'}.${notes ? ' ملاحظات: ' + notes : ''}`;
        const descFr = `Secteur: ${neighbourhood}. Moyens: ${volumeTitleFr}. Accès: ${access === 'paved' ? 'Carrossable' : 'Difficile'}.${notes ? ' Notes: ' + notes : ''}`;

        setTimeout(() => {
          this.store.addBlackspot({
            title: titleAr,
            category: 'waste',
            neighbourhood: neighbourhood,
            description: descAr,
            urgency: volume === 'heavy' ? 'high' : (volume === 'medium' ? 'medium' : 'low'),
            lat: lat,
            lng: lng,
            volume: volume,
            materials: selectedMaterials,
            accessibility: access,
            photo: this.uploadedPhotoData || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80'
          });

          if (btnSubmitReport) {
            btnSubmitReport.disabled = false;
            btnSubmitReport.removeAttribute('aria-busy');
            btnSubmitReport.innerHTML = `<span>${this.store.getT().btnSubmitReport || 'اعتماد وتسجيل البلاغ فوراً'}</span>`;
          }

          reportForm.reset();
          this.uploadedPhotoData = null;
          const photoPreview = document.getElementById('photoPreviewImg');
          const photoPrompt = document.getElementById('photoPromptText');
          if (photoPreview) photoPreview.style.display = 'none';
          if (photoPrompt) photoPrompt.style.display = 'inline';
          
          this.closeModal('reportModal');
          this.switchTab('map');
          this.mapEngine.flyToCoordinates(lat, lng, 16);
          this.showToast(this.store.getT().toastReportSuccess);
        }, 350);
      });
    }
  }

  bindEvents() {
    // Nav tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(btn.dataset.tab);
      });
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.setLanguage(btn.dataset.lang);
      });
    });

    // Map filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.store.setFilter(btn.dataset.filter);
      });
    });

    // Mobile View Switcher
    const btnShowMapMobile = document.getElementById('btnShowMapMobile');
    const btnShowListMobile = document.getElementById('btnShowListMobile');
    if (btnShowMapMobile) {
      btnShowMapMobile.addEventListener('click', () => this.switchMobileMapView('map'));
    }
    if (btnShowListMobile) {
      btnShowListMobile.addEventListener('click', () => this.switchMobileMapView('list'));
    }

    // Geolocation top button
    const geoBtn = document.getElementById('btnLocateUser');
    if (geoBtn) {
      geoBtn.addEventListener('click', () => {
        this.mapEngine.locateUser();
      });
    }

    // Open Report Modals
    document.querySelectorAll('.btn-open-report').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.openModal('reportModal', e.currentTarget);
      });
    });

    // Open New Campaign Modal (Restricted to Coordinator / Authorized Associations)
    const newCampBtn = document.getElementById('btnOpenNewCampaign');
    if (newCampBtn) {
      newCampBtn.addEventListener('click', (e) => {
        this.triggerCreateCampaign(e.currentTarget);
      });
    }

    // Close Modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) this.closeModal(modal.id);
      });
    });

    // Backdrop click & Escape
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    // Focus Trap & Escape Key Listener (WCAG 2.4.3 & 2.1.2)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
          this.closeModal(activeModal.id);
        }
      } else if (e.key === 'Tab') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
          const focusables = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
    });

    // Photo Input Handling with Auto-Compression & Keyboard Trigger
    const fileInput = document.getElementById('reportPhotoInput');
    const photoBox = document.getElementById('photoUploaderBox');
    const photoPreview = document.getElementById('photoPreviewImg');
    const photoPrompt = document.getElementById('photoPromptText');

    if (photoBox && fileInput) {
      photoBox.addEventListener('click', () => fileInput.click());
      photoBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput.click();
        }
      });

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            this.uploadedPhotoData = await window.ImageCompressor.compress(file, 1200, 0.72);
            if (photoPreview) {
              photoPreview.src = this.uploadedPhotoData;
              photoPreview.style.display = 'block';
              if (photoPrompt) photoPrompt.style.display = 'none';
            }
          } catch (err) {
            console.warn('Fallback standard reader for upload:', err);
            const reader = new FileReader();
            reader.onload = (event) => {
              this.uploadedPhotoData = event.target.result;
              if (photoPreview) {
                photoPreview.src = this.uploadedPhotoData;
                photoPreview.style.display = 'block';
                if (photoPrompt) photoPrompt.style.display = 'none';
              }
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }

    // Pick Coordinates on Map
    const btnPickCoords = document.getElementById('btnPickCoords');
    if (btnPickCoords) {
      btnPickCoords.addEventListener('click', () => {
        this.closeModal('reportModal');
        this.switchTab('map');
        if (window.innerWidth <= 992) this.switchMobileMapView('map');
        this.showToast(this.store.lang === 'ar' ? 'انقر على الخارطة لتحديد الموقع الدقيق' : 'Cliquez sur la carte pour pointer l\'emplacement');
        
        this.mapEngine.enableLocationPicker((lat, lng) => {
          this.mapEngine.disableLocationPicker();
          this.openModal('reportModal');
          document.getElementById('reportLat').value = lat.toFixed(6);
          document.getElementById('reportLng').value = lng.toFixed(6);
          const statusLabel = document.getElementById('locStatusLabel');
          if (statusLabel) {
            statusLabel.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)} (خارطة ✓)`;
            statusLabel.parentElement.classList.add('active');
          }
          this.showToast(this.store.lang === 'ar' ? 'تم اعتماد الإحداثيات.' : 'Coordonnées validées.');
          this.checkProximity(lat, lng);
        });
      });
    }

    // Campaign form submit with Loading State
    const newCampForm = document.getElementById('newCampaignForm');
    const btnSubmitCampaign = document.getElementById('btnSubmitCampaignForm');

    if (newCampForm) {
      newCampForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('campInputTitle').value.trim();
        const type = document.getElementById('campInputType').value;
        const date = document.getElementById('campInputDate').value.trim();
        const meetingPoint = document.getElementById('campInputMeeting').value.trim();
        const organizer = document.getElementById('campInputOrg').value.trim();
        const tools = document.getElementById('campInputTools').value.trim();
        const lat = parseFloat(newCampForm.dataset.lat) || (33.6835 + (Math.random() - 0.5) * 0.015);
        const lng = parseFloat(newCampForm.dataset.lng) || (1.0163 + (Math.random() - 0.5) * 0.015);

        if (!title || !date || !meetingPoint) {
          this.showToast(this.store.lang === 'ar' ? 'يرجى استيفاء كافة بيانات المبادرة المطلوبة.' : 'Veuillez remplir tous les champs obligatoires.');
          return;
        }

        if (btnSubmitCampaign) {
          btnSubmitCampaign.disabled = true;
          btnSubmitCampaign.setAttribute('aria-busy', 'true');
          btnSubmitCampaign.innerHTML = `<span class="btn-loading-spinner"></span> ${this.store.lang === 'ar' ? 'جاري نشر المبادرة...' : 'Publication...'}`;
        }

        setTimeout(() => {
          this.store.addCampaign({
            title,
            type,
            date,
            meetingPoint,
            organizer: organizer || (this.store.lang === 'ar' ? 'فعاليات المجتمع المدني بمدينة البيض' : 'Acteurs de la société civile d\'El Bayadh'),
            tools,
            lat,
            lng
          });

          if (btnSubmitCampaign) {
            btnSubmitCampaign.disabled = false;
            btnSubmitCampaign.removeAttribute('aria-busy');
            btnSubmitCampaign.innerHTML = `<span>${this.store.getT().btnSubmitCampaign || 'اعتماد ونشر المبادرة للعموم'}</span>`;
          }

          newCampForm.reset();
          delete newCampForm.dataset.lat;
          delete newCampForm.dataset.lng;

          this.closeModal('newCampaignModal');
          this.switchTab('campaigns');
          this.showToast(this.store.getT().toastCampaignSuccess);
        }, 350);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new BayedhaApp();
});
