"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CatalogRestaurant } from "@/features/restaurants/catalog";
import {
  HANU_CENTER_COORDS,
  HANU_CAMPUS_OUTLINE,
  getRestaurantCoordinates,
  calculateWalkingDistance,
  spreadOverlappingCoordinates,
} from "../constants";
import { formatCardPrice, mapsUrl } from "@/features/restaurants/format";

const DEFAULT_ZOOM = 17;
const FOCUS_MAX_ZOOM = 18;
const MAX_ZOOM = 20;

// OpenFreeMap: bản đồ vector dữ liệu OpenStreetMap đầy đủ (kể cả ngõ, ngách, đường đi bộ),
// miễn phí, không cần API key, phục vụ qua Cloudflare. Vector được vẽ bằng WebGL nên luôn nét
// trên mọi màn hình và mọi mức zoom. Tên miền này không bị DNS nhà mạng VN chặn như *.openstreetmap.org.
const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

// Dự phòng cho thiết bị không hỗ trợ WebGL: ảnh raster Esri (ít chi tiết hơn nhưng luôn tải được).
const ESRI_FALLBACK_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const ESRI_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface HanuMapContainerProps {
  restaurants: CatalogRestaurant[];
  selectedRestaurantId: string | null;
  onSelectRestaurant: (restaurant: CatalogRestaurant) => void;
  resetTrigger?: number;
  className?: string;
}

