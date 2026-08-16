// store.js - State Management with Proximity Duplicate Check & Upvoting Engine
class AppStore {
  constructor() {
    this.STORAGE_KEY_SPOTS = 'bayedha_spots_v1';
    this.STORAGE_KEY_CAMPAIGNS = 'bayedha_campaigns_v1';
    this.STORAGE_KEY_LANG = 'bayedha_lang_v1';
    this.STORAGE_KEY_USER_ACTIONS = 'bayedha_user_actions_v1';
    
    this.lang = localStorage.getItem(this.STORAGE_KEY_LANG) || 'ar';
    this.listeners = [];
    this.activeFilter = 'all';
    
    this.loadState();
  }

  loadState() {
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

  saveState() {
    localStorage.setItem(this.STORAGE_KEY_SPOTS, JSON.stringify(this.spots));
    localStorage.setItem(this.STORAGE_KEY_CAMPAIGNS, JSON.stringify(this.campaigns));
    localStorage.setItem(this.STORAGE_KEY_USER_ACTIONS, JSON.stringify(this.userActions));
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
    const baseVolunteers = 185 + (this.userActions.joinedCampaigns.length * 1);
    const totalTrees = 320 + (resolvedCount > 2 ? (resolvedCount - 2) * 50 : 0);
    const totalCampaignsDone = 9 + resolvedCount;

    return {
      cleanedCount: resolvedCount,
      volunteersCount: baseVolunteers,
      treesCount: totalTrees,
      campaignsCount: totalCampaignsDone
    };
  }

  // Calculate Great-Circle Distance in Meters (Haversine Formula)
  getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
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

  // Find nearest active spot within threshold (e.g. 80 meters)
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

  // Upvote / Endorse existing spot
  upvoteSpot(spotId) {
    const spot = this.spots.find(s => s.id === spotId);
    if (!spot) return false;

    if (!this.userActions.upvotedSpots.includes(spotId)) {
      this.userActions.upvotedSpots.push(spotId);
      spot.upvotes = (spot.upvotes || 1) + 1;
      spot.isUserUpvoted = true;
      this.saveState();
      return true;
    }
    return false; // Already upvoted
  }

  addBlackspot(spotData) {
    const newSpot = {
      id: 'spot-' + Date.now(),
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
      lat: parseFloat(spotData.lat) || 32.6990,
      lng: parseFloat(spotData.lng) || 1.0125,
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
    return newSpot;
  }

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

  addCampaign(campData) {
    const newCamp = {
      id: 'camp-' + Date.now(),
      title: {
        ar: campData.title,
        fr: campData.title
      },
      type: campData.type || 'clean',
      date: campData.date,
      dateIso: new Date().toISOString(),
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
    return newCamp;
  }
}

window.appStore = new AppStore();
