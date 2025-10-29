import React, { useEffect, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL(
        "leaflet/dist/images/marker-icon-2x.png",
        import.meta.url
    ).href,
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
        .href,
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
        .href,
});

export default function Edit({ location, jenisLokasi }) {
    const { data, setData, put, processing } = useForm({
        name: location.name || "",
        jenis_lokasi_id: location.jenis_lokasi?.id || "", // <-- ubah ini
        keterangan: location.keterangan || "",
        latitude: location.latitude || "",
        longitude: location.longitude || "",
        foto: null,
    });

    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const map = L.map("map-edit").setView(
            [location.latitude, location.longitude],
            13
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([location.latitude, location.longitude], {
            draggable: true,
        }).addTo(map);
        marker.on("dragend", async (e) => {
            const { lat, lng } = e.target.getLatLng();
            setData("latitude", lat);
            setData("longitude", lng);

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                const json = await res.json();
                setData("name", json.display_name || "");
            } catch (err) {
                console.error("Reverse geocoding gagal:", err);
            }
        });

        markerRef.current = marker;
        mapRef.current = map;

        return () => map.remove();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("jenis", data.jenis);
        formData.append("keterangan", data.keterangan);
        formData.append("latitude", data.latitude);
        formData.append("longitude", data.longitude);
        if (data.foto) {
            formData.append("foto", data.foto);
        }

        axios
            .post(route("locations.update", location.id), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-HTTP-Method-Override": "PUT", // karena route update biasanya PUT
                },
            })
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Lokasi berhasil diperbarui.",
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    // Arahkan ke halaman index lokasi
                    window.location.href = route("locations.index");
                });
            })
            .catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Gagal!",
                    text: "Terjadi kesalahan saat memperbarui data.",
                });
            });
    };

    return (
        <AuthenticatedLayout header={<h2>Edit Lokasi</h2>}>
            <Head title="Edit Data-Lokasi" />
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form kiri */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Informasi Lokasi
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Lokasi
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Jenis Lokasi
                                </label>
                                <select
                                    className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                    value={data.jenis_lokasi_id || ""}
                                    onChange={(e) =>
                                        setData("jenis", e.target.value)
                                    }
                                >
                                    <option value="">
                                        -- Pilih Jenis Lokasi --
                                    </option>
                                    {jenisLokasi.map((jenis) => (
                                        <option key={jenis.id} value={jenis.id}>
                                            {jenis.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Keterangan
                                </label>
                                <textarea
                                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                    name="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) =>
                                        setData("keterangan", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Foto Lokasi
                                </label>
                                <input
                                    type="file"
                                    name="foto"
                                    accept="image/*"
                                    className="border p-2 w-full rounded"
                                    onChange={(e) =>
                                        setData("foto", e.target.files[0])
                                    }
                                />
                                {location.foto && !data.foto && (
                                    <img
                                        src={`/storage/${location.foto}`}
                                        alt="Foto lokasi"
                                        className="mt-2 w-full h-48 object-cover rounded"
                                    />
                                )}
                                {data.foto && (
                                    <img
                                        src={URL.createObjectURL(data.foto)}
                                        alt="Preview"
                                        className="mt-2 w-full h-48 object-cover rounded"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Latitude
                                    </label>
                                    <input
                                        type="text"
                                        name="latitude"
                                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={data.latitude}
                                        onChange={(e) =>
                                            setData("latitude", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Longitude
                                    </label>
                                    <input
                                        type="text"
                                        name="longitude"
                                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={data.longitude}
                                        onChange={(e) =>
                                            setData("longitude", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={processing}
                            >
                                Simpan Perubahan
                            </button>
                        </form>
                    </div>

                    {/* Map kanan */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Lokasi di Peta
                        </h2>
                        <div
                            id="map-edit"
                            className="w-full h-[500px] rounded-md shadow"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Geser marker untuk mengubah koordinat.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
