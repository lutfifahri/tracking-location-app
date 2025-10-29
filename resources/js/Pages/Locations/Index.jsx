import React, { useEffect, useState, useRef } from "react";
import { useForm, router } from "@inertiajs/react"; // ← pastikan router diimport
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2";

// 🔹 Fix icon bawaan Leaflet agar muncul normal
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

export default function Index({ locations }) {
    const { data, setData, post, reset } = useForm({
        name: "",
        jenis: "",
        keterangan: "",
        foto: null,
        latitude: "",
        longitude: "",
    });

    const [map, setMap] = useState(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const defaultPosition = locations.length
            ? [locations[0].latitude, locations[0].longitude]
            : [-6.2, 106.816666];

        const defaultZoom = locations.length ? 13 : 5;

        const mapInstance = L.map("map").setView(defaultPosition, defaultZoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapInstance);

        // 🔍 Fitur pencarian lokasi global
        L.Control.geocoder({
            defaultMarkGeocode: true,
        })
            .on("markgeocode", function (e) {
                const { center, name } = e.geocode;

                if (markerRef.current)
                    mapInstance.removeLayer(markerRef.current);

                const marker = L.marker(center)
                    .addTo(mapInstance)
                    .bindPopup(`<b>${name}</b>`)
                    .openPopup();

                markerRef.current = marker;
                setData("latitude", center.lat);
                setData("longitude", center.lng);
                setData("name", name);
            })
            .addTo(mapInstance);

        // 🖱️ Klik manual di peta
        mapInstance.on("click", async function (e) {
            const { lat, lng } = e.latlng;

            if (markerRef.current) mapInstance.removeLayer(markerRef.current);

            const marker = L.marker([lat, lng], { draggable: true }).addTo(
                mapInstance
            );

            // Reverse geocoding
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                const json = await res.json();
                const displayName = json.display_name || "";

                setData("latitude", lat);
                setData("longitude", lng);
                setData("name", displayName);

                marker.bindPopup(`<b>${displayName}</b>`).openPopup();
            } catch (err) {
                console.error(err);
                setData("latitude", lat);
                setData("longitude", lng);
                setData("name", "");
                marker.bindPopup("Marker baru").openPopup();
            }

            markerRef.current = marker;

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
                } catch {}
            });
        });

        // 📍 Tampilkan lokasi dari database
        locations.forEach((loc) => {
            const marker = L.marker([loc.latitude, loc.longitude]).addTo(
                mapInstance
            );

            const popupContent = `
            <div style="font-family: Inter, sans-serif; width:260px; border-radius:12px; overflow:hidden; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
                <div style="height:150px; overflow:hidden;">
                    ${
                        loc.foto
                            ? `<img src="/storage/${loc.foto}" style="width:100%; height:150px; object-fit:cover;"/>`
                            : `<div style="width:100%; height:150px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#888; font-size:14px;">Tidak ada foto</div>`
                    }
                </div>
                <div style="padding:10px 14px;">
                    <h3 style="font-size:16px; font-weight:600; color:#222; margin:0 0 4px 0;">${
                        loc.name
                    }</h3>
                    <p style="font-size:13px; color:#555; margin:0 0 6px 0;">${
                        loc.jenis || "Jenis lokasi tidak tersedia"
                    }</p>
                    ${
                        loc.keterangan
                            ? `<p style="font-size:12px; color:#666; margin:0;">${loc.keterangan}</p>`
                            : ""
                    }
                    <div style="font-size:11px; color:#888; margin-top:6px;">📍 ${parseFloat(
                        loc.latitude
                    ).toFixed(5)}, ${parseFloat(loc.longitude).toFixed(5)}</div>
                    <div style="display:flex; gap:6px; margin-top:10px;">
                        <button class="btn-view" data-id="${
                            loc.id
                        }" style="flex:1; background:#16a34a; color:white; border:none; padding:6px 0; border-radius:6px; cursor:pointer; font-size:13px;">👁️ View</button>
                        <button class="btn-edit" data-id="${
                            loc.id
                        }" style="flex:1; background:#2563eb; color:white; border:none; padding:6px 0; border-radius:6px; cursor:pointer; font-size:13px;">✏️ Edit</button>
                        <button class="btn-delete" data-id="${
                            loc.id
                        }" style="flex:1; background:#dc2626; color:white; border:none; padding:6px 0; border-radius:6px; cursor:pointer; font-size:13px;">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;

            const popupEl = document.createElement("div");
            popupEl.innerHTML = popupContent;
            marker.bindPopup(popupEl);

            // 🟩 Tombol VIEW
            popupEl
                .querySelector(".btn-view")
                ?.addEventListener("click", () => {
                    Swal.fire({
                        title: loc.name || "Tanpa Nama",
                        html: `
                    <p><b>Jenis:</b> ${loc.jenis || "-"}</p>
                    <p><b>Keterangan:</b> ${loc.keterangan || "-"}</p>
                    ${
                        loc.foto
                            ? `<img src="/storage/${loc.foto}" style="width:100%; border-radius:8px; margin-top:8px;" />`
                            : "<p style='color:#888;'>Tidak ada foto</p>"
                    }
                    <p style="margin-top:8px; font-size:12px; color:#666;">
                        📍 ${loc.latitude}, ${loc.longitude}
                    </p>
                `,
                        confirmButtonText: "Tutup",
                        confirmButtonColor: "#2563eb",
                    });
                });

            // 🟦 Tombol EDIT
            popupEl
                .querySelector(".btn-edit")
                ?.addEventListener("click", () => {
                    router.visit(route("locations.edit", loc.id));
                });

            // 🟥 Tombol DELETE — sekarang marker bisa dihapus dengan aman
            popupEl
                .querySelector(".btn-delete")
                ?.addEventListener("click", () => {
                    Swal.fire({
                        title: "Yakin ingin menghapus?",
                        text: "Data ini akan dihapus permanen!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Ya, hapus!",
                        cancelButtonText: "Batal",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            axios
                                .delete(route("locations.destroy", loc.id))
                                .then((res) => {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Terhapus!",
                                        text: res.data.message,
                                        timer: 2000,
                                        showConfirmButton: false,
                                    });
                                    marker.remove(); // 🔥 Sekarang valid
                                })
                                .catch((err) => {
                                    console.error("❌ Error response:", err);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Gagal!",
                                        text:
                                            err.response?.data?.message ||
                                            "Terjadi kesalahan saat menghapus data.",
                                    });
                                });
                        }
                    });
                });
        });

        setMap(mapInstance);

        return () => mapInstance.remove();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("locations.store"), {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Lokasi berhasil disimpan.",
                    timer: 2000,
                    showConfirmButton: false,
                });
                reset();
            },
            onError: () => {
                Swal.fire({
                    icon: "error",
                    title: "Gagal!",
                    text: "Terjadi kesalahan saat menyimpan data.",
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Data Lokasi
                </h2>
            }
        >
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 🧭 Card Form Input */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                            📝 Tambah Lokasi Baru
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Nama Lokasi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Monas"
                                    className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Jenis Lokasi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Wisata, Kantor, Sekolah, dll"
                                    className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                    value={data.jenis}
                                    onChange={(e) =>
                                        setData("jenis", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Keterangan
                                </label>
                                <textarea
                                    placeholder="Tambahkan deskripsi singkat..."
                                    className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                    value={data.keterangan}
                                    onChange={(e) =>
                                        setData("keterangan", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Foto Lokasi
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                    onChange={(e) =>
                                        setData("foto", e.target.files[0])
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Latitude"
                                        className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                        value={data.latitude}
                                        onChange={(e) =>
                                            setData("latitude", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Longitude"
                                        className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
                                        value={data.longitude}
                                        onChange={(e) =>
                                            setData("longitude", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Simpan Lokasi
                            </button>
                        </form>
                    </div>

                    {/* 🗺️ Card Peta */}
                    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                            🌍 Peta Lokasi
                        </h2>
                        <div
                            id="map"
                            className="h-[500px] w-full rounded-md shadow-inner"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
