// app.js - Main Application Orchestrator with Single Coordinator, Image Compressor & Mosque Poster Generator
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
      const title = this.store.getI18nText(spot.title);
      const neighbourhood = this.store.getI18nText(spot.neighbourhood);
      const upvotes = spot.upvotes || 1;
      
      let badgeHtml = '';
      if (spot.status === 'blackspot') {
        badgeHtml = `<span class="badge badge-danger">${t.legendBlackspot}</span>`;
      } else if (spot.status === 'campaign') {
        badgeHtml = `<span class="badge badge-warning">${t.legendCampaign}</span>`;
      } else {
        badgeHtml = `<span class="badge badge-success">${t.badgeResolved}</span>`;
      }

      return `
        <div class="spot-mini-card" onclick="window.app.focusSpotOnMap(${spot.lat}, ${spot.lng})">
          <div class="spot-mini-header">
            ${badgeHtml}
            <small class="text-muted" style="font-size: 11px;">${spot.reportedAt || ''}</small>
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
          <button class="btn btn-primary" onclick="window.app.openModal('newCampaignModal')">
            + ${this.store.lang === 'ar' ? 'برمجة أول مبادرة تطوعية' : 'Programmer une initiative'}
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = campaigns.map(camp => {
      const title = this.store.getI18nText(camp.title);
      const meetingPoint = this.store.getI18nText(camp.meetingPoint);
      const organizer = this.store.getI18nText(camp.organizer);
      const target = this.store.getI18nText(camp.target);
      const tools = this.store.getI18nArray(camp.toolsNeeded);

      const joinBtnClass = camp.isUserJoined ? 'btn-outline' : 'btn-accent';
      const joinBtnText = camp.isUserJoined ? t.btnJoined : t.btnJoinCampaign;

      return `
        <div class="campaign-card" id="camp-card-${camp.id}">
          <div class="camp-banner" style="background-image: url('${camp.banner}')">
            <span class="badge badge-warning">${t.legendCampaign}</span>
          </div>
          <div class="camp-body">
            <h3 class="camp-title">${title}</h3>
            
            <div class="camp-meta-list">
              <div class="camp-meta-row">
                <strong>${t.campaignDate}:</strong>
                <span>${camp.date}</span>
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
                <span>${camp.volunteersRegistered} ${t.campaignVolunteers}</span>
              </div>
              <button class="btn btn-sm ${joinBtnClass}" onclick="window.app.toggleJoinCampaign('${camp.id}')">
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
      const title = this.store.getI18nText(spot.title);
      const neighbourhood = this.store.getI18nText(spot.neighbourhood);
      const description = this.store.getI18nText(spot.description);
      const cleanedBy = this.store.getI18nText(spot.cleanedBy);

      return `
        <div class="before-after-card">
          <div class="ba-slider-container" id="ba-${spot.id}">
            <div class="ba-image ba-image-before" style="background-image: url('${spot.beforePhoto || spot.photo}')"></div>
            <div class="ba-image ba-image-after" style="background-image: url('${spot.afterPhoto}')"></div>
            
            <div class="ba-label ba-label-before">${this.store.lang === 'ar' ? 'الوضع السابق' : 'État Initial'}</div>
            <div class="ba-label ba-label-after">${this.store.lang === 'ar' ? 'بعد التدخل' : 'Après Réhabilitation'}</div>
            
            <div class="ba-slider-handle">
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
      return `<option value="${camp.id}">${this.store.getI18nText(camp.title)} (${camp.date})</option>`;
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
      const spotTitle = this.store.getI18nText(nearby.spot.title);
      const dist = nearby.distance;
      const votes = nearby.spot.upvotes || 1;

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

  openCreateCampaignFromSpot(spotId) {
    const spot = this.store.spots.find(s => s.id === spotId);
    if (!spot) return;

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

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const alertBox = document.getElementById('proximityAlertBox');
      if (alertBox) alertBox.classList.remove('active');
      this.activeNearbySpot = null;
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" style="color: #a7f3d0;"><path d="M20 6 9 17l-5-5"/></svg>
      <span>${message}</span>
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
      btnOpenCoord.addEventListener('click', () => {
        this.openModal('coordinatorModal');
        if (!this.isCoordAuthenticated) {
          document.getElementById('coordPinScreen').style.display = 'block';
          document.getElementById('coordDashboardScreen').style.display = 'none';
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
    const verifyPin = () => {
      const pin = pinInput.value.trim();
      if (pin === '2026' || pin === '1234') {
        this.isCoordAuthenticated = true;
        document.getElementById('coordPinScreen').style.display = 'none';
        document.getElementById('coordDashboardScreen').style.display = 'block';
        this.renderCoordinatorDashboard();
        this.showToast('مرحباً بك في بوابة المنسق الميداني لبلدية البيض.');
      } else {
        alert(this.store.getT().pinError);
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
      afterFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            // Compress with Canvas ImageCompressor
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

    // Submit Resolution Form
    const resolveForm = document.getElementById('coordResolveForm');
    if (resolveForm) {
      resolveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const spotId = document.getElementById('resolveSpotSelect').value;
        const cleanedBy = document.getElementById('resolveCleanedBy').value.trim();

        if (!spotId) {
          alert('يرجى اختيار النقطة المطلوب إغلاقها.');
          return;
        }

        const success = this.store.resolveSpot(
          spotId,
          this.coordAfterPhotoData || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
          cleanedBy
        );

        if (success) {
          resolveForm.reset();
          this.coordAfterPhotoData = null;
          if (afterPhotoPreview) afterPhotoPreview.style.display = 'none';
          if (afterPhotoPrompt) afterPhotoPrompt.style.display = 'inline';
          this.closeModal('coordinatorModal');
          this.switchTab('impact');
          this.showToast(this.store.getT().toastSpotResolved);
        }
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
          const title = this.store.getI18nText(spot.title);
          const neighbourhood = this.store.getI18nText(spot.neighbourhood);
          const upvotes = spot.upvotes || 1;

          return `
            <div class="coord-spot-item">
              <div class="coord-spot-item-header">
                <strong>📍 ${neighbourhood}</strong>
                <span class="spot-vote-badge">👍 ${upvotes} ${t.upvotesCount}</span>
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin: 2px 0;">${title}</p>
              <div class="coord-spot-actions">
                <button class="btn btn-sm btn-primary" onclick="window.app.triggerCoordResolveModal('${spot.id}')">
                  ✓ ${t.btnResolveSpotTrigger}
                </button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openCreateCampaignFromSpot('${spot.id}')">
                  📅 برمجة حملة
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.app.coordinatorDeleteSpot('${spot.id}')">
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
        const title = this.store.getI18nText(spot.title);
        const neighbourhood = this.store.getI18nText(spot.neighbourhood);
        return `<option value="${spot.id}">${neighbourhood} - ${title.substring(0, 50)}...</option>`;
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
    // 1. Radio Cards for Volume
    document.querySelectorAll('#volumeCardsGroup .radio-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#volumeCardsGroup .radio-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const volInput = document.getElementById('reportVolume');
        if (volInput) volInput.value = card.dataset.volume;
      });
    });

    // 2. Multi-select Material Chips
    document.querySelectorAll('#materialsChipsGroup .chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });

    // 3. Accessibility Pills
    document.querySelectorAll('#accessPillGroup .access-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#accessPillGroup .access-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        const accessInput = document.getElementById('reportAccess');
        if (accessInput) accessInput.value = pill.dataset.access;
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
          alert('خاصية تحديد الموقع غير مدعومة');
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

    // 6. Submit Structured Report with Compressed Image
    const reportForm = document.getElementById('reportForm');
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
          alert('يرجى كتابة اسم الحي أو المعلم.');
          return;
        }

        let volumeTitleAr = 'حجم محدود';
        let volumeTitleFr = 'Volume limité';
        if (volume === 'medium') { volumeTitleAr = 'حجم متوسط (شاحنة 3.5T)'; volumeTitleFr = 'Volume moyen (3.5T)'; }
        if (volume === 'heavy') { volumeTitleAr = 'حجم ضخم (يستلزم جرافة وآليات)'; volumeTitleFr = 'Volume majeur (Engins lourds)'; }

        const titleAr = `تراكم نفايات (${volumeTitleAr}) - ${neighbourhood}`;
        const titleFr = `Point noir (${volumeTitleFr}) - ${neighbourhood}`;

        const descAr = `الموقع: ${neighbourhood}. نوع التدخل: ${volumeTitleAr}. المسلك: ${access === 'paved' ? 'معبد للشاحنات' : 'ضيق/وعر'}.${notes ? ' ملاحظات: ' + notes : ''}`;
        const descFr = `Secteur: ${neighbourhood}. Moyens: ${volumeTitleFr}. Accès: ${access === 'paved' ? 'Carrossable' : 'Difficile'}.${notes ? ' Notes: ' + notes : ''}`;

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
      btn.addEventListener('click', () => {
        this.openModal('reportModal');
      });
    });

    // Open New Campaign Modal
    const newCampBtn = document.getElementById('btnOpenNewCampaign');
    if (newCampBtn) {
      newCampBtn.addEventListener('click', () => {
        this.openModal('newCampaignModal');
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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          this.closeModal(modal.id);
        });
      }
    });

    // Photo Input Handling with Auto-Compression
    const fileInput = document.getElementById('reportPhotoInput');
    const photoBox = document.getElementById('photoUploaderBox');
    const photoPreview = document.getElementById('photoPreviewImg');
    const photoPrompt = document.getElementById('photoPromptText');

    if (photoBox && fileInput) {
      photoBox.addEventListener('click', () => fileInput.click());

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

    // Campaign form submit
    const newCampForm = document.getElementById('newCampaignForm');
    if (newCampForm) {
      newCampForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('campInputTitle').value.trim();
        const type = document.getElementById('campInputType').value;
        const date = document.getElementById('campInputDate').value.trim();
        const meetingPoint = document.getElementById('campInputMeeting').value.trim();
        const organizer = document.getElementById('campInputOrg').value.trim();
        const tools = document.getElementById('campInputTools').value.trim();
        const lat = newCampForm.dataset.lat || (33.6835 + (Math.random() - 0.5) * 0.015);
        const lng = newCampForm.dataset.lng || (1.0163 + (Math.random() - 0.5) * 0.015);

        if (!title || !date || !meetingPoint) {
          alert('يرجى استيفاء كافة بيانات المبادرة.');
          return;
        }

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

        newCampForm.reset();
        delete newCampForm.dataset.lat;
        delete newCampForm.dataset.lng;

        this.closeModal('newCampaignModal');
        this.switchTab('campaigns');
        this.showToast(this.store.getT().toastCampaignSuccess);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new BayedhaApp();
});
