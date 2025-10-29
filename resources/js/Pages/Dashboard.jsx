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
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {locations.map((loc) => (
                                        <Marker
                                            key={loc.id}
                                            position={[
                                                loc.latitude,
                                                loc.longitude,
                                            ]}
                                        >
                                            <Popup>
                                                <div className="text-sm">
                                                    <h4 className="font-semibold text-base mb-1">
                                                        {loc.name}
                                                    </h4>
                                                    <p>
                                                        <strong>Jenis:</strong>{" "}
                                                        {loc.jenis}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Keterangan:
                                                        </strong>{" "}
                                                        {loc.keterangan}
                                                    </p>
                                                    {loc.foto && (
                                                        <img
                                                            src={`/storage/${loc.foto}`}
                                                            alt={loc.name}
                                                            className="mt-2 rounded-md w-full object-cover"
                                                        />
                                                    )}
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
