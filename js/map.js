// map.js - Leaflet Map Engine for El Bayadh with Upvoting & Proximity Marker Support
class BayedhaMap {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.map = null;
    this.markersLayer = null;
    this.tempMarker = null;
    this.userLocationMarker = null;
    this.cityCenter = [33.6835, 1.0163]; // El Bayadh city center coordinates
    this.defaultZoom = 14;
    this.isPickingLocation = false;
    this.onLocationPickedCallback = null;

    this.initMap();
  }

  initMap() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.map = L.map(this.containerId, {
      center: this.cityCenter,
      zoom: this.defaultZoom,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);

    this.map.on('click', (e) => {
      if (this.isPickingLocation && this.onLocationPickedCallback) {
        this.setTempMarker(e.latlng.lat, e.latlng.lng);
        this.onLocationPickedCallback(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  enableLocationPicker(callback) {
    this.isPickingLocation = true;
    this.onLocationPickedCallback = callback;
    const container = document.getElementById(this.containerId);
    if (container) container.style.cursor = 'crosshair';
  }

  disableLocationPicker() {
    this.isPickingLocation = false;
    this.onLocationPickedCallback = null;
    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
      this.tempMarker = null;
    }
    const container = document.getElementById(this.containerId);
    if (container) container.style.cursor = '';
  }

  setTempMarker(lat, lng) {
    if (this.tempMarker) {
      this.tempMarker.setLatLng([lat, lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-badge marker-badge-temp">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      this.tempMarker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(this.map);
      this.tempMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (this.onLocationPickedCallback) {
          this.onLocationPickedCallback(pos.lat, pos.lng);
        }
      });
    }
    this.map.panTo([lat, lng]);
  }

  createCustomIcon(status, category) {
    let badgeClass = 'marker-badge-blackspot';
    let iconSvg = '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    if (status === 'campaign') {
      badgeClass = 'marker-badge-campaign';
      iconSvg = '<svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    } else if (status === 'resolved') {
      badgeClass = 'marker-badge-resolved';
      iconSvg = '<svg class="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    }

    return L.divIcon({
      className: `custom-map-marker marker-status-${status}`,
      html: `
        <div class="marker-badge ${badgeClass}" title="${status}">
          ${iconSvg}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  }

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

  renderSpots(spots, store) {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    const t = store.getT();

    spots.forEach(spot => {
      const icon = this.createCustomIcon(spot.status, spot.category);
      const marker = L.marker([spot.lat, spot.lng], { icon: icon });

      const title = escapeHTML(store.getI18nText(spot.title));
      const neighbourhood = escapeHTML(store.getI18nText(spot.neighbourhood));
      const description = escapeHTML(store.getI18nText(spot.description));
      const safeId = escapeHTML(spot.id);
      const safeCampaignId = escapeHTML(spot.campaignId || '');
      const upvotes = Number(spot.upvotes) || 1;

      let statusBadge = '';
      let actionBtn = '';

      if (spot.status === 'blackspot') {
        statusBadge = `<span class="badge badge-danger">${t.legendBlackspot}</span>`;
        const upvoteBtnText = spot.isUserUpvoted ? `✓ ${t.btnConfirmedAlready}` : `👍 ${t.btnUpvoteSpot} (${upvotes})`;
        const upvoteBtnClass = spot.isUserUpvoted ? 'btn-outline' : 'btn-accent';

        actionBtn = `
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
            <button class="btn btn-sm ${upvoteBtnClass} w-100" onclick="window.app.upvoteSpot('${safeId}')">
              ${upvoteBtnText}
            </button>
            <button class="btn btn-sm btn-primary w-100" onclick="window.app.openCreateCampaignFromSpot('${safeId}')">
              ${store.lang === 'ar' ? 'برمجة حملة تطوعية لهذا الموقع' : 'Programmer une action ici'}
            </button>
          </div>
        `;
      } else if (spot.status === 'campaign') {
        statusBadge = `<span class="badge badge-warning">${t.legendCampaign}</span>`;
        actionBtn = `
          <button class="btn btn-sm btn-accent w-100 mt-2" onclick="window.app.navigateToCampaign('${safeCampaignId}')">
            ${t.btnJoinCampaign}
          </button>
        `;
      } else if (spot.status === 'resolved') {
        statusBadge = `<span class="badge badge-success">${t.badgeResolved}</span>`;
        actionBtn = `
          <button class="btn btn-sm btn-outline w-100 mt-2" onclick="window.app.showBeforeAfterModal('${safeId}')">
            ${t.navImpact}
          </button>
        `;
      }

      const safePhoto = spot.photo ? encodeURI(spot.photo).replace(/"/g, '&quot;') : '';

      const popupHtml = `
        <div class="spot-popup-card">
          ${safePhoto ? `<div class="popup-image" style="background-image: url('${safePhoto}')"></div>` : ''}
          <div class="popup-content">
            <div class="popup-header">
              ${statusBadge}
              <small style="color: var(--text-muted); font-size: 11px;">📍 ${neighbourhood}</small>
            </div>
            <h4 class="popup-title">${title}</h4>
            <p class="popup-desc">${description}</p>
            ${spot.status === 'blackspot' ? `<div class="spot-vote-badge mb-2">👥 ${upvotes} ${t.upvotesCount}</div>` : ''}
            ${actionBtn}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, minWidth: 250, className: 'bayedha-popup' });
      this.markersLayer.addLayer(marker);
    });
  }

  locateUser() {
    if (!navigator.geolocation) {
      alert('نظام تحديد المواقع غير مدعوم / Géolocalisation non supportée.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (this.userLocationMarker) {
          this.map.removeLayer(this.userLocationMarker);
        }

        const userIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="width: 14px; height: 14px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        this.userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(this.map)
          .bindPopup('<b>موقعي الحالي / Ma position</b>')
          .openPopup();

        this.map.flyTo([latitude, longitude], 15, { duration: 1.2 });
      },
      () => {
        this.map.flyTo(this.cityCenter, this.defaultZoom);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  flyToCoordinates(lat, lng, zoom = 16) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }
}

window.BayedhaMap = BayedhaMap;