export function HanuMapContainer({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  resetTrigger,
  className = "",
}: HanuMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Khởi tạo bản đồ Leaflet một lần duy nhất
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const container = containerRef.current;

    // Khởi tạo map tại trung tâm HANU.
    // Chỉ dùng mức zoom nguyên (zoomSnap = 1): zoom lẻ như 16.5 buộc Leaflet phóng to ảnh tile
    // bằng CSS transform, làm bản đồ bị mờ.
    const map = L.map(container, {
      center: [HANU_CENTER_COORDS.lat, HANU_CENTER_COORDS.lng],
      zoom: DEFAULT_ZOOM,
      minZoom: 15,
      maxZoom: MAX_ZOOM,
      zoomSnap: 1,
      zoomDelta: 1,
      zoomControl: false, // Chuyển zoom control sang góc dưới để không che thanh search
    });

    // Thêm nút zoom ở góc dưới bên phải
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    // Không dùng tile.openstreetmap.org: DNS của nhiều nhà mạng VN trả về 127.0.0.1 cho tên miền này,
    // khiến bản đồ xám/đen trên Wi-Fi. CARTO giờ bắt buộc API key.
    if (supportsWebGL()) {
      const glLayer = maplibreGL({
        style: OPENFREEMAP_STYLE_URL,
        attributionControl: false, // Dùng ô ghi nguồn của Leaflet để không bị lặp hai dòng
      }).addTo(map);
      map.attributionControl.addAttribution(OPENFREEMAP_ATTRIBUTION);

      // Style "liberty" ưu tiên tên tiếng Anh ("Lương Thế Vinh Road", "Hanoi University").
      // Đổi mọi nhãn tên sang tên gốc tiếng Việt trong OSM (trường "name"), giữ nguyên nhãn số hiệu đường.
      const glMap = glLayer.getMaplibreMap();
      glMap.once("load", () => {
        for (const layer of glMap.getStyle().layers ?? []) {
          if (layer.type !== "symbol") continue;
          const textField = glMap.getLayoutProperty(layer.id, "text-field");
          if (textField && JSON.stringify(textField).includes("name")) {
            glMap.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name"],
              ["get", "name:latin"],
            ]);
          }
        }
      });
    } else {
      L.tileLayer(ESRI_FALLBACK_URL, {
        maxZoom: MAX_ZOOM,
        maxNativeZoom: 19,
        keepBuffer: 6,
        updateWhenIdle: false,
        attribution: ESRI_ATTRIBUTION,
      }).addTo(map);
    }

    // Khoanh vùng nổi bật khuôn viên Trường Đại học Hà Nội: viền sáng mờ bên ngoài + nét đứt đỏ
    // + nền đỏ nhạt. interactive: false để không chặn click vào ghim quán và kéo bản đồ.
    L.polygon(HANU_CAMPUS_OUTLINE, {
      color: "#9c2826",
      weight: 12,
      opacity: 0.12,
      fill: false,
      lineJoin: "round",
      interactive: false,
    }).addTo(map);
    L.polygon(HANU_CAMPUS_OUTLINE, {
      color: "#9c2826",
      weight: 3,
      opacity: 0.9,
      dashArray: "10 6",
      lineJoin: "round",
      fillColor: "#e0473f",
      fillOpacity: 0.1,
      interactive: false,
    }).addTo(map);

    mapRef.current = map;

    // Leaflet đo kích thước container ngay khi khởi tạo; trong Next.js (dynamic import, layout
    // còn đang ổn định) số đo này thường sai nên vùng giữa không tải tile -> ô xám.
    // Đo lại sau khi layout ổn định, khi cửa sổ đổi kích thước và khi chính container đổi kích thước.
    const refreshSize = () => map.invalidateSize();
    const initialSizeTimer = window.setTimeout(refreshSize, 250);
    window.addEventListener("resize", refreshSize);
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(refreshSize) : null;
    resizeObserver?.observe(container);

    return () => {
      window.clearTimeout(initialSizeTimer);
      window.removeEventListener("resize", refreshSize);
      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Cập nhật các marker ghim quán ăn khi danh sách restaurants thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Xóa marker cũ
    markersMapRef.current.forEach((marker) => marker.remove());
    markersMapRef.current.clear();

    // Nhiều quán dùng chung một Plus Code (vd. các quán "Cổng trường" cùng mã XQQW+6F):
    // xếp các ghim trùng vị trí thành vòng nhỏ quanh điểm thật để không đè lên nhau.
    const pinPositions = spreadOverlappingCoordinates(
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        coords: getRestaurantCoordinates(restaurant),
      }))
    );

    restaurants.forEach((restaurant) => {
      const realCoords = getRestaurantCoordinates(restaurant);
      const coords = pinPositions.get(restaurant.id) ?? realCoords;
      const isSelected = restaurant.id === selectedRestaurantId;
      const walking = calculateWalkingDistance(realCoords);

      const markerHtml = `
        <div class="hanu-food-pin group" style="transform:translate(-50%,-100%);cursor:pointer;">
          <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:${isSelected ? "38px" : "30px"};
            height:${isSelected ? "38px" : "30px"};
            background:${isSelected ? "#9c2826" : "#fffdf8"};
            color:${isSelected ? "#ffffff" : "#9c2826"};
            border:2.5px solid ${isSelected ? "#ffcf77" : "#9c2826"};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 3px 8px rgba(0,0,0,0.25);
            transition:all 0.2s ease-in-out;
          ">
            <span style="transform:rotate(45deg);font-size:${isSelected ? "16px" : "13px"};line-height:1;">
              🍜
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `restaurant-pin-${restaurant.id}`,
        html: markerHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 100,
      }).addTo(map);

      // Xây dựng popup card thông tin quán
      const priceText = formatCardPrice(
        restaurant.min_price_vnd,
        restaurant.max_price_vnd
      );
      const signatureDishes = restaurant.dishes
        .slice(0, 2)
        .map((d: { name: string }) => d.name)
        .join(", ");
      // Cùng link với nút "Mở trên Google Maps" ở trang chi tiết quán (toạ độ DB, hoặc địa chỉ/Plus Code)
      const mapsLink =
        mapsUrl(restaurant) ??
        `https://www.google.com/maps/search/?api=1&query=${realCoords.lat},${realCoords.lng}`;

      const popupContent = `
        <div style="font-family:var(--font-body,sans-serif);min-width:220px;max-width:260px;padding:2px;">
          ${
            restaurant.image_url
              ? `<div style="height:110px;width:100%;overflow:hidden;border-radius:10px;margin-bottom:8px;">
                  <img src="${restaurant.image_url}" alt="${restaurant.name}" style="width:100%;height:100%;object-fit:cover;" />
                </div>`
              : ""
          }
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:800;padding:2px 6px;border-radius:999px;">
              📍 ${restaurant.area || "Gần HANU"}
            </span>
            <span style="font-size:11px;font-weight:700;color:#059669;">
              ${priceText}
            </span>
          </div>
          <h4 style="font-size:14px;font-weight:900;color:#1c1917;margin:0 0 4px 0;line-height:1.2;">
            ${restaurant.name}
          </h4>
          <p style="font-size:11px;color:#78716c;margin:0 0 4px 0;">
            ${walking.formattedText}
          </p>
          ${
            signatureDishes
              ? `<p style="font-size:11px;color:#57534e;margin:0 0 8px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Món tiêu biểu: <strong>${signatureDishes}</strong>
                </p>`
              : ""
          }
          <div style="display:flex;gap:6px;margin-top:8px;">
            <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" style="flex:1;background:#f5efe6;color:#9c2826;border:1px solid #d2bca3;padding:6px;border-radius:8px;font-size:11px;font-weight:700;text-align:center;text-decoration:none;display:inline-block;">
              Chỉ đường ↗
            </a>
            <a href="/restaurants/${restaurant.id}" style="flex:1;background:#9c2826;color:#ffffff;padding:6px;border-radius:8px;font-size:11px;font-weight:700;text-align:center;text-decoration:none;display:inline-block;">
              Chi tiết ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: "hanu-custom-popup",
      });

      marker.bindTooltip(
        `<div style="font-weight:700;font-size:11px;color:#1c1917;white-space:nowrap;padding:1px 3px;">${restaurant.name}</div>`,
        {
          direction: "top",
          offset: [0, -32],
          className: "hanu-pin-tooltip",
        }
      );

      marker.on("click", () => {
        onSelectRestaurant(restaurant);
      });

      markersMapRef.current.set(restaurant.id, marker);
    });
  }, [restaurants, selectedRestaurantId, onSelectRestaurant]);

  // Khi resetTrigger thay đổi (người dùng bấm "Về HANU"), lướt góc nhìn về cổng trường
  useEffect(() => {
    if (!resetTrigger || !mapRef.current) return;
    mapRef.current.closePopup();
    mapRef.current.flyTo([HANU_CENTER_COORDS.lat, HANU_CENTER_COORDS.lng], DEFAULT_ZOOM, {
      animate: true,
      duration: 0.6,
    });
  }, [resetTrigger]);

  // Khi selectedRestaurantId thay đổi, lướt êm dịu tới quán và mở popup (không đổi zoom đột ngột để không mất tile)
  useEffect(() => {
    if (!selectedRestaurantId || !mapRef.current) return;
    const marker = markersMapRef.current.get(selectedRestaurantId);
    const target = restaurants.find((r) => r.id === selectedRestaurantId);
    if (marker && target) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = Math.min(Math.max(Math.round(currentZoom), DEFAULT_ZOOM), FOCUS_MAX_ZOOM);
      mapRef.current.setView(marker.getLatLng(), targetZoom, {
        animate: true,
        duration: 0.5,
      });
      setTimeout(() => {
        marker.openPopup();
      }, 250);
    }
  }, [selectedRestaurantId, restaurants]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#e8e0d8] ${className}`}>
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
