/**
 * Supernatural AR - Serviço de Geolocalização
 * Gerencia posição do jogador, spawn de monstros por área e detecção de POIs
 */

class GeolocationService {
    constructor() {
        this.currentPosition = null;
        this.watchId = null;
        this.isWatching = false;
        this.listeners = [];
        this.monsterSpawnRadius = 100; // metros
        this.spawnedMonsterLocations = [];

        // Configurações do GPS
        this.geoOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        };
    }

    /**
     * Verificar se geolocalização está disponível
     */
    isAvailable() {
        return 'geolocation' in navigator;
    }

    /**
     * Solicitar permissão e obter posição atual
     */
    async getCurrentPosition() {
        if (!this.isAvailable()) {
            throw new Error('Geolocalização não disponível');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                    console.log('📍 Posição obtida:', this.currentPosition);
                    resolve(this.currentPosition);
                },
                (error) => {
                    console.error('❌ Erro de geolocalização:', error);
                    reject(error);
                },
                this.geoOptions
            );
        });
    }

    /**
     * Iniciar monitoramento contínuo da posição
     */
    startWatching(callback) {
        if (!this.isAvailable()) {
            console.error('❌ Geolocalização não disponível');
            return false;
        }

        if (this.isWatching) {
            console.log('⚠️ Já está monitorando posição');
            return true;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp
                };

                // Notificar listeners
                this.listeners.forEach(listener => listener(this.currentPosition));

                if (callback) callback(this.currentPosition);
            },
            (error) => {
                console.error('❌ Erro no watch:', error);
            },
            this.geoOptions
        );

        this.isWatching = true;
        console.log('🛰️ Monitoramento de posição iniciado');
        return true;
    }

    /**
     * Parar monitoramento
     */
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
            console.log('📍 Monitoramento parado');
        }
    }

    /**
     * Adicionar listener de posição
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remover listener
     */
    removeListener(callback) {
        const idx = this.listeners.indexOf(callback);
        if (idx !== -1) {
            this.listeners.splice(idx, 1);
        }
    }

    /**
     * Calcular distância entre dois pontos (Haversine)
     * @returns distância em metros
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Raio da Terra em metros
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Gerar posições aleatórias para monstros ao redor do jogador
     */
    generateMonsterSpawnPoints(count = 3) {
        if (!this.currentPosition) {
            console.warn('⚠️ Posição atual não disponível');
            return [];
        }

        const spawnPoints = [];
        const { latitude, longitude } = this.currentPosition;

        for (let i = 0; i < count; i++) {
            // Gerar distância aleatória (20 a 100 metros)
            const distance = 20 + Math.random() * 80;

            // Gerar ângulo aleatório (0 a 360 graus)
            const angle = Math.random() * 2 * Math.PI;

            // Calcular nova posição
            const deltaLat = (distance / 111000) * Math.cos(angle);
            const deltaLon = (distance / (111000 * Math.cos(this.toRad(latitude)))) * Math.sin(angle);

            const spawnPoint = {
                latitude: latitude + deltaLat,
                longitude: longitude + deltaLon,
                distance: Math.round(distance),
                monsterType: this.getRandomMonsterType()
            };

            spawnPoints.push(spawnPoint);
        }

        console.log(`🐺 ${count} pontos de spawn gerados`);
        return spawnPoints;
    }

    /**
     * Obter tipo de monstro aleatório
     */
    getRandomMonsterType() {
        const types = ['werewolf', 'vampire', 'ghost', 'demon'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Verificar se jogador está próximo de um ponto de spawn
     */
    checkNearbyMonsters(spawnPoints, triggerDistance = 30) {
        if (!this.currentPosition) return [];

        const nearbyMonsters = [];
        const { latitude, longitude } = this.currentPosition;

        spawnPoints.forEach((point, index) => {
            const distance = this.calculateDistance(
                latitude, longitude,
                point.latitude, point.longitude
            );

            if (distance <= triggerDistance) {
                nearbyMonsters.push({
                    ...point,
                    index,
                    currentDistance: Math.round(distance)
                });
            }
        });

        return nearbyMonsters;
    }

    /**
     * Verificar se é uma encruzilhada (usando Overpass API - OpenStreetMap)
     * Nota: Requer conexão com internet
     */
    async checkCrossroad(lat, lon, radius = 50) {
        try {
            const query = `
        [out:json];
        way["highway"](around:${radius},${lat},${lon});
        out body;
      `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            const data = await response.json();

            // Se há 3+ ruas próximas, provavelmente é uma encruzilhada
            const isCrossroad = data.elements && data.elements.length >= 3;

            console.log(`🛣️ Verificação de encruzilhada: ${isCrossroad ? 'SIM' : 'NÃO'}`);

            return {
                isCrossroad,
                roadCount: data.elements ? data.elements.length : 0
            };
        } catch (error) {
            console.error('❌ Erro ao verificar encruzilhada:', error);
            return { isCrossroad: false, roadCount: 0, error };
        }
    }

    /**
     * Obter nome da rua atual (reverse geocoding)
     */
    async getStreetName(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`
            );

            const data = await response.json();

            return {
                street: data.address?.road || 'Rua desconhecida',
                neighborhood: data.address?.suburb || data.address?.neighbourhood || '',
                city: data.address?.city || data.address?.town || '',
                displayName: data.display_name
            };
        } catch (error) {
            console.error('❌ Erro ao obter nome da rua:', error);
            return { street: 'Desconhecido', error };
        }
    }

    /**
     * Converter posição GPS para coordenadas AR relativas
     * @param targetLat Latitude do alvo
     * @param targetLon Longitude do alvo
     * @returns Coordenadas XZ relativas para posicionar no mundo AR
     */
    gpsToARCoordinates(targetLat, targetLon) {
        if (!this.currentPosition) return { x: 0, z: 0 };

        const { latitude, longitude } = this.currentPosition;

        // Converter diferença de coordenadas para metros
        const deltaLat = targetLat - latitude;
        const deltaLon = targetLon - longitude;

        // Aproximação: 1 grau lat ≈ 111km, 1 grau lon ≈ 111km * cos(lat)
        const x = deltaLon * 111000 * Math.cos(this.toRad(latitude));
        const z = -deltaLat * 111000; // Negativo porque Z+ é "para trás" em three.js

        return { x, z };
    }
}

// Exportar instância única (singleton)
const geoService = new GeolocationService();
export default geoService;
