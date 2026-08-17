// store.js - State Management with Proximity Duplicate Check, Single Coordinator & Supabase Cloud Live Sync
class AppStore {
  constructor() {
    this.STORAGE_KEY_SPOTS = 'bayedha_spots_v3';
    this.STORAGE_KEY_CAMPAIGNS = 'bayedha_campaigns_v3';
    this.STORAGE_KEY_LANG = 'bayedha_lang_v1';
    this.STORAGE_KEY_USER_ACTIONS = 'bayedha_user_actions_v3';
    
    this.lang = localStorage.getItem(this.STORAGE_KEY_LANG) || 'ar';
    this.listeners = [];
    this.activeFilter = 'all';
    this.supabase = window.supabaseClient;
    
    this.loadLocalState();
    this.initSupabaseSync();
  }

  loadLocalState() {
    const savedSpots = localStorage.getItem(this.STORAGE_KEY_SPOTS);
    this.spots = savedSpots ? JSON.parse(savedSpots) : [...window.INITIAL_DATA.spots];

    const savedCampaigns = localStorage.getItem(this.STORAGE_KEY_CAMPAIGNS);
    this.campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [...window.INITIAL_DATA.campaigns];

    const savedActions = localStorage.getItem(this.STORAGE_KEY_USER_ACTIONS);
    this.userActions = savedActions ? JSON.parse(savedActions) : { joinedCampaigns: [], upvotedSpots: [] };
    
    // Apply user action flags
    this.campaigns.forEach(c => {
      c.isUserJoined = this.userActions.joinedCampaigns.includes(c.id);
    });

    this.spots.forEach(s => {
      s.upvotes = s.upvotes || 1;
      s.isUserUpvoted = this.userActions.upvotedSpots.includes(s.id);
    });
  }

  // =========================================================
  // SUPABASE CLOUD LIVE SYNC & REALTIME SUBSCRIPTION
  // =========================================================
  async initSupabaseSync() {
    if (!this.supabase) {
      console.log('Running in local offline mode.');
      return;
    }

    try {
      // 1. Fetch live spots from Supabase
      const { data: cloudSpots, error: spotsErr } = await this.supabase
        .from('spots')
        .select('*');

      if (!spotsErr && cloudSpots && cloudSpots.length > 0) {
        this.spots = cloudSpots.map(s => this.mapCloudSpotToLocal(s));
        localStorage.setItem(this.STORAGE_KEY_SPOTS, JSON.stringify(this.spots));
      }

      // 2. Fetch live campaigns from Supabase
      const { data: cloudCamps, error: campsErr } = await this.supabase
        .from('campaigns')
        .select('*');

      if (!campsErr && cloudCamps && cloudCamps.length > 0) {
        this.campaigns = cloudCamps.map(c => this.mapCloudCampToLocal(c));
        localStorage.setItem(this.STORAGE_KEY_CAMPAIGNS, JSON.stringify(this.campaigns));
      }

      if (!spotsErr && !campsErr) {
        this.notify();
        console.log('✅ Synchronized successfully with Supabase Cloud DB.');
      } else {
        console.log('ℹ️ Supabase tables initializing or offline (using local storage cache).');
      }

      // 3. Realtime Subscription (Live Multi-Device Push)
      this.supabase
        .channel('bayedha_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, (payload) => {
          this.handleRealtimeSpotChange(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, (payload) => {
          this.handleRealtimeCampChange(payload);
        })
        .subscribe();

    } catch (err) {
      console.warn('Supabase initial sync notice (falling back to cache):', err);
    }
  }

  mapCloudSpotToLocal(s) {
    return {
      id: s.id,
      status: s.status,
      category: s.category || 'waste',
      title: {
        ar: s.title_ar,
        fr: s.title_fr || s.title_ar
      },
      neighbourhood: {
        ar: s.neighbourhood_ar,
        fr: s.neighbourhood_fr || s.neighbourhood_ar
      },
      description: {
        ar: s.description_ar || '',
        fr: s.description_fr || s.description_ar || ''
      },
      volume: s.volume || 'light',
      materials: s.materials || ['plastic'],
      accessibility: s.accessibility || 'paved',
      lat: s.latitude,
      lng: s.longitude,
      photo: s.photo_url || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
      beforePhoto: s.before_photo_url || s.photo_url,
      afterPhoto: s.after_photo_url,
      cleanedBy: {
        ar: s.cleaned_by_ar || 'بلدية البيض والمجتمع المدني',
        fr: s.cleaned_by_fr || 'APC El Bayadh & Société Civile'
      },
      upvotes: s.upvotes_count || 1,
      isUserUpvoted: this.userActions.upvotedSpots.includes(s.id),
      reportedAt: s.reported_at ? s.reported_at.split('T')[0] : new Date().toISOString().split('T')[0]
    };
  }

  mapCloudCampToLocal(c) {
    return {
      id: c.id,
      title: {
        ar: c.title_ar,
        fr: c.title_fr || c.title_ar
      },
      type: c.activity_type || 'clean',
      date: c.event_date,
      meetingPoint: {
        ar: c.meeting_point_ar,
        fr: c.meeting_point_fr || c.meeting_point_ar
      },
      organizer: {
        ar: c.organizer_ar,
        fr: c.organizer_fr || c.organizer_ar
      },
      target: {
        ar: c.target_ar || '',
        fr: c.target_fr || c.target_ar || ''
      },
      toolsNeeded: {
        ar: c.tools_needed_ar || ['قفازات', 'أكياس جمع'],
        fr: c.tools_needed_fr || ['Gants', 'Sacs']
      },
      volunteersRegistered: c.volunteers_registered || 1,
      banner: c.banner_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      isUserJoined: this.userActions.joinedCampaigns.includes(c.id)
    };
  }

  handleRealtimeSpotChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    if (eventType === 'INSERT') {
      const localSpot = this.mapCloudSpotToLocal(newRecord);
      if (!this.spots.find(s => s.id === localSpot.id)) {
        this.spots.unshift(localSpot);
      }
    } else if (eventType === 'UPDATE') {
      const index = this.spots.findIndex(s => s.id === newRecord.id);
      if (index !== -1) {
        this.spots[index] = this.mapCloudSpotToLocal(newRecord);
      }
    } else if (eventType === 'DELETE') {
      this.spots = this.spots.filter(s => s.id !== oldRecord.id);
    }
    this.saveStateLocally();
    this.notify();
  }

  handleRealtimeCampChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    if (eventType === 'INSERT') {
      const localCamp = this.mapCloudCampToLocal(newRecord);
      if (!this.campaigns.find(c => c.id === localCamp.id)) {
        this.campaigns.unshift(localCamp);
      }
    } else if (eventType === 'UPDATE') {
      const index = this.campaigns.findIndex(c => c.id === newRecord.id);
      if (index !== -1) {
        this.campaigns[index] = this.mapCloudCampToLocal(newRecord);
      }
    }
    this.saveStateLocally();
    this.notify();
  }

  saveStateLocally() {
    localStorage.setItem(this.STORAGE_KEY_SPOTS, JSON.stringify(this.spots));
    localStorage.setItem(this.STORAGE_KEY_CAMPAIGNS, JSON.stringify(this.campaigns));
    localStorage.setItem(this.STORAGE_KEY_USER_ACTIONS, JSON.stringify(this.userActions));
  }

  saveState() {
    this.saveStateLocally();
    this.notify();
  }

  setLanguage(newLang) {
    if (newLang !== 'ar' && newLang !== 'fr') return;
    this.lang = newLang;
    localStorage.setItem(this.STORAGE_KEY_LANG, newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', window.i18n[newLang].dir);
    this.notify();
  }

  getT() {
    return window.i18n[this.lang];
  }

  t(key) {
    const dict = this.getT();
    return dict[key] || key;
  }

  getI18nText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[this.lang] || obj['ar'] || obj['fr'] || '';
  }

  getI18nArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return obj[this.lang] || obj['ar'] || obj['fr'] || [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.notify();
  }

  getFilteredSpots() {
    if (this.activeFilter === 'all') return this.spots;
    return this.spots.filter(s => s.status === this.activeFilter);
  }

  getStats() {
    const resolvedCount = this.spots.filter(s => s.status === 'resolved').length;
    const totalCampaigns = this.campaigns.length;
    let totalVolunteers = 0;
    this.campaigns.forEach(c => {
      totalVolunteers += (c.volunteersRegistered || 0);
    });
    let totalTrees = 0;
    this.campaigns.filter(c => c.type === 'tree').forEach(c => {
      totalTrees += (c.treesTarget || 50);
    });
    if (resolvedCount > 0) {
      totalTrees += resolvedCount * 15;
    }

    return {
      cleanedCount: resolvedCount,
      volunteersCount: totalVolunteers,
      treesCount: totalTrees,
      campaignsCount: totalCampaigns
    };
  }

  getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  findNearbyActiveSpot(lat, lng, radiusMeters = 85) {
    let nearestSpot = null;
    let minDistance = Infinity;

    this.spots.forEach(spot => {
      if (spot.status === 'blackspot' || spot.status === 'campaign') {
        const dist = this.getDistanceMeters(lat, lng, spot.lat, spot.lng);
        if (dist <= radiusMeters && dist < minDistance) {
          minDistance = dist;
          nearestSpot = { spot, distance: dist };
        }
      }
    });

    return nearestSpot;
  }

  // Upvote with Cloud Sync
  async upvoteSpot(spotId) {
    const spot = this.spots.find(s => s.id === spotId);
    if (!spot) return false;

    if (!this.userActions.upvotedSpots.includes(spotId)) {
      this.userActions.upvotedSpots.push(spotId);
      spot.upvotes = (spot.upvotes || 1) + 1;
      spot.isUserUpvoted = true;
      this.saveState();

      if (this.supabase) {
        try {
          await this.supabase
            .from('spots')
            .update({ upvotes_count: spot.upvotes })
            .eq('id', spotId);
        } catch (err) {
          console.warn('Upvote cloud sync notice:', err);
        }
      }
      return true;
    }
    return false;
  }

  // Resolve Spot with Cloud Sync
  async resolveSpot(spotId, afterPhotoUrl, cleanedByText) {
    const spot = this.spots.find(s => s.id === spotId);
    if (!spot) return false;

    const finalAfterPhoto = afterPhotoUrl || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80';
    const finalCleanedBy = cleanedByText || 'مصالح بلدية البيض والمجتمع المدني';

    spot.status = 'resolved';
    spot.beforePhoto = spot.beforePhoto || spot.photo;
    spot.afterPhoto = finalAfterPhoto;
    spot.cleanedBy = {
      ar: finalCleanedBy,
      fr: finalCleanedBy
    };
    spot.resolvedAt = new Date().toISOString().split('T')[0];

    this.saveState();

    if (this.supabase) {
      try {
        await this.supabase
          .from('spots')
          .update({
            status: 'resolved',
            after_photo_url: finalAfterPhoto,
            cleaned_by_ar: finalCleanedBy,
            cleaned_by_fr: finalCleanedBy,
            updated_at: new Date().toISOString()
          })
          .eq('id', spotId);
      } catch (err) {
        console.warn('Resolve spot cloud sync notice:', err);
      }
    }

    return true;
  }

  // Delete Spot with Cloud Sync
  async deleteSpot(spotId) {
    const index = this.spots.findIndex(s => s.id === spotId);
    if (index === -1) return false;

    this.spots.splice(index, 1);
    this.userActions.upvotedSpots = this.userActions.upvotedSpots.filter(id => id !== spotId);
    this.saveState();

    if (this.supabase) {
      try {
        await this.supabase
          .from('spots')
          .delete()
          .eq('id', spotId);
      } catch (err) {
        console.warn('Delete spot cloud sync notice:', err);
      }
    }

    return true;
  }

  // Add Blackspot with Cloud Sync
  async addBlackspot(spotData) {
    const localId = 'spot-' + Date.now();
    const newSpot = {
      id: localId,
      status: 'blackspot',
      category: spotData.category || 'waste',
      title: {
        ar: spotData.title,
        fr: spotData.title
      },
      neighbourhood: {
        ar: spotData.neighbourhood,
        fr: spotData.neighbourhood
      },
      description: {
        ar: spotData.description,
        fr: spotData.description
      },
      urgency: spotData.urgency || 'medium',
      volume: spotData.volume || 'light',
      materials: spotData.materials || ['plastic'],
      accessibility: spotData.accessibility || 'paved',
      lat: parseFloat(spotData.lat) || 33.6835,
      lng: parseFloat(spotData.lng) || 1.0163,
      reportedAt: new Date().toISOString().split('T')[0],
      reportedBy: {
        ar: 'مواطن (تطبيق بيّضها)',
        fr: 'Citoyen (App Bayedha)'
      },
      photo: spotData.photo || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
      upvotes: 1,
      isUserUpvoted: true
    };

    this.userActions.upvotedSpots.push(newSpot.id);
    this.spots.unshift(newSpot);
    this.saveState();

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('spots')
          .insert({
            status: 'blackspot',
            category: newSpot.category,
            title_ar: newSpot.title.ar,
            title_fr: newSpot.title.fr,
            neighbourhood_ar: newSpot.neighbourhood.ar,
            neighbourhood_fr: newSpot.neighbourhood.fr,
            description_ar: newSpot.description.ar,
            description_fr: newSpot.description.fr,
            volume: newSpot.volume,
            materials: newSpot.materials,
            accessibility: newSpot.accessibility,
            latitude: newSpot.lat,
            longitude: newSpot.lng,
            photo_url: newSpot.photo,
            upvotes_count: 1
          })
          .select();

        if (!error && data && data[0]) {
          // Update local ID with Supabase UUID
          newSpot.id = data[0].id;
          this.saveStateLocally();
        }
      } catch (err) {
        console.warn('Add blackspot cloud sync notice:', err);
      }
    }

    return newSpot;
  }

  // Toggle Join Campaign
  toggleJoinCampaign(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return false;

    const alreadyJoined = this.userActions.joinedCampaigns.includes(campaignId);
    if (alreadyJoined) {
      this.userActions.joinedCampaigns = this.userActions.joinedCampaigns.filter(id => id !== campaignId);
      campaign.volunteersRegistered = Math.max(0, campaign.volunteersRegistered - 1);
      campaign.isUserJoined = false;
    } else {
      this.userActions.joinedCampaigns.push(campaignId);
      campaign.volunteersRegistered += 1;
      campaign.isUserJoined = true;
    }

    this.saveState();
    return !alreadyJoined;
  }

  // Add Campaign with Cloud Sync
  async addCampaign(campData) {
    const localId = 'camp-' + Date.now();
    const newCamp = {
      id: localId,
      title: {
        ar: campData.title,
        fr: campData.title
      },
      type: campData.type || 'clean',
      date: campData.date,
      meetingPoint: {
        ar: campData.meetingPoint,
        fr: campData.meetingPoint
      },
      organizer: {
        ar: campData.organizer,
        fr: campData.organizer
      },
      target: {
        ar: campData.target || 'تنظيف وتأهيل الموقع المختار',
        fr: campData.target || 'Nettoyage et réhabilitation du site'
      },
      toolsNeeded: {
        ar: campData.tools ? campData.tools.split(',').map(s => s.trim()) : ['قفازات', 'أكياس قمامة'],
        fr: campData.tools ? campData.tools.split(',').map(s => s.trim()) : ['Gants', 'Sacs poubelle']
      },
      volunteersRegistered: 1,
      isUserJoined: true,
      banner: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
    };

    this.userActions.joinedCampaigns.push(newCamp.id);
    this.campaigns.unshift(newCamp);

    if (campData.lat && campData.lng) {
      this.spots.unshift({
        id: 'spot-camp-' + Date.now(),
        status: 'campaign',
        category: 'green',
        title: newCamp.title,
        neighbourhood: newCamp.meetingPoint,
        description: newCamp.target,
        urgency: 'medium',
        lat: parseFloat(campData.lat),
        lng: parseFloat(campData.lng),
        reportedAt: new Date().toISOString().split('T')[0],
        campaignId: newCamp.id,
        photo: newCamp.banner,
        upvotes: 1
      });
    }

    this.saveState();

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('campaigns')
          .insert({
            title_ar: newCamp.title.ar,
            title_fr: newCamp.title.fr,
            activity_type: newCamp.type,
            event_date: newCamp.date,
            meeting_point_ar: newCamp.meetingPoint.ar,
            meeting_point_fr: newCamp.meetingPoint.fr,
            organizer_ar: newCamp.organizer.ar,
            organizer_fr: newCamp.organizer.fr,
            target_ar: newCamp.target.ar,
            target_fr: newCamp.target.fr,
            tools_needed_ar: newCamp.toolsNeeded.ar,
            tools_needed_fr: newCamp.toolsNeeded.fr,
            volunteers_registered: 1,
            banner_url: newCamp.banner,
            latitude: parseFloat(campData.lat) || 33.6835,
            longitude: parseFloat(campData.lng) || 1.0163
          })
          .select();

        if (!error && data && data[0]) {
          newCamp.id = data[0].id;
          this.saveStateLocally();
        }
      } catch (err) {
        console.warn('Add campaign cloud sync notice:', err);
      }
    }

    return newCamp;
  }

  generateMunicipalReport() {
    const activeBlackspots = this.spots.filter(s => s.status === 'blackspot');
    const scheduledCampaigns = this.campaigns;
    const resolvedSpots = this.spots.filter(s => s.status === 'resolved');

    const heavyCount = activeBlackspots.filter(s => s.volume === 'heavy').length;
    const mediumCount = activeBlackspots.filter(s => s.volume === 'medium').length;
    const lightCount = activeBlackspots.filter(s => s.volume === 'light' || !s.volume).length;

    const dateStr = new Date().toLocaleDateString(this.lang === 'ar' ? 'ar-DZ' : 'fr-FR');

    if (this.lang === 'ar') {
      return `🌿 *تقرير المتابعة الميدانية - منصة بيّضها* 🌿
📍 *بلدية البيض* | التاريخ: ${dateStr}

📊 *الحصيلة الإجمالية:*
• فضاءات مسترجعة ومؤهلة: ${resolvedSpots.length} موقعاً ✅
• نقاط سوداء قيد المتابعة: ${activeBlackspots.length} نقطة
• مبادرات تطوعية مبرمجة: ${scheduledCampaigns.length} حملات 📅

🚜 *احتياجات العتاد المطلوب للنقاط العالقة:*
• بحاجة لجرافة وشاحنات كبرى (🔴): ${heavyCount} مواقع
• بحاجة لشاحنة نقل بلدية 3.5T (🟡): ${mediumCount} مواقع
• تدخل يدوي وتطوعي (🟢): ${lightCount} مواقع

💡 *النقاط ذات الأولوية القصوى:*
${activeBlackspots.slice(0, 3).map((s, i) => `${i + 1}. ${this.getI18nText(s.title)} (${this.getI18nText(s.neighbourhood)}) - [${s.upvotes || 1} تأكيداً]`).join('\n') || 'لا توجد نقاط عاجلة.'}

_تم إعداد هذا التقرير عبر المنظومة الرقمية الموحدة لبلدية البيض._`;
    } else {
      return `🌿 *Synthèse Opérationnelle - Plateforme Bayedha* 🌿
📍 *Commune d'El Bayadh* | Date : ${dateStr}

📊 *Bilan d'intervention :*
• Sites réhabilités et assainis : ${resolvedSpots.length} ✅
• Points noirs en attente : ${activeBlackspots.length}
• Actions citoyennes programmées : ${scheduledCampaigns.length} 📅

🚜 *Moyens logistiques requis :*
• Requiert rétrochargeur & bennes lourdes (🔴) : ${heavyCount}
• Requiert camion communal 3.5T (🟡) : ${mediumCount}
• Intervention manuelle/bénévoles (🟢) : ${lightCount}

💡 *Sites prioritaires :*
${activeBlackspots.slice(0, 3).map((s, i) => `${i + 1}. ${this.getI18nText(s.title)} (${this.getI18nText(s.neighbourhood)}) - [${s.upvotes || 1} votes]`).join('\n') || 'Aucun site prioritaire.'}

_Généré via le dispositif numérique Bayedha._`;
    }
  }
}

window.appStore = new AppStore();
