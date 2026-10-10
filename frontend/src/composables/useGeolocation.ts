import { onBeforeUnmount, onMounted, ref } from 'vue';

export type GeoErrorCode = 'geo_unsupported' | 'geo_denied' | 'geo_unavailable' | 'geo_timeout';

export class GeoError extends Error {
  readonly code: GeoErrorCode;

  constructor(code: GeoErrorCode) {
    super(code);
    this.name = 'GeoError';
    this.code = code;
  }
}

export interface Coords {
  lat: number;
  lon: number;
}

const OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8_000,
  maximumAge: 5 * 60_000,
};

function getCurrentCoords(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeoError('geo_unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject(new GeoError('geo_denied'));
        else if (err.code === err.TIMEOUT) reject(new GeoError('geo_timeout'));
        else reject(new GeoError('geo_unavailable'));
      },
      OPTIONS,
    );
  });
}

export function useGeolocation() {
  const locating = ref(false);
  const permission = ref<PermissionState | 'unknown'>('unknown');

  let status: PermissionStatus | null = null;
  const onChange = () => {
    if (status) permission.value = status.state;
  };

  onMounted(async () => {
    try {
      status = await navigator.permissions.query({ name: 'geolocation' });
      permission.value = status.state;
      status.addEventListener('change', onChange);
    } catch {}
  });

  onBeforeUnmount(() => status?.removeEventListener('change', onChange));

  async function locate(): Promise<Coords> {
    locating.value = true;
    try {
      return await getCurrentCoords();
    } finally {
      locating.value = false;
    }
  }

  return {
    locating,
    permission,
    locate,
  };
}
