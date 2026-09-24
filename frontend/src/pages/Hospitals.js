import React, { useState, useEffect, useCallback } from 'react';
import { hospitalAPI, userAPI } from '../services/api';

const S = {
  page: {
    maxWidth: '1200px', margin: '0 auto', padding: '28px 24px',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  headerIcon: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #059669, #047857)',
    borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px',
    boxShadow: '0 6px 20px rgba(5,150,105,0.35)',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px', marginBottom: '20px',
  },
  statCard: {
    background: 'white', borderRadius: '16px', padding: '18px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  locationBar: {
    background: '#f0fdf4', border: '1px solid #86efac',
    borderRadius: '12px', padding: '12px 18px',
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '16px', fontSize: '13px', color: '#166534', fontWeight: '600',
  },
  filterCard: {
    background: 'white', borderRadius: '16px', padding: '16px 20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
    marginBottom: '20px',
  },
  filterRow: { display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' },
  searchInput: {
    flex: 1, border: '2px solid #e2e8f0', borderRadius: '12px',
    padding: '10px 16px', fontSize: '14px', color: '#1e293b',
    outline: 'none', fontFamily: 'inherit', minWidth: '200px',
  },
  filterBtn: (active) => ({
    padding: '7px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
    background: active ? 'linear-gradient(135deg, #059669, #047857)' : '#f1f5f9',
    color: active ? 'white' : '#64748b',
    boxShadow: active ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
    transition: 'all 0.2s',
  }),
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  hospitalCard: {
    background: 'white', borderRadius: '18px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
    overflow: 'hidden', transition: 'all 0.3s',
  },
  cardTop: { padding: '18px 20px', borderBottom: '1px solid #f1f5f9' },
  cardBody: { padding: '16px 20px' },
  typeBadge: (bg, color) => ({
    display: 'inline-block', background: bg, color: color,
    padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
    marginBottom: '6px', marginRight: '6px',
  }),
  distanceBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
  },
  infoRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' },
  infoBox: {
    background: '#f8fafc', borderRadius: '10px', padding: '10px',
    textAlign: 'center',
  },
  facilityChip: {
    background: '#f1f5f9', color: '#475569', padding: '4px 10px',
    borderRadius: '8px', fontSize: '11px', fontWeight: '600',
    display: 'inline-block', margin: '0 4px 4px 0',
  },
  actionRow: { display: 'flex', gap: '8px', marginTop: '12px' },
  callBtn: {
    flex: 1, background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white', border: 'none', borderRadius: '12px', padding: '11px',
    fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    textDecoration: 'none',
  },
  mapBtn: {
    flex: 1, background: '#eff6ff', color: '#1d4ed8',
    border: '2px solid #bfdbfe', borderRadius: '12px', padding: '11px',
    fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    textDecoration: 'none',
  },

  detailsBtn: {
    width: '100%', background: '#f0fdf4', color: '#047857',
    border: '2px solid #bbf7d0', borderRadius: '12px', padding: '10px',
    fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  },
  skeleton: {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '18px', height: '220px',
  },
  emptyState: { textAlign: 'center', padding: '60px 20px', gridColumn: '1/-1' },
};

