import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Import Leaflet default icon fix
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Ganti bagian ini di atas export default function Dashboard...
const blueMarker = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png", // 📍 Marker biru glossy
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -35],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Dashboard({ locations }) {
    // Tentukan posisi awal peta (jika belum ada data, gunakan Jakarta)
    const defaultPosition = locations.length
        ? [locations[0].latitude, locations[0].longitude]
        : [-6.2, 106.816666]; // Jakarta

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 space-y-4">
                            <h3 className="text-lg font-semibold">
                                Peta Lokasi Tersimpan
                            </h3>
                            <div className="h-[600px] w-full rounded-lg overflow-hidden shadow border">
                                <MapContainer
                                    center={defaultPosition}
                                    zoom={13}
                                    scrollWheelZoom={true}
                                    className="h-full w-full z-0"
                                >
                                    {/* 🌍 Background map */}
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {/* 📍 Tampilkan semua lokasi */}
                                    {locations.map((loc) => (
                                        <Marker
                                            key={loc.id}
                                            position={[
                                                loc.latitude,
                                                loc.longitude,
                                            ]}
                                            icon={blueMarker}
                                        >
                                            <Popup>
                                                <div className="w-56 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                                    {/* Gambar lokasi */}
                                                    {loc.foto ? (
                                                        <img
                                                            src={`/storage/${loc.foto}`}
                                                            alt={loc.name}
                                                            className="w-full h-32 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                                            Tidak ada foto
                                                        </div>
                                                    )}

                                                    {/* Konten teks */}
                                                    <div className="p-3">
                                                        <h4 className="text-base font-semibold text-gray-900 mb-1 truncate">
                                                            {loc.name}
                                                        </h4>
                                                        {loc.jenis && (
                                                            <p className="text-gray-700 text-sm mb-1">
                                                                <span className="font-medium">
                                                                    Jenis:
                                                                </span>{" "}
                                                                {loc
                                                                    .jenis_lokasi
                                                                    ?.nama ||
                                                                    "-"}
                                                            </p>
                                                        )}
                                                        {loc.keterangan && (
                                                            <p className="text-gray-600 text-xs mb-2 line-clamp-3">
                                                                {loc.keterangan}
                                                            </p>
                                                        )}
                                                        <div className="text-xs text-gray-500 mb-3">
                                                            📍{" "}
                                                            {parseFloat(
                                                                loc.latitude
                                                            ).toFixed(5)}
                                                            ,{" "}
                                                            {parseFloat(
                                                                loc.longitude
                                                            ).toFixed(5)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
