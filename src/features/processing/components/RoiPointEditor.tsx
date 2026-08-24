import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface RoiPoint {
  lat: number;
  lon: number;
}

export interface RoiPointEditorProps {
  value: RoiPoint[];
  onChange: (value: RoiPoint[]) => void;
  min?: number;
  disabled?: boolean;
}

export function RoiPointEditor({
  value,
  onChange,
  min = 10,
  disabled = false,
}: RoiPointEditorProps) {
  const [draftLat, setDraftLat] = useState("");
  const [draftLon, setDraftLon] = useState("");

  const pointCount = value.length;
  const isValid = pointCount >= min;

  const formattedCount = useMemo(() => {
    return `${pointCount} / min ${min}`;
  }, [pointCount, min]);

  function addPoint() {
    const lat = Number(draftLat);
    const lon = Number(draftLon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    onChange([...value, { lat, lon }]);
    setDraftLat("");
    setDraftLon("");
  }

  function removePoint(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-muted-foreground">ROI Points</p>
        <p
          className={`tabular text-[11px] font-medium ${isValid ? "text-emerald-600" : "text-muted-foreground"}`}
        >
          {formattedCount}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <Input
          type="number"
          className="tabular h-8 text-xs"
          placeholder="lat"
          value={draftLat}
          onChange={(event) => setDraftLat(event.target.value)}
          disabled={disabled}
        />
        <Input
          type="number"
          className="tabular h-8 text-xs"
          placeholder="lon"
          value={draftLon}
          onChange={(event) => setDraftLon(event.target.value)}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          disabled={disabled}
          onClick={addPoint}
        >
          Add
        </Button>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Format koordinat: WGS 84 decimal degrees (lat, lon). Titik dikirim ke backend saat graph
        dijalankan.
      </p>

      {pointCount === 0 ? (
        <p className="text-[11px] text-muted-foreground/70">Belum ada titik ROI.</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {value.map((point, index) => (
            <li
              key={`${point.lat}-${point.lon}-${index}`}
              className="flex items-center justify-between gap-2 rounded border border-border bg-muted/40 px-2.5 py-1.5 text-[11px]"
            >
              <span className="truncate tabular">
                {index + 1}. {point.lat.toFixed(6)}, {point.lon.toFixed(6)}
              </span>
              <button
                type="button"
                className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Hapus titik ${index + 1}`}
                disabled={disabled}
                onClick={() => removePoint(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isValid ? (
        <p className="text-[11px] font-medium text-muted-foreground">
          Perlu minimal {min} titik sebelum graph valid dijalankan.
        </p>
      ) : null}
    </div>
  );
}