const typeColors = {
  'PHC': { bg: '#dcfce7', color: '#166534' },
  'CHC': { bg: '#dbeafe', color: '#1d4ed8' },
  'District': { bg: '#e9d5ff', color: '#6d28d9' },
  'Private': { bg: '#fce7f3', color: '#9d174d' },
  'Teaching Hospital': { bg: '#e0e7ff', color: '#3730a3' },
  'Government': { bg: '#fed7aa', color: '#9a3412' },
};

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, granted, denied, fallback
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [radius, setRadius] = useState(200);
  
  const fetchHospitals = useCallback(async (lat, lng, r = 200) => {
  setLoading(true);
  setError('');

  try {
    const res = await hospitalAPI.getNearby(lat, lng, r);

    console.log('API DATA:', res.data);

    const hospitalList = res.data?.hospitals || [];

    console.log('SETTING HOSPITALS:', hospitalList.length);

    setHospitals(hospitalList);
  } catch (err) {
    console.error('HOSPITAL ERROR:', err.response?.data || err.message);
    setError(
      err.response?.data?.detail ||
      'Failed to fetch hospitals. Make sure backend is running.'
    );
  } finally {
    setLoading(false);
  }
},[]);
  
  const detectLocation = useCallback(async () => {
    setLocationStatus('detecting');
    setError('');
    
    // 1. Try Browser Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setLocation(loc);
          setLocationStatus('granted');
          fetchHospitals(loc.latitude, loc.longitude, radius);
        },
        async (err) => {
          console.warn('Geolocation error:', err.message);
          
          let profileLocationFound = false;
          
          // 2. Try User Profile Fallback (if logged in)
          try {
            const profileRes = await userAPI.getProfile();
            const profile = profileRes.data.profile || profileRes.data;
            if (profile.latitude && profile.longitude) {
              const loc = { latitude: profile.latitude, longitude: profile.longitude };
              setLocation(loc);
              setLocationStatus('fallback');
              setError('📍 Using location from your profile. Browser GPS is blocked (requires HTTPS).');
              fetchHospitals(loc.latitude, loc.longitude, radius);
              profileLocationFound = true;
            }
          } catch (profileErr) {
            console.warn('Profile fetch failed:', profileErr);
          }

          if (!profileLocationFound) {
            // 3. Try IP-based geolocation
            try {
              const ipRes = await fetch('https://ipapi.co/json/');
              const data = await ipRes.json();
              if (data.latitude && data.longitude) {
                const loc = { latitude: data.latitude, longitude: data.longitude };
                setLocation(loc);
                setLocationStatus('fallback');
                setError('📍 Using approximate location via IP. Browser GPS is blocked (requires HTTPS).');
                fetchHospitals(loc.latitude, loc.longitude, radius);
              } else {
                throw new Error("IP location failed");
              }
            } catch (ipErr) {
              // 4. Final Fallback (Morbi)
              const fallbackLoc = { latitude: 22.8200, longitude: 70.8350 };
              setLocation(fallbackLoc);
              setLocationStatus('fallback');
              setError('📍 Location access denied. Showing default (Morbi). Use HTTPS for GPS support.');
              fetchHospitals(fallbackLoc.latitude, fallbackLoc.longitude, radius);
            }
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      const fallbackLoc = { latitude: 22.8200, longitude: 70.8350 };
      setLocation(fallbackLoc);
      setLocationStatus('fallback');
      setError('Your browser does not support geolocation. Showing default location.');
      fetchHospitals(fallbackLoc.latitude, fallbackLoc.longitude, radius);
    }
  },[radius, fetchHospitals]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  
 const filtered = hospitals.filter(h => {
  const name = h?.name || '';
  const address = h?.address || '';
  const type = h?.hospital_type || '';

  const matchType = filter === 'all' || type === filter;

  const search = searchText.trim().toLowerCase();

  const matchSearch =
    !search ||
    name.toLowerCase().includes(search) ||
    address.toLowerCase().includes(search);

  return matchType && matchSearch;
});

  const types = [
  'all',
  ...new Set(hospitals.map(h => h?.hospital_type).filter(Boolean))
];
  const getStars = (rating) => '⭐'.repeat(Math.round(rating));

console.log("HOSPITALS STATE:", hospitals);
console.log("FILTERED STATE:", filtered);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerIcon}>🏨</div>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Hospital Finder</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>GPS-powered nearby hospitals, PHCs, and clinics</p>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { value: hospitals.length, label: 'Total Found', color: '#059669' },
          { value: hospitals.filter(h => h.emergency_available).length, label: 'Emergency Ready', color: '#dc2626' },
          { value: hospitals.filter(h => h.hospital_type === 'PHC').length, label: 'PHCs', color: '#2563eb' },
          { value: `${radius}km`, label: 'Search Radius', color: '#7c3aed' },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <p style={{ fontSize: '28px', fontWeight: '900', color: s.color, margin: '0 0 4px 0' }}>{s.value}</p>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Location */}
      {location && (
        <div style={{
          ...S.locationBar,
          background: locationStatus === 'granted' ? '#f0fdf4' : '#fffbeb',
          borderColor: locationStatus === 'granted' ? '#86efac' : '#fde68a',
          color: locationStatus === 'granted' ? '#166534' : '#92400e',
        }}>
          📍 Location: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {locationStatus === 'granted' ? (
              <span style={{ color: '#059669' }}>✓ GPS Active</span>
            ) : (
              <>
                <span style={{ color: '#d97706' }}>⚠ Default Location</span>
                <button
                  onClick={detectLocation}
                  style={{
                    background: '#059669', color: 'white', border: 'none',
                    padding: '5px 12px', borderRadius: '8px', fontSize: '12px',
                    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  📍 Detect My Location
                </button>
              </>
            )}
          </span>
        </div>
      )}

      {/* Filters */}
      <div style={S.filterCard}>
        <div style={S.filterRow}>
          <input
            type="text"
            placeholder="🔍  Search hospitals by name or location..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={S.searchInput}
            onFocus={e => { e.target.style.borderColor = '#059669'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Radius: <strong>{radius}km</strong>
            </span>
            <input type="range" min="10" max="500" value={radius}
              onChange={e => {
                setRadius(Number(e.target.value));
                if (location) fetchHospitals(location.latitude, location.longitude, Number(e.target.value));
              }}
              style={{ width: '100px', accentColor: '#059669' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {types.map(type => (
            <button key={type} onClick={() => setFilter(type)} style={S.filterBtn(filter === type)}>
              {type === 'all' ? `All (${hospitals.length})` : type}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '14px 18px', borderRadius: '14px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={S.grid}>
          {[1, 2, 3, 4].map(i => <div key={i} style={S.skeleton}></div>)}
        </div>
      ) : (
        <>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
            Showing <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> hospitals
          </p>
          <div style={S.grid}>
            {filtered.map((h, i) => {
              const tc = typeColors[h.hospital_type] || { bg: '#f1f5f9', color: '#64748b' };
              return (
                <div key={i} style={S.hospitalCard}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
                >
                  <div style={S.cardTop}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '6px' }}>
                          {h.emergency_available && (
                            <span style={S.typeBadge('#fee2e2', '#dc2626')}>🚨 Emergency</span>
                          )}
                          <span style={S.typeBadge(tc.bg, tc.color)}>{h.hospital_type}</span>
                        </div>
                        <h3 style={{ fontWeight: '900', color: '#1e293b', fontSize: '15px', margin: '0 0 4px 0' }}>{h.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>📍 {h.address}</p>
                      </div>
                      <div style={S.distanceBox}>
                        <p style={{ fontSize: '26px', fontWeight: '900', color: '#059669', margin: 0 }}>{h.distance_km}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>km away</p>
                      </div>
                    </div>
                  </div>

                  <div style={S.cardBody}>
                    <div style={S.infoRow}>
                      <div style={S.infoBox}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px 0' }}>Travel Time</p>
                        <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px', margin: 0 }}>{h.estimated_travel_time}</p>
                      </div>
                      <div style={S.infoBox}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 2px 0' }}>Open Hours</p>
                        <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px', margin: 0 }}>{h.open_hours}</p>
                      </div>
                    </div>

                    {/* Rating & Beds */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px' }}>{getStars(h.rating)}</span>
                      <span style={{ fontWeight: '700', color: '#374151', fontSize: '13px' }}>{h.rating}/5</span>
                      {h.beds_available && (
                        <span style={{ marginLeft: 'auto', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                          🛏 {h.beds_available} beds
                        </span>
                      )}
                    </div>

                    {/* Facilities */}
                    <div style={{ marginBottom: '8px' }}>
                      {h.facilities?.slice(0, 4).map((f, j) => (
                        <span key={j} style={S.facilityChip}>{f}</span>
                      ))}
                      {h.facilities?.length > 4 && (
                        <span style={S.facilityChip}>+{h.facilities.length - 4} more</span>
                      )}
                    </div>

                    {/* Actions */}

                     <button
  style={S.detailsBtn}
 onClick={() => setSelectedHospital(h)}
 >
  👁️ View Details
</button>
                    
                    <div style={S.actionRow}>
                      {h.phone ? (
                        <a href={`tel:${h.phone}`} style={S.callBtn}>📞 Call Now</a>
                      ) : (
                        <div style={{ ...S.callBtn, opacity: 0.5, cursor: 'default' }}>📞 No Phone</div>
                      )}
                      <a
                        href={`https://maps.google.com/?q=${h.latitude},${h.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        style={S.mapBtn}
                      >
                        🗺 Directions
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div style={S.emptyState}>
                <p style={{ fontSize: '52px', margin: '0 0 16px 0' }}>🏥</p>
                <h3 style={{ fontWeight: '800', color: '#374151', margin: '0 0 8px 0' }}>No hospitals found</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Try increasing the search radius</p>
              </div>
            )}
          </div>
        </>
      )}
     {selectedHospital && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
          onClick={() => setSelectedHospital(null)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                padding: '22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={S.typeBadge('#dcfce7', '#166534')}>
                    {selectedHospital.hospital_type}
                  </span>

                  {selectedHospital.emergency_available && (
                    <span style={S.typeBadge('#fee2e2', '#dc2626')}>
                      🚨 Emergency
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: '#1e293b',
                    fontSize: '22px',
                    fontWeight: '900',
                  }}
                >
                  {selectedHospital.name}
                </h2>

                <p
                  style={{
                    color: '#64748b',
                    fontSize: '14px',
                    margin: '8px 0 0',
                  }}
                >
                  📍 {selectedHospital.address}
                </p>
              </div>

              <button
                onClick={() => setSelectedHospital(null)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={S.infoRow}>
                <div style={S.infoBox}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>
                    Distance
                  </p>
                  <p style={{ fontWeight: '800', margin: 0, color: '#059669' }}>
                    {selectedHospital.distance_km} km
                  </p>
                </div>

                <div style={S.infoBox}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>
                    Travel Time
                  </p>
                  <p style={{ fontWeight: '800', margin: 0, color: '#1e293b' }}>
                    {selectedHospital.estimated_travel_time}
                  </p>
                </div>
              </div>

              <div style={S.infoRow}>
                <div style={S.infoBox}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>
                    Rating
                  </p>
                  <p style={{ fontWeight: '800', margin: 0, color: '#1e293b' }}>
                    {getStars(selectedHospital.rating)} {selectedHospital.rating}/5
                  </p>
                </div>

                <div style={S.infoBox}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>
                    Beds Available
                  </p>
                  <p style={{ fontWeight: '800', margin: 0, color: '#1e293b' }}>
                    {selectedHospital.beds_available || 'Not Available'}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '14px',
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#64748b',
                  }}
                >
                  🕐 OPEN HOURS
                </p>
                <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>
                  {selectedHospital.open_hours || 'Not Available'}
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#64748b',
                  }}
                >
                  🏥 FACILITIES
                </p>

                {selectedHospital.facilities?.length ? (
                  selectedHospital.facilities.map((facility, index) => (
                    <span key={index} style={S.facilityChip}>
                      {facility}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                    No facility information available
                  </span>
                )}
              </div>

              <div style={S.actionRow}>
                {selectedHospital.phone ? (
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    style={S.callBtn}
                  >
                    📞 Call Hospital
                  </a>
                ) : (
                  <div
                    style={{
                      ...S.callBtn,
                      opacity: 0.5,
                      cursor: 'default',
                    }}
                  >
                    📞 No Phone
                  </div>
                )}

                <a
                  href={`https://maps.google.com/?q=${selectedHospital.latitude},${selectedHospital.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.mapBtn}
                >
                  🗺️ Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hospitals;