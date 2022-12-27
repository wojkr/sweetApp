mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/wojciech73/clc5iwkgg008a14pg2krkdtx4', // style URL
    center: dessert.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

const marker1 = new mapboxgl.Marker()
    .setLngLat(dessert.geometry.coordinates)
    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${dessert.company}</h3>`))
    .addTo(map);