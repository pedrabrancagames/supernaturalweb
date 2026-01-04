/**
 * AR Game Starter Kit - Geolocation System
 * Sistema de geolocalização para jogos baseados em localização
 */

// Configuração padrão
const GeoConfig = {
    highAccuracy: true,
    maxAge: 10000,         // Máximo de 10 segundos para cache
    timeout: 15000,        // Timeout de 15 segundos
    updateInterval: 5000,  // Atualização a cada 5 segundos
    minDistance: 5         // Distância mínima em metros para triggerar update
};

// Estado do sistema
const GeoState = {
    isWatching: false,
    watchId: null,
    currentPosition: null,
    lastPosition: null,
    totalDistance: 0,
    listeners: [],
    errorCount: 0,
    maxErrors: 3
};

/**
 * Inicia o monitoramento de localização
 * @param {Object} options - Opções de configuração
 * @returns {boolean} - Se iniciou com sucesso
 */
export function startWatching(options = {}) {
    if (!navigator.geolocation) {
        console.error('[Geo] Geolocalização não suportada neste navegador');
        return false;
    }

    if (GeoState.isWatching) {
        console.warn('[Geo] Já está monitorando localização');
        return true;
    }

    const config = { ...GeoConfig, ...options };

    GeoState.watchId = navigator.geolocation.watchPosition(
        (position) => handlePositionUpdate(position),
        (error) => handlePositionError(error),
        {
            enableHighAccuracy: config.highAccuracy,
            maximumAge: config.maxAge,
            timeout: config.timeout
        }
    );

    GeoState.isWatching = true;
    console.log('[Geo] Monitoramento iniciado');

    return true;
}

/**
 * Para o monitoramento de localização
 */
export function stopWatching() {
    if (!GeoState.isWatching || !GeoState.watchId) {
        return;
    }

    navigator.geolocation.clearWatch(GeoState.watchId);
    GeoState.watchId = null;
    GeoState.isWatching = false;

    console.log('[Geo] Monitoramento parado');
}

/**
 * Obtém a posição atual uma única vez
 * @returns {Promise<GeolocationPosition>}
 */
export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalização não suportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                updatePosition(position);
                resolve(position);
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: GeoConfig.highAccuracy,
                maximumAge: GeoConfig.maxAge,
                timeout: GeoConfig.timeout
            }
        );
    });
}

/**
 * Adiciona um listener para atualizações de posição
 * @param {Function} callback - Função chamada com (lat, lng, accuracy)
 * @returns {Function} - Função para remover o listener
 */
export function onPositionUpdate(callback) {
    if (typeof callback !== 'function') {
        console.error('[Geo] Callback deve ser uma função');
        return () => { };
    }

    GeoState.listeners.push(callback);

    // Retorna função para remover listener
    return () => {
        const index = GeoState.listeners.indexOf(callback);
        if (index > -1) {
            GeoState.listeners.splice(index, 1);
        }
    };
}

/**
 * Processa atualização de posição
 * @param {GeolocationPosition} position
 */
function handlePositionUpdate(position) {
    GeoState.errorCount = 0;

    updatePosition(position);
}

/**
 * Atualiza a posição e notifica listeners
 * @param {GeolocationPosition} position
 */
function updatePosition(position) {
    const { latitude, longitude, accuracy, heading, speed } = position.coords;

    // Calcular distância percorrida
    if (GeoState.currentPosition) {
        const distance = calculateDistance(
            GeoState.currentPosition.lat,
            GeoState.currentPosition.lng,
            latitude,
            longitude
        );

        // Só atualiza se moveu mais que a distância mínima
        if (distance < GeoConfig.minDistance) {
            return;
        }

        GeoState.totalDistance += distance;
        GeoState.lastPosition = { ...GeoState.currentPosition };
    }

    GeoState.currentPosition = {
        lat: latitude,
        lng: longitude,
        accuracy,
        heading,
        speed,
        timestamp: position.timestamp
    };

    // Notificar listeners
    GeoState.listeners.forEach(callback => {
        try {
            callback(latitude, longitude, accuracy, heading, speed);
        } catch (e) {
            console.error('[Geo] Erro no listener:', e);
        }
    });
}

/**
 * Processa erro de geolocalização
 * @param {GeolocationPositionError} error
 */
function handlePositionError(error) {
    GeoState.errorCount++;

    const errorMessages = {
        1: 'Permissão negada',
        2: 'Posição não disponível',
        3: 'Timeout'
    };

    console.error(`[Geo] Erro: ${errorMessages[error.code] || 'Desconhecido'}`);

    // Se muitos erros, parar monitoramento
    if (GeoState.errorCount >= GeoState.maxErrors) {
        console.error('[Geo] Muitos erros consecutivos, parando monitoramento');
        stopWatching();
    }
}

/**
 * Calcula distância entre dois pontos usando fórmula de Haversine
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} - Distância em metros
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Raio da Terra em metros
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Converte graus para radianos
 * @param {number} degrees 
 * @returns {number}
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Verifica se um ponto está dentro de um raio
 * @param {number} centerLat 
 * @param {number} centerLng 
 * @param {number} pointLat 
 * @param {number} pointLng 
 * @param {number} radiusMeters 
 * @returns {boolean}
 */
export function isWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusMeters) {
    const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
    return distance <= radiusMeters;
}

/**
 * Gera um ponto aleatório dentro de um raio
 * @param {number} centerLat 
 * @param {number} centerLng 
 * @param {number} radiusMeters 
 * @returns {{ lat: number, lng: number }}
 */
export function getRandomPointInRadius(centerLat, centerLng, radiusMeters) {
    const radiusInDegrees = radiusMeters / 111000;

    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;

    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    // Ajuste para latitude
    const newX = x / Math.cos(toRadians(centerLat));

    return {
        lat: centerLat + y,
        lng: centerLng + newX
    };
}

/**
 * Calcula o bearing (direção) entre dois pontos
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} - Direção em graus (0-360)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = toRadians(lng2 - lng1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const x = Math.sin(dLng) * Math.cos(lat2Rad);
    const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    let bearing = Math.atan2(x, y) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    return bearing;
}

/**
 * Retorna a distância total percorrida
 * @returns {number} - Distância em metros
 */
export function getTotalDistance() {
    return GeoState.totalDistance;
}

/**
 * Retorna a posição atual
 * @returns {Object|null}
 */
export function getPosition() {
    return GeoState.currentPosition;
}

/**
 * Reseta a distância total percorrida
 */
export function resetDistance() {
    GeoState.totalDistance = 0;
}

// Exportar estado para debug
export const getGeoState = () => ({ ...GeoState });

// Auto-inicialização (comentado por padrão)
// document.addEventListener('DOMContentLoaded', () => startWatching());
