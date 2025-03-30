// import { MapContainer as MapWrapper, TileLayer, Marker, Popup } from "react-leaflet"
// import "leaflet/dist/leaflet.css"
// import L from "leaflet"
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
// import markerIcon from "leaflet/dist/images/marker-icon.png"
// import markerShadow from "leaflet/dist/images/marker-shadow.png"
// import { memo } from "react"

// // Fix the default marker icon issue
// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// })

// const MapContainer = ({ locations = [], zoom = 12 }) => {
//   return (
//     <>
//       {locations.length > 0 && (
//         <MapWrapper
//           center={[locations[0].latitude, locations[0].longitude]}
//           zoom={zoom}
//           style={{ height: "100%", width: "100%", zIndex: 0 }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           />
//           {locations.map((location, index) => (
//             <Marker key={index} position={[location.latitude, location.longitude]}>
//               <Popup>{location.displayName}</Popup>
//             </Marker>
//           ))}
//         </MapWrapper>
//       )}
//     </>
//   )
// }

// export default memo(MapContainer)
