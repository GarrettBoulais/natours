
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ2FycmV0dGJvdWxhaXMiLCJhIjoiY2swenBiazB1MHNsbTNtcGZscGt4OGwybiJ9.-QWv-3EQgyV2TTaXniG6lg';

  var map = new mapboxgl.Map({
    container: 'map', // finds element with id map
    style: 'mapbox://styles/garrettboulais/ck0zpeohn08g91cnyymbrdhpd',
    scrollZoom: false
    // center: [-118.113491,34.111745],
    // zoom: 4,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' // bottom of element (pin) will be exact location
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
